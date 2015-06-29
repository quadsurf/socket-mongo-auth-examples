var token, socket, $errMessage;

var socket = io.connect();

function connect () {
  console.log("JUST RAN CONNECT!")
  console.log(socket);
  socket.on('connect', function () {
    console.log('connected');
    socket.emit('loggedIn')
  });
  socket.on('disconnect', function () {
    console.log('disconnected');
  });
  socket.on('data', function(msg, info){
   $('#messages').append($('<li>').text(info + ": " +msg));
 });
  socket.on('alreadyLoggedIn', function(){
    if ($errMessage) $errMessage.remove();
    $('#login').hide();
    $('.signup').hide();
    $('#message').show();
    $('#logout').show();
    $('#text').focus();
  });
}

connect();

$('#message').submit(function(e){
  e.preventDefault();
  var messageText = $("#text").val();
  console.log(messageText);
  socket.emit("message", messageText);
  $("#text").val("");
});

$('#logout').click(function(e){
  socket.emit('logout');
});

$('#login').submit(function (e) {
  e.preventDefault();
  var username = $('#username').val();
  var password = $('#password').val();
  var data = {user: {username: username, password:password}};
  $.ajax({
    type: 'POST',
    data: data,
    url: '/login'
  }).done(function (result) {
    if ($errMessage) $errMessage.remove();
                // token = result.token;
                $('#message').show();
                $('#logout').show();
                $('#login').hide();
                $('.signup').hide();
                $('#text').focus();
                connect();
                socket.emit("login", result);
              }).fail(function(err){
                if ($errMessage) $errMessage.remove();
                $errMessage = $("<h1>").text(err.responseText);
                $errMessage.css("color","red");
                $("body").append($errMessage);
                $('#login')[0].reset();
              });
            });