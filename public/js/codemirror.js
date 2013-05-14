var codemirror = (function() {

  var codemirror = {};
  var socket;
  var htmlCodeMirror;
  var jsCodeMirror;

  codemirror.setSocket = function(s) {
    socket = s;
  };

  codemirror.initHtmlCodeMirror = function() {
    htmlCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmHtml'), {
      theme: 'ambiance',
      lineNumbers: true,
      tabSize: 2,
      mode: 'text/html',
      matchBrackets: true,
      autoCloseBrackets: true,
      // mode: 'xml',
      // htmlMode: true,
      extraKeys: {'Ctrl-Space': 'autocompleteHtml'},
      autoCloseTags: true,
      highlightSelectionMatches: true,
      // styleActiveLine: true,
      lineWrapping: true,
      placeholder: 'HTML Code goes here...\n\nYou can start coding HTML in this area.\nLogin to GitHub to get a list of you gists.\nIf you want to save a file,\neither choose new file and start coding,\nor just start coding and save the code later.',

      // onKeyEvent: function(cm, s){ 
      //   if (s.type == 'keyup') { 
      //     passAndHintHtml(cm); 
      //   } 
      // }, 

      lineNumberFormatter: function(number) {
        // return number === 1 ? '•' : number;
        return number;
      }
    });

    function passAndHintHtml(cm) {
      setTimeout(function() {cm.execCommand('autocompleteHtml');}, 100);
      return CodeMirror.Pass;
    }

    htmlCodeMirror.setSize('100%', '100%');
    onChange(htmlCodeMirror, 'html', '#htmlToggleButton');
    CodeMirror.commands.autocompleteHtml = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.htmlHint);
    };

    codemirror.htmlCodeMirror = htmlCodeMirror;
    return htmlCodeMirror;

  }; // codemirrors.initHtmlCm

  codemirror.initJSCodeMirror = function() {
    jsCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmJS'), {
      theme: 'ambiance',
      lineNumbers: true,
      matchBrackets: true,
      tabSize: 2,
      mode: 'javascript',
      // styleActiveLine: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      highlightSelectionMatches: true,
      extraKeys: {'Ctrl-Space': 'autocompleteJS'},
      gutters: ["CodeMirror-lint-markers"],
      lintWith: CodeMirror.javascriptValidator,
      placeholder: 'JavaScript Code goes here...\n\nYou can start coding JavaScript in this area.\nLogin to GitHub to get a list of you gists.\nIf you want to save a file,\neither choose new file and start coding,\nor just start coding and save the code later.',

      // This, togheter with passAndHint, will trigger autocomplete at each keyup
      // onKeyEvent: function(cm, s){
      //   if (s.type == 'keyup') {
      //     passAndHintJS(cm);
      //   }
      // },

      lineNumberFormatter: function(number) {
        // return number === 1 ? '•' : number;
        return number;
      }
    });

    function passAndHintJS(cm) {
      setTimeout(function() {cm.execCommand('autocompleteJS');}, 100);
      return CodeMirror.Pass;
    }

    jsCodeMirror.setSize('100%', '100%');
    onChange(jsCodeMirror, 'javascript', '#jsToggleButton');
    CodeMirror.commands.autocompleteJS = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.javascriptHint);
    };

    codemirror.jsCodeMirror = jsCodeMirror;
    return jsCodeMirror;

  }; // codemirrors.initJsCm

  /**
   * Define onChange for each editor
   */
  function onChange(cm, codeType, toggleButtonName) {
    cm.on('change', function(editor, change) {

      if ($('#autoload').is(':checked')) {

        if (codeType == 'html') {
          emitCode(codeType,editor);
          emitCode('javascript', jsCodeMirror);
        }

        if (codeType == 'javascript') {
          // emitCode('html', htmlCodeMirror);
          emitCode(codeType,editor);
        }

      }

      if($('#gistsToggleLink').attr('href') != 'choose') {
        $('#savecode').removeClass('disabled').removeClass('btn-info');
      }

      // Change color of save button to give feedback of a modified file
      if( !$('#savecode').hasClass('disabled') &&
          !$('#savecode').hasClass('btn-info') &&
          $(toggleButtonName).text() != 'Choose a file (' + codeType + ')! ' &&
          (change.origin == '+input' || change.origin == '+delete' || change.origin == 'undo')) {
        $('#savecode').addClass('btn-info');
      }
    });
  }

  /**
   * Emit code through the socket.
   * This function is bound to any change made to the code editors.
   */
  var latencyFromLastPress = 100;
  var lastKeypress = null;
  function emitCode(codeType, editor) {
    lastKeypress = new Date().getTime();
    setTimeout(function() {
      var currentTime = new Date().getTime();
      if (currentTime - lastKeypress > latencyFromLastPress) {
        socket.emit(codeType, editor.getValue());
      }
    }, latencyFromLastPress + 10);
  }

  return codemirror;

})(); // end file