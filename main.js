// npx vite --host

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';


import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


import { OrbitControls } from "three/addons/controls/OrbitControls";

import { detectCollisionCubes } from "./functions/detectColisions";
import { detectCollisionCubeAndArray } from "./functions/detectColisions";




const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdceef6);
scene.fog = new THREE.Fog(scene.background, 1, 150);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
//scene.add(hemiLightHelper);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(- 1, 1.75, 1);
dirLight.position.multiplyScalar(30);
scene.add(dirLight);

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

// const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
// scene.add(dirLightHelper);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 7);


let stats = new Stats();
document.body.appendChild(stats.dom);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
/*/////////////////////////////////////////////////////*/

// let controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.target.set(0, 0, 0);
/*/////////////////////////////////////////////////////*/

const ambientLight = new THREE.AmbientLight(0xaaaaaa); // soft white light
//scene.add(ambientLight);


/*/////////////////////////////////////////////////////*/











let plane;

let player;
let playerBody;

let playerBottomBlock;
let playerRightBlock;
let playerLeftBlock;
let playerFrontBlock;


let ground;


let playerSpeed = 3;
let intersects;

let snow;





let dynamicBodies = [];

let mouse = new THREE.Vector3;
let targetPosition = new THREE.Vector3;
let raycaster = new THREE.Raycaster;

let dataLoaded = false;

let playerPosMarker = false;
let groundsMas = [];
let posMarker = 0;

let groundSize;
let groundPos;
let snowSize;

let allObjCollision = [];


const worldGrav = 9.8;










const gltfLoader = new GLTFLoader();
const url = 'map.glb';
gltfLoader.load(url, (gltf) => {
  const root = gltf.scene;



  root.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });


  root.traverse((el) => {

    const box = new THREE.Box3().setFromObject(el);
    const size = box.getSize(new THREE.Vector3());




    if (el.name == 'player') {
      let importedPlayer = el.clone();
      el = new THREE.Group();
      player = el;


      const geometryBottom = new THREE.BoxGeometry(size.x / 6, 0.2, size.z / 6);
      const materialBottom = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0, transparent: true });
      playerBottomBlock = new THREE.Mesh(geometryBottom, materialBottom);
      playerBottomBlock.position.y = -size.y / 2;

      const geometryRight = new THREE.BoxGeometry(0.1, size.y / 2, size.z / 2);
      const materialRight = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      playerRightBlock = new THREE.Mesh(geometryRight, materialRight);
      playerRightBlock.position.x = size.x / 2;

      const geometryLeft = new THREE.BoxGeometry(0.1, size.y / 2, size.z / 2);
      const materialLeft = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      playerLeftBlock = new THREE.Mesh(geometryLeft, materialLeft);
      playerLeftBlock.position.x = -size.x / 2;

      const geometryFront = new THREE.BoxGeometry(size.x / 4, size.y / 4, 0.1);
      const materialFront = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      playerFrontBlock = new THREE.Mesh(geometryFront, materialFront);
      playerFrontBlock.position.z = -size.z / 2;

      player.add(importedPlayer, playerBottomBlock, playerRightBlock, playerLeftBlock, playerFrontBlock);
      playerBody = el.children[0];
      player.userData.velocity = 0; // Начальная скорость
      player.userData.gravity = -0.01; // Ускорение свободного падения
      player.userData.jumpStrength = 0.25; // Сила прыжка

      player.userData.jump = false;

      player.userData.startSpeed = 0.15;
      player.userData.speed = player.userData.startSpeed;

      player.userData.playerOnGround = false;

      player.userData.hSpeed = 0.3;
      player.position.set(0, 2, 0)

      scene.add(player)
    }

    else if (el.name.includes('ground')) {
      groundSize = size;
      groundPos = el.position;
      ground = el;
      groundsMas.push(ground);
      allObjCollision.push(ground);
      scene.add(el.clone());
    }
    else if (el.name.includes('wall')) {
      allObjCollision.push(el);
      scene.add(el.clone());
    }

    else if (el.name.includes('snow')) {
      snowSize = size;
      for (var i = 0; i <= Math.ceil(groundSize.z / snowSize.z) + 1; i++) {
        snow = el.clone();
        snow.position.set(snow.position.x, snow.position.y, snow.position.z - (i * 8.8))
        scene.add(snow);
        //allObjCollision.push(snow);
      }
    }
    else if (el.name.includes('area')) {
      scene.add(el.clone());
    }
  })


  //scene.add(root);

  let geometryPlane = new THREE.BoxGeometry(50, 0.5, 500);
  let materialPlane = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide, opacity: 0.0, transparent: true })
  plane = new THREE.Mesh(geometryPlane, materialPlane);
  //plane.position.set(playerBody.position.x, playerBody.position.y - 1, playerBody.position.z - 2);

  scene.add(plane);

  dataLoaded = true;

});











