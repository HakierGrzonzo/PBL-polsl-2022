from colors import Color

a_color = Color(rgb=(1, 0, 0))
b_color = Color(rgb=(0, 1, 0))
print(a_color, b_color)
print(a_color.lerp(b_color, .5).to_RGB())
