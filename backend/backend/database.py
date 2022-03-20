from typing import AsyncGenerator
from uuid import uuid4

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
from fastapi_users_db_sqlalchemy.access_token import (
    SQLAlchemyAccessTokenDatabase,
    SQLAlchemyBaseAccessTokenTable,
)
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from sqlalchemy.sql.schema import Column, ForeignKey
from sqlalchemy import String, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql.sqltypes import Integer
from .models import Measurement, UserDB, AccessToken
from os import environ

# DATABASE_URL = "postgresql+asyncpg://postgres:1234@127.0.0.1:5432/postgres"
DATABASE_URL = environ["DATABASE"]
Base: DeclarativeMeta = declarative_base()


class UserTable(Base, SQLAlchemyBaseUserTable):
    measurements = relationship("Measurements")
    files = relationship("Files")
    pass


class AccessTokenTable(SQLAlchemyBaseAccessTokenTable, Base):
    pass


class Files(Base):
    __tablename__ = "Files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    author_id = Column(
        UUID(as_uuid=True), ForeignKey("user.id", use_alter=True), index=True
    )
    mime = Column(String(64))
    original_name = Column(String(256))
    measurement_id = Column(
        Integer, ForeignKey("Measurements.id", use_alter=True), index=True
    )
    author = relationship("Measurements", back_populates="files")


class Measurements(Base):
    __tablename__ = "Measurements"
    id = Column(Integer, primary_key=True, index=True)
    location_longitude = Column(Float())
    location_latitude = Column(Float())
    laeq = Column(Float(), default=0)
    location_time = Column(DateTime())
    notes = Column(String(1024))
    description = Column(String(2048))
    title = Column(String(512))
    author_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), index=True)
    tags = Column(String(1024))
    files = relationship(
        "Files", foreign_keys=[Files.measurement_id], lazy="joined"
    )


engine = create_async_engine(DATABASE_URL)
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(UserDB, session, UserTable)


async def get_access_token_db(
    session: AsyncSession = Depends(get_async_session),
):
    yield SQLAlchemyAccessTokenDatabase(AccessToken, session, AccessTokenTable)
