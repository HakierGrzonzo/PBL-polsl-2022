from typing import AsyncGenerator
from sqlalchemy import Column, Integer, \
    String, Table, ForeignKey, DateTime, Text, text, select, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

from fastapi_quickcrud import CrudMethods
from fastapi_quickcrud import crud_router_builder
from fastapi_quickcrud import sqlalchemy_to_pydantic


Base = declarative_base()
metadata = Base.metadata

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine('postgresql+asyncpg://postgres:1234@127.0.0.1:5432/postgres', future=True, echo=True,
                             pool_use_lifo=True, pool_pre_ping=True, pool_recycle=7200)
async_session = sessionmaker(bind=engine, class_=AsyncSession)


async def get_transaction_session() -> AsyncSession:
    async with async_session() as session:
        async with session.begin():
            yield session
from tables import UsersPhotos, PhotosRecordings





user_model_set = sqlalchemy_to_pydantic(db_model=UsersPhotos,
                                        crud_methods=[
                                            CrudMethods.FIND_ONE,
                                        ],
                                        exclude_columns=[])

friend_model_set = sqlalchemy_to_pydantic(db_model=PhotosRecordings,
                                                crud_methods=[
                                                    CrudMethods.FIND_ONE,
                                                    CrudMethods.UPSERT_ONE,
                                                    CrudMethods.UPDATE_MANY,
                                                    CrudMethods.UPDATE_ONE,
                                                    CrudMethods.DELETE_ONE,
                                                    CrudMethods.FIND_MANY,
                                                    CrudMethods.UPSERT_MANY,
                                                    CrudMethods.UPDATE_MANY,
                                                    CrudMethods.DELETE_MANY,
                                                    CrudMethods.PATCH_MANY,

                                                ],
                                                exclude_columns=[])

crud_route_1 = crud_router_builder(db_session=get_transaction_session,
                                   crud_models=user_model_set,
                                   db_model=UsersPhotos,
                                   prefix="/users",
                                   dependencies=[],
                                   async_mode=True,
                                   tags=["users_photos"]
                                   )
crud_route_2 = crud_router_builder(db_session=get_transaction_session,
                                   crud_models=friend_model_set,
                                   db_model=PhotosRecordings,
                                   async_mode=True,
                                   prefix="/recordings",
                                   dependencies=[],
                                   tags=["photos_recordings"]
                                   )
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

from fastapi_users.db import SQLAlchemyUserDatabase
async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, UserTable)
