var myGist = (function() {

  var myGist = {};
  var socket;

  myGist.setSocket = function(s) {
    socket = s;
  };

  //-------------------------------------------------------
  //
  // On load of page
  // 
  $(function() {

    //-------------------------------------------------------
    //
    // If everyauth is logged in, get gists of the user
    // 
    var user = $('#git-user').text();
    if (user.length !== 0) {
      console.log(user + ' is logged in.');
      LiveUtils.showLoadIndicator();
      $.ajax({
        url: '/gists',
        type: 'POST',
        data: {user : user},
        cache: false,
        timeout: 10000,
        success: function(response) {
          LiveUtils.hideLoadIndicator();

          if (response.error) {
            alert(response.error);
            return;
          }

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
    // Create a new gist
    //
    $('#newGist').click(function(e) {
      e.preventDefault();
      $('#newGistModal').modal('toggle');
    });

    $('#newGistModalSave').click(function(e) {
      LiveUtils.showLoadIndicator();
      var description = $('#inputGistDescription').val();
      $.ajax({
        url: '/newgist',
        type: 'POST',
        data: {description: description},
        timeout: 10000,
        cache: false,
        success: function(response) {
          LiveUtils.hideLoadIndicator();
          if (response.id) {
            $('#gistsList').append('<li><a class="gistElement" href="' + response.id + '">' + response.description + '</a></li>');
            LiveUtils.showFlashMessage('New Gist created!');

            // choose the new created gist
            $('a[href="' + response.id + '"]').click();

          } else {
            LiveUtils.showFlashMessage(response.error);
          }
        } // success
      }); // ajax
    });

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
        .text('HTML files ')
        .append('<span class="caret" style="margin-top: 8px;"></span>');

      $('#jsToggleButton')
        .removeClass('btn-success')
        .text('JS files ')
        .append('<span class="caret" style="margin-top: 8px;"></span>');

      $('#gistsToggleLink')
        .text($(this).text()+' ')
        .append('<span class="caret" style="margin-top: 8px;"></span>')
        .addClass('btn-success');

      var id = $(this).attr('href');
      $('#gistsToggleLink').attr('href', id);

      LiveUtils.showLoadIndicator();
      $.ajax({
        url: '/gist',
        type: 'POST',
        data: {id:id},
        timeout: 10000,
        cache: false,
        success: function(response) {
          LiveUtils.hideLoadIndicator();

          $('#htmlToggleButton').attr('href', 'choose').attr('disabled', false);
          $('#jsToggleButton').attr('href', 'choose').attr('disabled', false);

          if (response.htmlfiles.length > 0) {
            $('#htmlToggleButton').addClass('btn-success');
          }

          if (response.jsfiles.length > 0) {
            $('#jsToggleButton').addClass('btn-success');
          }

          $('#jsToggleButton').removeClass('disabled');
          $('#htmlToggleButton').removeClass('disabled');
          //$('#savecode').removeClass('disabled').removeClass('btn-info');

          $('#htmlList').append('<li><a id="newHtmlFile">New HTML File...</a></li>');
          $('#jsList').append('<li><a id="newJSFile">New JS File...</a></li>');

          $.each(response.htmlfiles, function(index, value) {
            $('#htmlList').append('<li><a class="htmlFile" href="' + value.id + '">' + value.filename + '</a></li>');
          });
          $.each(response.jsfiles, function(index, value) {
            $('#jsList').append('<li><a class="jsFile" href="' + value.id + '">' + value.filename + '</a></li>');
          });

          // myCodeMirrors.htmlCodeMirror.setValue(response);
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
      LiveUtils.showLoadIndicator();
      $.ajax({
        url: '/file',
        type: 'POST',
        data: {id:id, filename:filename},
        timeout: 10000,
        cache: false,
        success: function(response) {
          LiveUtils.hideLoadIndicator();
          $(currentClass == 'htmlFile' ? '#htmlToggleButton' : '#jsToggleButton')
            .text(filename+' ')
            .append('<span class="caret" style="margin-top: 8px;"></span>');
          // $('#savecode').removeClass('disabled').removeClass('btn-info');

          if(currentClass == 'htmlFile') {
            myCodeMirrors.htmlCodeMirror.setValue(response);
          }
          else {
            myCodeMirrors.jsCodeMirror.setValue(response);
          }
          // socket.emit('code', response);
        } // success
      }); // ajax
    }); // end download file and show the content

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
    // When the Save button in a modal is clicked, save the
    // new files and the existing files
    // 
    $('#bothModalSave').click(function() {
      LiveUtils.showLoadIndicator();
      socket.emit('saveFileGist', {code : myCodeMirrors.htmlCodeMirror.getValue(), filename : $('#inputHtmlBoth').val(), 'new' : true, type : 'html'});
      socket.emit('saveFileGist', {code : myCodeMirrors.jsCodeMirror.getValue(), filename : $('#inputJsBoth').val(), 'new' : true, type : 'js'});
    });
    $('#htmlModalSave').click(function() {
      LiveUtils.showLoadIndicator();
      socket.emit('saveFileGist', {code : myCodeMirrors.htmlCodeMirror.getValue(), filename : $('#inputHtml').val(), 'new' : true, type : 'html'});
      if($('#jsToggleButton').attr('href') != 'choose') {
        socket.emit('saveFileGist', {code : myCodeMirrors.jsCodeMirror.getValue(), filename : $('#jsToggleButton').text().slice(0,-1)});
      }
    });
    $('#jsModalSave').click(function() {
      LiveUtils.showLoadIndicator();
      socket.emit('saveFileGist', {code : myCodeMirrors.jsCodeMirror.getValue(), filename : $('#inputJs').val(), 'new' : true, type : 'js'});
      if($('#htmlToggleButton').attr('href') != 'choose') {
        socket.emit('saveFileGist', {code : myCodeMirrors.htmlCodeMirror.getValue(), filename : $('#htmlToggleButton').text().slice(0,-1)});
      }
    });

    //-------------------------------------------------------
    //
    // When the Save button is clicked, show a bootstrap modal
    // to save changed code to a new file, and save code to an
    // existing gist if the file already exist (via the socket)
    // 
    $('#savecode').click(function() {
      if($(this).hasClass('disabled')) {
        return false;
      }

      var htmlCode = myCodeMirrors.htmlCodeMirror.getValue();
      var jsCode = myCodeMirrors.jsCodeMirror.getValue();

      var htmlFilename = $('#htmlToggleButton').text();
      var jsFilename = $('#jsToggleButton').text();

      var htmlHref = $('#htmlToggleButton').attr('href');
      var jsHref = $('#jsToggleButton').attr('href');

      // show modal dialog to create both files
      if(htmlHref == 'choose' && jsHref == 'choose') {
        if(htmlCode !== '' && jsCode !== '') {
          $('#bothModal').modal('toggle');
        } else if(htmlCode !== '' && jsCode === '') {
          $('#htmlModal').modal('toggle');
        } else {
          $('#jsModal').modal('toggle');
        }

      // show modal dialog to create html files
      } else if(htmlHref == 'choose' && jsHref != 'choose') {
        socket.emit('saveFileGist', {code : jsCode, filename : jsFilename.slice(0, -1)});
        if(htmlCode !== '') {
          $('#htmlModal').modal('toggle');
        }

      // show modal dialog to create js files
      } else if(htmlHref != 'choose' && jsHref == 'choose') {
        socket.emit('saveFileGist', {code : htmlCode, filename : htmlFilename.slice(0, -1)});
        if(jsCode !== '') {
          $('#jsModal').modal('toggle');
        }

      // don't show modal dialog, just save files
      } else if(htmlHref != 'choose' && jsHref != 'choose') {
        socket.emit('saveFileGist', {code : htmlCode, filename : htmlFilename.slice(0, -1)});
        socket.emit('saveFileGist', {code : jsCode, filename : jsFilename.slice(0, -1)});
      }

      $('#savecode').removeClass('btn-info');
      LiveUtils.showLoadIndicator();
    }); // end $('#savecode').click(...)

    //-------------------------------------------------------
    //
    // When a new file is created, add the new file entry to
    // the dropdown menu with the file list
    // 
    socket.on('gistFileCreated', function(data) {
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
      LiveUtils.hideLoadIndicator();
      LiveUtils.showFlashMessage('File created!');
    });

    //-------------------------------------------------------
    //
    // Disable button if they are disabled by bootstrap
    // 
    $('#htmlToggleButton').click(function() {
      if($(this).hasClass('disabled')) {
        return false;
      }
    });
    $('#jsToggleButton').click(function() {
      if($(this).hasClass('disabled')) {
        return false;
      }
    });

    //-------------------------------------------------------
    //
    // Get a confirmation that the gist file was saved
    // 
    socket.on('gistFileSaved', function() {
      LiveUtils.showFlashMessage('File saved!');
    });

  }); // page loaded

  return myGist;

})();