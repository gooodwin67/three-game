// npx vite --host

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import RAPIER from '@dimforge/rapier3d-compat';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


import { OrbitControls } from "three/addons/controls/OrbitControls";

import { detectCollisionCubes } from "./functions/detectColisions";

await RAPIER.init();
const world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 0);

let stats = new Stats();
document.body.appendChild(stats.dom);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
/*/////////////////////////////////////////////////////*/

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
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
let playerBody;
let ground;


let playerOnGround = false;


let dynamicBodies = [];

let mouse = new THREE.Vector3;
let targetPosition = new THREE.Vector3;
let raycaster = new THREE.Raycaster;

let dataLoaded = false;









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


  root.children.forEach((el) => {
    const box = new THREE.Box3().setFromObject(el);
    const size = box.getSize(new THREE.Vector3());

    if (el.name == 'player') {
      el.userData.mass = 1;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)
      addPhysicsToObject(el, el.position, 'dynamic', 1)

      player = el;

    }

    else if (el.name.includes('ground')) {

      el.userData.mass = 0;
      el.userData.param = new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2)

      // let plane1 = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
      // plane1.position.x = el.position.x;
      // plane1.position.z = el.position.z;
      // plane1.position.y = el.position.y;

      // scene.add(plane1)


      addPhysicsToObject(el, el.position, 'fixed', Math.random())
      ground = el;

    }
  })


  scene.add(root);
  dataLoaded = true;




  //addPhysicsToAllObjects3D();
});


//addPhysicsToAllObjects();








function animate() {

  if (dataLoaded) {
    camera.lookAt(player.position);
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

    if (detectCollisionCubes(player, ground)) playerOnGround = true;
    else playerOnGround = false;

    playerBody.applyImpulse({ x: 0.0, y: 0.0, z: -0.01 }, true);
  }


  // controls.update();
  stats.update();
  renderer.render(scene, camera);

}
renderer.setAnimationLoop(animate);

document.addEventListener('touchend', onTouchEnd);
// document.addEventListener('touchstart', onTouchMove);
// document.addEventListener('touchmove', onTouchMove);

function onTouchEnd() {
  if (playerOnGround) {
    const jumpForce = new RAPIER.Vector3(0, 5, 0); // Сила прыжка (можно настроить)
    playerBody.applyImpulse(jumpForce, true); // Применяем импульс
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

function addPhysicsToObject(obj, pos, mode, id) {
  let body;
  if (mode == 'dynamic') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z).setCanSleep(false))
  }
  else if (mode == 'fixed') {
    body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z).setCanSleep(false))
  }

  const shape = RAPIER.ColliderDesc.cuboid(obj.userData.param.x, obj.userData.param.y, obj.userData.param.z).setMass(obj.userData.mass).setRestitution(0).setFriction(0);
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