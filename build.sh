#!/usr/bin/fish

set VERSION "0-9-2"
set FRONTEND "hakiergrzonzo/pbl:v$VERSION-front"
set BACKEND "hakiergrzonzo/pbl:v$VERSION-back"

docker build -t $FRONTEND ./frontend >> /dev/null > /dev/null
docker push $FRONTEND
docker build -t $BACKEND ./backend >> /dev/null > /dev/null
docker push $BACKEND

#docker build -t localhost:5000/clip_site -f Dockerfile.app . && \
#	docker build -t localhost:5000/clip_db -f Dockerfile.mysql . && \
#	docker build -t localhost:5000/clip_worker -f Dockerfile.worker . && \
#	docker build -t localhost:5000/clip_importer -f Dockerfile.importer . 
#
#docker push localhost:5000/clip_site && \
#	docker push localhost:5000/clip_db && \
#	docker push localhost:5000/clip_worker && \
#	docker push localhost:5000/clip_importer
#

