from .colors import Color
from fastapi import APIRouter, Response
from jinja2 import Template
from os import path
from fastapi_redis_cache.cache import cache_one_day


class SvgResponse(Response):
    media_type = "image/svg_xml"

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(media_type="image/svg+xml", *args, **kwargs)


def change_mime(mime=SvgResponse.media_type):
    def outer(f):
        def inner(*args, **kwargs):
            response = f(*args, **kwargs)
            response.media_type = mime
            print(response)
            return response

        return inner

    return outer


class Markers:
    def __init__(self, min: float, max: float) -> None:
        self.min = min
        self.max = max
        template_path = path.join(path.dirname(__file__), "pin.svg")
        self.template = Template(open(template_path).read())
        self.min_color = Color(rgb=(0, 1, 0))
        self.max_color = Color(rgb=(1, 0, 0))

    def get_router(self) -> APIRouter:
        router = APIRouter()

        @router.get("/{score}", response_class=SvgResponse, status_code=200)
        def get_marker(score: float):
            factor = score / (self.max - self.min)
            response = SvgResponse(
                content=self.template.render(
                    {
                        "color": self.min_color.lerp(
                            self.max_color, factor
                        ).get_css_color()
                    }
                ),
            )
            response.headers['cache-control'] = 'max-age=3600'
            return response

        return router
