var gettingStartedHtmlTemplate = '<!-- HTML Code goes here -->';

var gettingStartedJavaScriptTemplate = '';

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
'      <div data-widgetType="VerticalLayout">\n' +
'\n' +
'        <!-- Button widget -->\n' +
'        <div data-widgetType="Button" text="Time" id="btnTime"></div>\n' +
'\n' +
'        <!-- Button widget -->\n' +
'        <div data-widgetType="Button" text="Phone Name" id="btnName"></div>\n' +
'\n' +
'      </div> <!--vertical layout-->\n' +
'    </div> <!--screen widget-->\n' +
'  </div> <!--nativeui-->\n' +
'</body>\n' +
'</html>';

var nativeJavaScriptTemplate = 'mosync.nativeui.UIReady = function() {\n' +
'  var mainScreen = document.getNativeElementById("mainScreen");\n' +
'  mainScreen.show();\n' +
'\n' +
'  var btnTime = document.getNativeElementById("btnTime");\n' +
'  btnTime.addEventListener("Clicked", function() {\n' +
'    alert(new Date());\n' +
'  });\n' +
'\n' +
'  var btnName = document.getNativeElementById("btnName");\n' +
'  btnName.addEventListener("Clicked", function() {\n' +
'    alert(device.name);\n' +
'  });\n' +
'};\n' +
'\n' +
'document.addEventListener("deviceready", function() {\n' +
'  mosync.nativeui.initUI();\n' +
'},true);';

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
'        <div>Platform: <span id="platform"></span></div>\n' +
'        <div>Version: <span id="version"></span></div>\n' +
'        <div>UUID: <span id="uuid"></span></div>\n' +
'        <div>Name: <span id="name"></span></div>\n' +
'        <div>Width: <span id="width"></span></div>\n' +
'        <div>Height: <span id="height"></span></div>\n' +
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
'}\n' +
'\n' +
'function displayDeviceInfo() {\n' +
'  document.getElementById("platform").innerHTML = device.platform;\n' +
'  document.getElementById("version").innerHTML = device.version;\n' +
'  document.getElementById("uuid").innerHTML = device.uuid;\n' +
'  document.getElementById("name").innerHTML = device.name;\n' +
'  document.getElementById("width").innerHTML = screen.width;\n' +
'  document.getElementById("height").innerHTML = screen.height;\n' +
'}\n' +
'\n' +
'// Select thid line and right click on it to execute the function!\n' +
'// displayDeviceInfo();\n';