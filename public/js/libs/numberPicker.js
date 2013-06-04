var numberPicker = (function() {

  var numberPicker = {};
  numberPicker.numberPicker = function(editor, sliderDiv) {
    var widthSlider = sliderDiv.css('width');

    var slider = $(sliderDiv.children(":first")[0]);
    var sliderOriginalValue = slider.val();
    var tokenOriginalValue;

    var startReplace, endReplace;

    // Bind the numberPicker to change events
    slider.change(function(e) {
      e.preventDefault();

      // editor.off('cursorActivity', onCursorActivity);

      var cur = editor.getCursor();
      var token = editor.getTokenAt(cur);
      editor.setCursor({line: cur.line, ch: token.end});

      // when cursor is in front of a token, the token is then null,
      // replace token with tokenAhead which is at a ch+1
      var tokenAhead = editor.getTokenAt({line:cur.line, ch:cur.ch+1});
      token = token.type === null ? tokenAhead : token;

      // new value - original value gives us how much the slider was slided
      var offset = $(this).val() - sliderOriginalValue;

      // actual value, the original token value + offset
      var value = (tokenOriginalValue + offset) + '';
      // console.log('tokenOriginalValue:', tokenOriginalValue);
      editor.replaceRange(value, {line:cur.line, ch:startReplace}, {line:cur.line, ch:endReplace});

      if(value.length < (endReplace - startReplace)) {
        endReplace--;
      } else if(value.length > (endReplace - startReplace)) {
        endReplace++;
      }
    });

    editor.setOption('onKeyEvent', function(cm, s){
      if (s.type == 'keyup') {
        showNumberPicker(cm);
      }
    });

    editor.on('focus', function(cm) {
      // console.log('focus!');
      // $('#inletSliderHtml').css('visibility','hidden');
      // $('#inletSliderJS').css('visibility','hidden');
      editor.on('cursorActivity', onCursorActivity);
    });

    editor.on('cursorActivity', onCursorActivity);

    function onCursorActivity(cm) {
      // console.log('cursorActivity');
      hideSlider(cm);
      showNumberPicker(cm);
    }

    // Code for numberPicker
    function showNumberPicker(cm) {
      var cur = cm.getCursor();
      var pos = cm.cursorCoords();
      var token = cm.getTokenAt(cur);
      var tokenAhead = cm.getTokenAt({line:cur.line, ch:cur.ch+1});
      token = token.type === null ? tokenAhead : token;
      // console.log('token:', token);

      // adjust the sliderDiv position when element is hidden,
      // so that it won't move when sliding the slider
      if (sliderDiv.css('visibility') == 'hidden') {
        sliderDiv
          .css('left', (pos.left - parseInt(widthSlider,10)/2 + 4) + 'px')
          .css('top', (pos.top - 15) + 'px');
      }

      // we don't want to match colors
      var string = token.string;
      var hex = string.match(/#([A-Fa-f0-9]{6})/g);
      if (hex !== null) {
        return;
      }

      // match any ints in the token string
      var matches = string.match(/-?\d+/g), match;
      if (matches) {
        match = matches[0];
        tokenOriginalValue = parseInt(match, 10);

        var startInt = string.indexOf(match);
        var endInt = startInt + match.length;

        // console.log('startInt:', startInt);
        // console.log('endInt:', endInt);

        startReplace = token.start + startInt;
        endReplace = token.start + endInt;

        // check if in the int boudaries
        if(cur.ch >= token.start + startInt && cur.ch <= token.start + endInt) {
          sliderDiv.css('visibility', 'visible');

          // here we could bing right and left keys to
          // move the slider with the keyboard
          cm.addKeyMap(sliderMap);

        } else {
          hideSlider(cm);
        }
      } else {
        hideSlider(cm);
      }
    }

    var sliderMap = {
      Left: function() {
        slider.get(0).stepDown(1);
        slider.trigger('change');
      },
      Right: function() {
        slider.get(0).stepUp(1);
        slider.trigger('change');
      }
    };

    function hideSlider(cm) {
      sliderDiv.css('visibility', 'hidden');
      slider.val(50);
      cm.removeKeyMap(sliderMap);
    }
    //-------------------------------------------------------
    //
    // Test mouse pointer over tokens, incomplete implementation
    //
    // document.addEventListener("mousemove", function(e) {
    //   var x = e.pageX, y = e.pageY;
    //   var localEditor;
    //   var element = document.elementFromPoint(x, y);
    //   $(element).parents().each(function(i, el) {
    //     if (el.id == 'codeMirrorHtmlContainer') {
    //       localEditor = codemirror.htmlCodeMirror;
    //     }
    //     if (el.id == 'codeMirrorJsContainer') {
    //       localEditor = codemirror.jsCodeMirror;
    //     }
    //   });

    //   var pos = localEditor.coordsChar({left: x, top: y});
    //   $('#mouse').html('line: ' + pos.line + ', ch: ' + pos.ch);

    //   var token = localEditor.getTokenAt(pos);
    //   var tokenAhead = localEditor.getTokenAt({line:pos.line, ch:pos.ch+1});
    //   token = token.type === null ? tokenAhead : token;
    //   console.log('token:', token);

    //   var string = token.string;
    //   var matches = string.match(/-?\d+/g), match;
    //   if (matches !== null) {
    //     match = parseInt(match, 10);
    //     tokenOriginalValue = parseInt(match, 10);

    //     var startInt = string.indexOf(match);
    //     var endInt = startInt + match.length;

    //     // console.log('startInt:', startInt);
    //     // console.log('endInt:', endInt);

    //     startReplace = token.start + startInt;
    //     endReplace = token.start + endInt;

    //     element.style.cursor = 'col-resize';
    //   } else {
    //     element.style.cursor = 'default';
    //   }
    // }, false);

  }; // numberPicker.numberPicker = function(editor, sliderDiv) {

  return numberPicker;

})();