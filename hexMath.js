

const eps = 0.000001; //due to double type errors

function distance(A, B){ //hexes -> their distance
    if((A.Q-B.Q)*(A.R-B.R) >= 0-eps){
        return Math.max(Math.abs(A.Q-B.Q), Math.abs(A.R-B.R));
    } else {
        return Math.abs(A.Q-B.Q)+abs(A.R-B.R);
    }
}

exports.distance = distance;