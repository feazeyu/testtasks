

const eps = 0.000001; //due to double type errors

class Hex {
    constructor(Q, R){

        this.Q = Q;
        this.R = R;
    }
}

function distance(A, B){ //hexes -> their distance
    if((A.Q-B.Q)*(A.R-B.R) >= 0-eps){
        return Math.max(Math.abs(A.Q-B.Q), Math.abs(A.R-B.R));
    } else {
        return Math.abs(A.Q-B.Q)+abs(A.R-B.R);
    }
}

function hexesWithDistFrom(middle, dist){
    if(dist <= 0 || Math.floor(dist) != dist){
        throw "dist : " + dist + " has to be positive integer!";
    }
    let dQ = 0;
    let dR = dist;
    let hexes = [];
    while(dQ < dist){
        hexes.push(Hex(middle.Q + dQ, middle.R + dR));
        hexes.push(Hex(middle.Q - dQ, middle.R - dR));
        dQ++;
    }
    while(dR > 0){
        hexes.push(Hex(middle.Q + dQ, middle.R + dR));
        hexes.push(Hex(middle.Q - dQ, middle.R - dR));
        dR--;
    }
    while(dQ > 0){
        hexes.push(Hex(middle.Q + dQ, middle.R + dR));
        hexes.push(Hex(middle.Q - dQ, middle.R - dR));
        dQ--;
        dR--;
    }
    return hexes;
}

function hexesWithinRadius(middle, radius){
    if(radius <= 0 || Math.floor(radius) != radius){
        throw "radius : " + radius + " has to be positive integer!";
    }
    hexes = [];
    for(let dist = radius; dist >= 1; dist--){
        hexes.concat(hexesWithDistFrom(middle, dist));
    }
    return hexes;
}

exports.distance = distance;
exports.Hex = Hex;
exports.hexesWithinRadius = hexesWithinRadius;

