(function() {

  // global socket
  var socket = io.connect();

  //-------------------------------------------------------
  //
  // On connection to server tell the server I want to be in
  // the webapp room
  // 
  socket.on('connect', function() {
    socket.emit('room', 'webapp');
  });

  //-------------------------------------------------------
  //
  // Load resources for autocompletion
  // 
  socket.emit('getListResources');
  socket.on('listResources', function(resources) {
    for (var i = 0; i < resources.length; i++) {
      CodeMirror.resourceImages().push('resources/' + resources[i]);
    }
    console.log('Loaded resources: '+ CodeMirror.resourceImages());
  });

  //-------------------------------------------------------
  //
  // Log error from web view on mobile device in browser app
  // 
  socket.on('mobilelog', function(message) {
    console.error("Mobile device log:", message);
  });


  //-------------------------------------------------------
  //
  // On load of page
  // 
  $(function() {

    $.ajax({
      url: '/serverip',
      type: 'POST',
      cache: false,
      timeout: 10000,
      success: function(response) {
        $('#serverip').html('Server IP: ' + response);
      } // success
    }); // ajax

    myCodeMirrors.setSocket(socket);
    var htmlCodeMirror = myCodeMirrors.initHtmlCodeMirror();
    var jsCodeMirror = myCodeMirrors.initJSCodeMirror();

    //-------------------------------------------------------
    //
    // Set up number pickers
    // 
    numberPicker.init(htmlCodeMirror, $('#inletSliderHtml'));
    numberPicker.init(jsCodeMirror, $('#inletSliderJS'));

    //-------------------------------------------------------
    //
    // Set up color pickers
    // 
    colorPicker.init(htmlCodeMirror, 'htmlColorPicker');
    colorPicker.init(jsCodeMirror, 'jsColorPicker');

    //-------------------------------------------------------
    //
    // Set up gists
    // 
    myGist.setSocket(socket);

    //-------------------------------------------------------
    //
    // Updates mouse coordinates indicator on the top-right of the screen
    // 
    // document.addEventListener("mousemove", function(e) {
    //   var x = e.pageX, y = e.pageY;
    //   var posCharInEditor = jsCodeMirror.coordsChar({left: x, top: y});
    //   $('#mouse').html('line-m: ' + posCharInEditor.line + ', ch-m: ' + posCharInEditor.ch);
    // });

    //-------------------------------------------------------
    //
    // Set up templates dropdown
    // 
    $('#templateList li a').click(function(e) {
      e.preventDefault();
      var el = $(this)[0];
      var type = $(el).attr('href');

      LiveUtils.showLoadIndicator();
      $.ajax({
        url: '/template',
        type: 'POST',
        data: {type : type},
        cache: false,
        timeout: 10000,
        success: function(response) {
          LiveUtils.hideLoadIndicator();
          htmlCodeMirror.setValue(response.html);
          jsCodeMirror.setValue(response.js);
        } // success
      }); // ajax      
    });

    //-------------------------------------------------------
    //
    // When the Restart button is clicked, send the code to the
    // server (the server will send it to the mobile)
    // 
    $('#executecode').click(function() {
      if($(this).hasClass('disabled')) {
        return false;
      }

      var html = htmlCodeMirror.getValue();
      socket.emit('html', html);

      // // get html without embedded javascript and emit
      // var htmlWithoutScripts = stripScripts(html);
      // socket.emit('html', htmlWithoutScripts);

      // // extract embedded javascript scripts from html
      // // and emit as javascript
      // var doc = htmlCodeMirror.getValue();
      // var scripts = $(doc).filter('script');
      // for (var i = 0; i < scripts.length; i++) {
      //   socket.emit('javascript', scripts[i].innerHTML);
      // }

      // emit javascript from js myCodeMirrors
      var js = jsCodeMirror.getValue();
      socket.emit('javascript', js);

      /**
       * Removes embedded javascript scripts from html.
       * For some obscure reason, the doctype tag and the head
       * tag are also removed from the html, this is wrong.
       * @param  s html string
       * @return html string without embedded javascript
       */
      function stripScripts(s) {
        var div = document.createElement('div');
        div.innerHTML = s;
        var scripts = div.getElementsByTagName('script');
        var i = scripts.length;
        while (i--) {
          scripts[i].parentNode.removeChild(scripts[i]);
        }
        return div.innerHTML;
      }

      // this will compress the code, i.e. remove extra spaces and returns
      // code = code.replace(/(\r\n|\n|\r|\t)/gm,'');
      // code = code.replace(/\s+/g,' ');
    });

    //-------------------------------------------------------
    //
    // Set up right click for execute code
    // 
    var currentScrollPos;
    $(window).scroll(function () {
      currentScrollPos = document.body.scrollTop;
    });

    $(document).on('contextmenu', '#codeMirrorJsContainer', function(ev) {
      // ev.preventDefault();
      if(jsCodeMirror.somethingSelected()) {
        $('#runMenu').css('top', ev.pageY+'px').css('left', ev.pageX+'px').css('display','block');
        document.body.scrollTop = currentScrollPos;
        return false;
      }
      document.body.scrollTop = currentScrollPos;
      return true;
    });
    $('#runMenu').on('click', function(e) {
      socket.emit('javascript', jsCodeMirror.getSelection());
      $(this).css('display','none');
    });

    //-------------------------------------------------------
    //
    // When the Add Resource button is clicked, show modal to
    // choose a file 
    // 
    $('#downloadResource').click(function(e) {
      e.preventDefault();
      $('#downloadResourceModal').modal('toggle');
    });

    // Focus input field for a new resource
    $('#downloadResourceModal').on('shown', function() {
      $('#inputUrlResource').focus();
    });

    //-------------------------------------------------------
    //
    // When Save button for url is clicked, send the url and file
    // name to server that will request C++ to save the file on
    // the connected device
    // 
    $('#resourceModalSave').click(function() {
      socket.emit('downloadResourceFromWeb', {url : $('#inputUrlResource').val(), filename : $('#inputFilenameResource').val() });
      CodeMirror.resourceImages().push('resources/' + response);
    });

    //-------------------------------------------------------
    //
    // Auto-insert a file name in the filename field for a url
    // 
    $('#inputUrlResource').on('input', function() {
        var s = $('#inputUrlResource').val();
        $('#inputFilenameResource').val(s.substr(s.lastIndexOf('/') + 1));
    });

    //-------------------------------------------------------
    //
    // When Save button for a new local resource is clicked,
    // send an ajax request to the server for saving the file
    // locally (on the server), and generate a URL which is
    // sent to the device for downloading the new resource.
    // 
    // 1. Submit form with the file data
    // 2. Get successful response
    // 3. Send url to the server via socket
    // 4. Server will send url to C++ to download resource
    //    on device
    // 
    $('#upload').submit(function(e) {
      e.preventDefault();

      $(this).ajaxSubmit({
        success: function(response) {
          if(response.error) {
            status('Opps, something bad happened');
            return;
          }
          // alert('file uploaded!');
          $('#downloadResourceModal').modal('hide');
          socket.emit('downloadResourceFromServer', response);

          CodeMirror.resourceImages().push('resources/' + response);
        }
      });

      return false;
    });

    //-------------------------------------------------------
    //
    // Alert the user with the result of an attempt to save
    // a new file resurce on the device
    // 
    socket.on('resourceSaved', function(message) {
      LiveUtils.showFlashMessage(message);
    });

    //-------------------------------------------------------
    //
    // Toggle between html editor and javascript editor with
    // two buttons
    //
    $('#toggleHtmlArea,#toggleJSArea').click(function(e) {
      var htmlActive, jsActive;
      if ($(this).attr('id') == 'toggleHtmlArea') {
        htmlActive = !$(this).hasClass('active');
        jsActive = $('#toggleJSArea').hasClass('active');
      } else {
        htmlActive = $('#toggleHtmlArea').hasClass('active');
        jsActive = !$(this).hasClass('active');
      }

      $('#editors').css('display','block');
      if (htmlActive && jsActive) $('#codeMirrorHtmlContainer,#codeMirrorJsContainer').css('display','block').css('width','50%');
      if (!htmlActive && !jsActive) $('#editors').css('display','none');
      if (htmlActive && !jsActive) {
        $('#codeMirrorHtmlContainer').css('display','block').css('width','100%');
        $('#codeMirrorJsContainer').css('display','none');
      }
      if (!htmlActive && jsActive) {
        $('#codeMirrorHtmlContainer').css('display','none');
        $('#codeMirrorJsContainer').css('display','block').css('width','100%');
      }
    }); // end toggle editors

    //-------------------------------------------------------
    //
    // Enable resizing the container of myCodeMirrorss
    //
    $('#editors').resizable({handles: 's'});
    $('#codeMirrorHtmlContainer').resizable({
      handles: 'e',
      resize: function(event, ui) {
        var offsetWidth = ui.originalSize.width - ui.size.width;
        $('#codeMirrorJsContainer').width(offsetWidth + this.jsOriginalWidth);
      },
      start: function(event, ui) {
        this.jsOriginalWidth = $('#codeMirrorJsContainer').width();
      },
      stop: function(event, ui) {
        this.jsOriginalWidth = $('#codeMirrorJsContainer').width();
      }
    });

    $(window).resize(function () {
      $('#codeMirrorJsContainer').width($(document.body).width() - $('#codeMirrorHtmlContainer').width() - 1);
    });

    //-------------------------------------------------------
    //
    // Enable the collapsible HTML and JS documentation
    // containers. Change background color on selection
    //
    $('.collapse').collapse();
    $('.widget').on('shown', function () {
      $(this).parent().css('background-color', '#C9E7C4');
    });
    $('.widget').on('hidden', function () {
      $(this).parent().css('background-color', 'white');
    });

    //-------------------------------------------------------
    //
    // Avoid jumping to top of the document when clicking
    // on collapsible links
    //
    $('.collapsibleLink').click(function(e) {
      e.preventDefault();
    });

    //-------------------------------------------------------
    //
    // Send the user to a form for a feedback on the prototype
    //
    $('#feedback').click(function() {
      window.open('https://docs.google.com/forms/d/1U1tFal2g6pwXG04eg-YPeWgBXbDwEwxBtkvxQKEEIrw/edit');
    });


    //-------------------------------------------------------
    //
    // Tells the server to reset the webview in the mobile app
    //
    $('#reset').click(function() {
      socket.emit('reset');
    });

  }); // end on load of page
})();

var LiveUtils = (function() {
  var LiveUtils = {};

  // When a gist file is saved, give feedback to the user
  LiveUtils.showFlashMessage = function(message) {
    LiveUtils.hideLoadIndicator();
    $('#flashMessage').html(message);
    $('#flashMessage').fadeIn(1000, function() {
      $('#flashMessage').fadeOut(3000);
    });
  };

  // helper functions to show and hide a load indicator
  LiveUtils.showLoadIndicator = function() {
    $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
  };

  LiveUtils.hideLoadIndicator = function() {
    $('#loadIndicator').css('background', '#003B80');
  };

  return LiveUtils;

})();