// npx vite --host

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import RAPIER from '@dimforge/rapier3d-compat';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


import { OrbitControls } from "three/addons/controls/OrbitControls";

import { detectCollisionCubes } from "./functions/detectColisions";
import { detectCollisionCubeAndArray } from "./functions/detectColisions";

await RAPIER.init();
const world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdceef6);
scene.fog = new THREE.Fog(scene.background, 1, 5000);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
scene.add(hemiLightHelper);

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
camera.position.set(0, 4, 1000);
camera.lookAt(0, 0, -9);

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








camera.position.z = 5;


let plane;
let player;
let playerBody;
let ground;
let groundBody;

let playerSpeed = 4;
let intersects;

let snow;


let playerOnGround = false;


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









// let geometryPlayer2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// let materialPlayer2 = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide })
// player2 = new THREE.Mesh(geometryPlayer2, materialPlayer2);
// player2.userData.mass = 1;
// player2.userData.position = new RAPIER.Vector3(0, 3, 0);
// player2.userData.param = new THREE.Vector3(0.25, 0.25, 0.25);
// player2.position.set(0, 2, 0)
// player2.receiveShadow = true;
//scene.add(player2);

// const player2Body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(1, 3, 0).setCanSleep(false))
// const player2Shape = RAPIER.ColliderDesc.cuboid(0.25, 0.25, 0.25).setMass(1).setRestitution(0).setFriction(0);
// world.createCollider(player2Shape, player2Body)
// dynamicBodies.push([player2, player2Body])



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
      el.userData.mass = 1;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)
      addPhysicsToObject(el, el.position, 'dynamic', 1, 'player')

      player = el;


    }

    else if (el.name.includes('ground')) {
      groundSize = size;
      groundPos = el.position;
      el.userData.mass = 0;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)
      addPhysicsToObject(el, el.position, 'fixed', Math.random(), 'ground')
      ground = el;
      groundsMas.push(ground);

    }
    else if (el.name.includes('wall')) {

      el.userData.mass = 1;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)
      addPhysicsToObject(el, el.position, 'fixed', Math.random(), 'wall')
      // ground = el;

    }

    else if (el.name.includes('snow')) {
      snowSize = size;

      for (var i = 0; i <= Math.ceil(groundSize.z / snowSize.z) + 1; i++) {
        snow = el.clone();
        snow.position.set(snow.position.x, snow.position.y, snow.position.z - (i * 8.8))
        scene.add(snow);
      }


    }
  })


  scene.add(root);

  const boxSnow = new THREE.Box3().setFromObject(snow);
  const sizeSnow = boxSnow.getSize(new THREE.Vector3());

  let geometryPlane = new THREE.BoxGeometry(10, 0.5, 5);
  let materialPlane = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide, opacity: 0, transparent: true })
  plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(player.position.x, player.position.y - 1, player.position.z + 2);

  scene.add(plane);

  dataLoaded = true;

  playerBody.applyImpulse({ x: 0.0, y: 0.0, z: -playerSpeed }, true);


  //addPhysicsToAllObjects3D();
});


//addPhysicsToAllObjects();








function animate() {

  if (dataLoaded) {
    camera.lookAt(new THREE.Vector3(camera.position.x, player.position.y, player.position.z));
    camera.position.z = player.position.z + 7;

    world.step();

    // world.bodies.forEach((body) => {
    //   const position = body.translation();
    //   const rotation = body.rotation();

    //   const mesh = scene.getObjectById(body.userData.id); // Предполагаем, что id связан с объектом
    //   if (mesh) {
    //     mesh.position.set(position.x, position.y, position.z);
    //     mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    //   }
    // });

    for (let i = 0, n = dynamicBodies.length; i < n; i++) {
      dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
      dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
    }


    if (detectCollisionCubeAndArray(player, groundsMas)) {
      playerOnGround = true
    }
    else { playerOnGround = false };




    plane.position.set(player.position.x, ground.position.y, player.position.z + 3);

    if (player.position.z < groundsMas[posMarker].position.z) {
      playerPosMarker = true;
      reloadGround();
    }

    if (Math.abs(playerBody.linvel().z) < playerSpeed) {
      playerBody.applyImpulse({ x: 0.0, y: 0.0, z: -playerSpeed }, true);
    }
    // if (intersects) {

    //   if (player.position.x < intersects.x - 0) {

    //     playerBody.applyImpulse({ x: 0.05, y: 0.0, z: 0.0 }, true);
    //   }
    //   else if (player.position.x > intersects.x + 0) {

    //     playerBody.applyImpulse({ x: -0.05, y: 0.0, z: 0.0 }, true);
    //   }
    //   else {
    //     playerBody.resetForces(true)

    //   }
    // }
    // else {
    //   playerBody.resetForces(true)

    // }
  }



  // controls.update();
  stats.update();
  renderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);

