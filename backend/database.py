from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
    SQLAlchemyBaseAccessTokenTable,
)
import sqlalchemy
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from sqlalchemy.sql.schema import Column, ForeignKey
from sqlalchemy import String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql.sqltypes import Integer
from .models import UserDB, AccessToken

DATABASE_URL = 'postgresql+asyncpg://postgres:1234@127.0.0.1:5432/postgres'
Base: DeclarativeMeta = declarative_base()


class UserTable(Base, SQLAlchemyBaseUserTable):
    measurments = relationship("Measurments")
    pass

class AccessTokenTable(SQLAlchemyBaseAccessTokenTable, Base):
    pass

class Measurments(Base):
    __tablename__ = "Measurments"
    id = Column(UUID, primary_key=True, index=True)
    location_string = Column(String(255))
    location_time = Column(DateTime())
    notes = Column(String(1024))
    description = Column(String(2048))
    title = Column(String(512))
    author_id = Column(UUID, ForeignKey('user.id'), index=True)


engine = create_async_engine(DATABASE_URL)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, UserTable)

async def get_access_token_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyAccessTokenDatabase(AccessToken, session, AccessTokenTable)

