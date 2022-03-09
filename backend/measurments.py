from uuid import uuid4
from fastapi.param_functions import Depends
import fastapi_users
from fastapi_users.fastapi_users import FastAPIUsers
from sqlalchemy.sql import select
from sqlalchemy.ext.asyncio.session import AsyncSession
from .models import Location, Measurment, CreateMeasurment, UpdateMeasurment, User
from .database import get_async_session, Measurments, UserTable

from fastapi.routing import APIRouter


class MeasurmentRouter:
    def __init__(self, fastapi_users: FastAPIUsers):
        self.fastapi_users = fastapi_users

    async def get_all_measurments(self, session: AsyncSession) -> list[Measurment]:
        result = await session.execute(select(Measurments).join(UserTable))
        return result.scalars().all()

    async def create_new_measurment(
        self, session: AsyncSession, data: CreateMeasurment, current_user: User
    ) -> Measurment:
        new_measurment = Measurments(
            location_string=data.location.string,
            location_time=data.location.time,
            notes=data.notes,
            description=data.description,
            title=data.title,
            author_id=current_user.id,
        )
        session.add(new_measurment)
        return new_measurment

    def get_router(self):
        router = APIRouter()

        @router.get("/")
        async def get_all(session: AsyncSession = Depends(get_async_session)):
            return await self.get_all_measurments(session)

        @router.post("/create", response_model=Measurment)
        async def add_measurment(
            measurment: CreateMeasurment,
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ):
            new_measurment = await self.create_new_measurment(session, measurment, user)
            return new_measurment

        return router
