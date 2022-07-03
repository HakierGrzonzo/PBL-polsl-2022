from fastapi import FastAPI
from fastapi_users import FastAPIUsers
from sqlalchemy.ext.asyncio.session import AsyncSession
from starlette.requests import Request
from starlette.responses import Response

from backend.geojson import GeoJsonRouter
from backend.markers import Markers
from .user_manager import get_user_manager
from .models import User, UserCreate, UserDB, UserUpdate
from .auth import cookie_backend, token_backend
from .measurements import MeasurementRouter
from .files import FileRouter
from .tea import router as tea
from fastapi_redis_cache import FastApiRedisCache
from .version import version

__version__ = version

fastapi_users = FastAPIUsers(
    get_user_manager,
    [cookie_backend, token_backend],
    User,
    UserCreate,
    UserUpdate,
    UserDB,
)

app = FastAPI(title="PBL backend boogalloo", version=version)

from os import environ

if cors := environ.get("CORS"):
    from fastapi.middleware.cors import CORSMiddleware

    urls = cors.split(" ")
    print("WARN: running with cors for {}".format(", ".join(urls)))
    app.add_middleware(
        CORSMiddleware,
        allow_origins=urls,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
from .database import engine, Base

REDIS_URL = environ.get("REDIS_URL", "redis://127.0.0.1:6379")


@app.on_event("startup")
async def startup_event():
    redis_cache = FastApiRedisCache()
    redis_cache.init(
        host_url=REDIS_URL,
        prefix="pbl-cache",
        response_header="X-PBL-Cache",
        ignore_arg_types=[Request, Response, AsyncSession],
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(
    fastapi_users.get_auth_router(cookie_backend),
    prefix="/api/cookie",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_auth_router(token_backend),
    prefix="/api/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(),
    prefix="/local",
    tags=["local"],
)

app.include_router(
    fastapi_users.get_users_router(),
    prefix="/api/users",
    tags=["users"],
)

FILE_PREFIX = "/api/files"

measurement_router = MeasurementRouter(fastapi_users, FILE_PREFIX)
app.include_router(
    measurement_router.get_router(),
    prefix="/api/data",
    tags=["data"],
)

file_router = FileRouter(fastapi_users, FILE_PREFIX)
app.include_router(
    file_router.get_router(),
    prefix=FILE_PREFIX,
    tags=["files"],
)

app.include_router(
    GeoJsonRouter(measurement_router).get_router(),
    prefix="/api/geojson",
    tags=["data", "geojson"],
)


app.include_router(
    file_router.get_admin_router(), prefix="/local", tags=["local", "files"]
)

app.include_router(tea, prefix="/api/auth", tags=["auth"])

app.include_router(Markers(1, 7).get_router(), prefix="/api/markers", tags=['svg'])
