/**
 * JSLint: http://stackoverflow.com/questions/14007482/show-line-errors-in-codemirror
 * JSLint: https://github.com/douglascrockford/JSLint/wiki/JSLINT-in-a-web-page
 */

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
      // image.values.push('resources/' + resources[i]);
      // icon.values.push('resources/' + resources[i]);
      // icon_android.values.push('resources/' + resources[i]);
      // icon_ios.values.push('resources/' + resources[i]);
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

    codemirror.setSocket(socket);
    var htmlCodeMirror = codemirror.initHtmlCodeMirror();
    var jsCodeMirror = codemirror.initJSCodeMirror();

    //-------------------------------------------------------
    //
    // Set up number pickers
    // 
    numberPicker.numberPicker(htmlCodeMirror, $('#inletSliderHtml'));
    numberPicker.numberPicker(jsCodeMirror, $('#inletSliderJS'));

    colorPicker.colorPicker(htmlCodeMirror, 'htmlColorPicker');
    colorPicker.colorPicker(jsCodeMirror, 'jsColorPicker');

    document.addEventListener("mousemove", function(e) {
      var x = e.pageX, y = e.pageY;
      var posCharInEditor = jsCodeMirror.coordsChar({left: x, top: y});
      $('#mouse').html('line-m: ' + posCharInEditor.line + ', ch-m: ' + posCharInEditor.ch);
    });

    //-------------------------------------------------------
    //
    // Set up right click for execute code
    // 
    document.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      if(jsCodeMirror.somethingSelected()) {
        $('#runMenu').css('top', ev.y).css('left', ev.x).css('display','inline');
      }
      return false;
    }, false);
    jsCodeMirror.on("focus", function() {
      $('#runMenu').css('display','none');
    });
    $('#runMenu').on('click', function(e) {
      $(this).css('display','none');
    });

    //-------------------------------------------------------
    //
    // Set up templates dropdown
    // 
    $('#nativeTemplate').click(function(e) {
      e.preventDefault();
      htmlCodeMirror.setValue(nativeHtmlTemplate);
      jsCodeMirror.setValue(nativeJavaScriptTemplate);
    });
    $('#webTemplate').click(function(e) {
      e.preventDefault();
    });
    $('#acTemplate').click(function(e) {
      e.preventDefault();
      jsCodeMirror.setValue(autocompletetestTemplate);
    });

    //-------------------------------------------------------
    //
    // If everyauth is logged in, get gists of the user
    // 
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
    } // end get gists of the user


    //-------------------------------------------------------
    //
    // When choosing a gist, fetch the files
    // 
    $(document).on('click', '.gistElement', function(e) {
      e.preventDefault();

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

          $('#htmlToggleButton').attr('href', 'choose');
          $('#jsToggleButton').attr('href', 'choose');

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
    }); // end fetch the files

    //-------------------------------------------------------
    //
    // When choosing a file, download it and show the content
    // 
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
    }); // end download file and show the content

    //-------------------------------------------------------
    //
    // When the Run button is clicked, send the code to the
    // server (the server will send it to the mobile)
    // 
    var firsttime = true;
    var oldState = {};
    $('#executecode').click(function() {
      var html = htmlCodeMirror.getValue();

      // get html without embedded javascript and emit
      var htmlWithoutScripts = stripScripts(html);
      socket.emit('html', htmlWithoutScripts);

      // extract embedded javascript scripts from html
      // and emit as javascript
      var doc = htmlCodeMirror.getValue();
      var scripts = $(doc).filter('script');
      for (var i = 0; i < scripts.length; i++) {
        socket.emit('javascript', scripts[i].innerHTML);
      }

      // Let's test the evaluation of change code
      // Hack inspired by Khan Akademy
      // Same as $('#jshint').click(function() {

      // console.clear();
      // JSHINT(jsCodeMirror.getValue());
      // console.log('JSHINT.data():', JSHINT.data());
      // var sandboxCode = document.getElementById('sandboxCode');
      // sandboxCode.innerHTML = htmlCodeMirror.getValue();

      // if(firsttime) {
      //   firsttime = false;

      //   // add global vars to the oldState obj with value
      //   // undefined, then assign to each prop the actual
      //   // value from the the code
      //   for (var i = 0; i < JSHINT.data().globals.length; i++) {
      //     oldState[JSHINT.data().globals[i]] = undefined;
      //   }

      //   eval(jsCodeMirror.getValue());

      //   for(var v in oldState) {
      //     var value = eval(v);
      //     if (typeof(value) == 'object') {
      //       console.log(Object.keys(value));
      //       oldState[v] = JSON.stringify(value);
      //     } else {
      //       oldState[v] = value + '';
      //     }
      //   }

      //   console.log('oldState:', oldState);

      //   // send all code first time
      //   socket.emit('javascript', jsCodeMirror.getValue());

      // } else {
      //   // eval and compare with old state
      //   var grabAll = {};

      //   for (var j = 0; j < JSHINT.data().globals.length; j++) {
      //     grabAll[JSHINT.data().globals[j]] = undefined;
      //   }

      //   eval(jsCodeMirror.getValue());

      //   for(var v in oldState) {
      //     var value = eval(v);
      //     if (typeof(value) == 'object') {
      //       grabAll[v] = JSON.stringify(value);
      //     } else {
      //       grabAll[v] = value + '';
      //     }
      //   }

      //   // TO DO: check for new globals by comparing the length
      //   // of oldState and grabAll?

      //   if (Object.keys(oldState).length == Object.keys(grabAll).length) {
      //     for(var vvv in grabAll) {
      //       if(grabAll[vvv] != oldState[vvv]) {
      //         console.log('var ' + vvv + ' = ' + grabAll[vvv], 'This should be evalled');
      //         // eval('var ' + vvv + ' = ' + grabAll[vvv]);

      //         socket.emit('javascript', 'var ' + vvv + ' = ' + grabAll[vvv]);

      //       }
      //     }
      //   }

      //   // eval.call(window, jsCodeMirror.getValue());
      //   console.log('JSHINT.data():', JSHINT.data());
      //   console.log('oldState:', oldState);
      //   console.log('grabAll:', grabAll);
      //   oldState = grabAll;
      //   console.log('oldState after assignment:', oldState);
      // }


      // emit javascript from js codemirror
      var js = jsCodeMirror.getValue();
      socket.emit('javascript', js);

      /**
       * Remove embedded javascript scripts from html
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
    // When the Save button is clicked, show a bootstrap modal
    // to save changed code to a new file, and save code to an
    // existing gist if the file already exist (via the socket)
    // 
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
    }); // end $('#savecode').click(...)

    //-------------------------------------------------------
    //
    // When the Save button in a modal is clicked, save the
    // new files and the existing files
    // 
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

    //-------------------------------------------------------
    //
    // Get a confirmation that the gist file was saved
    // 
    socket.on('fileSaved', function() {
      showMessageFileSaved();
    });

    //-------------------------------------------------------
    //
    // Called when 'New HTML File...' is called
    // 
    $(document).on('click', '#newHtmlFile', function(e) {
      e.preventDefault();
      $('#htmlModal').modal('toggle');
    });

    // Focus input field for new HTML file
    $('#htmlModal').on('shown', function() {
      $('#inputHtml').focus();
    });

    //-------------------------------------------------------
    //
    // Called when 'New JS File...' is called
    // 
    $(document).on('click', '#newJSFile', function(e) {
      e.preventDefault();
      $('#jsModal').modal('toggle');
    });

    // Focus input field for new JS file
    $('#jsModal').on('shown', function() {
      $('#inputJs').focus();
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
      socket.emit('downloadResource', {url : $('#inputUrlResource').val(), filename : $('#inputFilenameResource').val() });
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
          socket.emit('downloadResource', {url : 'http://localhost:5678/uploads/' + response, filename : response });

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
    socket.on('fileSaved', function(message) {
      alert(message);
    });

    //-------------------------------------------------------
    //
    // When a new file is created, add the new file entry to
    // the dropdown menu with the file list
    // 
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
    // Enable resizing the container of codemirrors with the
    // s(outh) handle
    //
    $('#editors').resizable({handles: 's'});

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
    // Tells the server to reset the webview in the mobile app
    //
    $('#reset').click(function() {
      socket.emit('reset');
    });

    // When a gist file is saved, give feedback to the user
    function showMessageFileSaved() {
      hideLoadIndicator();
      $('#fileSaved').fadeIn(1000, function() {
        $('#fileSaved').fadeOut(3000);
      });
    }

    // helper functions to show and hide a load indicator
    function showLoadIndicator() {
      $('#loadIndicator').css('background', '#003B80 url("/img/ajax-loader.gif") no-repeat 0px 30px');
    }

    function hideLoadIndicator() {
      $('#loadIndicator').css('background', '#003B80');
    }

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

    //-------------------------------------------------------
    //
    // Acorn
    // Rules: 1. If node is a program get the last statement/node
    //        2. If node is a literal get the node around by passing
    //           the (start of the literal node - 1) to find the VariableDeclaration
    //        3. If node is a block, find the function declaration
    //           togheter with the body. PROBLEM: when changing a 
    //           function declaration we should execute all the calls
    //           to that function!
    //           
    //
    // Depending on where we are with the cursor we want to extract the
    // surrounding statement to executing it, a la Smalltalk. Also, add
    // a feature so that the user can select e portion of the text and
    // execute it.

    jsCodeMirror.on('cursorActivity', function(cm) {
      updateParserHighlightWithLatency();
    });

    var latencyFromLastPress = 100;
    var lastKeypress = null;
    function updateParserHighlightWithLatency() {
      lastKeypress = new Date().getTime();
      setTimeout(function() {
        var currentTime = new Date().getTime();
        if (currentTime - lastKeypress > latencyFromLastPress) {
          console.log('CURSOR ACTIVITY');
          // clean console
          console.clear();
          updateParserHighlight();
        }
      }, latencyFromLastPress + 10);
    }

    function updateParserHighlight() {

      if (typeof(marker) != 'undefined') marker.clear();

      // get code from code mirror
      var code = jsCodeMirror.getValue();

      // If there is an error, don't even continue parsing
      JSHINT(code);
      var errors = JSHINT.data().errors;
      if (errors) return;

      // parse the program to a node program
      var program = acorn.parse(code, {locations: true, ranges: true});
      console.log('program:', program, '\n');

      // get the position of the cursor, specified as index(int) of
      // the total characters from start to caret (and not as {line,ch})
      var pos = jsCodeMirror.indexFromPos(jsCodeMirror.getCursor());
      var node = acorn.walk.findNodeAround(program, pos);
      if(typeof(node) == 'undefined') return;

      var _ = acorn.walk.findNodeAround(node.node);
      if(typeof(_) != 'undefined')
        console.log('_:', _.node);
      var __ = acorn.walk.findNodeBefore(program,pos);
      if(typeof(__) != 'undefined')
        console.log('__:', __.node);
      var ___ = acorn.walk.findNodeAfter(program,pos);
      if(typeof(___) != 'undefined')
        console.log('___:', ___.node);

      node = node.node;
      console.log('First node found:', node);

      node = findNode(node, pos);
      var string = stringFromNode(node);
      console.log('To Be Eval String:', string);

      function findNode(node, pos) {
        try {
          // If node is program, find node one ch before the caret
          if(node.type == 'Program') {
            var closestLeftNode = acorn.walk.findNodeAround(program, pos-1);
            return findNode(closestLeftNode.node, pos-1);
          }
          else if (node.type == 'Literal') {
            var closestRightNode = acorn.walk.findNodeAround(program, node.end+1);
            var closestLeftNode = acorn.walk.findNodeAround(program, node.start-1);
            if(closestRightNode.node.type == 'Program') {
              return findNode(closestLeftNode.node, pos-1);
            }
            if(closestRightNode.node.type == 'CallExpression') {
              return findNode(closestRightNode.node);
            }
            if(closestRightNode.node.type == 'ExpressionStatement') {
              return findNode(closestRightNode.node);
            }
            return findNode(closestLeftNode.node, pos+1);
          }
          else if (node.type == 'VariableDeclaration') {
            var aroundMe = acorn.walk.findNodeAround(program, node.start-1);
            if (typeof(aroundMe) == 'undefined' || aroundMe.node.type == 'Program') {
              return node;
            } else {
              return findNode(aroundMe.node, pos);
            }
          }
          else if (node.type == 'BlockStatement') {
            var closestLeftNode = acorn.walk.findNodeAround(program, node.start-1);
            return findNode(closestLeftNode.node, pos);
          }
          else if (node.type == 'ReturnStatement') {
            var closestLeftNode = acorn.walk.findNodeAround(program, node.start-1);
            return findNode(closestLeftNode.node, pos);
          }
          else if (node.type == 'AssignmentExpression') {
            var closestLeftNode = acorn.walk.findNodeAround(program, node.end+1);
            return findNode(closestLeftNode.node, pos+1);
          }
          else if (node.type == 'MemberExpression') {
            var closestLeftNode = acorn.walk.findNodeAround(program, node.end+1);
            return findNode(closestLeftNode.node, pos+1);
          }
          else if (node.type == 'FunctionDeclaration') {
            var aroundMe = acorn.walk.findNodeAround(program, node.start-1);
            if (typeof(aroundMe) == 'undefined' || aroundMe.node.type == 'Program') {
              return node;
            } else {
              return findNode(aroundMe.node, pos);
            }
          }
          else if (node.type == 'ForStatement') {
            return node;
          }
          else if (node.type == 'IfStatement') {
            return node;
          }
          else if (node.type == 'WhileStatement') {
            return node;
          }
          else if (node.type == 'DoWhileStatement') {
            return node;
          }
          else if (node.type == 'SwitchCase') {
            return node;
          }
          else if (node.type == 'TryStatement') {
            return node;
          }
          else if (node.type == 'WithStatement') {
            return node;
          }
          else if (node.type == 'BinaryExpression') {
            var closestLeftNode = acorn.walk.findNodeAround(program, node.start-1);
            return findNode(closestLeftNode.node, pos);
          }
          else if (node.type == 'ExpressionStatement') {
            var aroundMe = acorn.walk.findNodeAround(program, node.start-1);
            if (typeof(aroundMe) == 'undefined' || aroundMe.node.type == 'Program') {
              return node;
            } else {
              return findNode(aroundMe.node, pos);
            }
          }
          else if (node.type == 'CallExpression') {
            var aroundMe = acorn.walk.findNodeAround(program, node.start-1);
            if (typeof(aroundMe) == 'undefined' || aroundMe.node.type == 'Program') {
              return node;
            } else {
              return findNode(aroundMe.node, pos);
            }
          }
          else if (node.type == 'MemberExpression') {
            var closestLeftNode = acorn.walk.findNodeAround(program, pos+1);
            return findNode(closestLeftNode.node, pos+1);
          }
          else if (node.type == 'Identifier') {
            var closestLeftNode = acorn.walk.findNodeAround(program, pos+1);
            return findNode(closestLeftNode.node, pos+1);
          }
          else if (node.type == 'FunctionExpression') {
            var aroundMe = acorn.walk.findNodeAround(program, node.start-1);
            if (typeof(aroundMe) == 'undefined' || aroundMe.node.type == 'Program') {
              return node;
            } else {
              return findNode(aroundMe.node, pos);
            }
          }
        } catch(e) {
          console.log('Error Message:', e);
          console.log('around: nothing', '\n');
        }
      }
    } // jsCodeMirror.on('cursorActivity', function(cm) {

    function stringFromNode(node) {
      var start = jsCodeMirror.posFromIndex(node.start);
      var end = jsCodeMirror.posFromIndex(node.end);
      console.log('start:', start);
      console.log('end:', end);
      if (typeof(marker) != 'undefined') marker.clear();
      marker = jsCodeMirror.markText(start, end, {className: 'parserHighlight'});
      return jsCodeMirror.getRange(start, end);
    }

    // Same as jsCodeMirror.on('cursorActivity', function(cm) {
    $('#acorn').click(function() {
      // // clean console
      // console.clear();

      // // get code from code mirror
      // var code = jsCodeMirror.getValue();

      // // If there is an error, don't even continue parsing
      // JSHINT(code);
      // var errors = JSHINT.data().errors;
      // if (errors) return;

      // // parse the program to a node program
      // var program = acorn.parse(code, {locations: true, ranges: true});

      // // get the position of the cursor, specified as index(int) of
      // // the total characters from start to caret (and not as {line,ch})
      // var pos = jsCodeMirror.indexFromPos(jsCodeMirror.getCursor());
      // console.log('pos:', pos);

      // // Find a node with a given start, end, and type (all are optional,
      // // null can be used as wildcard). Returns a {node, state} object, or
      // // undefined when it doesn't find a matching node.
      // // exports.findNodeAt = function(node, start, end, test, base, state) {
      // // var node = acorn.walk.findNodeAt(program, pos);

      // // Find the innermost node of a given type that contains the given
      // // position. Interface similar to findNodeAt.
      // // exports.findNodeAround = function(node, pos, test, base, state) {
      // var node = acorn.walk.findNodeAround(program, pos);

      // // Find the outermost matching node after a given position.
      // // exports.findNodeAfter = function(node, pos, test, base, state) {
      // // var node = acorn.walk.findNodeAfter(program, pos);

      // // Find the outermost matching node before a given position.
      // // exports.findNodeBefore = function(node, pos, test, base, state) {
      // // var node = acorn.walk.findNodeBefore(program, pos);

      // console.log('node:', node);

      // // print the start and end of the found node
      // console.log('node.start:', node.node.start);
      // console.log('node.end:', node.node.end);

      // // try to get the string in the found node
      // var start = jsCodeMirror.posFromIndex(node.node.start);
      // var end = jsCodeMirror.posFromIndex(node.node.end);
      // console.log('getRange:');
      // console.log(jsCodeMirror.getRange(start, end));
    }); // $('#acorn').click(function() {


  //-------------------------------------------------------
  //
  // Hack inspired by Khan Akademy
  //
  // var firsttime = true;
  // var oldState = {};
  // $('#jshint').click(function() {
  //   console.clear();
  //   JSHINT(jsCodeMirror.getValue());
  //   console.log('JSHINT.data():', JSHINT.data());

  //   if(firsttime) {
  //     firsttime = false;

  //     // add global vars to the oldState obj with value
  //     // undefined, then assign to each prop the actual
  //     // value from the the code
  //     for (var i = 0; i < JSHINT.data().globals.length; i++) {
  //       oldState[JSHINT.data().globals[i]] = undefined;
  //     }

  //     eval(jsCodeMirror.getValue());

  //     for(var v in oldState) {
  //       var value = eval(v);
  //       if (typeof(value) == 'object') {
  //         oldState[v] = JSON.stringify(value);
  //       } else {
  //         oldState[v] = value + '';
  //       }
  //     }

  //     console.log('oldState:', oldState);

  //   } else {
  //     // eval and compare with old state
  //     var grabAll = {};

  //     for (var j = 0; j < JSHINT.data().globals.length; j++) {
  //       grabAll[JSHINT.data().globals[j]] = undefined;
  //     }

  //     eval(jsCodeMirror.getValue());

  //     for(var v in oldState) {
  //       var value = eval(v);
  //       if (typeof(value) == 'object') {
  //         grabAll[v] = JSON.stringify(value);
  //       } else {
  //         grabAll[v] = value + '';
  //       }
  //     }

  //     // TO DO: check for new globals by comparing the length
  //     // of oldState and grabAll?

  //     if (Object.keys(oldState).length == Object.keys(grabAll).length) {
  //       for(var v in grabAll) {
  //         if(grabAll[v] != oldState[v]) {
  //           console.log('var ' + v + ' = ' + grabAll[v], 'should be evalled');
  //           // eval('var ' + v + ' = ' + grabAll[v]);
  //         }
  //       }
  //     }

  //     // eval.call(window, jsCodeMirror.getValue());
  //     console.log('JSHINT.data():', JSHINT.data());
  //     console.log('oldState:', oldState);
  //     console.log('grabAll:', grabAll);
  //     oldState = grabAll;
  //     console.log('oldState after assignment:', oldState);
  //   }

  // });

  }); // end on load of page


  //-------------------------------------------------------
  //
  // UglifyJS
  //
  // var code = 'var widgetButton = mosync.nativeui.create("Button", "myButton", { "text" : "Click Me!", "width" : "FILL_AVAILABLE_SPACE" });'

  // var code = 'function one() {var a = 5; function two() {var b = 10;}} var miao; if(true) {console.log("hello");}';
  // var toplevel_ast = UglifyJS.parse(code);
  // toplevel_ast.figure_out_scope();

  // console.log('toplevel_ast:');
  // console.log(toplevel_ast);

  // console.log(toplevel_ast.variables._values.$widgetButton.init.expression.end);
  // console.log(toplevel_ast.variables._values.$widgetButton.init.expression.expression.end);
  // console.log(toplevel_ast.variables._values.$widgetButton.init.expression.expression.expression.end);

  // console.log(toplevel_ast);

  //-------------------------------------------------------
  //
  // JSLint
  //
  // JSLINT('function one() {var a = 5; function two() {var b = 10;}} var miao;');
  // data = JSLINT.data();
  // console.log(data);
  // console.log(JSLINT.report(data));

})();