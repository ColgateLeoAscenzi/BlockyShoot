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
      x: -20+Math.random()*20,
      y: 7,
      z: -20+Math.random()*20,
      color: Math.random()*0xffffff,
      yrotation: 0,
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    //console.log(player);
    if (data.left) {
        player.yrotation+=0.05;
    }
    if (data.up) {
        player.z-=2*Math.cos(player.yrotation);
        player.x-=2*Math.sin(player.yrotation);
    }
    if (data.right) {
        player.yrotation-=0.05;

    }
    if (data.down) {
        player.z+=2*Math.cos(player.yrotation);
        player.x+=2*Math.sin(player.yrotation);
    }
    if(player.x > 180){
        player.x = 180;
    }
    if(player.x < - 180){
        player.x = - 180;
    }
    if(player.z > 180){
        player.z = 180;
    }
    if(player.z < -180){
        player.z = -180;
    }
  });

  socket.on('disconnect', function() {
      players[socket.id] = {};
 });
});

setInterval(function() {
  io.sockets.emit('state', players);
  var d = new Date();
  var n = d.getTime();
  io.sockets.emit('ping', n);
}, 1000 / 60);



// setInterval(function() {
//   io.sockets.emit('message', 'Polling');
// }, 1000);
