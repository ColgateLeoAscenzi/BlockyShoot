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
      velocity: 0,
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
    if (data.down) {
        if(player.velocity + 0.25 < 2){
            player.velocity += 0.25;
        }
        else{
            player.velocity = 2;
        }
    }

    if (data.right) {
        player.yrotation-=0.05;

    }
    if (data.up) {
        if(player.velocity - 0.25 > -2){
            player.velocity -= 0.25;
        }
        else{
            player.velocity = - 2;
        }
    }
    if(!data.down && !data.up){
        //kill momentum
        player.velocity = player.velocity*0.88;
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

    player.z+=player.velocity*Math.cos(player.yrotation);
    player.x+=player.velocity*Math.sin(player.yrotation);
  });

  socket.on('disconnect', function() {
      players[socket.id] = {};
 });
});

setInterval(function() {
  //update places
  io.sockets.emit('state', players);

  //ping
  var d = new Date();
  var n = d.getTime();
  io.sockets.emit('ping', n);
}, 1000 / 60);


// setInterval(function() {
//   io.sockets.emit('message', 'Polling');
// }, 1000);
