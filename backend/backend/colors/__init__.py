from typing import Tuple, Optional


class Color:
    """
        Class representing colors, doing color calculations in HSV color space
    """
    def __init__(
        self,
        rgb: Optional[Tuple[float, float, float]] = None,
        hsv: Optional[Tuple[float, float, float]] = None,
    ) -> None:
        # clamp rgb values to 0 - 1
        if rgb:
            r, g, b = [min(max(c, 0), 1) for c in rgb]
            # https://www.rapidtables.com/convert/color/rgb-to-hsv.html
            c_max = max(r, g, b)
            c_min = min(r, g, b)
            delta = c_max - c_min
            # Calculate H
            if delta == 0:
                self._h = 0
            else:
                if c_max == r:
                    self._h = 60 * (((g - b) / delta) % 6)
                elif c_max == g:
                    self._h = 60 * (((b - r) / delta) + 2)
                else: # c_max == b
                    self._h = 60 * (((r - g) / delta) + 4)
            # Calculate S
            if c_max == 0:
                self._s = 0
            else:
                self._s = delta / c_max
            # Calculate V
            self._v = c_max

        elif hsv:
            self._h, self._s, self._v = hsv
        else:
            raise Exception("No colors given!")

    def to_HSV(self) -> Tuple[float, float, float]:
        """
        Returns the color value in a [H, S, V] format, where:
            0 <= H < 360
            0 <= S, V <= 1
        """
        return self._h, self._s, self._v

    def __sub__(self, other):
        """Returns the diffrence of colors in HSV color space"""
        return Color(
            hsv=tuple(
                old - new
                for new, old in zip(list(self.to_HSV()), list(other.to_HSV()))
            )
        )

    def to_RGB(self) -> Tuple[float, float, float]:
        """
        Returns Color as a [R, G, B] value, where:
            0 <= r, g, b <= 1
        """
        # https://www.rapidtables.com/convert/color/hsv-to-rgb.html
        c = self._v * self._s
        x = c * (1 - abs((self._h / 60) % 2 - 1))
        m = self._v - c
        if self._h < 60:
            r, g, b = c, x, 0
        elif self._h < 120:
            r, g, b = x, c, 0
        elif self._h < 180:
            r, g, b = 0, c, x
        elif self._h < 240:
            r, g, b = 0, x, c
        elif self._h < 300:
            r, g, b = x, 0, c
        else: # self._h < 360
            r, g, b = c, 0, x

        return r + m, g + m, b + m

    def lerp(self, target, factor: float):
        """
        Returns a mixed color from `self` and `target`, in such a way where
        factor of zero would return `self` and factor of 1 would return `target`
        """
        source = self.to_HSV()
        target = (self - target).to_HSV()
        return Color(
            hsv=tuple(
                old + factor * new
                for old, new in zip(list(source), list(target))
            )
        )

    def __repr__(self) -> str:
        r, g, b = [round(255 * c) for c in self.to_RGB()]
        return f"<Color r={r} g={g} b={b} h={self._h} s={self._s} v={self._v}/>"

    def get_css_color(self) -> str:
        """
        Returns the color as a `#rrggbb` value suitable for css
        """
        r, g, b = [round(255 * c) for c in self.to_RGB()]
        return "#{:02X}{:02X}{:02X}".format(r, g, b)
