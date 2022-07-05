import asyncio
from typing import Tuple

from backend.models import Location


def run_as_sync(f):
    def inner(*args, **kwargs):
        try:
            loop = asyncio.get_event_loop()
        except:
            loop = asyncio.new_event_loop()
        return loop.run_until_complete(f(*args, **kwargs))

    return inner


def parse_gps_coord_string(raw_value: str) -> float:
    """
    Converts gps exif values given as strings in the following format:
            14/1, 30/1, 19/1
             ^    ^       ^
    degrees -+    |       |
        minutes --+       |
                seconds --+

    To degrees in float
    """
    values = raw_value.split(",")
    res = 0
    for v in reversed(values):
        numerator, denominator = [int(x.strip()) for x in v.split("/")]
        res = res / 60 + (numerator / denominator)  # values are in base 60
    return res


def parse_exif_to_location(image_metadata) -> Tuple[float, float]:
    lat = parse_gps_coord_string(image_metadata["exif:GPSLatitude"])
    if image_metadata["exif:GPSLatitudeRef"] != "N":
        lat = -lat
    lon = parse_gps_coord_string(image_metadata["exif:GPSLongitude"])
    if image_metadata["exif:GPSLongitudeRef"] != "E":
        lon = -lon
    return lat, lon
