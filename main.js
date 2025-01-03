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
scene.fog = new THREE.Fog(scene.background, 1, 150);

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
let player2;
let playerBody;
let ground;
let groundBody;

let playerSpeed = 3;
let intersects;

let snow;


let playerOnGround = false;


let dynamicBodies = [];

let mouse = new THREE.Vector3;
let targetPosition = new THREE.Vector3;
let raycaster = new THREE.Raycaster;
let raycasterBottom = new THREE.Raycaster;
let raycasterRight = new THREE.Raycaster;

let dataLoaded = false;
let playerLoaded = false;

let playerPosMarker = false;
let groundsMas = [];
let posMarker = 0;

let groundSize;
let groundPos;
let snowSize;

let allObjCollision = [];













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

      el.visible = false;
      el.userData.mass = 1;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)
      addPhysicsToObject(el, el.position, 'dynamic', 1, 'player2')

      player2 = el;

    }

    else if (el.name.includes('ground')) {
      groundSize = size;
      groundPos = el.position;
      el.userData.mass = 0;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)
      addPhysicsToObject(el, el.position, 'fixed', Math.random(), 'ground')
      ground = el;
      groundsMas.push(ground);
      allObjCollision.push(ground);




    }
    else if (el.name.includes('wall')) {

      el.userData.mass = 1;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)

      addPhysicsToObject(el, el.position, 'fixed', Math.random(), 'wall')

      allObjCollision.push(el);




    }

    else if (el.name.includes('snow')) {
      snowSize = size;

      for (var i = 0; i <= Math.ceil(groundSize.z / snowSize.z) + 1; i++) {
        snow = el.clone();
        snow.position.set(snow.position.x, snow.position.y, snow.position.z - (i * 8.8))
        scene.add(snow);
      }

      allObjCollision.push(snow);



    }
  })


  scene.add(root);

  let geometryPlane = new THREE.BoxGeometry(50, 0.5, 500);
  let materialPlane = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide, opacity: 0.0, transparent: true })
  plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(player2.position.x, player2.position.y - 1, player2.position.z + 2);

  scene.add(plane);



  dataLoaded = true;

  playerBody.applyImpulse({ x: 0.0, y: 0.0, z: -playerSpeed }, true);



  //addPhysicsToAllObjects3D();
});


const urlPlayer = 'snowball.glb';
gltfLoader.load(urlPlayer, (gltf) => {
  const root = gltf.scene;











  root.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

    }
  });

  let el = root.children[0];

  const box = new THREE.Box3().setFromObject(el);
  const size = box.getSize(new THREE.Vector3());

  el.userData.mass = 1;
  el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2.2, size.z / 2)
  //addPhysicsToObject(el, el.position, 'dynamic', 2, 'player')

  player = el;



  scene.add(player);




  playerLoaded = true;




  //addPhysicsToAllObjects3D();
});








function animate() {

  if (dataLoaded && playerLoaded) {



    camera.lookAt(new THREE.Vector3(camera.position.x, player2.position.y, player2.position.z));
    camera.position.z = player2.position.z + 7;

    const direction = new THREE.Vector3().subVectors(player2.position, player.position).normalize();

    if (player.position.distanceTo(player2.position) > 0.2) {
      player.position.x += direction.x * 0.2;
      player.position.y += direction.y * 0.2;
      player.position.z = player2.position.z;

    } else {
      player.position.copy(player2.position);
    }









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
      //dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
    }

    //console.log(checkRayBottom(player2));

    if (checkRayBottom(player2).distanceBottom < 0.3) {
      playerOnGround = true
    }
    else { playerOnGround = false };




    plane.position.set(plane.position.x, ground.position.y, player2.position.z + 3);

    if (player.position.z < groundsMas[posMarker].position.z) {
      playerPosMarker = true;
      reloadGround();
    }
    // if (Math.abs(playerBody.linvel().x) > 0) {
    //   playerBody.setLinvel({ x: 0.0, y: 0.0, z: -playerSpeed }, true);
    // }

    if (Math.abs(playerBody.linvel().z) < playerSpeed) {

      playerBody.applyImpulse({ x: 0.0, y: 0.0, z: -0.1 }, true);
    }
    else {
      player.rotation.x -= 0.2;
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

  playerBody.setLinvel({ x: 0.0, y: playerBody.linvel().y, z: -playerSpeed }, true)

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




    if (intersects) targetPosition = new THREE.Vector3(intersects.x, player2.position.y, player2.position.z);

    if (targetPosition.x > player2.position.x && (checkRayBottom(player).distanceRight > 0.2 || checkRayBottom(player).distanceRight == 0)) {
      playerBody.setTranslation(targetPosition, true);
    }
    else if (targetPosition.x < player2.position.x) {
      playerBody.setTranslation(targetPosition, true);
    }



  }
}

function reloadGround() {


  let newGround = groundsMas[posMarker].clone();
  newGround.position.set(newGround.position.x, newGround.position.y, newGround.position.z - groundSize.z)
  scene.add(newGround);
  groundsMas.push(newGround);
  allObjCollision.push(newGround);
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
  let shape;
  if (name == 'player2') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y + 2, pos.z).setCanSleep(false).enabledRotations(false))
    shape = RAPIER.ColliderDesc.ball(obj.userData.param.y).setMass(obj.userData.mass).setRestitution(0).setFriction(0);
  }
  else if (name == 'ground') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setCanSleep(false))
    shape = RAPIER.ColliderDesc.cuboid(obj.userData.param.x, obj.userData.param.y, obj.userData.param.z).setMass(obj.userData.mass).setRestitution(0).setFriction(0);
  }
  else if (name == 'wall') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setCanSleep(false))
    shape = RAPIER.ColliderDesc.cuboid(obj.userData.param.x, obj.userData.param.y, obj.userData.param.z).setMass(obj.userData.mass).setRestitution(0).setFriction(0);
  }

  if (name == 'wall') {
    //const shape = RAPIER.ColliderDesc.trimesh(obj.geometry.attributes.position.array, obj.geometry.index.array);
  }

  body.userData = { id: id }
  if (id == 1) playerBody = body
  world.createCollider(shape, body)
  dynamicBodies.push([obj, body, id])
  // if (obj.children.length > 0) {
  //   dynamicBodies.push([obj.children[0], body, id])
  //   //dynamicBodies.push([obj.children[1], body, id + 100])
  // }
  // else {
  //   dynamicBodies.push([obj, body, id])
  // }

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



function checkRayBottom(obj) {
  // Устанавливаем начало луча в позицию меша
  const origin = obj.position.clone();
  // Направляем луч вниз (в отрицательном направлении оси Y)
  const directionBottom = new THREE.Vector3(0, -1, 0).normalize();
  const directionRight = new THREE.Vector3(1, 0, 0).normalize();

  // Обновляем raycaster с заданной длиной
  raycasterBottom.set(origin, directionBottom);
  raycasterRight.set(origin, directionRight);

  let distanceBottom = 0;
  let distanceRight = 0;
  let distance;


  // Проверяем пересечения с объектами в сцене
  const intersectsBottom = raycasterBottom.intersectObjects(allObjCollision);

  const intersectsRight = raycasterRight.intersectObjects(allObjCollision);


  if (intersectsBottom.length > 0) {
    const intersection = intersectsBottom[0];
    distanceBottom = intersection.distance;
  }
  if (intersectsRight.length > 0) {
    const intersection = intersectsRight[0];
    distanceRight = intersection.distance;
  }
  console.log(distanceRight);
  distance = { distanceBottom: distanceBottom, distanceRight: distanceRight }

  return distance;
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