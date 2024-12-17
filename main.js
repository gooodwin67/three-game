import * as THREE from 'three';

import { OrbitControls } from "three/addons/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);
//camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
/*/////////////////////////////////////////////////////*/

// let controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.target.set(0, 0, 0);
/*/////////////////////////////////////////////////////*/

const ambientLight = new THREE.AmbientLight(0xaaaaaa); // soft white light
scene.add(ambientLight);

var light = new THREE.PointLight(0xffffff, 0.6, 200);
light.position.set(10, 10, 100);
light.castShadow = true;
//scene.add(light);
/*/////////////////////////////////////////////////////*/




let geometryPlane = new THREE.BoxGeometry(3, 7, 0.1);
let materialPlane = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide })
let plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.receiveShadow = true;
scene.add(plane);

let geometryPlayer = new THREE.BoxGeometry(0.5, 0.5, 0.1);
let materialPlayer = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide })
let player = new THREE.Mesh(geometryPlayer, materialPlayer);
player.receiveShadow = true;
scene.add(player);



camera.position.z = 5;

let mouse = new THREE.Vector2();


function init() {

}


function animate() {

 player.position.x = mouse.x * 2;

 // controls.update();
 renderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);



document.addEventListener('touchmove', onDocumentTouchDown);

function onDocumentTouchDown(e) {


 e = e.changedTouches[0];

 var rect = renderer.domElement.getBoundingClientRect();

 mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
 mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;

}

/*
function onDocumentMouseDown( event ) {
 mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
 mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
 
 raycaster.setFromCamera( mouse, camera );
 let intersects = raycaster.intersectObjects( [].concat(...mas) );
 
 if (play == 1 && intersects.length > 0 && moveDown == 0 && moveUp == 0 && moveLeft == 0 && moveRight == 0) {
   
   let posInMasY = intersects[0].object.i;
   let posInMasX = intersects[0].object.j;

   if (posInMasY < 3 && mas[parseInt(posInMasY)+1][posInMasX].p == 16) {
     showClearBlock(intersects[0].object)
     let posY = intersects[0].object.position.y;
     let posYempty = mas[parseInt(posInMasY)+1][posInMasX].position.y;
     
     obj1 = intersects[0];
     obj2 = posYempty;
     moveDown = 1;

     mas[parseInt(posInMasY)+1][posInMasX].position.y = posY;
     
     let tempI1 = mas[parseInt(posInMasY)][posInMasX].i;
     let tempI2 = mas[parseInt(posInMasY)+1][posInMasX].i
     mas[parseInt(posInMasY)][posInMasX].i = tempI2;
     mas[parseInt(posInMasY)+1][posInMasX].i = tempI1;
     
    [mas[parseInt(posInMasY)][posInMasX], mas[parseInt(posInMasY)+1][posInMasX]] 
     = [mas[parseInt(posInMasY)+1][posInMasX], mas[parseInt(posInMasY)][posInMasX]];
   }
   
   
   
   
   else if (posInMasY > 0 && mas[parseInt(posInMasY)-1][posInMasX].p == 16) {
     showClearBlock(intersects[0].object)
     let posY = intersects[0].object.position.y;
     let posYempty = mas[parseInt(posInMasY)-1][posInMasX].position.y;
     
     obj1 = intersects[0];
     obj2 = posYempty;
     moveUp = 1;
     
     mas[parseInt(posInMasY)-1][posInMasX].position.y = posY;
     
     let tempI1 = mas[parseInt(posInMasY)][posInMasX].i;
     let tempI2 = mas[parseInt(posInMasY)-1][posInMasX].i
     mas[parseInt(posInMasY)][posInMasX].i = tempI2;
     mas[parseInt(posInMasY)-1][posInMasX].i = tempI1;
     
     [mas[parseInt(posInMasY)][posInMasX], mas[parseInt(posInMasY)-1][posInMasX]] 
      = [mas[parseInt(posInMasY)-1][posInMasX], mas[parseInt(posInMasY)][posInMasX]];
     
   }
   else if (posInMasX < 3 && mas[posInMasY][parseInt(posInMasX)+1].p == 16) {
     showClearBlock(intersects[0].object)
     let posX = intersects[0].object.position.x;
     let posXempty = mas[posInMasY][parseInt(posInMasX)+1].position.x;
     
     obj1 = intersects[0];
     obj2 = posXempty;
     moveRight = 1;
     
     mas[posInMasY][parseInt(posInMasX)+1].position.x = posX;
     
     let tempI1 = mas[parseInt(posInMasY)][posInMasX].j;
     let tempI2 = mas[posInMasY][parseInt(posInMasX)+1].j;
     mas[parseInt(posInMasY)][posInMasX].j = tempI2;
     mas[posInMasY][parseInt(posInMasX)+1].j = tempI1;
     
    [mas[parseInt(posInMasY)][posInMasX], mas[posInMasY][parseInt(posInMasX)+1]] 
     = [mas[posInMasY][parseInt(posInMasX)+1], mas[parseInt(posInMasY)][posInMasX]];
   }
   
   else if (posInMasX > 0 && mas[posInMasY][parseInt(posInMasX)-1].p == 16) {
     showClearBlock(intersects[0].object)
     let posX = intersects[0].object.position.x;
     let posXempty = mas[posInMasY][parseInt(posInMasX)-1].position.x;
     
     obj1 = intersects[0];
     obj2 = posXempty;
     moveLeft = 1;
     
     mas[posInMasY][parseInt(posInMasX)-1].position.x = posX;
     
     let tempI1 = mas[parseInt(posInMasY)][posInMasX].j;
     let tempI2 = mas[posInMasY][parseInt(posInMasX)-1].j;
     mas[parseInt(posInMasY)][posInMasX].j = tempI2;
     mas[posInMasY][parseInt(posInMasX)-1].j = tempI1;
     
    [mas[parseInt(posInMasY)][posInMasX], mas[posInMasY][parseInt(posInMasX)-1]] 
     = [mas[posInMasY][parseInt(posInMasX)-1], mas[parseInt(posInMasY)][posInMasX]];
   }
  win();
 }
}*/