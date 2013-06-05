/*
var btn = document.getElementById('change');
btn.addEventListener('click', function() {
  changeColor();
}, false);

function changeColor() {
  document.documentElement.style.backgroundColor = "white";
  document.body.style.backgroundColor = "white";
}
*/

function changeColor() {
  var color = "#" +
    (Math.random() * 0xFFFFFF + 0x1000000)
    .toString(16).substr(1,6);
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}

function displayDeviceInfo() {
  document.getElementById("platform").innerHTML = device.platform;
  document.getElementById("version").innerHTML = device.version;
  document.getElementById("uuid").innerHTML = device.uuid;
  document.getElementById("name").innerHTML = device.name;
  document.getElementById("width").innerHTML = screen.width;
  document.getElementById("height").innerHTML = screen.height;
}

// Select thid line and right click on it to execute the function!
// displayDeviceInfo();