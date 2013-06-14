(function() {

  var socket = io.connect();

  //-------------------------------------------------------
  //
  // Register to mobile room
  // 
  socket.on('connect', function() {
    socket.emit('room', 'mobile');
  });

  //-------------------------------------------------------
  //
  // Evaluate html
  // 
  socket.on('html', function(code) {
    // console.log('html code evaluated:' + code);

    // reset mosync
    reset();

    document.open();
    document.write(code);
    document.close();
  });

  //-------------------------------------------------------
  //
  // Evaluate JavaScript
  // 
  socket.on('javascript', function(code) {
    try {
      // console.log('Code evaluate on mobile:' + code);

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
    mosync.bridge.send(['Custom', 'restoreWebView']);
    mosync.bridge.send(['Custom', 'restoreWebView']);
  });

  /**
   * Reset mosync runtime
   */
  function reset() {
    mosync.nativeui.destroyAll();
    mosync.nativeui.callBackTable = {};
    mosync.nativeui.eventCallBackTable = {};
    mosync.nativeui.numWidgetsRequested = 0;
    window.clearInterval(mosync.nativeui.showInterval);
  }

  //-------------------------------------------------------
  //
  // Get server ip
  // 
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
      socket.emit('resourceSaved', message, filename);
    });
  });

  socket.on('downloadResourceFromWeb', function(data) {
    mosync.bridge.send([
      'Custom',
      'downloadResource',
      data.url,
      data.filename
    ], function(message) {
      socket.emit('resourceSaved', message, data.filename);
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