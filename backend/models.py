from fastapi_users import models
from pydantic import BaseModel
from pydantic.types import UUID4
from typing import Optional
from datetime import datetime
from fastapi_users.authentication.strategy.db import BaseAccessToken


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

class Tag(BaseModel):
    name: str

class Location(BaseModel):
    string: str
    time: datetime

class FileEntry(BaseModel):
    file_id: UUID4
    original_name: str
    mime: str
    owner: UUID4

class FileRefrence(FileEntry):
    link: str

class _protoMeasurment(BaseModel):
    location: Location
    notes: str
    description: str
    title: str
    author: UUID4
    tags: list[Tag]

class Measurment(_protoMeasurment):
    measurment_id: UUID4
    photo: Optional[FileRefrence]
    recording: Optional[FileRefrence]
    other_files: Optional[list[FileRefrence]]

class CreateMeasurment(BaseModel):
    photo: Optional[FileEntry]
    recording: Optional[FileEntry]
    other_files: Optional[list[FileEntry]]


class UpdateMeasurment(_protoMeasurment):
    measurment_id: UUID4
    photo: Optional[UUID4]
    recording: Optional[UUID4]
    other_files: Optional[list[UUID4]]