document.addEventListener('touchend', onTouchEnd);
document.addEventListener('touchstart', onTouchMove);
document.addEventListener('touchmove', onTouchMove);

function onTouchEnd() {
  if (playerOnGround) {
    const jumpForce = new RAPIER.Vector3(0, 5, 0); // Сила прыжка (можно настроить)
    playerBody.applyImpulse(jumpForce, true); // Применяем импульс
  }

}

function onTouchMove(e) {

  if (playerOnGround) {
    playerBody.setLinearDamping(0)

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


    playerBody.setTranslation(targetPosition, true);
  }
}

function reloadGround() {


  let newGround = groundsMas[posMarker].clone();
  newGround.position.set(newGround.position.x, newGround.position.y, newGround.position.z - groundSize.z)
  scene.add(newGround);
  groundsMas.push(newGround);
  newGround.userData.param = new THREE.Vector3(groundSize.x / 2, groundSize.y / 2, groundSize.z / 2)
  addPhysicsToObject(newGround, newGround.position, 'fixed', Math.random(), 'ground');



  for (var i = 0; i <= Math.ceil(groundSize.z / snowSize.z) + 2; i++) {
    snow = snow.clone();
    snow.position.set(snow.position.x, snow.position.y, groundsMas[posMarker + 1].position.z + groundSize.z / 2 - (i * 8.8))
    scene.add(snow);
  }
  posMarker++;
  playerPosMarker = false;
}

function addPhysicsToObject(obj, pos, mode, id, name) {
  let body;
  if (mode == 'dynamic') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z).setCanSleep(false).enabledRotations(false))
  }
  else if (mode == 'fixed') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setCanSleep(false))
  }
  const shape = RAPIER.ColliderDesc.cuboid(obj.userData.param.x, obj.userData.param.y, obj.userData.param.z).setMass(obj.userData.mass).setRestitution(0).setFriction(0);
  if (name == 'wall') {
    //const shape = RAPIER.ColliderDesc.trimesh(obj.geometry.attributes.position.array, obj.geometry.index.array);
  }

  body.userData = { id: id }
  if (id == 1) playerBody = body
  world.createCollider(shape, body)
  dynamicBodies.push([obj, body, id])
}


function addPhysicsToAllObjects() {
  scene.traverse((object) => {
    if (object.isMesh) {
      // Создаем Collider для каждого объекта
      // const geometry = object.geometry;
      // const shape = RAPIER.ColliderDesc.trimesh(geometry.attributes.position.array, geometry.index.array);

      // const rigidBody = RAPIER.RigidBodyDesc.dynamic()
      //   .setTranslation(object.position.x, object.position.y, object.position.z)
      //   .setRotation(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);

      // const body = world.createRigidBody(rigidBody);
      // body.userData = { id: Math.random() }
      // world.createCollider(shape, body);
      const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(object.userData.position.x, object.userData.position.y, object.userData.position.z).setCanSleep(false))
      const shape = RAPIER.ColliderDesc.cuboid(object.userData.param.x, object.userData.param.y, object.userData.param.z).setMass(object.userData.mass).setRestitution(0).setFriction(0);
      body.userData = { id: Math.random() }
      world.createCollider(shape, body)
      dynamicBodies.push([object, body])

    }
  });
}



// function addPhysicsToAllObjects3D() {

//   scene.children[3].children.forEach((object) => {
//     if (object.isMesh) {
//       console.log(getObjectSize(object))
//       const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(object.position.x, object.position.y, object.position.z).setCanSleep(false))
//       const shape = RAPIER.ColliderDesc.cuboid(getObjectSize(object).x / 3 / 2, getObjectSize(object).y / 3 / 2, getObjectSize(object).z / 3 / 2).setMass(1).setRestitution(0).setFriction(0);
//       body.userData = { id: Math.random() }
//       world.createCollider(shape, body)
//       dynamicBodies.push([object, body])
//     }
//   });
// }




function scaleToFit(obj, bound) {
  let box = new THREE.Box3().setFromObject(obj);
  let size = new THREE.Vector3();
  box.getSize(size);

  let vScale = new THREE.Vector3().copy(new THREE.Vector3(0.05, 0.05, 0.05)).divide(size);

  let scale = Math.min(vScale.x, Math.min(vScale.y, vScale.z));

  obj.scale.setScalar(scale);
}