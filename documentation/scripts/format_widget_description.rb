s = "left

Sets or gets the horizontal distance from the parent widget in a RelativeLayout.

top

Specifies the vertical distance from the parent widget in a RelativeLayout.

width

Sets or gets the width of a widget.

height

Sets or gets the height of a widget.

alpha

Sets the transparency of the widget background. On Android this property is available for the moment only on Layouts and ImageWidget widgets.

backgroundColor

Specifies the background color of a widget.

visible

Sets whether the widget is visible or not. Layouts ignore invisible widgets.

enabled

Sets whether the widget is enabled or not. If not, the widget is grayed out.

backgroundGradient

Specifies the background gradient of a widget. Currently implemented only on Android."


pass1 = ""
s.each do |line|
  next if line == "\n"
  pass1 << line.gsub("'","\\\\'")
end

pass2 = ""
pass1.each_with_index do |line,i|
  pass2 << "['" + line.chop + "'," if i % 2 == 0
  pass2 << "'" + line.chop + "'],\n" if i % 2 != 0
end

puts pass2[0..-3]