function animate() {

  if (dataLoaded) {

    camera.lookAt(new THREE.Vector3(camera.position.x, player.position.y, player.position.z));
    camera.position.z = player.position.z + 7;




    playerMove();



    plane.position.set(plane.position.x, ground.position.y, player.position.z - 3);

    if (player.position.z < groundsMas[posMarker].position.z) {
      playerPosMarker = true;
      reloadGround();
    }



  }




  stats.update();
  renderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);

document.addEventListener('touchend', onTouchEnd);
// document.addEventListener('touchstart', onTouchMove);
document.addEventListener('touchmove', onTouchMove);

function onTouchEnd() {
  if (player.userData.playerOnGround) {
    player.userData.jump = true;
  }






}

function playerMove() {

  player.position.z -= player.userData.speed;
  playerBody.rotation.x -= player.userData.speed;

  if (detectCollisionCubeAndArray(playerFrontBlock, allObjCollision)) {
    player.userData.speed = 0;
  }
  else {
    player.userData.speed = player.userData.startSpeed;
  }


  //console.log(player.userData.jump);
  if (detectCollisionCubeAndArray(playerBottomBlock, allObjCollision)) {
    player.userData.playerOnGround = true;
    //player.position.y = 0; // Устанавливаем куб на уровне земли
    player.userData.velocity = 0; // Останавливаем куб
    if (player.userData.jump) {
      player.userData.velocity = player.userData.jumpStrength;
    }

    player.userData.jump = false;



  }
  else {
    player.userData.velocity += player.userData.gravity; // Увеличиваем скорость под действием гравитации
    player.userData.playerOnGround = false;
  }
  player.position.y += player.userData.velocity; // Обновляем позицию куба


  const direction = new THREE.Vector3().subVectors(player.position, targetPosition).normalize();


  if (!detectCollisionCubeAndArray(playerLeftBlock, allObjCollision) && direction.x > 0 && !player.userData.jump) {
    if (player.position.distanceTo(targetPosition) > player.userData.hSpeed) {

      player.position.x -= direction.x * player.userData.hSpeed;
      player.position.y = player.position.y;
      player.position.z = player.position.z;

    } else {
      player.position.x = targetPosition.x;
      player.position.y = player.position.y;
      player.position.z = player.position.z;
    }
  }
  else if (!detectCollisionCubeAndArray(playerRightBlock, allObjCollision) && direction.x < 0 && !player.userData.jump) {
    if (player.position.distanceTo(targetPosition) > player.userData.hSpeed) {

      player.position.x -= direction.x * player.userData.hSpeed;
      player.position.y = player.position.y;
      player.position.z = player.position.z;

    } else {
      player.position.x = targetPosition.x;
      player.position.y = player.position.y;
      player.position.z = player.position.z;
    }
  }
  else if (direction.x == 0) {
    player.position.x = targetPosition.x;
    player.position.y = player.position.y;
    player.position.z = player.position.z;
  }





}

function onTouchMove(e) {



  if (player.userData.playerOnGround) {


    e = e.changedTouches[0];

    var rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    plane.geometry.computeBoundingBox();
    var box1 = plane.geometry.boundingBox.clone();
    box1.applyMatrix4(plane.matrixWorld);

    intersects = raycaster.ray.intersectBox(box1, new THREE.Vector3());




    if (intersects) targetPosition = new THREE.Vector3(intersects.x, player.position.y, player.position.z);

  }
}

function reloadGround() {


  let newGround = groundsMas[posMarker].clone();
  newGround.position.set(newGround.position.x, newGround.position.y, newGround.position.z - groundSize.z)
  scene.add(newGround);
  groundsMas.push(newGround);
  allObjCollision.push(newGround);
  newGround.userData.param = new THREE.Vector3(groundSize.x / 2, groundSize.y / 2, groundSize.z / 2)

  for (var i = 0; i <= Math.ceil(groundSize.z / snowSize.z) + 2; i++) {
    snow = snow.clone();
    snow.position.set(snow.position.x, snow.position.y, groundsMas[posMarker + 1].position.z + groundSize.z / 2 - (i * 8.8))
    scene.add(snow);
  }
  posMarker++;
  playerPosMarker = false;
}








/*///////////////////////////////////////////////////////////////////////////////////////////////////////*/

// player.mixer = new THREE.AnimationMixer(player);
//   player.mixers = [];
//   player.allAnimations = [];
//   player.mixers.push(player.mixer);
//   player.clock = new THREE.Clock();
//   player.animations = gltf.animations;


//   player.allAnimations.push(player.userData.playerRotate = player.mixer.clipAction(player.animations[0]));
//   //player.userData.playerRotate.timeScale = 1;

//   //player.userData.playerRotate.play();

// if (player.mixers.length > 0) {

//   player.mixers[0].update(player.clock.getDelta());

// }

/*///////////////////////////////////////////////////////////////////////////////////////////////////////*/