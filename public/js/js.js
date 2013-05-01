/**
 * JSLint: http://stackoverflow.com/questions/14007482/show-line-errors-in-codemirror
 * JSLint: https://github.com/douglascrockford/JSLint/wiki/JSLINT-in-a-web-page
 */
(function() {

  var socket = io.connect();

  // On connection to server
  socket.on('connect', function() {
    // Tell the server I want to be in the webapp room
    socket.emit('room', 'webapp');
  });

  // On load of page
  $(function() {

    var htmlCodeMirror = codemirror.initHtmlCodeMirror();
    var jsCodeMirror = codemirror.initJSCodeMirror();

    /**
     * Emit code through the socket.
     * This function is bound to any change made to the code editors.
     */
    function emitCode(codeType, editor) {
      var latencyFromLastPress = 500;
      var lastKeypress = null;
      lastKeypress = new Date().getTime();
      setTimeout(function() {
        var currentTime = new Date().getTime();
        if (currentTime - lastKeypress > latencyFromLastPress) {
          socket.emit(codeType, editor.getValue());
        }
      }, latencyFromLastPress + 10);
    }

    function showLoadIndicator() {
      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
    }

    function hideLoadIndicator() {
      $('#loadIndicator').css('background', '#003B80');
    }

    // If everyauth is logged in, get gists.
    var user = $('#git-user').text();
    if (user.length !== 0) {
      console.log(user + ' is logged in.');

      showLoadIndicator();

      $.ajax({
        url: '/gists',
        type: 'POST',
        data: {user : user},
        cache: false,
        timeout: 10000,
        success: function(response) {
          hideLoadIndicator();
          // 
          // if (response.error) {
          //   alert(response.error);
          //   return;
          // }
          $.each(response, function(index, value) {
            $('#gistsList').append('<li><a class="gistElement" href="' + value.id + '">' + value.description + '</a></li>');
          });
        } // success
      }); // ajax
    } else {
      console.log('none is logged in');
    }
    /************** end get gists **************/

    // When choosing a gist, fetch the files
    $(document).on('click', '.gistElement', function(e) {
      e.preventDefault();

      htmlCodeMirror.setValue('');
      jsCodeMirror.setValue('');

      $('#htmlList').empty();
      $('#jsList').empty();

      $('#htmlToggleButton')
        .removeClass('btn-success')
        .text('Choose a file (html)! ')
        .append('<span class="caret" style="margin-top: 8px;"></span>');

      $('#jsToggleButton')
        .removeClass('btn-success')
        .text('Choose a file (javascript)! ')
        .append('<span class="caret" style="margin-top: 8px;"></span>');

      $('#gistsToggleLink')
        .text($(this).text()+' ')
        .append('<span class="caret" style="margin-top: 8px;"></span>')
        .addClass('btn-success');

      var id = $(this).attr('href');
      $('#gistsToggleLink').attr('href', id);

      showLoadIndicator();

      $.ajax({
        url: '/gist',
        type: 'POST',
        data: {id:id},
        timeout: 10000,
        cache: false,
        success: function(response) {
          hideLoadIndicator();

          if (response.htmlfiles.length > 0) {
            $('#htmlToggleButton').addClass('btn-success');
          }

          if (response.jsfiles.length > 0) {
            $('#jsToggleButton').addClass('btn-success');
          }

          $('#jsToggleButton').removeClass('disabled');
          $('#htmlToggleButton').removeClass('disabled');
          //$('#savecode').removeClass('disabled').removeClass('btn-info');

          $('#htmlList').append('<li><a id="newHtmlFile" href="asd">New HTML File...</a></li>');
          $('#jsList').append('<li><a id="newJSFile" href="asd">New JS File...</a></li>');

          $.each(response.htmlfiles, function(index, value) {
            $('#htmlList').append('<li><a class="htmlFile" href="' + value.id + '">' + value.filename + '</a></li>');
          });
          $.each(response.jsfiles, function(index, value) {
            $('#jsList').append('<li><a class="jsFile" href="' + value.id + '">' + value.filename + '</a></li>');
          });

          // htmlCodeMirror.setValue(response);
          // socket.emit('code', response);
        }
      }); // ajax
    });

    /**
     * When choosing a file, download it and show the content.
     */
    $(document).on('click', '.htmlFile, .jsFile', function(e) {
      e.preventDefault();
      var currentClass = $(this).attr('class');
      var filename = $(this).text();
      var id = $(this).attr('href');
      $(currentClass == 'htmlFile' ? '#htmlToggleButton' : '#jsToggleButton').attr('href', id);
      showLoadIndicator();
      $.ajax({
        url: '/file',
        type: 'POST',
        data: {id:id, filename:filename},
        timeout: 10000,
        cache: false,
        success: function(response) {
          hideLoadIndicator();
          $(currentClass == 'htmlFile' ? '#htmlToggleButton' : '#jsToggleButton')
            .text(filename+' ')
            .append('<span class="caret" style="margin-top: 8px;"></span>');
          // $('#savecode').removeClass('disabled').removeClass('btn-info');

          if(currentClass == 'htmlFile') {
            htmlCodeMirror.setValue(response);
          }
          else {
            jsCodeMirror.setValue(response);
          }
          // socket.emit('code', response);
        } // success
      }); // ajax
    });

    // working send message
    $('#executecode').click(function() {
      // send code to the server that will bounce it to the mobile room
      var html = htmlCodeMirror.getValue();
      var htmlWithoutScripts = stripScripts(html);
      socket.emit('html', htmlWithoutScripts);

      var doc = htmlCodeMirror.getValue();
      var scripts = $(doc).filter('script');
      for (var i = 0; i < scripts.length; i++) {
        socket.emit('javascript', scripts[i].innerHTML);
      }

      var js = jsCodeMirror.getValue();
      socket.emit('javascript', js);

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

    $('#savecode').click(function() {
      var htmlFilename = $('#htmlToggleButton').text();
      var jsFilename = $('#jsToggleButton').text();

      var htmlHref = $('#htmlToggleButton').attr('href');
      var jsHref = $('#jsToggleButton').attr('href');

      // show modal dialog to create both files
      if(htmlHref == 'choose' && jsHref == 'choose') {
        if(htmlCodeMirror.getValue() !== '' && jsCodeMirror.getValue() !== '') {
          $('#bothModal').modal('toggle');
        } else if(htmlCodeMirror.getValue() !== '' && jsCodeMirror.getValue() === '') {
          $('#htmlModal').modal('toggle');
        } else {
          $('#jsModal').modal('toggle');
        }

      // show modal dialog to create html files
      } else if(htmlHref == 'choose' && jsHref != 'choose') {
        socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : jsFilename.slice(0, -1)});
        if(htmlCodeMirror.getValue() !== '') {
          $('#htmlModal').modal('toggle');
        }

      // show modal dialog to create js files
      } else if(htmlHref != 'choose' && jsHref == 'choose') {
        socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : htmlFilename.slice(0, -1)});
        if(jsCodeMirror.getValue() !== '') {
          $('#jsModal').modal('toggle');
        }

      // don't show modal dialog, just save files
      } else if(htmlHref != 'choose' && jsHref != 'choose') {
        socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : htmlFilename.slice(0, -1)});
        socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : jsFilename.slice(0, -1)});
      }

      $('#savecode').removeClass('btn-info');
      showLoadIndicator();
    });

    $('#bothModalSave').click(function() {
      socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : $('#inputHtmlBoth').val(), 'new' : true, type : 'html'});
      socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : $('#inputJsBoth').val(), 'new' : true, type : 'js'});
    });

    $('#htmlModalSave').click(function() {
      socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : $('#inputHtml').val(), 'new' : true, type : 'html'});
      if($('#jsToggleButton').attr('href') != 'choose') {
        socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : $('#jsToggleButton').text().slice(0,-1)});
      }
    });

    $('#jsModalSave').click(function() {
      socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : $('#inputJs').val(), 'new' : true, type : 'js'});
      if($('#htmlToggleButton').attr('href') != 'choose') {
        socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : $('#htmlToggleButton').text().slice(0,-1)});
      }
    });

    $(document).on('click', '#newHtmlFile', function(e) {
      e.preventDefault();
      $('#htmlModal').modal('toggle');
    });

    $('#htmlModal').on('shown', function() {
      $('#inputHtml').focus();
    });

    $(document).on('click', '#newJSFile', function(e) {
      e.preventDefault();
      $('#jsModal').modal('toggle');
    });

    $('#jsModal').on('shown', function() {
      $('#inputJs').focus();
    });

    $('#downloadResource').click(function(e) {
      e.preventDefault();
      $('#downloadResourceModal').modal('toggle');
    });

    $('#downloadResourceModal').on('shown', function() {
      $('#inputUrlResource').focus();
    });

    $('#resourceModalSave').click(function() {
      socket.emit('downloadResource', {url : $('#inputUrlResource').val(), filename : $('#inputFilenameResource').val() });
    });

    $('#inputUrlResource').on('input', function() {
        var s = $('#inputUrlResource').val();
        $('#inputFilenameResource').val(s.substr(s.lastIndexOf('/') + 1));
    });

    socket.on('fileSaved', function(message) {
      alert(message);
    });

    // On gist file created
    socket.on('filecreated', function(data) {
      if(data.type == 'html') {
        $('#htmlList').append('<li><a class="htmlFile" href="' + data.id + '">'+data.filename+'</a></li>');
        $('#htmlToggleButton')
          .text(data.filename+' ')
          .append('<span class="caret" style="margin-top: 8px;"></span>');
      }
      if(data.type == 'js') {
        $('#jsList').append('<li><a class="jsFile" href="' + data.id + '">'+data.filename+'</a></li>');
        $('#jsToggleButton')
          .text(data.filename+' ')
          .append('<span class="caret" style="margin-top: 8px;"></span>');
      }
      showMessageFileSaved();
    });

    // On gist file saved
    socket.on('filesaved', function() {
      showMessageFileSaved();
    });

    function showMessageFileSaved() {
      hideLoadIndicator();
      $('#fileSaved').fadeIn(1000, function() {
        $('#fileSaved').fadeOut(3000);
      });
    }

    // Toggle between html area and javascript area with two buttons
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
    });

    // Enables resizing the container of codemirrors.
    $('#editors').resizable({handles: 's'});

    $('.collapse').collapse();
    $('.collapse').on('shown', function () {
      $(this).parent().css('background-color', '#C9E7C4');
    });
    $('.collapse').on('hidden', function () {
      $(this).parent().css('background-color', 'white');
    });

    $('#reset').click(function() {
      socket.emit('reset');
    });

    $('#downloadResource').click(function() {
      socket.emit('downloadResource');
    });

    $('#upload').submit(function(e) {
      console.log('submit');
      e.preventDefault();

      $(this).ajaxSubmit({
        success: function(response) {
          if(response.error) {
            status('Opps, something bad happened');
            return;
          }
          // alert('file uploaded!');
          $('#downloadResourceModal').modal('hide');
          socket.emit('downloadResource', {url : 'http://localhost:5678/uploads/' + response, filename : response });

          var res = $.grep(CodeMirror.htmlStructure(), function(e) {
            return e.tag == 'div';
          });
          var image = $.grep(res[0].attr, function(e) {
            return e.key == 'image';
          });
          image[0].values.push(response);
        }
      });

      return false;
    });

    /* Tangle for the delay
        var rootElement = document.getElementById('delayLabel');
        var model = {
            initialize: function() {
                this.delay = 500;
            },
            update: function() {
                // this.delay = this.delay + 100;
            }
        };
        var tangle = new Tangle(rootElement, model);
    */

  }); // on load of page
})();