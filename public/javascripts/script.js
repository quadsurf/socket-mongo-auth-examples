var token, socket, $errMessage;

// todo - make this faster
function hideShowForms(){
  if ($errMessage) $errMessage.remove();
  $('#message').show();
  $('#logout').show();
  $('#login').hide();
  $('.signup').hide();
  $('#text').focus();
}

socket = io.connect({'forceNew': true});
// when we connect, see if they are already logged in

socket.on('connect', function () {
  if (socket.emit('isLoggedIn')) socket.emit('loggedIn');
});
socket.on('data', function(msg, info){
 $('#messages').append($('<li>').text(info + ": " +msg));
});
socket.on('alreadyLoggedIn', function(){
  hideShowForms();
});

$('#message').submit(function(e){
  e.preventDefault();
  var messageText = $("#text").val();
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
    hideShowForms();
    socket.emit("login", result);
  }).fail(function(err){
    if ($errMessage) $errMessage.remove();
    $errMessage = $("<h1>").text(err.responseText);
    $errMessage.css("color","red");
    $("body").append($errMessage);
    $('#login')[0].reset();
  });
});