(function() {

  var socket = io.connect();

  // On connection to server
  socket.on('connect', function() {
    // Tell the server I want to be in the mobile room
    socket.emit('room', 'mobile');
  });

  // socket.on('restoreWebView', function (code) {
  //   mosync.nativeui.destroyAll();
  //   mosync.bridge.send(['Custom', 'restoreWebView']);
  // });

  socket.on('html', function(code) {
    reset();

    // mosync = null;

    document.open();
    document.write(code);
    document.close();

    // socket.emit('document', document.body);
  });

  socket.on('javascript', function(code) {
    try {
      eval(code);
    } catch(e) {
      // If the user changes something that generate an error,
      // we don't want to show an alert every time
      // alert('something went wrong with the js!');
      console.log("error!");
      console.log(e.message);
    }
  });

  socket.on('reset', function() {
    reset();
  });

  function reset() {
    mosync.nativeui.destroyAll();
    mosync.nativeui.callBackTable = {};
    mosync.nativeui.eventCallBackTable = {};
    mosync.bridge.send(['Custom', 'restoreWebView']);
  }

  socket.on('downloadResource', function(data) {
    mosync.bridge.send([
      'Custom',
      'downloadResource',
      data.url,
      data.filename
    ], function(message) {
      alert(message);
      socket.emit('fileSaved', message);
    });
  });

})(); // (function() {