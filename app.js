var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
server.listen(5678);

var GitHubApi = require("github");
var github = new GitHubApi({
    version: "3.0.0"
});
var currentSelectedGistId;

/************ everyauth ************/
var everyauth = require('everyauth');
everyauth.debug = true;

console.log(Object.keys(everyauth.github));

everyauth.github
  .appId('e354d175ec5d528e1221')
  .appSecret('c0395c056ba48ab496689aaf4a60d4196a870dc9')
  .findOrCreateUser(function(sess, accessToken, accessTokenExtra, ghUser) {
    return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser, accessToken));
  })
  .sendResponse( function (res, data) { /* default implementation */
    var user = data.user;
    return this.redirect(res, '/');
  }).redirectPath('/');

// for some reasons the user is must start with 1
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

function addUser(source, sourceUser, token) {
  var user;
  user = {id: nextUserId};
  user['token'] = token;
  user[source] = sourceUser;
  usersById[nextUserId] = user;
  nextUserId++;
  return user;
}

everyauth.everymodule.findUserById(function (id, callback) {
  callback(null, usersById[id]);
});

/************ everyauth end ************/

app.configure(function(){
  app.use(express.cookieParser());
  app.use(express.session({ secret: "secret" }));
  // app.use(express.methodOverride());
  // app.use(app.router);

  // view engine
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);

  // static files
  app.use(express.static(__dirname + '/public'));

  app.use(everyauth.middleware(app));
})

// routing
app.get('/', function(req, res){

  if (req.loggedIn) {
    github.user.get({}, function (err, data) {
      if (err) {
        console.log('try to authenticate...');
        github.authenticate({
            type: "oauth",
            token: req.user.token
        });
      } else {
        // We are authenticated!
        console.log(data);
      }
    })
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
  //     "test.js": {
  //       "content": "We were stars..."
  //     }
  //   }
  // }, function (err, data) {
  //   console.log(data);
  // });

  res.render('index.ejs', {
    title: 'Live!'
  });
});

app.post('/', express.bodyParser(), function(req, res){
  var user = req.body.user;
  getGistOfUser(user, function(err, data) {
    if (err) {
      res.send({error:err.message});
    } else {
      var gists = [];
      for (var i=0; i < data.length; i++) {
        gists.push({id:data[i].id, description:data[i].description});
      };
      res.send(gists);
    }
  });
});

app.post('/gist', express.bodyParser(), function(req, res){
  // var id = req.body.id;
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
        var type = filename.match(/.*\.(.*)/)[1];
        if (type == 'html') {
          htmlFiles.push({id:currentSelectedGistId, filename:filename});
        }
        if (type == 'js') {
          jsFiles.push({id:currentSelectedGistId, filename:filename});
        }
      }
    }

    res.send({'htmlfiles' : htmlFiles, 'jsfiles' : jsFiles});
  });
});

app.post('/file', express.bodyParser(), function(req, res){
  var id = req.body.id;
  var file = req.body.filename;

  github.gists.get({
    id: id
  }, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    var files = data.files;
    var content = (files[file]).content;
    res.send(content);
  });
});

app.get('/mobile', function(req, res){
    res.render('mobile.ejs', {
        title: 'Mobile!'
    });
});

function getGistOfUser(user, callback) {
  github.gists.getFromUser({
    user: user
  }, function(err, data){
    callback(err, data);
  });
}

// usernames which are currently connected to the chat
var usernames = {};

// io.sockets.emit will send to all the clients
// socket.broadcast.emit will send the message to all the other clients except the newly created connection
io.sockets.on('connection', function (socket) {

    // let the clients that call with 'room' join the given room
    socket.on('room', function (room) {
        socket.join(room);
        console.log('A client has joined: ' + room);
        // io.sockets.in('heaven').emit('message', 'what is going on, party people?');
    })
    
    socket.on('htmlCode', function (code) {
        io.sockets.in('mobile').emit('htmlCode', code);
    })

    socket.on('jsCode', function (code) {
        io.sockets.in('mobile').emit('jsCode', code);
    })

    socket.on('saveFileGist', function (data) {
      var temp = {};
      temp.id = currentSelectedGistId;
      temp.files = {};
      temp.files[data.filename] = {};
      temp.files[data.filename]["content"] = data.code;
      
      console.log(temp);
      github.gists.edit(temp
        , function (err, data) {
        console.log(data);
      });
    });

    // // when the client emits 'sendchat', this listens and executes
    // socket.on('sendchat', function (data) {
    //  // we tell the client to execute 'updatechat' with 2 parameters
    //  io.sockets.emit('updatechat', socket.username, data);
    // });
    // 
    // // when the client emits 'adduser', this listens and executes
    // socket.on('adduser', function(username){
    //  // we store the username in the socket session for this client
    //  socket.username = username;
    //  // add the client's username to the global list
    //  usernames[username] = username;
    //  // echo to client they've connected
    //  socket.emit('updatechat', 'SERVER', 'you have connected');
    //  // echo globally (all clients) that a person has connected
    //  socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
    //  // update the list of users in chat, client-side
    //  io.sockets.emit('updateusers', usernames);
    // });
    // 
    // // when the user disconnects.. perform this
    // socket.on('disconnect', function(){
    //  // remove the username from global usernames list
    //  delete usernames[socket.username];
    //  // update list of users in chat, client-side
    //  io.sockets.emit('updateusers', usernames);
    //  // echo globally that this client has left
    //  socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    // });
});