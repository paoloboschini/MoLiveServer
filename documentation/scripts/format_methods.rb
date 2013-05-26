# page = `wget -qO- http://www.mosync.com/files/imports/doxygen/latest/html5/mosync-nativeui.js.html#mosync.nativeui`

# puts page.scan(/<h1>.*>(.*)<\/a><\/h1>/)

s = "webViewHandle The MoSync handle of the WebView widget. Use mosync.nativeui.MAIN_WEBVIEW to refer to the main WebView in the application (this is the hidden WebView in a JavaScript NativeUI app).
script A string with JavaScript code."

pass1 = ""
s.each_with_index do |line,i|
  pass1 << "{ name: '" + line.split[0...1].join(' ') + "',\n" +
  "  description: '" + line.match(/[.* ](.*)/)[1] + "'},\n"
end

puts pass1[0..-3]