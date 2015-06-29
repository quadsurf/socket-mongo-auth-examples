require("dotenv").load();
var app = require('express')();
var express = require("express");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require("body-parser");
var Session = require('express-session'),
    SessionStore = require('session-file-store')(Session);
var session = Session({ secret: 'pass', resave: true, saveUninitialized: true });

var ios = require('socket.io-express-session');

var db = require("./models");
var loginMiddleware = require("./middleware/login");
var token;

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session);
io.use(ios(session));

app.use(loginMiddleware);


app.get('/', function(req,res){
  res.redirect('/login');
});

app.get('/signup' ,function(req,res){
  res.render('signup');
});

app.get('/login', function(req,res){

  res.render('login');
});

app.post("/signup", function (req, res) {
  var newUser = req.body.user;
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/");
    } else {
      console.log(err);
      res.render("signup");
    }
  });
});

app.get('/logout', function(req,res){
  req.logout("/");
  res.redirect("/");
});

app.post('/login', function (req, res) {
  db.User.authenticate(req.body.user,
   function (err, user) {
    if (err) {
      res.status(400).send(err);
    }
     else if (!err && user !== null) {
       req.login(user);
       res.json(user);
     } else {
       res.status(400).send("Invalid username or Password");
     }
   });
});

// Math.random().toString(36).substring(3,16) + +new Date
var logoutTimer;

io.on('connection', function (socket) {
    console.log("CONNECTED!");
    console.log("THIS IS THE ID RIGHT NOW", socket.handshake.session.uid)
    socket.on('loggedIn', function(){
      if(socket.handshake.session.uid ){
        console.log("WE ALREADY HAVE AN ID!")
      clearTimeout(logoutTimer);
      socket.emit('alreadyLoggedIn');
      console.log("loggedIn Emitted!");
      }
    });

    socket.on("login", function(result) {
        socket.handshake.session.name = result.username;
        socket.handshake.session.uid = result._id;
        socket.handshake.session.save();
        console.log("This is the logged in person!", socket.handshake.session);
    });
    socket.on("logout", function(result) {
        if (socket.handshake.session.result) {
            delete socket.handshake.session.name;
            delete socket.handshake.session.uid;
            // Save the data to the session store
        socket.handshake.session.save();
        }
    });
    socket.on('message', function(message){
      io.emit("data", message, socket.handshake.session.name);
    });
    socket.on('disconnect', function(){
      if(socket.handshake.session.uid){
        console.log("disconnected");
        logoutTimer = setTimeout(function(){
        delete socket.handshake.session.uid;
        delete socket.handshake.session.name;
        socket.handshake.session.save();
        console.log(socket.handshake.session);
      }, 2000);
      }
    });
  });



http.listen(3000, function(){
  console.log('listening on port 3000');
});