from typing import Tuple, Optional


class Color:
    def __init__(
            self, 
            rgb: Optional[Tuple[float, float, float]] = None, 
            yuv: Optional[Tuple[float, float, float]] = None, 
        ) -> None:
        # clamp rgb values to 0 - 1
        if rgb:
            r, g, b = [min(max(c, 0), 1) for c in rgb]
            self._y = 0.299 * r + 0.587 * g + 0.114 * b
            self._u = 0.429 * (b - self._y)
            self._v = 0.877 * (r - self._y)
        elif yuv:
            self._y, self._u, self._v = yuv
        else:
            raise Exception("No colors given!")

    def to_YUV(self) -> Tuple[float, float, float]:
        return self._y, self._u, self._v

    def __sub__(self, other):
        return Color(
                yuv=tuple(
                    old - new for new, old in zip(list(self.to_YUV()), list(other.to_YUV()))
                    )
                )


    def to_RGB(self) -> Tuple[float, float, float]:
        r = self._y + 1.140 * self._v
        g = self._y - 0.395 * self._u - 0.581 * self._v
        b = self._y + 2.032 * self._u
        return r, g, b

    def lerp(self, target, factor: float):
        source = self.to_YUV()
        print(factor)
        target = (target - self).to_YUV()
        return Color(
            yuv=tuple(
                old - factor * new for old, new in zip(list(source), list(target))
                )
        )

    def __repr__(self) -> str:
        r, g, b = [round(255 * c) for c in self.to_RGB()]
        return f"<Color r={r} g={g} b={b} />"

    def get_css_color(self) -> str:
        color = 0
        for c in self.to_RGB():
            clamped = max(min(c * 255, 255), 0)
            color = 255 * color + clamped
        print(self)
        return '#{:06X}'.format(round(color))



