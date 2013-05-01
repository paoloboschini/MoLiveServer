var codemirror = (function() {

  var codemirror = {};

  codemirror.initHtmlCodeMirror = function() {
    var htmlCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmHtml'), {
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

      // onKeyEvent: function(cm, s){ 
      //   if (s.type == 'keyup') { 
      //     passAndHintHtml(cm); 
      //   } 
      // }, 

      lineNumberFormatter: function(number) {
        return number === 1 ? '•' : number;
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

    return htmlCodeMirror;

  }; // codemirrors.initHtmlCm

  codemirror.initJSCodeMirror = function() {
    var jsCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmJS'), {
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

      // This, togheter with passAndHint, will trigger autocomplete at each keyup
      // onKeyEvent: function(cm, s){
      //   if (s.type == 'keyup') {
      //     passAndHintJS(cm);
      //   }
      // },

      lineNumberFormatter: function(number) {
        return number === 1 ? '•' : number;
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

    return jsCodeMirror;

  }; // codemirrors.initJsCm

  /**
   * Define onChange for each editor
   */
  function onChange(cm, codeType, toggleButtonName) {
    cm.on('change', function(editor, change) {
      if ($('#autoload').is(':checked')) {
        emitCode(codeType,editor);
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

  return codemirror;

})(); // end file