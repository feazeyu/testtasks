const fs = require('fs');
const path = './config.txt';
var config = {};

let defaults = {
    map: ["omega"],
}

function loadConfig(){
    config = JSON.parse(fs.readFileSync(path));
    console.log(config);
}

function saveConfig(){
    fs.writeFileSync(path, JSON.stringify(config));
}

function getConfig(user){
    if(!(user.id in config)){
        config[user.id] = {...defaults};
        saveConfig();
    }
    return config[user.id];
}
function editUserData(user, data){
    console.log(user.id);
    console.log(data);
    if(!config[user.id]){
        config[user.id] = {...defaults};
    }
    for(key in data){
        config[user.id][key] = data[key];
    }
    saveConfig();
}

exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.editUserData = editUserData;
exports.getConfig = getConfig;
exports.config = config;