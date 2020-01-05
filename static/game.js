const socket = io();

// socket.on('message', function(data){
//     console.log(data);
// });


socket.emit('new player');

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);




var canvas = document.getElementById('canvas');
console.log(canvas);
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    context.fillStyle = "rgb("+player.r+","+player.g+","+player.b+")";
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});
