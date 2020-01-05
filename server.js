var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var path = require('path');
const io = require('socket.io')(http);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.sendFile(__dirname+"/index.html");
});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 100+Math.random()*100,
      y: 100+Math.random()*100,
      r: Math.random()*250,
      g: Math.random()*250,
      b: Math.random()*250
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);


// setInterval(function() {
//   io.sockets.emit('message', 'Polling');
// }, 1000);
