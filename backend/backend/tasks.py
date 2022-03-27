import dramatiq
import os
from pyowm import OWM
from dramatiq.brokers.redis import RedisBroker

redis_broker = RedisBroker(host="redis")
dramatiq.set_broker(redis_broker)
owm = OWM(os.environ["OPENWEATHERMAP"])

@dramatiq.actor
def hello_queue():
    os.system("ffmpeg -version")
    print("hello world")

@dramatiq.actor
def on_new_location(measurement):
    # TODO add redis time lat long cache
    # TODO update db
    mgr = owm.weather_manager()
    w = mgr.weather_at_coords(
            measurement["location"]["latitude"], 
            measurement["location"]["longitude"]
    )
    print(vars(w))

