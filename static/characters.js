var vaporeonColors = {
    headTop: 0x337298,
    main: 0x73cfea,
    ears: 0xf2f2a8,
    ring: 0xe9f6ff,
    eye: 0x000000,
}

var vaporeonAnimations = [];

const GLLoader = new THREE.GLTFLoader();

function createVaporeon(id){
  var vaporeonScene = GLLoader.load("./static/models/vaporeon/vaporeon.glb", gltf => onLoad(gltf, id));
}

const onLoad = ( gltf, id ) => {
  var mesh = gltf.scene.children[0];
  // console.log(gltf.scene.children[0]);
  // mesh.material = new THREE.MeshPhongMaterial({color: 0xffffff});
  mesh.up = new THREE.Vector3(0,1,0);
  scene.add(mesh);
  vaporeonAnimations = gltf.animations;
  // console.log(mesh);
  playerMeshes[id] = mesh;
  console.log('done loading');
  // console.log(vaporeonAnimations);
  vaporeonLoaded = true;
};

function createPlayer(id, color){
    var playerBoxGeom = new THREE.BoxGeometry(10,10,10,1,1,1);
    var playerBoxMat  = new THREE.MeshPhongMaterial({color : color});
    var playerBoxMesh = new THREE.Mesh(playerBoxGeom, playerBoxMat);
    scene.add(playerBoxMesh);
    playerMeshes[id] = playerBoxMesh;
}

function createPiplup(id){
    var playerBoxGeom = new THREE.BoxGeometry(10,10,10,1,1,1);
    var playerBoxMat  = new THREE.MeshPhongMaterial({color : 0xB2D1D4});
    var playerBoxMesh = new THREE.Mesh(playerBoxGeom, playerBoxMat);
    scene.add(playerBoxMesh);
    playerMeshes[id] = playerBoxMesh;
}
