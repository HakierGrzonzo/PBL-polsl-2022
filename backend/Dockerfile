FROM python:3.10

WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
EXPOSE 80
ENV FILE_PATH /files
VOLUME /files


RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./backend_runner.sh .
COPY ./alembic.ini ./alembic.ini
COPY ./alembic ./alembic
COPY ./backend ./backend
CMD /app/backend_runner.sh
