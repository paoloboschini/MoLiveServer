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
      // mosync.nativeui.callBackTable = {};
      // mosync.nativeui.eventCallBackTable = {};
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

    // clean up "Clicked" events added to widgets by leaving
    // only the last one
    var table = mosync.nativeui.eventCallBackTable;
    for(var k in table) {
      if(k.indexOf('Clicked') != -1) {
        table[k] = table[k].slice(-1);
      }
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

  var _serverip;
  $.ajax({
    url: '/serverip',
    type: 'POST',
    cache: false,
    timeout: 10000,
    success: function(response) {
      _serverip = response;
    } // success
  }); // ajax

  socket.on('downloadResourceFromServer', function(filename) {
    console.log('downloadResourceFromServer');
    mosync.bridge.send([
      'Custom',
      'downloadResource',
      'http://' + _serverip + ':5678/uploads/' + filename,
      filename
    ], function(message) {
      socket.emit('resourceSaved', message);
    });
  });

  socket.on('downloadResourceFromWeb', function(data) {
    mosync.bridge.send([
      'Custom',
      'downloadResource',
      data.url,
      data.filename
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