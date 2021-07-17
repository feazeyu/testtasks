const fs = require("fs");
const path = "./userConfig.json";

var config = {};

let permissionLevels = {
  captain: 10,
  admin: 8,
  pirate: 6,
  human: 0,
};

function defaults() {
  return {
    userName: "unknown username",
    permissionLevel: "human",
    preferences: {
      map: ["thunderdome"],
    },
  };
}

function checkUserConf(user) {
  if (!(user.id in config)) {
    config[user.id] = defaults();
  }
  updateUserName(user);
  saveConfig();
}

function loadConfig() {
  config = JSON.parse(fs.readFileSync(path));
  console.log(config);
}

function saveConfig() {
  fs.writeFileSync(path, JSON.stringify(config));
}

function updateUserName(user) {
  config[user.id].userName = user.username;
}

function getUserPreferences(user) {
  checkUserConf(user);
  return config[user.id].preferences;
}

function editUserPreferences(user, data) {
  checkUserConf(user);
  for (key in data) {
    config[user.id].preferences[key] = data[key];
  }
  updateUserName(user);
  saveConfig();
}

function getUserPermissionLevel(user) {
  checkUserConf(user);
  return config[user.id].permissionLevel;
}

function getUserPermissionValue(user) {
  checkUserConf(user);
  return permissionLevels[getUserPermissionLevel(user)];
}

function isUserEligible(user, neededPermissionLevel) {
  checkUserConf(user);
  if (getUserPermissionValue(user) >= permissionLevels[neededPermissionLevel]) {
    return true;
  } else {
    return false;
  }
}

function getUserById(id) {
  if (!(id in config)) {
    config[id] = defaults();
    saveConfig();
  }
  return {
    id: id,
    username: config[id].userName,
  };
}

function getUserByMention(mentionString) {
  return getUserById(mentionString.slice(3, -1));
}

function getAllUserIds() {
  return Object.keys(config);
}

function changePermissionLevel(initiatior, targetUser, targetPermissionLevel) {
  checkUserConf(initiatior);
  checkUserConf(targetUser);
  if (!(targetPermissionLevel in permissionLevels)) {
    return "invalid permission level";
  }
  if (
    getUserPermissionValue(initiatior) <=
    permissionLevels[targetPermissionLevel]
  ) {
    return "cannot set equal or grater permission level for other user";
  }
  if (
    getUserPermissionValue(targetUser) >= getUserPermissionValue(initiatior)
  ) {
    return "cannot set permission levels for users with equal or higher permission levels";
  }
  config[targetUser.id].permissionLevel = targetPermissionLevel;
  saveConfig();
}

exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.editUserPreferences = editUserPreferences;
exports.getUserPreferences = getUserPreferences;
exports.isUserEligible = isUserEligible;
exports.changePermissionLevel = changePermissionLevel;
exports.getUserById = getUserById;
exports.getUserByMention = getUserByMention;
exports.getUserPermissionLevel = getUserPermissionLevel;
exports.getAllUserIds = getAllUserIds;
