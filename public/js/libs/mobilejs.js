(function() {

  var socket = io.connect();

  // On connection to server
  socket.on('connect', function() {
    // Tell the server I want to be in the mobile room
    socket.emit('room', 'mobile');
  });

  socket.on('html', function(code) {
    console.log('html code evaluated:' + code);
    reset();
    // document.location.reload(true);

    document.open();
    document.write(code);
    document.close();
  });

  socket.on('javascript', function(code) {
    try {
      console.log('Code evaluate on mobile:' + code);
      // execute eval in the global scope
      eval.call(window, code);
    } catch(e) {
      // If the user changes something that generate an error,
      // we don't want to show an alert every time
      // alert('something went wrong with the js!');
      console.log('error catch mobile:', e);
      socket.emit('mobilelog', e.message);
    }
  });

  socket.on('reset', function() {
    reset();
  });

  /**
   * This function can be called by two sources:
   * 1. When the user clicks on the Restart button,
   *    then the web app needs to know when then the
   *    webview is done restoring itself and it is ready.
   *    In this case we send mobileIsReady message.
   * 2. When reset is called while live programming,
   *    i.e. the user is editing the HTML area.
   * @param  {[type]} liveCoding [description]
   * @return {[type]}            [description]
   */
  function reset() {
    mosync.nativeui.destroyAll();
    mosync.bridge.send(['Custom', 'restoreWebView']);
    mosync.bridge.send(['Custom', 'restoreWebView']);
    mosync.nativeui.callBackTable = {};
    mosync.nativeui.eventCallBackTable = {};

    mosync.nativeui.numWidgetsRequested = 0;
    window.clearInterval(mosync.nativeui.showInterval);
  }

  //-------------------------------------------------------
  //
  // Get server IP address
  // 
  mosync.bridge.send([
    'Custom',
    'getServerAddress'
  ], function(ip) {
    server_ip = ip;
  });

  socket.on('downloadResource', function(filename) {
    mosync.bridge.send([
      'Custom',
      'downloadResource',
      'http://' + server_ip + ':5678/uploads/' + filename,
      filename
    ], function(message) {
      socket.emit('resourceSaved', message);
    });
  });

  socket.on('getListResources', function() {
    mosync.bridge.send([
      'Custom',
      'getListResources'
    ], function(resources) {
      socket.emit('listResources', resources);
    });
  });

})(); // (function() {