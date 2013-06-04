// Init Express framework and Socket.io
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs');

io.enable('browser client minification'); // send minified client
io.enable('browser client etag');         // apply etag caching logic based on version number
io.enable('browser client gzip');         // gzip the file
// io.set('log level', 1);                   // reduce logging

server.listen(5678);

// Init the GitHub Api, https://github.com/ajaxorg/node-github
var GitHubApi = require('github');
var github = new GitHubApi({
    version: '3.0.0'
});

/**
 * Current selected gist. We save the id on the server side to avoid
 * sending it back and forth once a gist is selected and active.
 */
var currentSelectedGistId;

/**
 * Init everyauth.
 */
var everyauth = require('everyauth');
everyauth.debug = true;

everyauth.github
  .appId('e354d175ec5d528e1221')
  .appSecret('c0395c056ba48ab496689aaf4a60d4196a870dc9')
  .findOrCreateUser(function(sess, accessToken, accessTokenExtra, ghUser) {
    return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser, accessToken));
  })
  .sendResponse(function(res, data) { /* default implementation */
    var user = data.user;
    return this.redirect(res, '/');
  }).redirectPath('/');

/**
 * Globals used by everyauth for keeping track of the connected users.
 */
var nextUserId = 1;
var usersByGhId = {};
var usersById = {};

/* More compact version of addUser, less clear */
/*
function addUser(source, sourceUser, token) {
  var user;
  user = usersById[nextUserId] = {id: nextUserId};
  user['token'] = token;
  user[source] = sourceUser;
  nextUserId++;
  return user;
}
*/

/**
 * Add a new new connected user to the list usersById.
 */
function addUser(source, sourceUser, token) {
  var user;
  user = {id: nextUserId};
  user['token'] = token;
  user[source] = sourceUser;
  usersById[nextUserId] = user;
  nextUserId++;
  return user;
}

/**
 * Used by everyauth to access a user.
 */
everyauth.everymodule.findUserById(function(id, callback) {
  callback(null, usersById[id]);
});

/************ End everyauth ************/

/**
 * Setup the Express app.
 */
app.configure(function(){
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'secret' }));
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.static(__dirname + '/public'));
  app.use(everyauth.middleware(app));

  // http://stackoverflow.com/questions/8378338/what-does-connect-js-methodoverride-do
  // app.use(express.methodOverride());
});

/**
 * Routing for the homepage. If we are logged in to GitHub via everyauth,
 * try to get a user data via the github library. The github library needs a
 * token to do certain operations on GitHub, i.e. edit gists. The token is
 * returned by everyauth and oauth is used by the github library to perform
 * authentication on the github object.
 */
 app.get('/', function(req, res){
  if (req.loggedIn) {
    github.user.get({}, function(err, data) {
      if (err) {
        console.log('try to authenticate...');
        github.authenticate({
            type: 'oauth',
            token: req.user.token
        });
      } else {
        // We are authenticated!
        console.log('We are authenticated! ' + data);
      }
    });
  }

  // Delete a gist
  // github.gists.delete({
  //   id: '5291274'
  // }, function (err, data) {
  //   console.log(data);
  // })

  // Edit a gist
  // github.gists.edit({
  //   id: '4960315',
  //   files: {
  //     'test.js': {
  //       'content': 'We were stars...'
  //     }
  //   }
  // }, function (err, data) {
  //   console.log(data);
  // });

  // var octocats = require('./octocat').octocats;
  // var octocat = octocats[Math.floor(Math.random()*octocats.length)];

  res.render('index.ejs', {
    title: 'Live!',
    widgets: require('./documentation/widgets').widgets,
    jsEvents: require('./documentation/events').events,
    jsMethods: require('./documentation/methods').methods
    // octocat: octocat
  });
});

/**
 * Routing that responds to an ajax request for retrieving the gists
 * of a specific user. Returns the id and the description for each gist.
 */
app.post('/gists', function(req, res){
  var user = req.body.user;
  getGistsOfUser(user, function(err, data) {
    if (err) {
      res.send({error:err.message});
    } else {
      var gists = [];
      for (var i=0; i < data.length; i++) {
        gists.push({id:data[i].id, description:data[i].description});
      }
      res.send(gists);
    }
  });
});

/**
 * Get gists from a specific user. Calls a callback with the retrieved
 * data.
 */
function getGistsOfUser(user, callback) {
  github.gists.getFromUser({
    user: user
  }, function(err, data){
    callback(err, data);
  });
}

