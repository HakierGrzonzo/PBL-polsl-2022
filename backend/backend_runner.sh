#!/bin/bash
while !</dev/tcp/db/5432; do 
    sleep 1
done
echo "DB is up!"
python3 -m alembic upgrade head 
uvicorn backend:app --host 0.0.0.0 --port 80
