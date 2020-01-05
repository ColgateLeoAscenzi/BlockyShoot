var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var path = require('path');
const io = require('socket.io')(http);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.sendFile(__dirname+"/index.html");
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 0,
      y: 0
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 1;
    }
    if (data.up) {
      player.y -= 1;
    }
    if (data.right) {
      player.x += 1;
    }
    if (data.down) {
      player.y += 1;
    }
  });
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);


// setInterval(function() {
//   io.sockets.emit('message', 'Polling');
// }, 1000);
