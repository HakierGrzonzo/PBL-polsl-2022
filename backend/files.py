import aiofiles
from fastapi import HTTPException, File
from fastapi.datastructures import UploadFile
from fastapi.param_functions import Depends
from fastapi_users.fastapi_users import FastAPIUsers
from sqlalchemy.sql import select
from sqlalchemy.ext.asyncio.session import AsyncSession
from .models import FileRefrence, User
from .database import get_async_session, Files
from fastapi.routing import APIRouter


class FileRouter:
    def __init__(self, fastapi_users: FastAPIUsers, prefix: str) -> None:
        self.fastapi_users = fastapi_users
        self.prefix = prefix

    def _table_to_file_refrence(self, source: Files) -> FileRefrence:
        return FileRefrence(
            id=source.id,
            owner=source.author_id,
            mime=source.mime,
            original_name=source.original_name,
            link="{}/file/{}".format(self.prefix, source.id),
        )

    async def get_all_files(self, session: AsyncSession):
        result = await session.execute(select(Files))
        return [self._table_to_file_refrence(x) for x in result.scalars().all()]

    async def get_my_files(self, session: AsyncSession, user: User):
        result = await session.execute(select(Files).filter(Files.author_id == user.id))
        return [self._table_to_file_refrence(x) for x in result.scalars().all()]

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

        @router.post("/upload", response_model=FileRefrence, status_code=201)
        async def upload_new_file(
            uploaded_file: UploadFile = File(...),
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> FileRefrence:
            # TODO(hakiergrzonzo) - https://stackoverflow.com/questions/65342833/fastapi-uploadfile-slow/70667530#70667530
            pass
            

        return router
