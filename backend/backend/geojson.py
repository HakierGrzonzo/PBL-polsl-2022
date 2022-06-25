import os
from fastapi.param_functions import Depends
from fastapi.routing import APIRouter
from geojson.feature import FeatureCollection
from sqlalchemy.ext.asyncio.session import AsyncSession
from starlette.responses import JSONResponse
from backend.database import get_async_session
from fastapi_redis_cache import cache
from backend.measurements import MeasurementRouter
from geojson import Feature, Point, dumps
import json

HOSTNAME = os.environ["HOSTNAME"]


class GeoJsonRouter:
    def __init__(self, measurements: MeasurementRouter) -> None:
        self.measurements = measurements

    def get_router(self) -> APIRouter:
        router = APIRouter()

        @router.get("/", response_class=JSONResponse)
        @cache(expire=120)
        async def get_geojson(
            session: AsyncSession = Depends(get_async_session),
        ):
            measurements = await self.measurements.get_all_measurements(session)
            geo_json = FeatureCollection(
                [
                    Feature(
                        geometry=Point(
                            (m.location.longitude, m.location.latitude)
                        ),
                        properties={
                            "Name": m.title,
                            "l_aeq": m.laeq,
                            "files": [
                                {
                                    "name": f.original_name,
                                    "link": HOSTNAME + f.link,
                                }
                                for f in m.files
                            ],
                            # This is an ugly hack, we convert stuff 
                            # to a json string then convert it back
                            "weather": json.loads(m.weather.json())
                            if m.weather
                            else None,
                        },
                    )
                    for m in measurements
                ]
            )
            # This is an ugly hack, we convert stuff 
            # to a json string then convert it back
            return json.loads(dumps(geo_json))

        return router
