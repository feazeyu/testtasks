const fs = require('fs');
const path = './config.txt';
var config = {};

function loadConfig(){
    config = JSON.parse(fs.readFileSync(path));
    console.log(config);
}

function saveConfig(){
    fs.writeFileSync(path, JSON.stringify(config));
}

function getConfig(){
    return config;
}
function editUserData(user, data){
    console.log(user.id);
    console.log(data);
    if(!config[user.id]){
    config[user.id] = {};
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