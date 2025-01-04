export function detectCollisionCubes(object1, object2) {
 object1.geometry.computeBoundingBox();
 object2.geometry.computeBoundingBox();
 object1.updateMatrixWorld();
 object2.updateMatrixWorld();
 let box1 = object1.geometry.boundingBox.clone();
 box1.applyMatrix4(object1.matrixWorld);
 let box2 = object2.geometry.boundingBox.clone();
 box2.applyMatrix4(object2.matrixWorld);

 //if (box1.intersectsBox(box2)) $('.info').text(1);
 return box1.intersectsBox(box2);
}

export function detectCollisionCubeAndArray(object1, array) {
 object1.geometry.computeBoundingBox();

 array.forEach(function (item, index, array) {

  if (item.children.length > 0) {

   item.children.forEach(function (item, index, array) {
    item.geometry.computeBoundingBox();
   })
  }
  else {
   item.geometry.computeBoundingBox();
  }
 });

 object1.updateMatrixWorld();
 array.forEach(function (item, index, array) {
  item.updateMatrixWorld();
 });

 let box1 = object1.geometry.boundingBox.clone();
 box1.applyMatrix4(object1.matrixWorld);

 var intersect = false;

 array.forEach(function (item, index, array) {
  if (item.children.length > 0) {
   item.children.forEach(function (item, index, array) {
    let box2 = item.geometry.boundingBox.clone();
    box2.applyMatrix4(item.matrixWorld);

    if (box1.intersectsBox(box2)) {
     intersect = item;
    }
   })
  }
  else {
   let box2 = item.geometry.boundingBox.clone();
   box2.applyMatrix4(item.matrixWorld);

   if (box1.intersectsBox(box2)) {
    intersect = item;
   }
  }

 });
 return intersect;

}