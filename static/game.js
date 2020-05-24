const socket = io();

// socket.on('message', function(data){
//     console.log(data);
// });


socket.emit('new player');
var camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container, scene;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var HEIGHT, WIDTH

var playerMeshes = {};
var liveBullets = [];

var lastPing = [];
var ROLLAVG = 60;


createCanvas();

createScene();

// loop();

setInterval(function() {
  socket.emit('movement', movement);
  updateBullets();

}, 1000 / 60);



function createCanvas() {


  container = document.getElementById('glcanvas');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
  // window.addEventListener('mousemove', onMouseMove, false);
  // window.addEventListener('mousedown', onMouseDown, false);

}
// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

// function loop() {
//       renderer.render(scene, camera);
//       requestAnimationFrame(loop);
// }

function createPlayer(color){
    var playerBoxGeom = new THREE.BoxGeometry(10,10,10,1,1,1);
    var playerBoxMat  = new THREE.MeshPhongMaterial({color : color});
    var playerBoxMesh = new THREE.Mesh(playerBoxGeom, playerBoxMat);
    return playerBoxMesh;
    // scene.add(playerBoxMesh);
}

function createBullet(){
    var bulletGeom = new THREE.BoxGeometry(10,2,2,1,1,1);
    var bulletMat = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
    var bulletMesh = new THREE.Mesh(bulletGeom, bulletMat);
    return bulletMesh;
}

function createScene(){
    scene = new THREE.Scene();

    var geomBox = new THREE.BoxBufferGeometry(10000, 10000, 10000, 10, 10, 10);
    var matBox  = new THREE.MeshBasicMaterial(
                               { color : 0x87ceeb});
    var box = new THREE.Mesh(geomBox, matBox);
    box.material.side = THREE.BackSide;
    scene.add(box);

    var geometry = new THREE.BoxGeometry(360,2,360,1,1,1);
    var material = new THREE.MeshBasicMaterial({color : 0x000000});
    var plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
    plane.position.set(0,0,0);

    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

}


socket.on('state', function(players) {
  for (var id in players) {
    var player = players[id];
    if (player != {}){
        if(playerMeshes[id] == undefined){
            playerMeshes[id] = createPlayer(player.color);
            scene.add(playerMeshes[id]);
        }
        playerMeshes[id].position.set(player.x,player.y,player.z);
        playerMeshes[id].rotation.y = player.yrotation;
        //shrink player on death
        if(!player.isAlive){
            playerMeshes[id].scale.set((Math.max(0,player.deathTimer-290)/10),(Math.max(0,player.deathTimer-290)/10),(Math.max(0,player.deathTimer-290)/10));
        }
        else{
            playerMeshes[id].scale.set(1,1,1);
        }

        if(socket.id == id){
            if(!player.isAlive){
                document.getElementById("respawn").innerHTML = "You Died, Respawn in<br>"+Math.round((player.deathTimer*(1000/60))/1000)+" s";
            }
            else{
                document.getElementById("respawn").innerHTML = "";
            }
            camera.position.set(player.x+50*Math.sin(player.yrotation),player.y+30,player.z+50*Math.cos(player.yrotation));
            camera.lookAt(player.x-10*Math.sin(player.yrotation),player.y,player.z-10*Math.cos(player.yrotation));
            // camera.position.set(player.x,player.y+500,player.z);
            // camera.lookAt(player.x,player.y,player.z);
            playerMeshes[id].rotation.y = player.yrotation;
        }
    }
  }
  renderer.render(scene, camera);
});

var objectLoader = new THREE.ObjectLoader();


socket.on('shot', function(bullet){
    objectLoader.parse( bullet, function ( obj ) {
        liveBullets.push(obj);
        scene.add(obj);
        obj.position.set(obj.userData["x"],obj.userData["y"],obj.userData["z"]);
        obj.rotation.y = obj.userData["yrotation"];
    } );
});

var latency = 0;

socket.on('pong', function(ms) {
    latency = ms;

    if(lastPing.length < ROLLAVG){
        lastPing.push(latency);
        avg = latency;
    }
    else{
        var newHist = [];
        for(var i = 1; i < lastPing.length; i++){
            newHist[i-1] = lastPing[i];
            avg += lastPing[i];
        }
        newHist.push(latency);
        avg +=latency;
        avg = avg/ROLLAVG;
        lastPing = newHist;
    }
    document.getElementById("ping").innerHTML = Math.round(avg)+" ms";
    //console.log(latency);
});

socket.on('plsdrawrays', function(vecArr){
    // console.log("Bullet: x",vecArr[0],"y",vecArr[1],"z",vecArr[2]);
    // console.log("Far Away Point: x",vecArr[3],"y",vecArr[4],"z",vecArr[5]);

    // var pointA = new THREE.Vector3(vecArr[0],vecArr[1],vecArr[2]);
    // var farAwayPoint = new THREE.Vector3(vecArr[0]+100,vecArr[1],vecArr[2]+100);
    // var pointB = new THREE.Vector3();
    // pointB.addVectors ( pointA, farAwayPoint.normalize().multiplyScalar(20) );
    // drawRays(pointA, pointB);

});

function drawRays(pointA, pointB){
         var geometry = new THREE.Geometry();
         geometry.vertices.push( pointA );
         geometry.vertices.push( pointB );
         var material = new THREE.LineBasicMaterial( { color : 0xFF00FF } );
         var intLT = new THREE.Line(geometry, material);
         scene.add(intLT);
         setTimeout(function(){scene.remove(intLT)}, 25);
         setTimeout(function(){intLT.geometry.dispose();}, 25);
}

var raycaster = new THREE.Raycaster();

function updateBullets(){
    for(var i = 0; i < liveBullets.length; i++){
        for(var inc = 0; inc < 8; inc++){
            liveBullets[i].position.z-=1*Math.cos(liveBullets[i].userData["yrotation"]);
            liveBullets[i].position.x-=1*Math.sin(liveBullets[i].userData["yrotation"]);
            liveBullets[i].userData["z"] -= 1*Math.cos(liveBullets[i].userData["yrotation"]);
            liveBullets[i].userData["x"] -= 1*Math.sin(liveBullets[i].userData["yrotation"]);
        }



        if(new Date().getTime() >= liveBullets[i].userData["deathTime"]){
            scene.remove(liveBullets[i]);
            liveBullets.shift();
        }
    }
}
