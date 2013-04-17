// jslint example: http://stackoverflow.com/questions/14007482/show-line-errors-in-codemirror
// https://github.com/douglascrockford/JSLint/wiki/JSLINT-in-a-web-page
(function () {

  var socket = io.connect();

  // on connection to server
  socket.on('connect', function () {
    // tell the server I want to be in the webapp room
    socket.emit('room', 'webapp');
  });

  // on load of page
  $(function () {

    // Setup commond codemirrors options
    var options = {
      interval: 500,
      theme: "erlang-dark",
      lineNumbers: true,
      matchBrackets: true,
      tabSize: 2,
      lineNumberFormatter: function (number) {
        return number === 1 ? "•" : number;
      }
    };

    function emitCode(codeType, editor) {
      var latencyFromLastPress = 500;
      var lastKeypress = null;
      lastKeypress = new Date().getTime();
      setTimeout(function () {
        var currentTime = new Date().getTime();
        if (currentTime - lastKeypress > latencyFromLastPress) {
          socket.emit(codeType, editor.getValue());
        }
      }, latencyFromLastPress + 10);
    }

    // set up html code mirror
    var htmlArea = document.getElementById('code-mirror-html');
    var htmlCodeMirror = CodeMirror.fromTextArea(htmlArea, options);
    htmlCodeMirror.setOption('mode', {name: 'xml', htmlMode: true});
    htmlCodeMirror.setSize("100%", "100%");
    htmlCodeMirror.on("change", function(editor, change) {
      if ($('#autoload').is(':checked')) {
        emitCode('htmlCode',editor);
      }
      if( !$('#savecode').hasClass('disabled') &&
          !$('#savecode').hasClass('btn-info') &&
          $('#htmlToggleButton').text() != 'Choose an html file! ' &&
          (change.origin == 'input' || change.origin == 'delete')) {
        $('#savecode').addClass('btn-info');
      }
    });

    // set up javascript code mirror
    var jsArea = document.getElementById('code-mirror-js');
    var jsCodeMirror = CodeMirror.fromTextArea(jsArea, options);
    jsCodeMirror.setOption('mode', {name: 'javascript'});
    jsCodeMirror.setSize("100%", "100%");
    jsCodeMirror.on("change", function(editor, change) {
      if ($('#autoload').is(':checked')) {
        emitCode('jsCode', editor);
      }
      if( !$('#savecode').hasClass('disabled') &&
          !$('#savecode').hasClass('btn-info') &&
          $('#htmlToggleButton').text() != 'Choose a javascript file! ' &&
          (change.origin == 'input' || change.origin == 'delete')) {
        $('#savecode').addClass('btn-info');
      }
    });

    /* If everyauth is logged in, get gists. */
    var user = $('#git-user').text();
    if (user.length !== 0) {
      console.log(user + " is logged in.");

      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');

      $.ajax({
        url: "/",
        type: "POST",
        data: {user : user},
        cache: false,
        timeout: 10000,
        success: function (response) {
          $('#loadIndicator').css('background', '#003B80');
          // 
          // if (response.error) {
          //   alert(response.error);
          //   return;
          // }
          $.each(response, function (index, value) {
            $('#gistsList').append('<li><a class="gistElement" href="' + value.id + '">' + value.description + '</a></li>');
          });
        } // success
      }); // ajax
    } else {
      console.log("none is logged in");
    }
    /************** end get gists **************/

    // when choosing a gist, fetch the files
    $(document).on("click", ".gistElement", function(e) {
      e.preventDefault();

      htmlCodeMirror.setValue('');
      jsCodeMirror.setValue('');

      $('#htmlList').empty();
      $('#jsList').empty();

      $("#htmlArrow").hide("slide", { direction: "up", easing: "easeOutExpo"}, 1000);
      $("#jsArrow").hide("slide", { direction: "up", easing: "easeOutExpo"}, 1000);

      $('#htmlToggleButton')
        .removeClass("btn-success")
        .text("Choose an html file! ")
        .append('<span class="caret" style="margin-top: 8px;"></span>')
        .addClass("disabled");

      $('#jsToggleButton')
        .removeClass("btn-success")
        .text("Choose a javascript file! ")
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
        success: function (response) {
          $('#loadIndicator').css('background', '#003B80');

          if (response.htmlfiles.length > 0) {
            $("#htmlArrow").show("slide", { direction: "up", easing: "easeOutExpo"}, 1000);
            $('#htmlToggleButton').addClass("btn-success");
            $('#htmlToggleButton').removeClass("disabled");
          }

          if (response.jsfiles.length > 0) {
            $("#jsArrow").show("slide", { direction: "up", easing: "easeOutExpo"}, 1000);
            $('#jsToggleButton').addClass("btn-success");
            $('#jsToggleButton').removeClass("disabled");
          }

          $.each(response.htmlfiles, function (index, value) {
            $('#htmlList').append('<li><a class="htmlFile" href="'+value.id+'">'+value.filename+'</a></li>');
          });
          $.each(response.jsfiles, function (index, value) {
            $('#jsList').append('<li><a class="jsFile" data-id="'+value.id+'" href="'+value.id+'">'+value.filename+'</a></li>');
          });

          // htmlCodeMirror.setValue(response);
          // socket.emit('code', response);
        }
      }); // ajax
    });

    // when choosing an html file, download it and show the content
    $(document).on("click", ".htmlFile", function(e) {
      e.preventDefault();
      var filename = $(this).text();
      var id = $(this).attr('href');
      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
      $.ajax({
        url: "/file",
        type: "POST",
        data: {id:id, filename:filename},
        timeout: 10000,
        cache: false,
        success: function (response) {
          $('#loadIndicator').css('background', '#003B80');
          $('#htmlToggleButton')
            .text(filename+' ')
            .append('<span class="caret" style="margin-top: 8px;"></span>');
          $('#savecode').removeClass("disabled").removeClass('btn-info');
          htmlCodeMirror.setValue(response);
          // socket.emit('code', response);
        }
      }); // ajax
    });

    // when choosing a javascript file, download it and show the content
    $(document).on("click", ".jsFile", function(e) {
      e.preventDefault();
      var filename = $(this).text();
      var id = $(this).attr('href');
      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
      $.ajax({
        url: "/file",
        type: "POST",
        data: {id:id, filename:filename},
        cache: false,
        timeout: 10000,
        success: function (response) {
          $('#loadIndicator').css('background', '#003B80');
          $('#jsToggleButton')
            .text(filename+' ')
            .append('<span class="caret" style="margin-top: 8px;"></span>');
          $('#savecode').removeClass("disabled").removeClass('btn-info');
          jsCodeMirror.setValue(response);
          // socket.emit('code', response);
        }
      }); // ajax
    });

    // working send message
    $('#executecode').click(function () {
      // send code to the server that will bounce it to the mobile room
      socket.emit('htmlCode', htmlCodeMirror.getValue());
      socket.emit('jsCode', jsCodeMirror.getValue());

      // this will compress the code, i.e. remove extra spaces and returns
      // code = code.replace(/(\r\n|\n|\r|\t)/gm,"");
      // code = code.replace(/\s+/g," ");
    });

    $('#savecode').click(function () {
      var htmlFilename = $('#htmlToggleButton').text();
      var jsFilename = $('#jsToggleButton').text();

      if(htmlFilename != 'Choose an html file! ') {
        socket.emit('saveFileGist', {code : htmlCodeMirror.getValue(), filename : htmlFilename});
      }
      if (jsFilename != 'Choose a javascript file! ') {
        socket.emit('saveFileGist', {code : jsCodeMirror.getValue(), filename : jsFilename});
      }
      $('#savecode').removeClass('btn-info');
    });

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

    /* Tangle for the delay
        var rootElement = document.getElementById("delayLabel");
        var model = {
            initialize: function () {
                this.delay = 500;
            },
            update: function () {
                // this.delay = this.delay + 100;
            }
        };
        var tangle = new Tangle(rootElement, model);
        */


  }); // on load of page
})();