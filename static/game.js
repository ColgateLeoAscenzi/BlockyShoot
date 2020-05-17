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

var lastPing = [];
var ROLLAVG = 100;

createCanvas();

createScene();

// loop();

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);



function createCanvas() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
  //
  camera.position.x = 0;
  camera.position.z = 120;
  camera.position.y = 40;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

function createScene(){
    scene = new THREE.Scene();

    var geomBox = new THREE.BoxBufferGeometry(10000, 10000, 10000, 10, 10, 10);
    var matBox  = new THREE.MeshBasicMaterial(
                               { color : 0x87ceeb});
    var box = new THREE.Mesh(geomBox, matBox);
    box.material.side = THREE.BackSide;
    scene.add(box);

    var geometry = new THREE.BoxGeometry(180,2,180,1,1,1);
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
        if(socket.id == id){
            camera.position.set(player.x,player.y+20,player.z+50);
            camera.lookAt(player.x,player.y,player.z);
            playerMeshes[id].rotation.y = player.yrotation;
        }
    }
  }
  renderer.render(scene, camera);
});

socket.on('ping', function(time){
    var d = new Date();
    var n = d.getTime();
    var avg = 0;
    if(lastPing.length < ROLLAVG){
        lastPing.push((n-time)*2);
        avg = n-time;
    }
    else{
        var newHist = [];
        for(var i = 1; i < lastPing.length; i++){
            newHist[i-1] = lastPing[i];
            avg += lastPing[i];
        }
        newHist.push((n-time)*2);
        avg +=(n-time)*2;
        avg = avg/ROLLAVG;
        lastPing = newHist;
    }
    document.getElementById("ping").innerHTML = avg+" ms";
    // console.log("Pong",n-time,"ms");
});
