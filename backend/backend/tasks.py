import dramatiq
import os
from pyowm import OWM
from dramatiq.brokers.redis import RedisBroker
from sqlalchemy.sql.expression import select
from .utils import run_as_sync
from .database import Files, Measurements, get_sync_session
from backend.models import FileReference
import ffmpeg
from wand.image import Image


FILE_PATH_PREFIX = os.environ["FILE_PATH"]

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
def on_new_location(measurement):
    # TODO add redis time lat long cache
    mgr = owm.weather_manager()
    for session in get_sync_session():
        old = session.execute(
            select(Measurements).filter(
                Measurements.id == measurement["measurement_id"]
            ) 
        ).unique().scalars().all()
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
        session.commit()
    print(f"Got weather for {measurement['measurement_id']}")


@dramatiq.actor
def ffmpeg_compress_audio(audio_uuid):
    ffmpeg.input(os.path.join(FILE_PATH_PREFIX, audio_uuid)).output(
        os.path.join(FILE_PATH_PREFIX, audio_uuid + "_opt"),
        f="adts",
        acodec="aac",
        audio_bitrate=128 * 1024,
    ).overwrite_output().run()
    for session in get_sync_session():
        f_query = session.execute(select(Files).filter(Files.id == audio_uuid))
        fs = f_query.scalars().all()
        if len(fs) != 1:
            raise Exception("Failed to process file, not found in db")
        f = fs[0]
        f.optimized_name = f.original_name + ".aac"
        f.optimized_mime = "audio/aac"
        session.commit()
    print(f"Transcoded {audio_uuid} successfully")


@dramatiq.actor
def magick_compress_picture(picture_uuid):
    try:
        img = Image(filename=os.path.join(FILE_PATH_PREFIX, picture_uuid))
    except:
        print(f"Picture {picture_uuid} is unopenable!")
        return
    img.resize(img.width // 10, img.height // 10)
    img_webp = img.convert('webp')
    img_webp.save(filename=os.path.join(FILE_PATH_PREFIX, picture_uuid + "_opt"))
    for session in get_sync_session():
        f_query = session.execute(select(Files).filter(Files.id == picture_uuid))
        fs = f_query.scalars().all()
        if len(fs) != 1:
            raise Exception("Failed to process file, not found in db")
        f = fs[0]
        f.optimized_name = f.original_name + (
            ".webp" if not f.original_name.endswith(".webp") else ""
        )
        f.optimized_mime = "image/webp"
        session.commit()
    print(f"Converted {picture_uuid} successfully")

def send_file_to_be_optimized(file: FileReference) -> bool:
    if "audio" in file.mime.lower():
        ffmpeg_compress_audio.send(str(file.file_id))
        return True
    elif "image" in file.mime.lower():
        magick_compress_picture.send(str(file.file_id))
        return True
    return False

