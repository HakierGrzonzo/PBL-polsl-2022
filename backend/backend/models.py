from typing import Optional
from fastapi_users import models
from pydantic import BaseModel
from pydantic.types import UUID4
from datetime import datetime
from fastapi_users.authentication.strategy.db import BaseAccessToken


class Weather(BaseModel):
    temperature: float
    wind_speed: float
    pressure: float
    humidity: float
    status: str


class AccessToken(BaseAccessToken):
    pass


class User(models.BaseUser):
    pass


class UserCreate(models.BaseUserCreate):
    pass


class UserUpdate(models.BaseUserUpdate):
    pass


class UserDB(User, models.BaseUserDB):
    pass


class Location(BaseModel):
    latitude: float
    longitude: float
    time: datetime


class FileEntry(BaseModel):
    file_id: UUID4
    original_name: str
    mime: str
    optimized_mime: Optional[str]
    measurement: int
    owner: UUID4


class FileReference(FileEntry):
    link: str


class _protoMeasurement(BaseModel):
    location: Location
    notes: str
    description: str
    title: str
    laeq: float
    tags: list[str]


class Measurement(_protoMeasurement):
    measurement_id: int
    files: list[FileReference]
    weather: Optional[Weather]
    score: Optional[float]
    deviation: Optional[float]


class AdminPanelMsg(BaseModel):
    msg: str


class CreateMeasurement(_protoMeasurement):
    pass


class UpdateMeasurement(_protoMeasurement):
    pass
