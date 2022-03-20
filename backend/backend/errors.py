from pydantic import BaseModel


class ErrorModel(BaseModel):
    detail: str


class errors:
    COMMA_ERROR = "No commas allowed in tags! Please direct your request to a working server"
    VALLIDATION_ERROR = "Validation Error"
    DB_ERROR = "Failed to save to database"
    ID_ERROR = "Measurement id does not exist!"
    FILE_ERROR = "Requested file does not exist!"
    OWNER_ERROR = "You do not own this object!"
    FILES_EXIST = (
        "This measurement has some files associated with it, delete them first!"
    )


def get_error(string: str):
    return {"summary": string, "value": {"detail": string}}
