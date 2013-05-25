var nativeHtmlTemplate = '<!DOCTYPE html>\n' +
'<html>\n' +
'  <head>\n' +
'    <meta http-equiv="Content-type" content="text/html; charset=utf-8">\n' +
'  </head>\n' +
'\n' +
'  <body>\n' +
'  <div id="NativeUI">\n' +
'    <div data-widgetType="Screen" id="mainScreen">\n' +
'\n' +
'      <!-- Image widget -->\n' +
'      <div data-widgetType="Image" image="resources/100.jpeg"></div>\n' +
'\n' +
'    </div> <!--screen widget-->\n' +
'  </div> <!--nativeui-->\n' +
'</body>\n' +
'</html>';

var nativeJavaScriptTemplate = 'mosync.nativeui.UIReady = function() {\n' +
'  var mainScreen = document.getNativeElementById("mainScreen");\n' +
'  mainScreen.show();\n' +
'  //var vibrateButton = document.getNativeElementById("vibrateButton");\n' +
'};\n' +
'\n' +
'document.addEventListener("deviceready", function() {\n' +
'  mosync.nativeui.initUI();\n' +
'},true);';

var autocompletetestTemplate = 'var myButton = mosync.nativeui.create("Button", "myButton", {\n' +
'  "text" : "Click Me!",\n' +
'  "width" : "FILL_AVAILABLE_SPACE"\n' +
'});';

var webHtmlTemplate = '<!DOCTYPE html>\n' +
'<html>\n' +
'  <head>\n' +
'    <meta name="viewport" content="width=320, user-scalable=no">\n' +
'    <meta http-equiv="Content-type" content="text/html; charset=utf-8">\n' +
'    <title>Wormhole Template App</title>\n' +
'  </head>\n' +
'  <body>\n' +
'    <div id="screen">\n' +
'      <div id="heading">Customized Wormhole Technology</div>\n' +
'      <div id="info">\n' +
'        <div>Platform: <span id="platform">&nbsp;</span></div>\n' +
'        <div>Version: <span id="version">&nbsp;</span></div>\n' +
'        <div>UUID: <span id="uuid">&nbsp;</span></div>\n' +
'        <div>Name: <span id="name">&nbsp;</span></div>\n' +
'        <div>Width: <span id="width">&nbsp;</span></div>\n' +
'        <div>Height: <span id="height">&nbsp;</span></div>\n' +
'      </div>\n' +
'      <div onclick=\'changeColor()\'>Change Color</div>\n' +
'    </div>\n' +
'  </body>\n' +
'</html>';

var webJavaScriptTemplate = '/*\n' +
'var btn = document.getElementById(\'change\');\n' +
'btn.addEventListener(\'click\', function() {\n' +
'  changeColor();\n' +
'}, false);\n' +
'\n' +
'function changeColor() {\n' +
'  document.documentElement.style.backgroundColor = "white";\n' +
'  document.body.style.backgroundColor = "white";\n' +
'}\n' +
'*/\n' +
'\n' +
'function changeColor() {\n' +
'  var color = "#" +\n' +
'    (Math.random() * 0xFFFFFF + 0x1000000)\n' +
'    .toString(16).substr(1,6);\n' +
'  document.documentElement.style.backgroundColor = color;\n' +
'  document.body.style.backgroundColor = color;\n' +
'}';