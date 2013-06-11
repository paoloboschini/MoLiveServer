var myCodeMirrors = (function() {

  var myCodeMirrors = {};
  var socket;
  var htmlCodeMirror;
  var jsCodeMirror;

  myCodeMirrors.setSocket = function(s) {
    socket = s;
  };

  myCodeMirrors.initHtmlCodeMirror = function() {
    htmlCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmHtml'), {
      // theme: 'ambiance',
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
    htmlCodeMirror.on('cursorActivity', function(cm) {
      var cur = htmlCodeMirror.getCursor();
      var index = htmlCodeMirror.indexFromPos(cur);
      $('#cursorPosIndicator').html('col: ' + cur.ch + ', ch: ' + index);
    });
    onChange(htmlCodeMirror, 'html', '#htmlToggleButton');
    CodeMirror.commands.autocompleteHtml = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.htmlHint);
    };

    myCodeMirrors.htmlCodeMirror = htmlCodeMirror;
    return htmlCodeMirror;

  }; // myCodeMirrorss.initHtmlCm

  myCodeMirrors.initJSCodeMirror = function() {
    jsCodeMirror = CodeMirror.fromTextArea(document.getElementById('cmJS'), {
      // theme: 'ambiance',
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
    jsCodeMirror.on('cursorActivity', function(cm) {
      $('#runMenu').css('display','none');
      var cur = jsCodeMirror.getCursor();
      var index = jsCodeMirror.indexFromPos(cur);
      $('#cursorPosIndicator').html('col: ' + cur.ch + ', ch: ' + index);

      // Enable or disable the run button after linting JavaScript
      myCodeMirrors.hintString(jsCodeMirror.getValue());
      var errors = JSHINT.data().errors;
      if (errors) {
        $('#executecode').addClass('disabled');
      } else {
        $('#executecode').removeClass('disabled');
      }
    });
    onChange(jsCodeMirror, 'javascript', '#jsToggleButton');
    onCursorActivity(jsCodeMirror);
    CodeMirror.commands.autocompleteJS = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.javascriptHint);
    };

    myCodeMirrors.jsCodeMirror = jsCodeMirror;
    return jsCodeMirror;

  }; // myCodeMirrorss.initJsCm

  /**
   * Send the changed code to the mobile target.
   */
  function onChange(cm, codeType, toggleButtonName) {
    cm.on('change', function(editor, change) {

      if ($('#autoload').is(':checked')) {

        myCodeMirrors.hintString(jsCodeMirror.getValue());
        var errors = JSHINT.data().errors;

        if (codeType == 'html') {
          emitCode(codeType, editor, true);
          if(!errors) {
            emitCode('javascript', jsCodeMirror, true);
          }
        }

        if (codeType == 'javascript') {
          // why do we need to run html if only JavaScript code is changed?
          // Beacuse of the widgets???
          // emitCode('html', htmlCodeMirror);
          if(!errors) {
            emitCode(codeType, editor, false);
          }
        }

      }

      if($('#gistsToggleLink').attr('href') != 'choose') {
        $('#savecode').removeClass('disabled').removeClass('btn-info');
      }

      var _codeType = codeType == 'html' ? 'HTML files ' : 'JS files ';

      // Change color of save button to give feedback of a modified file
      if( !$('#savecode').hasClass('disabled') &&
          !$('#savecode').hasClass('btn-info') &&
          $(toggleButtonName).text() != _codeType + 'files ' &&
          (change.origin == '+input' || change.origin == '+delete' || change.origin == 'undo')) {
        $('#savecode').addClass('btn-info');
      }
    });
  }

  //-------------------------------------------------------
  //
  // Depending on where we are with the cursor we want to extract the
  // surrounding statement to executing it, a la Smalltalk.
  // 
  function onCursorActivity(cm) {
    cm.on('cursorActivity', function(cm) {
      if ($('#autoload').is(':checked')) {
        updateParserHighlightWithLatency();
      }
    });
  }

  var latencyFromLastCursorActivity = 100;
  function updateParserHighlightWithLatency() {
    lastCursorActivity = new Date().getTime();
    setTimeout(function() {
      var currentTime = new Date().getTime();
      if (currentTime - lastCursorActivity > latencyFromLastCursorActivity) {
        highlightFirstLevelActiveNode();
      }
    }, latencyFromLastCursorActivity + 10);
  }

  function highlightFirstLevelActiveNode() {
    if (typeof(marker) != 'undefined') marker.clear();
    var node = firstLevelActiveNode();
    if (node) {
      var start = node.start;
      var end = node.end;
      marker = jsCodeMirror.markText(start, end, {className: 'parserHighlight'});
    }
  }

  function firstLevelActiveNode() {
    var code = jsCodeMirror.getValue();
    var functionName;

    // If there is an error, stop parsing
    // JSHINT(code, {smarttabs: true});
    myCodeMirrors.hintString(code);
    var errors = JSHINT.data().errors;
    if (errors) {
      // console.log('errors');
      return;
    }

    // parse the program to a node program
    var program = acorn.parse(code, {locations: true, ranges: true});
    // console.log('program:', program);

    // get the position of the cursor, specified as index(int) of
    // the total characters from start to caret (and not as {line,ch})
    var pos = jsCodeMirror.indexFromPos(jsCodeMirror.getCursor());
    for (var i = 0; i < program.body.length; i++) {

      var node = program.body[i];
      var startIndexNode = node.start;
      var endIndexNode = node.end;
      var nodeType = node.type;

      var startNode = jsCodeMirror.posFromIndex(startIndexNode);
      var endNode = jsCodeMirror.posFromIndex(endIndexNode);

      if (pos >= startIndexNode && pos <= endIndexNode) {
        if(nodeType == 'VariableDeclaration') {
          endIndexNode++;
          variableInitializationType = node.declarations[0].init.type;
          if(variableInitializationType == 'FunctionExpression') {
            functionName = node.declarations[0].id.name;
          }
        }

        if(nodeType == 'FunctionDeclaration') {
          functionName = node.id.name;
        }

        if(nodeType == 'ExpressionStatement') {
          var left = node.expression.left;
          var right = node.expression.right;
          if(left) {
            if(right.type == 'FunctionExpression') {
              var startLeft = jsCodeMirror.posFromIndex(left.start);
              var endLeft = jsCodeMirror.posFromIndex(left.end);
              functionName = jsCodeMirror.getRange(startLeft, endLeft);
            }
          }
        }

        return {
          start: startNode,
          end: endNode,
          content: jsCodeMirror.getRange(startNode, endNode),
          functionName: functionName
        };
      }
    }
  }

  //-------------------------------------------------------
  //
  // Remove marker when clicking on the live checkbox
  //   
  $(function() {
    $('#autoload').click(function() {
      if (!$('#autoload').is(':checked')) {
        if (typeof(marker) != 'undefined') marker.clear();
      }
    });
  });

   //-------------------------------------------------------
   //
   // Emit code through the socket.
   // This function is bound to any change made to the code editors.
   //   
  var latencyFromLastPress = 100;
  function emitCode(codeType, editor, executeEverything) {
    lastKeypress = new Date().getTime();
    setTimeout(function() {
      var currentTime = new Date().getTime();
      if (currentTime - lastKeypress > latencyFromLastPress) {
        if (codeType == 'javascript' && !executeEverything) {
          var node = firstLevelActiveNode();
          if (node) {
            socket.emit(codeType, node.content);
            if(node.functionName) {
              // Dilemma: run the function if its body was modified. Good or Bad?
              // socket.emit(codeType, node.functionName + '()');
            }
          }
        } else {
          socket.emit(codeType, editor.getValue());
        }
      }
    }, latencyFromLastPress + 10);
  }

  myCodeMirrors.hintString = function(str) {
    JSHINT(str, {smarttabs: true, asi: true});
  };

  return myCodeMirrors;

})(); // end file