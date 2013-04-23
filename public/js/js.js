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

  // On file saved to github
  socket.on("filesaved", function() {
    $('#loadIndicator').css('background', '#003B80');
    console.log("fadeIn");
    $('#fileSaved').fadeIn(1000, function() {
      console.log("fadeOut");
      $('#fileSaved').fadeOut(3000);
    });
  });


  // On load of page
  $(function() {

    // Init html code mirror
    var htmlCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmHtml'), {
      theme: "lesser-dark",
      lineNumbers: true,
      tabSize: 2,
      mode: 'text/html',
      // mode: 'xml',
      // htmlMode: true,
      extraKeys: {"Ctrl-Space": "autocompleteHtml"},
      autoCloseTags: true,
      highlightSelectionMatches: true,
      styleActiveLine: true,
      lineWrapping: true,
      lineNumberFormatter: function(number) {
        return number === 1 ? "•" : number;
      }
    });
    htmlCodeMirror.setSize("100%", "100%");
    onChange(htmlCodeMirror, "html", "#htmlToggleButton");
    CodeMirror.commands.autocompleteHtml = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.htmlHint);
    };

    // Init javascript code mirror
    var jsCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmJS'), {
      theme: "lesser-dark",
      lineNumbers: true,
      matchBrackets: true,
      tabSize: 2,
      mode: "javascript",
      styleActiveLine: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      highlightSelectionMatches: true,
      extraKeys: {"Ctrl-Space": "autocompleteJS"},

      // This, togheter with passAndHint, will trigger autocomplete at each keyup
      // onKeyEvent: function(cm, s){
      //   if (s.type == "keyup") {
      //     passAndHint(cm);
      //   }
      // },

      lineNumberFormatter: function(number) {
        return number === 1 ? "•" : number;
      }
    });

    function passAndHint(cm) {
      setTimeout(function() {cm.execCommand("autocompleteJS");}, 100);
      return CodeMirror.Pass;
    }

    jsCodeMirror.setSize("100%", "100%");    
    onChange(jsCodeMirror, "javascript", "#jsToggleButton");
    CodeMirror.commands.autocompleteJS = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.javascriptHint);
    };

    /**
     * Define onChange for each editor
     */
    function onChange(cm, codeType, toggleButtonName) {
      cm.on("change", function(editor, change) {
        if ($('#autoload').is(':checked')) {
          emitCode(codeType,editor);
        }
        if( !$('#savecode').hasClass('disabled') &&
            !$('#savecode').hasClass('btn-info') &&
            $(toggleButtonName).text() != 'Choose a file (' + codeType + ')! ' &&
            (change.origin == '+input' || change.origin == '+delete')) {
          $('#savecode').addClass('btn-info');
        }
      });
    }

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

    // If everyauth is logged in, get gists.
    var user = $('#git-user').text();
    if (user.length !== 0) {
      console.log(user + " is logged in.");

      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');

      $.ajax({
        url: "/user",
        type: "POST",
        data: {user : user},
        cache: false,
        timeout: 10000,
        success: function(response) {
          $('#loadIndicator').css('background', '#003B80');
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
      console.log("none is logged in");
    }
    /************** end get gists **************/

    // When choosing a gist, fetch the files
    $(document).on("click", ".gistElement", function(e) {
      e.preventDefault();

      htmlCodeMirror.setValue('');
      jsCodeMirror.setValue('');

      $('#htmlList').empty();
      $('#jsList').empty();

      $('#htmlToggleButton')
        .removeClass("btn-success")
        .text("Choose a file (html)! ")
        .append('<span class="caret" style="margin-top: 8px;"></span>')
        .addClass("disabled");

      $('#jsToggleButton')
        .removeClass("btn-success")
        .text("Choose a file (javascript)! ")
        .append('<span class="caret" style="margin-top: 8px;"></span>')
        .addClass("disabled");

      $('#gistsToggleLink')
        .text($(this).text()+' ')
        .append('<span class="caret" style="margin-top: 8px;"></span>')
        .addClass("btn-success");

      var id = $(this).attr('href');

      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');

      $.ajax({
        url: "/gist",
        type: "POST",
        data: {id:id},
        timeout: 10000,
        cache: false,
        success: function(response) {
          $('#loadIndicator').css('background', '#003B80');

          if (response.htmlfiles.length > 0) {
            $('#htmlToggleButton').addClass("btn-success");
            $('#htmlToggleButton').removeClass("disabled");
          }

          if (response.jsfiles.length > 0) {
            $('#jsToggleButton').addClass("btn-success");
            $('#jsToggleButton').removeClass("disabled");
          }

          $.each(response.htmlfiles, function(index, value) {
            $('#htmlList').append('<li><a class="htmlFile" href="'+value.id+'">'+value.filename+'</a></li>');
          });
          $.each(response.jsfiles, function(index, value) {
            $('#jsList').append('<li><a class="jsFile" data-id="'+value.id+'" href="'+value.id+'">'+value.filename+'</a></li>');
          });

          // htmlCodeMirror.setValue(response);
          // socket.emit('code', response);
        }
      }); // ajax
    });

    /**
     * When choosing a file, download it and show the content.
     */
    $(document).on("click", ".htmlFile, .jsFile", function(e) {
      e.preventDefault();
      var currentClass = $(this).attr("class");
      var filename = $(this).text();
      var id = $(this).attr('href');
      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
      $.ajax({
        url: "/file",
        type: "POST",
        data: {id:id, filename:filename},
        timeout: 10000,
        cache: false,
        success: function(response) {
          $('#loadIndicator').css('background', '#003B80');
          $(currentClass == "htmlFile" ? '#htmlToggleButton' : '#jsToggleButton')
            .text(filename+' ')
            .append('<span class="caret" style="margin-top: 8px;"></span>');
          $('#savecode').removeClass("disabled").removeClass('btn-info');
          currentClass == "htmlFile" ? htmlCodeMirror.setValue(response) : jsCodeMirror.setValue(response);
          // socket.emit('code', response);
        } // success
      }); // ajax
    });

    // working send message
    $('#executecode').click(function() {
      // send code to the server that will bounce it to the mobile room
      socket.emit('html', htmlCodeMirror.getValue());
      socket.emit('javascript', jsCodeMirror.getValue());

      // this will compress the code, i.e. remove extra spaces and returns
      // code = code.replace(/(\r\n|\n|\r|\t)/gm,"");
      // code = code.replace(/\s+/g," ");
    });

    $('#savecode').click(function() {
      var htmlFilename = $('#htmlToggleButton').text();
      var jsFilename = $('#jsToggleButton').text();

      if(htmlFilename != 'Choose a file (html)! ') {
        socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : htmlFilename.slice(0, -1)});
      }
      if (jsFilename != 'Choose a file (javascript)! ') {
        socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : jsFilename.slice(0, -1)});
      }
      $('#savecode').removeClass('btn-info');
      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
    });

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
    $("#editors").resizable({handles: "s"});

    $(".collapse").collapse();

    /* Tangle for the delay
        var rootElement = document.getElementById("delayLabel");
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