// npx vite --host

import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';


import { OrbitControls } from "three/addons/controls/OrbitControls";

import { detectCollisionCubes } from "./functions/detectColisions";

await RAPIER.init();
const world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 0);


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








camera.position.z = 5;


let plane;
let player;
let player2;

let playerOnGround = false;


let dynamicBodies = [];

let mouse = new THREE.Vector3;
let targetPosition = new THREE.Vector3;
let raycaster = new THREE.Raycaster;







let geometryPlane = new THREE.BoxGeometry(3, 0.2, 7);
let materialPlane = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide })
plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.receiveShadow = true;
scene.add(plane);

const planeBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
const planeShape = RAPIER.ColliderDesc.cuboid(1.5, 0.1, 3.5)
world.createCollider(planeShape, planeBody)
dynamicBodies.push([plane, planeBody])


let geometryPlayer2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
let materialPlayer2 = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide })
player2 = new THREE.Mesh(geometryPlayer2, materialPlayer2);
player2.receiveShadow = true;
scene.add(player2);

const player2Body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(1, 3, 0).setCanSleep(false))
const player2Shape = RAPIER.ColliderDesc.cuboid(0.25, 0.25, 0.25).setMass(1).setRestitution(0).setFriction(0);
world.createCollider(player2Shape, player2Body)
dynamicBodies.push([player2, player2Body])











function animate() {

  camera.lookAt(0, 0, 0);

  world.step();

  for (let i = 0, n = dynamicBodies.length; i < n; i++) {
    dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
    dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
  }

  if (detectCollisionCubes(player2, plane)) playerOnGround = true;
  else playerOnGround = false;


  // controls.update();
  renderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);

document.addEventListener('touchend', onTouchEnd);
document.addEventListener('touchstart', onTouchMove);
document.addEventListener('touchmove', onTouchMove);

function onTouchEnd() {
  if (playerOnGround) {
    const jumpForce = new RAPIER.Vector3(0, 5, 0); // Сила прыжка (можно настроить)
    player2Body.applyImpulse(jumpForce, true); // Применяем импульс
  }

}

function onTouchMove(e) {

  if (playerOnGround) {

    e = e.changedTouches[0];

    var rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    plane.geometry.computeBoundingBox();
    var box1 = plane.geometry.boundingBox.clone();
    box1.applyMatrix4(plane.matrixWorld);

    let intersects = raycaster.ray.intersectBox(box1, new THREE.Vector3());


    if (intersects) targetPosition = new THREE.Vector3(intersects.x, player2.position.y, player2.position.z);


    player2Body.setTranslation(targetPosition, true);
  }
}



