// Init
var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server);
server.listen(5678);

var GitHubApi = require("github");
var github = new GitHubApi({
    version: "3.0.0"
});
var currentSelectedGistId;

/************ everyauth ************/
var everyauth = require("everyauth");
everyauth.debug = true;

everyauth.github
  .appId("e354d175ec5d528e1221")
  .appSecret("c0395c056ba48ab496689aaf4a60d4196a870dc9")
  .findOrCreateUser(function(sess, accessToken, accessTokenExtra, ghUser) {
    return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser("github", ghUser, accessToken));
  })
  .sendResponse( function (res, data) { /* default implementation */
    var user = data.user;
    return this.redirect(res, "/");
  }).redirectPath("/");

// for some reasons the user is must start with 1
var nextUserId = 1;
var usersByGhId = {};
var usersById = {};

/* More compact version of addUser, less clear */
/*
function addUser(source, sourceUser, token) {
  var user;
  user = usersById[nextUserId] = {id: nextUserId};
  user["token"] = token;
  user[source] = sourceUser;
  nextUserId++;
  return user;
}
*/

function addUser(source, sourceUser, token) {
  var user;
  user = {id: nextUserId};
  user["token"] = token;
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
  app.set("views", __dirname + "/views");
  app.engine("html", require("ejs").renderFile);

  // static files
  app.use(express.static(__dirname + "/public"));

  app.use(everyauth.middleware(app));
})


/**
 * Routing for the homepage. If we are logged in to GitHub via everyauth,
 * try to get a user data via the github library. The github library needs a
 * token to do certain operations on GitHub, i.e. edit gists. The token is
 * returned by everyauth and oauth is used by the github library to perform
 * authentication on the github object.
 */
 app.get("/", function(req, res){
  if (req.loggedIn) {
    github.user.get({}, function (err, data) {
      if (err) {
        console.log("try to authenticate...");
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
  //   id: "5291274"
  // }, function (err, data) {
  //   console.log(data);
  // })

  // Edit a gist
  // github.gists.edit({
  //   id: "4960315",
  //   files: {
  //     "test.js": {
  //       "content": "We were stars..."
  //     }
  //   }
  // }, function (err, data) {
  //   console.log(data);
  // });

  res.render("index.ejs", {
    title: "Live!"
  });
});

/**
 * Routing that responds to an ajax request for retrieving the gists
 * of a specific user. Returns the is and the description for each gist.
 */
app.post("/user", express.bodyParser(), function(req, res){
  var user = req.body.user;
  getGistsOfUser(user, function(err, data) {
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
app.post("/gist", express.bodyParser(), function(req, res){
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
        if (type == "html") {
          htmlFiles.push({id:currentSelectedGistId, filename:filename});
        }
        if (type == "js") {
          jsFiles.push({id:currentSelectedGistId, filename:filename});
        }
      }
    }

    res.send({"htmlfiles" : htmlFiles, "jsfiles" : jsFiles});
  });
});

/**
 * Routing that responds to an ajax request for retrieving a specific
 * file from a gist. Returns the content of the file.
 */
app.post("/file", express.bodyParser(), function(req, res){
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

app.get("/mobile", function(req, res){
    res.render("mobile.ejs", {
        title: "Mobile!"
    });
});

// usernames which are currently connected to the chat
var usernames = {};

// io.sockets.emit will send to all the clients
// socket.broadcast.emit will send the message to all the other clients except the newly created connection
io.sockets.on("connection", function (socket) {

  // let the clients that call with "room" join the given room
  socket.on("room", function (room) {
      socket.join(room);
      console.log("A client has joined: " + room);
  });
  
  socket.on("htmlCode", function (code) {
      io.sockets.in("mobile").emit("htmlCode", code);
  });

  socket.on("jsCode", function (code) {
      io.sockets.in("mobile").emit("jsCode", code);
  });

  socket.on("saveFileGist", function (data) {
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
});