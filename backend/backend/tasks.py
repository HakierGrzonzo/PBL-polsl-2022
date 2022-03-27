import dramatiq
import os
from dramatiq.brokers.redis import RedisBroker

redis_broker = RedisBroker(host="redis")
dramatiq.set_broker(redis_broker)

@dramatiq.actor
def hello_queue():
    os.system("ffmpeg -version")
    print("hello world")
