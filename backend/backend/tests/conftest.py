from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from typing import AsyncGenerator
from sqlalchemy_utils import database_exists, create_database
from ..database import get_async_session, Base
from ..app import app
from os import environ
import pytest
from .const import const
import sys
import asyncio


def pytest_configure():
    pytest.shared = {"token": None, "measurement_id": None}


@pytest.fixture(scope="session")
def event_loop():
    """
    Creates an instance of the default event loop for the test session.
    """
    if sys.platform.startswith("win") and sys.version_info[:2] >= (3, 8):
        # Avoid "RuntimeError: Event loop is closed" on Windows when tearing down tests
        # https://github.com/encode/httpx/issues/914
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def db_engine():
    TEST_DB = environ.get(
        "TEST_DATABASE",
        "postgresql+asyncpg://postgres:1234@127.0.0.1:5432/test",
    )
    sync_engine = create_engine(TEST_DB.replace("+asyncpg", ""))
    if not database_exists(sync_engine.url):
        create_database(sync_engine.url)
    Base.metadata.create_all(bind=sync_engine)
    yield create_async_engine(TEST_DB)


@pytest.fixture(scope="module")
async def db(db_engine) -> AsyncGenerator[AsyncSession, None]:
    connection = await db_engine.connect()
    _ = await connection.begin()
    db = AsyncSession(bind=connection)
    yield db
    await db.rollback()
    await connection.close()


@pytest.fixture(scope="module")
def client(db):
    app.dependency_overrides[get_async_session] = lambda: db

    with TestClient(app) as c:
        yield c
