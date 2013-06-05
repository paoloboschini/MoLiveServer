mosync.nativeui.UIReady = function() {
  var mainScreen = document.getNativeElementById("mainScreen");
  mainScreen.show();

  var btnTime = document.getNativeElementById("btnTime");
  btnTime.addEventListener("Clicked", function() {
    alert(new Date());
  });

  var btnName = document.getNativeElementById("btnName");
  btnName.addEventListener("Clicked", function() {
    alert(device.name);
  });
};

document.addEventListener("deviceready", function() {
  mosync.nativeui.initUI();
},true);