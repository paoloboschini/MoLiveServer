var colorPicker = (function() {

  var colorPicker = {};
  var startReplace, endReplace;

  colorPicker.colorPicker = function(editor, id) {

    var picker = new Color.Picker({
        color: "#000000", // accepts rgba(), or #hex
        display: false,
        size: 200,
        id: id,
        callback: function(rgba, state, type) {
          if (state == 'update') return;
          var cur = editor.getCursor();
          var token = editor.getTokenAt(cur);

          var value = Color.Space(rgba, "RGB>HEX>STRING");
          editor.replaceRange('#'+value, {line:cur.line, ch:startReplace}, {line:cur.line, ch:endReplace});
        }
    });

    editor.setOption('onKeyEvent', function(cm, s){
      if (s.type == 'keyup') {
        showColorPicker(cm);
      } // if (s.type == 'keyup') {
    });

    editor.on('cursorActivity', function(cm) {
      showColorPicker(cm);
    });

    // Code for colorPicker
    function showColorPicker(cm) {
      var cur = cm.getCursor();
      var pos = cm.cursorCoords();
      var token = cm.getTokenAt(cur);
      var tokenAhead = cm.getTokenAt({line:cur.line, ch:cur.ch+1});
      token = token.type === null ? tokenAhead : token;
      // console.log('token:', token);

      // match any ints in the token string
      var string = token.string;
      var matches = string.match(/#([A-Fa-f0-9]{6})/g), match;
      // console.log('matches:', matches);

      if (matches !== null) {
        match = matches[0];

        var startInt = string.indexOf(match);
        var endInt = startInt + match.length;

        // console.log('startInt:', startInt);
        // console.log('endInt:', endInt);

        startReplace = token.start + startInt;
        endReplace = token.start + endInt;

        // check if in the int boudaries
        if(cur.ch >= token.start + startInt && cur.ch <= token.start + endInt) {
          picker.element.style.top = (pos.top + 20) + "px";
          picker.element.style.left = (pos.left + 10) + "px";
          picker.update(match.substr(1));
          picker.toggle(true);
        } else {
          picker.toggle(false);
        }
      } else {
        picker.toggle(false);
      }
    } // function showColorPicker(cm) {
  }; // colorPicker.colorPicker = function(editor, id) {

  return colorPicker;

})();