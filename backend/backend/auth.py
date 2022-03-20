from fastapi import Depends
from fastapi_users.authentication.backend import AuthenticationBackend
from fastapi_users.authentication.strategy.db import (
    AccessTokenDatabase,
    DatabaseStrategy,
)

from .database import get_access_token_db
from .models import AccessToken, UserCreate, UserDB


def get_database_strategy(
    access_token_db: AccessTokenDatabase[AccessToken] = Depends(
        get_access_token_db
    ),
) -> DatabaseStrategy[UserCreate, UserDB, AccessToken]:
    return DatabaseStrategy(access_token_db, lifetime_seconds=3600)


from fastapi_users.authentication import CookieTransport, BearerTransport

cookie_transport = CookieTransport(
    cookie_max_age=36000,
    cookie_name="ciasteczkowy_potwor",
    cookie_httponly=True,
    cookie_samesite="strict",
)

cookie_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_database_strategy,
)

token_transport = BearerTransport(tokenUrl="/api/jwt/login")

token_backend = AuthenticationBackend(
    name="jwt", transport=token_transport, get_strategy=get_database_strategy
)
