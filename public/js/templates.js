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