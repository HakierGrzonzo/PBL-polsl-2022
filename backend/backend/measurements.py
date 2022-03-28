from fastapi import HTTPException
from fastapi.param_functions import Depends
from fastapi_users.fastapi_users import FastAPIUsers
from sqlalchemy.sql import select, delete
from sqlalchemy.ext.asyncio.session import AsyncSession
from starlette.responses import Response
from fastapi_redis_cache import cache
from .tasks import on_new_location
from .models import (
    Location,
    Measurement,
    CreateMeasurement,
    User,
    UpdateMeasurement,
    FileReference,
    Weather,
)
from .database import get_async_session, Measurements
from fastapi.routing import APIRouter
from .errors import errors, ErrorModel, get_error
import json


class MeasurementRouter:
    def __init__(self, fastapi_users: FastAPIUsers, file_prefix: str):
        self.fastapi_users = fastapi_users
        self.file_prefix = file_prefix

    def _table_to_model(self, source: Measurements) -> Measurement:
        return Measurement(
            measurement_id=source.id,
            location=Location(
                latitude=source.location_latitude or 0,
                longitude=source.location_longitude or 0,
                time=source.location_time,
            ),
            notes=source.notes,
            description=source.description,
            title=source.title,
            tags=source.tags.split(", "),
            laeq=source.laeq or 0,
            files=list(
                [
                    FileReference(
                        file_id=x.id,
                        owner=x.author_id,
                        mime=x.mime,
                        original_name=x.original_name,
                        link="{}/file/{}".format(self.file_prefix, x.id),
                        measurement=x.measurement_id,
                    )
                    for x in source.files
                ]
            ),
            weather = Weather(
                temperature = source.temperature,
                wind_speed = source.wind_speed,
                pressure = source.pressure,
                humidity = source.humidity,
                status = source.weather_status
            ) if source.temperature is not None else None
        )

    def _check_tags(
        self, to_check: Measurement | CreateMeasurement | UpdateMeasurement
    ):
        if "," in "".join(to_check.tags):
            raise HTTPException(status_code=422, detail=errors.COMMA_ERROR)

    async def get_all_measurements(
        self, session: AsyncSession
    ) -> list[Measurement]:
        result = await session.execute(select(Measurements))
        return [
            self._table_to_model(x) for x in result.unique().scalars().all()
        ]

    async def get_one_measurement(
        self, session: AsyncSession, id: int
    ) -> Measurement:
        result = await session.execute(
            select(Measurements).filter(id == Measurements.id)
        )
        res = result.unique().scalars().all()
        if len(res) != 1:
            raise HTTPException(status_code=404, detail=errors.ID_ERROR)
        return self._table_to_model(res[0])

    async def delete_measurment(
        self,
        session: AsyncSession,
        delete_id: int,
        current_user: User,
    ):
        measurement = await session.execute(
            select(Measurements).filter(delete_id == Measurements.id)
        )
        res = measurement.unique().scalars().all()
        if len(res) != 1:
            raise HTTPException(status_code=404, detail=errors.ID_ERROR)
        target = res[0]
        if target.author_id != current_user.id:
            raise HTTPException(status_code=403, detail=errors.OWNER_ERROR)
        if len(target.files) > 0:
            raise HTTPException(status_code=412, detail=errors.FILES_EXIST)
        await session.execute(
            delete(Measurements).where(delete_id == Measurements.id)
        )

    async def update_measurements(
        self,
        session: AsyncSession,
        edit_id: int,
        new_data: UpdateMeasurement,
        current_user: User,
    ) -> Measurement:
        old = await session.execute(
            select(Measurements).filter(Measurements.id == edit_id)
        )
        old = old.unique().scalars().all()
        if len(old) != 1:
            print(old)
            raise HTTPException(status_code=404, detail=errors.ID_ERROR)
        target = old[0]
        if target.author_id != current_user.id:
            raise HTTPException(status_code=403, detail=errors.OWNER_ERROR)
        target.title = new_data.title
        target.notes = new_data.notes
        target.description = new_data.description
        target.tags = ", ".join(new_data.tags)
        target.location_latitude = new_data.location.latitude
        target.location_longitude = new_data.location.longitude
        target.location_time = new_data.location.time.replace(tzinfo=None)
        target.laeq = new_data.laeq
        return self._table_to_model(target)

    async def get_my_measurements(
        self, session: AsyncSession, current_user: User
    ) -> list[Measurement]:
        result = await session.execute(
            select(Measurements).filter(
                Measurements.author_id == current_user.id
            )
        )
        return [
            self._table_to_model(x) for x in result.unique().scalars().all()
        ]

    async def create_new_measurement(
        self, session: AsyncSession, data: CreateMeasurement, current_user: User
    ) -> Measurement:
        new_measurement = Measurements(
            location_longitude=data.location.longitude,
            location_latitude=data.location.latitude,
            location_time=data.location.time.replace(tzinfo=None),
            notes=data.notes,
            description=data.description,
            title=data.title,
            laeq=data.laeq,
            author_id=current_user.id,
            tags=", ".join(data.tags),
        )
        session.add(new_measurement)
        await session.flush()
        await session.refresh(new_measurement)
        model = self._table_to_model(new_measurement)
        on_new_location.send(json.loads(model.json()))
        return model

    def get_router(self):
        router = APIRouter()

        @router.get("/", response_model=list[Measurement])
        @cache(expire=120)
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

        @router.patch(
            "/{id}",
            response_model=Measurement,
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
                            "examples": {1: get_error(errors.ID_ERROR)}
                        }
                    },
                },
                421: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {
                                1: get_error(errors.COMMA_ERROR),
                            }
                        }
                    },
                },
                500: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.DB_ERROR)}
                        }
                    },
                },
            },
        )
        async def edit_measurement(
            id: int,
            new_data: UpdateMeasurement,
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> Measurement:
            self._check_tags(new_data)
            res = await self.update_measurements(session, id, new_data, user)
            try:
                await session.commit()
                return res
            except Exception as e:
                print(e)
                raise HTTPException(status_code=500, detail=errors.DB_ERROR)

        @router.get(
            "/{id}",
            response_model=Measurement,
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
        async def get_one_measurement(
            id: int,
            session: AsyncSession = Depends(get_async_session),
        ) -> Measurement:
            res = await self.get_one_measurement(session, id)
            return res

        @router.post(
            "/create",
            response_model=Measurement,
            status_code=201,
            responses={
                421: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.COMMA_ERROR)}
                        }
                    },
                },
                500: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.DB_ERROR)}
                        }
                    },
                },
            },
        )
        async def add_measurement(
            measurement: CreateMeasurement,
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> Measurement:
            """
            Create new Measurement.

            Tags must not contain `,`
            """
            self._check_tags(measurement)
            new_measurement = await self.create_new_measurement(
                session, measurement, user
            )
            try:
                await session.commit()
                return new_measurement
            except Exception as e:
                print(e)
                raise HTTPException(status_code=500, detail=errors.DB_ERROR)

        @router.delete(
            "/{id}",
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
                            "examples": {1: get_error(errors.ID_ERROR)}
                        }
                    },
                },
                412: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.FILES_EXIST)}
                        }
                    },
                },
                500: {
                    "model": ErrorModel,
                    "content": {
                        "application/json": {
                            "examples": {1: get_error(errors.DB_ERROR)}
                        }
                    },
                },
            },
        )
        async def delete_measurement(
            id: int,
            session: AsyncSession = Depends(get_async_session),
            user: User = Depends(self.fastapi_users.current_user()),
        ) -> Response:
            await self.delete_measurment(session, id, user)
            try:
                await session.commit()
                return Response(status_code=204)
            except Exception as e:
                print(e)
                raise HTTPException(status_code=500, detail=errors.DB_ERROR)

        return router
