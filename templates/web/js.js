// You can select/mark arbitraty piece of code and right click
// on the selection to execute it in the current JavaScript runtime
// on the connected phones.

// Try to select "changeColor()" or "displayDeviceInfo()"
// and right click on the selection to execute the functions!

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