/**
 * Routing that responds to an ajax request for retrieving a specific
 * gist from a gist id. Returns an object that contains the html and JS
 * files contained in the specified gist.
 */
app.post('/gist', function(req, res){
  currentSelectedGistId = req.body.id;

  github.gists.get({
    id: currentSelectedGistId
  }, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    var files = data.files;
    var htmlFiles = [];
    var jsFiles = [];

    for (var key in files) {
      if (files.hasOwnProperty(key)) {
        var filename = (files[key]).filename;
        var content = (files[key]).content;

        var extension = filename.match(/.*\.(.*)/);
        if (!extension) {
          continue;
        }

        var type = extension[1];
        if (type == 'html') {
          htmlFiles.push({id:currentSelectedGistId, filename:filename});
        }
        if (type == 'js') {
          jsFiles.push({id:currentSelectedGistId, filename:filename});
        }
      }
    }

    console.log('html files: ' + htmlFiles.length);
    console.log('js files: ' + jsFiles.length);

    res.send({'htmlfiles' : htmlFiles, 'jsfiles' : jsFiles});
  });
});

/**
 * Routing that responds to an ajax request for retrieving a specific
 * file from a gist. Returns the content of the file.
 */
app.post('/file', function(req, res){
  var file = req.body.filename;

  github.gists.get({
    id: currentSelectedGistId
  }, function(err, data) {
    if (err) {
      console.log('github.gists.get, ' + err);
      return;
    }
    var files = data.files;
    var content = (files[file]).content;
    res.send(content);
  });
});

/**
 * Routing that responds to the mobile device where the app is to be
 * rendered.
 */
app.get('/mobile', function(req, res){
    res.render('mobile.ejs', {
        title: 'Mobile!'
    });
});

app.post('/upload', function(req, res){
  console.log(req.files);

  fs.readFile(req.files.savefile.path, function (err, data) {
    var newPath = __dirname + '/public/uploads/' + req.files.savefile.name;
    console.log(newPath);
    fs.writeFile(newPath, data, function (err) {
      console.log(err);
      res.send(req.files.savefile.name);
    });
  });

});

/**
 * Setup connected sockets.
 * Note: io.sockets.emit will send to all the clients
 * Note: socket.broadcast.emit will send the message to all the
 *       other clients except the newly created connection
 */
io.sockets.on('connection', function(socket) {

  // Add a client to a room
  socket.on('room', function(room) {
      socket.join(room);
      console.log('A client has joined: ' + room);
  });

  // Send the html code to the mobile room
  socket.on('html', function(code) {
    io.sockets.in('mobile').emit('html', code);
  });

  // Send the JavaScript code to the mobile room
  socket.on('javascript', function(code) {
    io.sockets.in('mobile').emit('javascript', code);
  });

  // Send the edited code to github to update the gist file
  socket.on('saveFileGist', function(data) {
    var newFile = data['new'];
    var filename = data.filename;
    var type = data.type;

    var temp = {};
    temp.id = currentSelectedGistId;
    temp.files = {};
    temp.files[filename] = {};

    // without '...' in the content, the file is deleted or not created 
    temp.files[filename]['content'] = data.code === '' ? '...' : data.code;

    console.log('data.code: ---' + data.code + '---');

    github.gists.edit(temp, function(err, data) {
      if (err) {
        console.log(err);
        console.log('Error saving file: ' + filename);
      } else {
        console.log('file saved! >>> ' + filename);
        if(newFile) {
          io.sockets.in('webapp').emit('filecreated', {id : currentSelectedGistId, filename : filename, type : type});
        } else {
          io.sockets.in('webapp').emit('filesaved');
        }
      }
    });
  });

  socket.on('reset', function() {
    io.sockets.in('mobile').emit('reset');
  });

  socket.on('downloadResource', function(data) {
    io.sockets.in('mobile').emit('downloadResource', data);
  });

  socket.on('fileSaved', function() {
    io.sockets.in('webapp').emit('fileSaved');
  });

  socket.on('resourceSaved', function(message) {
    io.sockets.in('webapp').emit('resourceSaved', message);
  });

  socket.on('getListResources', function() {
    io.sockets.in('mobile').emit('getListResources');
  });

  socket.on('listResources', function(resources) {
    io.sockets.in('webapp').emit('listResources', resources);
  });

  socket.on('mobilelog', function(message) {
    io.sockets.in('webapp').emit('mobilelog', message);
  });

}); // io connection