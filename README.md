[![Czy ktoś zjebał builda?](https://github.com/HakierGrzonzo/PBL-polsl-2022/actions/workflows/docker-images.yml/badge.svg?branch=master)](https://github.com/HakierGrzonzo/PBL-polsl-2022/actions/workflows/docker-images.yml)

# API keys required for backend

In file `api-keys.env` you need to store your API keys:
```env
OPEN_WEATHER_MAP=<your api key> # https://openweathermap.org/
```

#TODO

## Backend

Link do bazy dannych ustawiamy jako zmienną środowiskową `DATABASE`, na przykład:

```bash
export DATABASE=postgresql+asyncpg://postgres:1234@127.0.0.1:5432/pbl
```

lub dla powłoki `fish`:

```bash
set -x DATABASE postgresql+asyncpg://postgres:1234@127.0.0.1:5432/pbl
```

Backend hostujemy za pomocą: 

`uvicorn backend:app --reload`

Biblioteki insalujemy za pomocą komendy:

```
pip3 install -r backend/requirements.txt
```
