(function() {

  var socket = io.connect();

  // on connection to server
  socket.on('connect', function () {
    // tell the server I want to be in the mobile room
    socket.emit('room', 'mobile');
  });

  // on load of page
  $(function() {

    // socket.on('restoreWebView', function (code) {
    //   mosync.nativeui.destroyAll();
    //   mosync.bridge.send(["Custom", "restoreWebView"]);
    // });

    socket.on('htmlCode', function (code) {
      mosync.nativeui.destroyAll();
      mosync.bridge.send(["Custom", "restoreWebView"]);

      document.open("text/html");
      document.write(code);
      document.close();
    });

    socket.on('jsCode', function (code) {
      try {
        eval(code);
      } catch(e) {
        // If the user changes something that generate an error,
        // we don't want to show an alert every time
        // alert('something went wrong with the js!');
      }
    });
  }); // on load of page
})();