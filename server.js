var express = require('express');
var app = express();
var http = require('http').createServer(app);
var path = require('path');
const io = require('socket.io')(http, {pingInterval: 1000});
var THREE = require('./static/lib/three.min.js');

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.sendFile(__dirname+"/index.html");
});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});

var players = {};
var playerMeshes = {};
var playerMeshesArr = [];
var liveBullets = [];
var playercount = 0;

var scene = new THREE.Scene();

io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      id: playercount,
      x: -20+Math.random()*20,
      y: 7,
      z: -20+Math.random()*20,
      velocity: 0,
      color: Math.random()*0xffffff,
      yrotation: 0,
      canShoot: true,
      shootCooldown: 60,
      isAlive: true,
      deathTimer: 300,
    };
    playercount+=1;

    playerMeshes[socket.id] = createPlayer(players[socket.id].color);
    playerMeshesArr.push(playerMeshes[socket.id]);
    scene.add(playerMeshes[socket.id]);
    playerMeshes[socket.id].position.set(players[socket.id].x,players[socket.id].y,players[socket.id].z);
    playerMeshes[socket.id].rotation.y = players[socket.id].yrotation;

  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    //console.log(player);
    if (data.left && player.isAlive) {
        player.yrotation+=0.05;
    }
    if (data.down && player.isAlive) {
        if(player.velocity + 0.25 < 2){
            player.velocity += 0.25;
        }
        else{
            player.velocity = 2;
        }
    }

    if (data.right && player.isAlive) {
        player.yrotation-=0.05;

    }
    if (data.up && player.isAlive) {
        if(player.velocity - 0.25 > -2){
            player.velocity -= 0.25;
        }
        else{
            player.velocity = - 2;
        }
    }
    if (data.space && player.canShoot && player.isAlive){
        //visuals for physics
        var bullet = createBullet();
        bullet.userData = {deathTime: new Date().getTime()+2000, shotBy: player.id, x: player.x-3*Math.sin(player.yrotation), y: player.y, z:player.z-3*Math.cos(player.yrotation), yrotation: player.yrotation};

        bullet.rotation.y = player.yrotation;
        scene.add(bullet);
        liveBullets.push(bullet);
        io.sockets.emit('shot',bullet);
        //reset shooting
        player.canShoot = false;

    }
    if(!data.down && !data.up && player.isAlive){
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

    if(!player.canShoot){
        player.shootCooldown--;
        if(player.shootCooldown <=0){
            player.shootCooldown = 30;
            player.canShoot = true;
        }
    }


    player.z+=player.velocity*Math.cos(player.yrotation);
    player.x+=player.velocity*Math.sin(player.yrotation);
  });

  socket.on('disconnect', function() {
      players[socket.id] = {};
 });
});

setInterval(function() {
  for (var id in players) {
      player = players[id];
      if (player != {}){
          if(playerMeshes[id] == undefined){
              if(player.color == undefined){
                  playerMeshes[id] = createPlayer(0x000000);
              }
              else{
                  playerMeshes[id] = createPlayer(player.color);
              }

              scene.add(playerMeshes[id]);
          }
          playerMeshes[id].position.set(player.x,player.y,player.z);
          playerMeshes[id].rotation.y = player.yrotation;
      }
  }


  io.sockets.emit('state', players);

  for (var id in players) {
      player = players[id];
      if (player != {}){
          if(!player.isAlive){
              player.deathTimer--;
              if(player.deathTimer<=0){
                  player.isAlive = true;
                  player.x = -140+Math.random()*280;
                  player.z = -140+Math.random()*280;
              }
          }
      }
  }


}, 1000 / 60);

setInterval(function(){updateBullets();}, 1000/60);





//threeD stuff
function createPlayer(color){
    var playerBoxGeom = new THREE.BoxGeometry(10,10,10,1,1,1);
    var playerBoxMat  = new THREE.MeshPhongMaterial({color : color});
    var playerBoxMesh = new THREE.Mesh(playerBoxGeom, playerBoxMat);
    return playerBoxMesh;
    // scene.add(playerBoxMesh);
}

function createBullet(){
    var bulletGeom = new THREE.BoxGeometry(2,2,10,1,1,1);
    var bulletMat = new THREE.MeshPhongMaterial({color: 0xAA0000});
    var bulletMesh = new THREE.Mesh(bulletGeom, bulletMat);
    return bulletMesh;
}

var raycaster = new THREE.Raycaster();

function updateBullets(){
    for(var i = 0; i < liveBullets.length; i++){
        for(var j = 0; j < 8; j++){
            liveBullets[i].position.z-=1*Math.cos(liveBullets[i].userData["yrotation"]);
            liveBullets[i].position.x-=1*Math.sin(liveBullets[i].userData["yrotation"]);
            liveBullets[i].userData["z"] -= 1*Math.cos(liveBullets[i].userData["yrotation"]);
            liveBullets[i].userData["x"] -= 1*Math.sin(liveBullets[i].userData["yrotation"]);
            for (var id in players) {
                player = players[id];
                if (player != {}){
                    //check collision if not shot by same player
                    if(player.id != liveBullets[i].userData["shotBy"] && player.isAlive){

                        // var bulletVec = new THREE.Vector3();
                        // bulletVec.x = liveBullets[i].userData["x"];
                        // bulletVec.z = liveBullets[i].userData["z"];
                        // bulletVec.y = liveBullets[i].userData["y"];
                        //
                        // var farAwayPoint = new THREE.Vector3();
                        // farAwayPoint.x = liveBullets[i].userData["x"]-=100*Math.cos(liveBullets[i].userData["yrotation"]);
                        // farAwayPoint.z = liveBullets[i].userData["z"]-=100*Math.sin(liveBullets[i].userData["yrotation"]);
                        // farAwayPoint.y = liveBullets[i].userData["y"];
                        // var intersects = []
                        //
                        // raycaster.set(bulletVec, farAwayPoint.normalize());
                        // intersects = raycaster.intersectObjects(playerMeshesA);
                        // if(intersects.length > 0){
                        //     console.log("HIT");
                        // }

                        if(Math.sqrt((liveBullets[i].userData["x"]-player.x)**2+(liveBullets[i].userData["y"]-player.y)**2+(liveBullets[i].userData["z"]-player.z)**2) < 9){
                            player.isAlive = false;
                            scene.remove(liveBullets[i]);
                            player.deathTimer = 300;
                        }

                    }
                }
            }
        }

        if(new Date().getTime() >= liveBullets[i].userData["deathTime"]){
            scene.remove(liveBullets[i]);
            liveBullets.shift();
        }


    }
}
