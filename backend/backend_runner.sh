#!/bin/bash
while !</dev/tcp/db/5432; do 
    sleep 1
done
echo "DB is up!"
python3 -m alembic upgrade head 
while !</dev/tcp/redis/6379; do 
    sleep 1
done
echo "REDIS is up!"
uvicorn backend:app --host 0.0.0.0 --port 80 --proxy-headers
