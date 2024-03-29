import aiofiles
from fastapi import HTTPException, File
from fastapi.datastructures import UploadFile
from fastapi.param_functions import Depends
from fastapi_users.fastapi_users import FastAPIUsers
from sqlalchemy.sql import select, delete
from sqlalchemy.ext.asyncio.session import AsyncSession
from starlette.responses import FileResponse, Response
from typing import Tuple
from fastapi_redis_cache import cache

from backend.tasks import send_file_to_be_optimized, try_get_location_from_image
from .models import AdminPanelMsg, FileReference, User
from .database import get_async_session, Files, Measurements
from fastapi.routing import APIRouter
from os import environ, unlink
from os.path import join
from pydantic.types import UUID4
from .errors import errors, ErrorModel, get_error

FILE_PATH_PREFIX = environ["FILE_PATH"]


class FileRouter:
    def __init__(self, fastapi_users: FastAPIUsers, prefix: str) -> None:
        self.fastapi_users = fastapi_users
        self.prefix = prefix

    def _table_to_file_refrence(self, source: Files) -> FileReference:
        return FileReference(
            file_id=source.id,
            owner=source.author_id,
            mime=source.mime,
            original_name=source.original_name,
            link="{}/file/{}".format(self.prefix, source.id),
            measurement=source.measurement_id,
            optimized_mime=source.optimized_mime,
        )

    async def get_all_files(self, session: AsyncSession):
        result = await session.execute(select(Files))
        return [self._table_to_file_refrence(x) for x in result.scalars().all()]

    async def get_my_files(self, session: AsyncSession, user: User):
        result = await session.execute(
            select(Files).filter(Files.author_id == user.id)
        )
        return [self._table_to_file_refrence(x) for x in result.scalars().all()]

    async def insert_file_to_db(
        self, session: AsyncSession, user: User, file: Files
    ) -> FileReference:
        measurement = await session.execute(
            select(Measurements).filter(Measurements.id == file.measurement_id)
        )
        res = measurement.unique().scalars().all()
        if len(res) != 1:
            raise HTTPException(status_code=404, detail=errors.ID_ERROR)
        session.add(file)
        await session.flush()
        await session.refresh(file)
        return self._table_to_file_refrence(file)

    async def get_filename_mime(
        self, session: AsyncSession, file_id: UUID4, optimized: bool = False
    ) -> Tuple[str, str, bool]:
        result = await session.execute(
            select(Files).filter(Files.id == file_id)
        )
        res = result.scalars().all()
        if len(res) == 1:
            if optimized and res[0].optimized_mime is not None:
                return [res[0].optimized_mime, res[0].optimized_name, True]
            return [res[0].mime, res[0].original_name, False]
        else:
            raise HTTPException(status_code=404, detail=errors.FILE_ERROR)

    async def delete_file(
        self, session: AsyncSession, user: User, file_id: UUID4
    ):
        file = await session.execute(select(Files).filter(file_id == Files.id))
        res = file.scalars().all()
        if len(res) != 1:
            raise HTTPException(status_code=404, detail=errors.FILE_ERROR)
        target = res[0]
        if target.author_id != user.id:
            raise HTTPException(status_code=403, detail=errors.OWNER_ERROR)
        await session.execute(delete(Files).where(file_id == Files.id))

    def get_router(self) -> APIRouter:
        router = APIRouter()

        @router.get("/", response_model=list[FileReference])
        @cache(expire=120)
        async def get_all_files(
            session: AsyncSession = Depends(get_async_session),
            _: User = Depends(self.fastapi_users.current_user()),
        ) -> list[FileReference]:
            return await self.get_all_files(session)

        @router.get("/mine", response_model=list[FileReference])
        async def get_my_files(
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> list[FileReference]:
            return await self.get_my_files(session, user)

        @router.post(
            "/",
            status_code=201,
            response_model=FileReference,
            responses={
                404: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.ID_ERROR)}
                        }
                    },
                },
            },
        )
        async def upload_new_file(
            measurement_id: int,
            uploaded_file: UploadFile = File(...),
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> FileReference:
            """
            Upload a file and associate it with a measurement.
            """
            try:
                file_entry = Files(
                    original_name=uploaded_file.filename,
                    mime=uploaded_file.content_type,
                    author_id=user.id,
                    measurement_id=measurement_id,
                )
                file_refrence = await self.insert_file_to_db(
                    session, user, file_entry
                )
                async with aiofiles.open(
                    join(FILE_PATH_PREFIX, str(file_refrence.file_id)), "wb"
                ) as f:
                    while content := await uploaded_file.read(8192):
                        await f.write(content)
                await session.commit()
                send_file_to_be_optimized(file_refrence)
                if "image" in file_refrence.mime.lower():
                    try_get_location_from_image.send(str(file_refrence.file_id))
                return file_refrence
            except Exception as e:
                raise e

        @router.get(
            "/file/{id}",
            responses={
                404: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.FILE_ERROR)}
                        }
                    },
                },
            },
            response_class=FileResponse,
        )
        async def return_file(
            id: UUID4,
            isDownload: bool = False,
            optimized: bool = True,
            session: AsyncSession = Depends(get_async_session),
        ):
            """
            Returns file for a given id.

            File must have an associated measurement.

            - isDownload = False: if `True` then the file will be sent as
            an attachment
            - id: id of file to return
            - optimized = True: returns compressed version, if applicable. **MIME
            will most likely differ!**
            """
            try:
                (
                    mime,
                    original_name,
                    is_optimized,
                ) = await self.get_filename_mime(session, id, optimized)
                if isDownload:
                    return FileResponse(
                        join(
                            FILE_PATH_PREFIX,
                            str(id) + ("_opt" if is_optimized else ""),
                        ),
                        media_type=mime,
                        filename=original_name,
                    )
                else:
                    return FileResponse(
                        join(
                            FILE_PATH_PREFIX,
                            str(id) + ("_opt" if is_optimized else ""),
                        ),
                        media_type=mime,
                    )
            except Exception as e:
                raise e

        @router.get(
            "/delete/{id}",
            status_code=204,
            responses={
                403: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.OWNER_ERROR)}
                        }
                    },
                },
                404: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.FILE_ERROR)}
                        }
                    },
                },
            },
        )
        async def delete_file(
            id: UUID4,
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ):
            try:
                await self.delete_file(session, user, id)
                await session.commit()
                unlink(join(FILE_PATH_PREFIX, str(id)))
                return Response(status_code=204)
            except Exception as e:
                raise e

        return router

    def get_admin_router(self):
        router = APIRouter()

        @router.get("/reoptimize", response_model=AdminPanelMsg)
        async def reoptimize_all_files(
            session: AsyncSession = Depends(get_async_session),
        ):
            files_query = await session.execute(select(Files))
            files = [
                self._table_to_file_refrence(x)
                for x in files_query.scalars().all()
            ]
            count = sum(send_file_to_be_optimized(file) for file in files)
            return AdminPanelMsg(msg=f"Sent {count} files to be optimized")

        return router
