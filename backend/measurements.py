from fastapi import HTTPException
from fastapi.param_functions import Depends
from fastapi_users.fastapi_users import FastAPIUsers
from sqlalchemy.sql import select
from sqlalchemy.ext.asyncio.session import AsyncSession
from .models import Location, Measurement, CreateMeasurement, User
from .database import get_async_session, Measurements
from fastapi.routing import APIRouter


class MeasurementRouter:
    def __init__(self, fastapi_users: FastAPIUsers):
        self.fastapi_users = fastapi_users

    def _table_to_model(self, source: Measurements) -> Measurement:
        return Measurement(
            measurement_id=source.id,
            location=Location(string=source.location_string, time=source.location_time),
            notes=source.notes,
            description=source.description,
            title=source.title,
            tags=source.tags.split(", "),
        )

    async def get_all_measurements(self, session: AsyncSession) -> list[Measurement]:
        result = await session.execute(select(Measurements))
        return [self._table_to_model(x) for x in result.scalars().all()]

    async def get_my_measurements(
        self, session: AsyncSession, current_user: User
    ) -> list[Measurement]:
        result = await session.execute(
            select(Measurements).filter(Measurements.author_id == current_user.id)
        )
        return [self._table_to_model(x) for x in result.scalars().all()]

    async def create_new_measurement(
        self, session: AsyncSession, data: CreateMeasurement, current_user: User
    ) -> Measurement:
        new_measurement = Measurements(
            location_string=data.location.string,
            location_time=data.location.time.replace(tzinfo=None),
            notes=data.notes,
            description=data.description,
            title=data.title,
            author_id=current_user.id,
            tags=", ".join(data.tags),
        )
        session.add(new_measurement)
        await session.flush()
        await session.refresh(new_measurement)
        return self._table_to_model(new_measurement)

    def get_router(self):
        router = APIRouter()

        @router.get("/", response_model=list[Measurement])
        async def get_all_measurements(
            session: AsyncSession = Depends(get_async_session),
        ):
            """Returns all Measurements, to be used on the map part, therefore public"""
            return await self.get_all_measurements(session)

        @router.get("/mine", response_model=list[Measurement])
        async def get_users_measurements(
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ):
            """Returns Measurements for the current user"""
            return await self.get_my_measurements(session, user)

        @router.post("/create", response_model=Measurement)
        async def add_measurement(
            measurement: CreateMeasurement,
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> Measurement:
            """
            Create new Measurement.

            Tags must not contain `,`
            """
            if "," in "".join(measurement.tags):
                raise HTTPException(
                    status_code=422, detail="`,` in tags is not allowed"
                )
            try:
                new_measurement = await self.create_new_measurement(
                    session, measurement, user
                )
                await session.commit()
                return new_measurement
            except:
                raise HTTPException(
                    status_code=500, detail="Failed to save to database"
                )

        return router
