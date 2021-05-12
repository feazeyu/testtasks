


function setAlarm(user, args){
    time = args.t;
    message = "test";//args.m[0];
    let currentTime = Math.floor(Date.now()/1000)%86400;
    let convertedTime = (time[0] * 3600 + time[1] * 60 + time[2]);
    if (convertedTime < currentTime){
        convertedTime += 86400;
    }
    let remainingTime = convertedTime - Math.floor(Date.now()/1000)%86400;
    setTimeout(() => {user.send(`${message}`)}, remainingTime*1000);
}
exports.setAlarm = setAlarm;