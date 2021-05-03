const eps = 0.000001; //due to double type errors

class Coords {
  constructor(Q, R) {
    this.Q = Q;
    this.R = R;
  }
}

function distance(A, B) {
  //hexes -> their distance
  if ((A.Q - B.Q) * (A.R - B.R) >= 0 - eps) {
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
  while (dQ < dist) {
    coords.push(Coords(middle.Q + dQ, middle.R + dR));
    coords.push(Coords(middle.Q - dQ, middle.R - dR));
    dQ++;
  }
  while (dR > 0) {
    coords.push(Coords(middle.Q + dQ, middle.R + dR));
    coords.push(Coords(middle.Q - dQ, middle.R - dR));
    dR--;
  }
  while (dQ > 0) {
    coords.push(Coords(middle.Q + dQ, middle.R + dR));
    coords.push(Coords(middle.Q - dQ, middle.R - dR));
    dQ--;
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

exports.distance = distance;
exports.Coords = Coords;
exports.coordsWithinRadius = coordsWithinRadius;
