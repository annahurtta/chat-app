var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname));

//Käyttäjät ja huoneet
var usernames = {};
var rooms = ['room1', 'room2', 'room3'];

io.sockets.on('connection', function (socket){
  //Picking up a username
  socket.on('adduser', function(username){
    //tallennetaan käyttäjä
    socket.username = username;
    //tallennetaan huone
    socket.room = 'room1';
    //lisätään käyttäjänimi listaan
    usernames[username] = username;
    //lisätään käyttäjä huoneeseen
    socket.join('room1');
    //kerrotaan käyttäjälle liittymisestä
    socket.emit('updatechat', 'SERVER', 'You have connected');
    //kerrotaan huoneessa oleville uudesta liittymisestä
    socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + 'has connected');
    socket.emit('updaterooms', rooms, 'room1'); 
    });
  
  //kun käyttäjä lähettää viestin
  socket.on('sendchat', function (data){
    io.sockets.in(socket.room).emit('updatechat', socket.username, data);
  });

  //kun käyttäjä vaihtaa huonetta
  socket.on('switchRoom', function(newroom){
    socket.leave(socket.room);
    console.log(newroom)
    socket.join(newroom);
    //kerro käyttäjälle liittymisestä
    socket.emit('updatechat', 'SERVER', 'You have connected to ' + newroom);
    //kerro vanhalle huoneelle, että käyttäjä lähti
    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has left this room');
    socket.room = newroom;
    socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined here');
    socket.emit('updaterooms', rooms, newroom);
  });

  //kun käyttäjä lähtee pois
  socket.on('disconnect', function(){
    //poista käyttäjä listalta
    delete usernames[socket.username];
    //päivitä lista
    io.sockets.emit('updateusers', usernames);
    //kerro käyttäjän poistumisesta
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has left the building');
    socket.leave(socket.room);
  });
});