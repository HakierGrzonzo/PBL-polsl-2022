import dramatiq
import os
from pyowm import OWM
from dramatiq.brokers.redis import RedisBroker
from sqlalchemy.sql.expression import select
from .utils import run_as_sync
from .database import get_async_session, Measurements

owm_token = os.environ.get("OPEN_WEATHER_MAP")
if owm_token:
    owm = OWM(owm_token)
else:
    print("[ERROR] NO OPEN_WEATHER_MAP token is set")
    owm = None
redis_broker = RedisBroker(host="redis")
dramatiq.set_broker(redis_broker)


@dramatiq.actor
def hello_queue():
    os.system("ffmpeg -version")
    print("hello world")


@dramatiq.actor
@run_as_sync
async def on_new_location(measurement):
    # TODO add redis time lat long cache
    mgr = owm.weather_manager()
    async for session in get_async_session():
        old = await session.execute(
            select(Measurements).filter(
                Measurements.id == measurement["measurement_id"]
            )
        )
        old = old.unique().scalars().all()
        if len(old) != 1:
            raise Exception("Failed to get measurement from db to set weather")
        target = old[0]
        w = mgr.weather_at_coords(
            measurement["location"]["latitude"],
            measurement["location"]["longitude"],
        )
        if w is None:
            raise Exception("Failed to get weather information")
        target.temperature = w.weather.temperature()["temp"]
        target.pressure = w.weather.pressure["press"]
        target.humidity = w.weather.humidity
        target.weather_status = w.weather.detailed_status
        target.wind_speed = w.weather.wind()["speed"]
        await session.commit()
    print(f"Got weather for {measurement['measurement_id']}")
