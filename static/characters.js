var vaporeonColors = {
    headTop: 0x337298,
    main: 0x73cfea,
    ears: 0xf2f2a8,
    ring: 0xe9f6ff,
    eye: 0x000000,
}

function createVaporeon(){
    this.mesh      = new THREE.Object3D();
    this.mesh.name = "Vaporeon";

    this.mesh.body = new THREE.Object3D();
    var bodyGeom = new THREE.BoxBufferGeometry(4,4,8,1,1,1);
    var bodyMat  = new THREE.MeshPhongMaterial({color : vaporeonColors.main});
    var bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.mesh.body.add(bodyMesh);
    this.mesh.add(this.mesh.body);
    this.mesh.body.position.y-=3;

    this.mesh.body.head = new THREE.Object3D();
    var headGeom = new THREE.BoxBufferGeometry(6,6,6,1,1,1);
    var headMat  = new THREE.MeshPhongMaterial({color : vaporeonColors.headTop});
    var headMesh = new THREE.Mesh(headGeom, headMat);
    this.mesh.body.head.position.set(0,5,-4);
    this.mesh.body.head.add(headMesh);
    this.mesh.body.add(this.mesh.body.head);

    this.mesh.body.head.leftEye = new THREE.Object3D();
    var eyeG = new THREE.BoxBufferGeometry(1,2,1,1,1,1);
    var eyeM = new THREE.MeshPhongMaterial({color : vaporeonColors.eye});
    var eyeMesh = new THREE.Mesh(eyeG, eyeM);
    this.mesh.body.head.leftEye.add(eyeMesh);
    this.mesh.body.head.add(this.mesh.body.head.leftEye);
    this.mesh.body.head.leftEye.position.set(-1.5,0,-3);

    this.mesh.body.head.rightEye = this.mesh.body.head.leftEye.clone();
    this.mesh.body.head.rightEye.position.set(1.5,0,-3);
    this.mesh.body.head.add(this.mesh.body.head.rightEye);

    //yellow horn
    this.mesh.body.head.horn = new THREE.Object3D();
    var horn1Geom = new THREE.BoxBufferGeometry(1,5,1,1,1,1);
    var horn1Mat = new THREE.MeshPhongMaterial({color : vaporeonColors.ears});
    var horn1Mesh = new THREE.Mesh(horn1Geom, horn1Mat);
    horn1Mesh.position.set(0,0.5,0);
    this.mesh.body.head.horn.add(horn1Mesh);
    this.mesh.body.head.horn.position.set(0,5,-0.75);
    var horn2Geom = new THREE.BoxBufferGeometry(1,3,1,1,1,1);
    var horn2Mat = new THREE.MeshPhongMaterial({color : vaporeonColors.ears});
    var horn2Mesh = new THREE.Mesh(horn2Geom, horn2Mat);
    horn2Mesh.position.set(0,-0.5,1);
    this.mesh.body.head.horn.add(horn2Mesh);
    var horn3Geom = new THREE.BoxBufferGeometry(1,1,1,1,1,1);
    var horn3Mat = new THREE.MeshPhongMaterial({color : vaporeonColors.ears});
    var horn3Mesh = new THREE.Mesh(horn3Geom, horn3Mat);
    horn3Mesh.position.set(0,-1.5,2);
    this.mesh.body.head.horn.add(horn3Mesh);
    //blue horn
    var horn1Geom1 = new THREE.BoxBufferGeometry(1,5,0.5,1,1,1);
    var horn1Mat1 = new THREE.MeshPhongMaterial({color : vaporeonColors.headTop});
    var horn1Mesh1 = new THREE.Mesh(horn1Geom1, horn1Mat1);
    horn1Mesh1.position.set(0,0.5,-0.75);
    this.mesh.body.head.horn.add(horn1Mesh1);
    var horn2Geom1 = new THREE.BoxBufferGeometry(1,3,0.5,1,1,1);
    var horn2Mat1 = new THREE.MeshPhongMaterial({color : vaporeonColors.headTop});
    var horn2Mesh1 = new THREE.Mesh(horn2Geom1, horn2Mat1);
    horn2Mesh1.position.set(0,-0.5,-1.25);
    this.mesh.body.head.horn.add(horn2Mesh1);
    var horn3Geom1 = new THREE.BoxBufferGeometry(1,2,0.5,1,1,1);
    var horn3Mat1 = new THREE.MeshPhongMaterial({color : vaporeonColors.headTop});
    var horn3Mesh1 = new THREE.Mesh(horn3Geom1, horn3Mat1);
    horn3Mesh1.position.set(0,-1,-1.75);
    this.mesh.body.head.horn.add(horn3Mesh1);

    this.mesh.body.head.add(this.mesh.body.head.horn);

    this.mesh.body.ring = new THREE.Object3D();
    var ringGeom = new THREE.ConeBufferGeometry(5.5,1,10);
    var ringMat = new THREE.MeshPhongMaterial({color: vaporeonColors.ring});
    var ringMesh = new THREE.Mesh(ringGeom, ringMat);
    this.mesh.body.ring.add(ringMesh);
    this.mesh.body.add(this.mesh.body.ring);
    this.mesh.body.ring.position.set(0,2.5,-2.25);
    this.mesh.body.ring.rotation.x = -0.28;

    this.mesh.body.FRLeg = new THREE.Object3D();
    var legGeom = new THREE.BoxBufferGeometry(1,3,2,1,1,1);
    var legMat = new THREE.MeshPhongMaterial({color: vaporeonColors.main});
    var legMesh = new THREE.Mesh(legGeom,legMat);
    this.mesh.body.FRLeg.add(legMesh);
    this.mesh.body.add(this.mesh.body.FRLeg);
    this.mesh.body.FRLeg.position.set(2.5,-1.25,-2.5);
    this.mesh.body.FRLeg.rotation.set(0,0,0.2);
    this.mesh.body.FLLeg = this.mesh.body.FRLeg.clone();
    this.mesh.body.add(this.mesh.body.FLLeg);
    this.mesh.body.FLLeg.position.set(-2.5,-1.25,-2.5);
    this.mesh.body.FLLeg.rotation.set(0,0,-0.2);
    this.mesh.body.BLLeg = this.mesh.body.FRLeg.clone();
    this.mesh.body.add(this.mesh.body.BLLeg);
    this.mesh.body.BLLeg.position.set(-2.5,-1.25,2.5);
    this.mesh.body.BLLeg.rotation.set(0,0,-0.2);
    this.mesh.body.BRLeg = this.mesh.body.FRLeg.clone();
    this.mesh.body.add(this.mesh.body.BRLeg);
    this.mesh.body.BRLeg.position.set(2.5,-1.25,2.5);
    this.mesh.body.BRLeg.rotation.set(0,0,0.2);

    this.mesh.body.tail = new THREE.Object3D();
    var tailGeom = new THREE.BoxBufferGeometry(3,3,3.5,1,1,1);
    var tailMat = new THREE.MeshPhongMaterial({color:vaporeonColors.main});
    var tailMesh = new THREE.Mesh(tailGeom, tailMat);
    this.mesh.body.tail.add(tailMesh);
    this.mesh.body.add(this.mesh.body.tail);
    this.mesh.body.tail.position.set(0,-0.5,5.5);

    this.mesh.body.tail.leftFin = new THREE.Object3D();
    var finGeom = new THREE.BoxBufferGeometry(3.25,0.66,2,1,1,1);
    var finMat = new THREE.MeshPhongMaterial({color: vaporeonColors.main});
    var finMesh = new THREE.Mesh(finGeom, finMat);
    this.mesh.body.tail.leftFin.add(finMesh);
    this.mesh.body.tail.add(this.mesh.body.tail.leftFin);
    this.mesh.body.tail.leftFin.position.set(1.8,0.2,2.5);
    this.mesh.body.tail.leftFin.rotation.set(0,-0.98,0.25);

    this.mesh.body.tail.rightFin = this.mesh.body.tail.leftFin.clone();
    this.mesh.body.tail.rightFin.position.set(-1.8,0.2,2.5);
    this.mesh.body.tail.rightFin.rotation.set(0,0.98,-0.25);
    this.mesh.body.tail.add(this.mesh.body.tail.rightFin);

    return this.mesh;
}

function createPlayer(color){
    var playerBoxGeom = new THREE.BoxGeometry(10,10,10,1,1,1);
    var playerBoxMat  = new THREE.MeshPhongMaterial({color : color});
    var playerBoxMesh = new THREE.Mesh(playerBoxGeom, playerBoxMat);
    return playerBoxMesh;
}

function createPiplup(){
    var playerBoxGeom = new THREE.BoxGeometry(10,10,10,1,1,1);
    var playerBoxMat  = new THREE.MeshPhongMaterial({color : 0xB2D1D4});
    var playerBoxMesh = new THREE.Mesh(playerBoxGeom, playerBoxMat);
    return playerBoxMesh;
}