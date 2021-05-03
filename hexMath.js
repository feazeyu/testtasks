const eps = 0.000001; //due to double type errors

class Coords {
  constructor(Q, R) {
    this.Q = Q;
    this.R = R;
  }
}

function distance(A, B) {
  //hexes -> their distance
  if ((A.Q - B.Q) * (A.R - B.R) <= 0 + eps) {
    return Math.max(Math.abs(A.Q - B.Q), Math.abs(A.R - B.R));
  } else {
    return Math.abs(A.Q - B.Q) + abs(A.R - B.R);
  }
}

function coordsWithDistFrom(middle, dist) {
  if (dist <= 0 || Math.floor(dist) != dist) {
    throw "dist : " + dist + " has to be positive integer!";
  }
  let dQ = 0;
  let dR = dist;
  let coords = [];
  while (dQ > -dist) {
    coords.push(new Coords(middle.Q + dQ, middle.R + dR));
    coords.push(new Coords(middle.Q - dQ, middle.R - dR));
    dQ--;
  }
  while (dR > 0) {
    coords.push(new Coords(middle.Q + dQ, middle.R + dR));
    coords.push(new Coords(middle.Q - dQ, middle.R - dR));
    dR--;
  }
  while (dQ < 0) {
    coords.push(new Coords(middle.Q + dQ, middle.R + dR));
    coords.push(new Coords(middle.Q - dQ, middle.R - dR));
    dQ++;
    dR--;
  }
  return coords;
}

function coordsWithinRadius(middle, radius) {
  if (radius <= 0 || Math.floor(radius) != radius) {
    throw "radius : " + radius + " has to be positive integer!";
  }
  coords = [];
  for (let dist = radius; dist >= 1; dist--) {
    coords.concat(coordsWithDistFrom(middle, dist));
  }
  return coords;
}

function runTests(){
    //distance tests
    let A = new Coords(-83, 130); //Next Gen distro
    let B = new Coords(-66, 192); //Corner stalker
    let C = new Coords(-65, 123); //No2 (Baika)

    let distAB = 79; //values from SB client
    let distAC = 18;
    let distBC = 69;

    distTest(A, B, distAB);
    distTest(A, C, distAC);
    distTest(B, C, distBC);

    //coords with dist from tests
    coordsWithDistFromTest(A, 2);
    coordsWithDistFromTest(B, 5);
    coordsWithDistFromTest(C, 1);
    coordsWithDistFromTest(A, 7);
    coordsWithDistFromTest(B, 3);
    coordsWithDistFromTest(C, 10);
}

function coordsWithDistFromTest(M, dist){
    let output = coordsWithDistFrom(M, dist);
    if(output.length != 6*dist){
        throw "wrong output length, expected: " + (6*dist) + " got: " + output.length;
    }
    for(let i = 0; i < output.length; i++){
        distTest(M, output[i], dist);
    }
}

function distTest(A, B, expectedDist){
    if(expectedDist != distance(A, B)){
        throw "dist test expected: " + expectedDist + " got: " + distance(A, B);
    }
}

exports.distance = distance;
exports.Coords = Coords;
exports.coordsWithinRadius = coordsWithinRadius;
exports.runTests = runTests;
