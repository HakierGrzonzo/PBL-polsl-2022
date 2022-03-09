from fastapi import FastAPI
from fastapi_users import FastAPIUsers
from .user_manager import get_user_manager
from .models import User, UserCreate, UserDB, UserUpdate
from .auth import auth_backend
from .measurements import MeasurementRouter

fastapi_users = FastAPIUsers(
    get_user_manager,
    [auth_backend],
    User,
    UserCreate,
    UserUpdate,
    UserDB,
)

app = FastAPI()

from .database import engine, Base


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/api/auth",
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

app.include_router(
    MeasurementRouter(fastapi_users).get_router(), prefix="/api/data", tags=["data"]
)
