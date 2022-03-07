from fastapi import Depends

from sqlalchemy import CHAR, Column, DateTime, ForeignKey, Integer, String, Table, Text, UniqueConstraint 
from sqlalchemy.orm import relationship 
#from sqlalchemy.sql.sqltypes import NullType
from sqlalchemy.ext.declarative import declarative_base

from fastapi_users.db import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase
Base = declarative_base()
metadata = Base.metadata


class UsersPhotos(Base, SQLAlchemyBaseUserTable):
    __tablename__ = 'users_photos'
    id = Column(Integer, primary_key=True)
    recordings = relationship("PhotosRecordings", backref="photos_recordings")

class PhotosRecordings(Base):
    __tablename__ = 'photos_recordings'
    id = Column(Integer, primary_key=True)
    added = Column(DateTime)
    original_recording = Column(Text)
    compresed_recording = Column(Text)
    photo = Column(Text)
    position = Column(Text)
    position_modified = Column(DateTime)
    description = Column(Text)
    user_notes = Column(Text)
    title = Column(Text)
    author_id = Column(Integer, ForeignKey('users_photos.id'))

