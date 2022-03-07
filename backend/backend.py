import asyncio
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI

app = FastAPI()
from crud import crud_route_1, crud_route_2, engine
from tables import Base

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(crud_route_1)
app.include_router(crud_route_2)
uvicorn.run(app, host="0.0.0.0", port=8000, debug=False)

