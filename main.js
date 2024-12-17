// npx vite --host

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
let raycaster = new THREE.Raycaster();

let targetPosition = new THREE.Vector3(0, 0, 0);
const speed = 0.1;

function init() {

}


function animate() {

  const direction = new THREE.Vector3().subVectors(targetPosition, player.position).normalize();

  player.position.addScaledVector(direction, speed);

  if (player.position.distanceTo(targetPosition) <= speed) {
    player.position.copy(targetPosition);
  }



  // controls.update();
  renderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);



document.addEventListener('touchmove', onDocumentTouchDown);
document.addEventListener('touchstart', onDocumentTouchDown);
document.addEventListener('touchend', onDocumentTouchEnd);

function onDocumentTouchEnd(e) {
  console.log('end');
  targetPosition = player.position;

}

function onDocumentTouchDown(e) {


  e = e.changedTouches[0];

  var rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  plane.geometry.computeBoundingBox();
  var box1 = plane.geometry.boundingBox.clone();
  box1.applyMatrix4(plane.matrixWorld);

  let intersects = raycaster.ray.intersectBox(box1, new THREE.Vector3());


  targetPosition = new THREE.Vector3(intersects.x, player.position.y, player.position.z);



  // player.position.x = intersects.x;

}
