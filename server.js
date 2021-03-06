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
var cameraAbove = false;

var scene = new THREE.Scene();



io.on('connection', function(socket) {
  socket.on('new player', function(info) {
    players[socket.id] = {
      id: playercount,
      x: -20+Math.random()*20,
      y: 7,
      z: -20+Math.random()*20,
      velocity: 0,
      color: Math.random()*0xffffff,
      yrotation: 0,
      canShoot: true,
      shootCooldown: 15,
      isShooting: false,
      shootDelay: 50,
      isAlive: true,
      deathTimer: 300,
      character: info.selected,
      isIdle: true,
      isWalking: false,
      isJumping: false,
      isAttack1: false,
      isAttack2: false
    };
    playercount+=1;
    var newPlayer = createPlayer(players[socket.id].color);
    newPlayer.name = socket.id;
    playerMeshes[socket.id] = newPlayer;
    playerMeshesArr.push(newPlayer);
    scene.add(newPlayer);
    playerMeshes[socket.id].position.set(players[socket.id].x,players[socket.id].y,players[socket.id].z);
    playerMeshes[socket.id].rotation.y = players[socket.id].yrotation;

  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};

    if(player.isAttack1){
      player.isAttack1 = false;
    }
    //console.log(player);
    if (data.left && player.isAlive) {
        player.yrotation+=0.03;
    }
    if (data.down && player.isAlive) {
        player.isWalking = true;
        player.isIdle = false;
        if(player.velocity + 0.15 < 1){
            player.velocity += 0.15;
        }
        else{
            player.velocity = 1;
        }
    }

    if (data.right && player.isAlive) {
      player.isIdle = false;
        player.yrotation-=0.03;

    }
    if (data.up && player.isAlive) {
      player.isIdle = false;
        player.isWalking = true;
        if(player.velocity - 0.15 > -1){
            player.velocity -= 0.15;
        }
        else{
            player.velocity = - 1;
        }
    }
    if (data.space && player.canShoot && player.isAlive){
        player.isIdle = false;

        player.isShooting = true;
        player.canShoot = false;
        player.isAttack1 = true;
    }

    if(!data.down && !data.up && player.isAlive){
      player.isIdle = false;
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

    if(player.isShooting){
      player.shootDelay--;
      if(player.shootDelay <=0){
        //after delaying the actual bullet, from the initial button press, then shoot for rea.
        var bullet = createBullet();
        bullet.userData = {deathTime: new Date().getTime()+2000, shotBy: player.id, x: player.x-3*Math.sin(player.yrotation), y: player.y, z:player.z-3*Math.cos(player.yrotation), yrotation: player.yrotation};
        bullet.position.set(player.x-3*Math.sin(player.yrotation),player.y,player.z-3*Math.cos(player.yrotation));
        bullet.rotation.y = player.yrotation;
        scene.add(bullet);
        liveBullets.push(bullet);
        io.sockets.emit('shot',bullet);
        player.shootDelay = 50;
        player.isShooting = false;
      }
    }

    if(!player.canShoot && !player.isShooting){
        player.shootCooldown--;
        if(player.shootCooldown <=0){
            player.shootCooldown = 15;
            player.canShoot = true;
        }
    }


    player.z+=player.velocity*Math.cos(player.yrotation);
    player.x+=player.velocity*Math.sin(player.yrotation);


    //handle animations
    if(Math.abs(player.velocity) < 0.01){
      player.isWalking = false;
    }
    if(player.isWalking == false && player.isAttack1 == false && player.isAttack2 == false && player.isJumping == false){
      player.isIdle = true;
    }
  });

  socket.on('disconnect', function() {
    io.sockets.emit("dcplayer", socket.id);
    scene.remove(playerMeshes[socket.id]);
    var foundIdx = -1;
    for(var i = 0; i < playerMeshesArr.length; i++){
      if(playerMeshesArr[i].name == socket.id){
        foundIdx = i;
        break;
      }
    }
    playerMeshesArr.splice(i, 1);
    delete playerMeshesArr[socket.id];
    delete playerMeshes[socket.id];
    delete players[socket.id];
 });
});

setInterval(function() {
  for (var id in players) {
      var player = players[id];
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
      var player = players[id];
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
    this.mesh      = new THREE.Object3D();
    this.mesh.name = "Bullet";

    this.mesh.bullet = new THREE.Object3D();
    this.mesh.bullet.name = "Body";
    var bulletGeom = new THREE.BoxGeometry(2,2,4,1,1,1);
    var bulletMat = new THREE.MeshPhongMaterial({color: 0x0101AA});
    var bulletMesh = new THREE.Mesh(bulletGeom, bulletMat);
    this.mesh.bullet.add(bulletMesh);

    this.mesh.bullet.front = new THREE.Object3D();
    this.mesh.bullet.front.name = "Front";
    var bulletFrontGeom = new THREE.BoxBufferGeometry(3,3,2);
    var bulletFrontMat = new THREE.MeshPhongMaterial({color: 0x73cfea});
    var bulletFrontMesh = new THREE.Mesh(bulletFrontGeom,bulletFrontMat);
    this.mesh.bullet.front.add(bulletFrontMesh);
    this.mesh.bullet.add(this.mesh.bullet.front);
    this.mesh.add(this.mesh.bullet);
    this.mesh.bullet.front.position.set(0,0,-3);
    this.mesh.bullet.front.userData = {position: {x:0,y:0,z:-3}};

    return this.mesh;
}


var raycaster = new THREE.Raycaster();


function updateBullets(){
    for(var i = 0; i < liveBullets.length; i++){
        for(var inc = 0; inc < 8; inc++){
            liveBullets[i].position.z-=1*Math.cos(liveBullets[i].userData["yrotation"]);
            liveBullets[i].position.x-=1*Math.sin(liveBullets[i].userData["yrotation"]);
            liveBullets[i].userData["z"] -= 1*Math.cos(liveBullets[i].userData["yrotation"]);
            liveBullets[i].userData["x"] -= 1*Math.sin(liveBullets[i].userData["yrotation"]);

            var direction = new THREE.Vector3();

            for(var z = 0; z < playerMeshesArr.length; z++){
                playerMeshesArr[z].updateMatrixWorld();
            }
            var b = liveBullets[i];
            raycaster.set(b.position, direction.subVectors(new THREE.Vector3(b.position.x-10*Math.sin(b.rotation.y),b.position.y,b.position.z-10*Math.cos(b.rotation.y)),b.position).normalize());

            intersects = raycaster.intersectObjects(playerMeshesArr);

            if(intersects.length > 0){
                hitPlayer = intersects[0];
                  if(hitPlayer.object.name != liveBullets[i].userData["shotBy"] && players[hitPlayer.object.name].isAlive && hitPlayer.distance <= 5){
                      players[hitPlayer.object.name].isAlive = false;
                      scene.remove(liveBullets[i]);
                      players[hitPlayer.object.name].deathTimer = 300;
                      break;
                  }
            }


            if(new Date().getTime() >= liveBullets[i].userData["deathTime"]){
                scene.remove(liveBullets[i]);
                liveBullets.shift();
                break;
            }
        }

    }
}
