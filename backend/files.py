import aiofiles
from fastapi import HTTPException, File
from fastapi.datastructures import UploadFile
from fastapi.param_functions import Depends
from fastapi_users.fastapi_users import FastAPIUsers
from sqlalchemy.sql import select, delete
from sqlalchemy.ext.asyncio.session import AsyncSession
from starlette.responses import FileResponse, Response
from typing import Tuple

from .models import FileRefrence, User
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

    def _table_to_file_refrence(self, source: Files) -> FileRefrence:
        return FileRefrence(
            file_id=source.id,
            owner=source.author_id,
            mime=source.mime,
            original_name=source.original_name,
            link="{}/file/{}".format(self.prefix, source.id),
            measurement=source.measurement_id,
        )

    async def get_all_files(self, session: AsyncSession):
        result = await session.execute(select(Files))
        return [self._table_to_file_refrence(x) for x in result.scalars().all()]

    async def get_my_files(self, session: AsyncSession, user: User):
        result = await session.execute(select(Files).filter(Files.author_id == user.id))
        return [self._table_to_file_refrence(x) for x in result.scalars().all()]

    async def insert_file_to_db(
        self, session: AsyncSession, user: User, file: Files
    ) -> FileRefrence:
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
        self, session: AsyncSession, file_id: UUID4
    ) -> Tuple[str, str]:
        result = await session.execute(select(Files).filter(Files.id == file_id))
        res = result.scalars().all()
        if len(res) == 1:
            return [res[0].mime, res[0].original_name]
        else:
            raise HTTPException(status_code=404, detail=errors.FILE_ERROR)
        pass

    async def delete_file(self, session: AsyncSession, user: User, file_id: UUID4):
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

        @router.get("/", response_model=list[FileRefrence])
        async def get_all_files(
            session: AsyncSession = Depends(get_async_session),
            _: User = Depends(self.fastapi_users.current_user()),
        ) -> list[FileRefrence]:
            return await self.get_all_files(session)

        @router.get("/mine", response_model=list[FileRefrence])
        async def get_my_files(
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> list[FileRefrence]:
            return await self.get_my_files(session, user)

        @router.post(
            "/",
            status_code=201,
            response_model=FileRefrence,
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
        ) -> FileRefrence:
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
                file_refrence = await self.insert_file_to_db(session, user, file_entry)
                async with aiofiles.open(
                    join(FILE_PATH_PREFIX, str(file_refrence.file_id)), "wb"
                ) as f:
                    while content := await uploaded_file.read(8192):
                        await f.write(content)
                await session.commit()
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
                mime, original_name = await self.get_filename_mime(session, id)
                if isDownload:
                    return FileResponse(
                        join(FILE_PATH_PREFIX, str(id)),
                        media_type=mime,
                        filename=original_name,
                    )
                else:
                    return FileResponse(
                        join(FILE_PATH_PREFIX, str(id)), media_type=mime
                    )
            except Exception as e:
                raise e

        @router.delete(
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
