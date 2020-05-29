var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
}

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65){
      movement.left = true;
    }
    if(event.keyCode == 87){
      movement.up = true;
    }
    if(event.keyCode == 68){
      movement.right = true;
    }
    if(event.keyCode == 83){
      movement.down = true;
    }
    if(event.keyCode == 32){
        movement.space = true;
    }
    if(event.keyCode == 49 || event.keyCode == 97){
        cameraMode = 1;
    }
    if(event.keyCode == 50 || event.keyCode == 98){
        cameraMode = 2;
    }
    if(event.keyCode == 51 || event.keyCode == 99){
        cameraMode = 3;
    }
});
document.addEventListener('keyup', function(event) {
    if(event.keyCode == 65){
      movement.left = false;
    }
    if(event.keyCode == 87){
      movement.up = false;
    }
    if(event.keyCode == 68){
      movement.right = false;
    }
    if(event.keyCode == 83){
      movement.down = false;
    }
    if(event.keyCode == 32){
      movement.space = false;
    }
});
