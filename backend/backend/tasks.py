import dramatiq
import math
import os
from pyowm import OWM
from dramatiq.brokers.redis import RedisBroker
from sqlalchemy.sql.expression import select
from .utils import parse_exif_to_location
from .database import Files, Measurements, get_sync_session
from backend.models import FileReference
import ffmpeg
from wand.image import Image


FILE_PATH_PREFIX = os.environ["FILE_PATH"]
SCALE_FACTOR = 5

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
        old = (
            session.execute(
                select(Measurements).filter(
                    Measurements.id == measurement["measurement_id"]
                )
            )
            .unique()
            .scalars()
            .all()
        )
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
def try_get_location_from_image(picture_uuid):
    try:
        img = Image(filename=os.path.join(FILE_PATH_PREFIX, picture_uuid))
    except:
        print(f"Picture {picture_uuid} is unopenable!")
        return
    GPS_KEYS = [
        "exif:GPSLatitude",
        "exif:GPSLatitudeRef",
        "exif:GPSLongitude",
        "exif:GPSLongitudeRef",
    ]
    if not all(key in img.metadata.keys() for key in GPS_KEYS):
        print(f"[WARN] No GPS EXIF data in {picture_uuid}")
        return
    lat, long = parse_exif_to_location(img.metadata)
    for session in get_sync_session():
        measurements = (
            session.execute(
                select(Measurements).join(Files).filter(Files.id == picture_uuid)
            )
            .unique()
            .scalars()
            .all()
        )
        if len(measurements) != 1:
            raise Exception(
                f"Error while getting file infromation from DB for {picture_uuid}"
            )
        measurement = measurements[0]
        distance = (
            math.sqrt(
                (measurement.location_longitude - long) ** 2
                + (measurement.location_latitude - lat) ** 2
            )
            * 111
        )
        print(f"[info] location error of {distance}km in {measurement.title}")
        measurement.location_longitude = long
        measurement.location_latitude = lat
        session.commit()


@dramatiq.actor
def ffmpeg_compress_audio(audio_uuid):
    try:
        ffmpeg.input(os.path.join(FILE_PATH_PREFIX, audio_uuid)).output(
            os.path.join(FILE_PATH_PREFIX, audio_uuid + "_opt"),
            f="adts",
            acodec="aac",
            audio_bitrate=128 * 1024,
        ).overwrite_output().run()
    except ffmpeg._run.Error as e:
        print("[error] - ffmpeg:", e)
        return
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
    if orientation := img.metadata.get("exif:Orientation"):
        orientation = int(orientation)
        # https://sirv.com/help/articles/rotate-photos-to-be-upright/
        # maps mirrored rotations to normal ones
        mirrored_dict = {2: 1, 4: 3, 5: 6, 7: 8}
        rotation_dict = {1: 0, 3: 180, 6: 90, 8: 270}
        # try to get rotation
        rotation = rotation_dict[mirrored_dict.get(orientation, orientation)]
        if rotation != 0:
            # Only rotate if we need to
            img.rotate(rotation)
        if orientation in mirrored_dict.keys():
            img.flop()
    img.resize(img.width // SCALE_FACTOR, img.height // SCALE_FACTOR)
    img_webp = img.convert("webp")
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
