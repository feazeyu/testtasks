const fs = require("fs");
const path = "./fleetData.json";
const Messages = require("./messages");
const Config = require("./config");

var config = {};

const aliases = {
  "vette": "corvettes",
  "vetttes": "corvettes",
  "corvette": "corvettes",
  "patrol": "patrols",
  "scout": "scouts",
  "dessies": "destroyers",
  "destroyer": "destroyers",
  "frig": "frigates",
  "frigs": "frigates",
  "frigate": "frigates",
  "recon": "recons",
  "carrier": "carriers",
  "dread": "dreadnoughts",
  "dreads": "dreadnoughts",
  "dreadnought": "dreadnoughts",
  "tc": "tcs",
  "indie": "industrials",
  "indies": "industrials",
  "industrial": "industrials",
  "gunship": "gunships",
  "gs": "gunships",
}

function defaults() {
  return {
    userName: "unknown username",
    units: {
      corvette: 0,
      patrol: 0,
      scout: 0,
      industrial: 0,
      destroyer: 0,
      frigate: 0,
      recon: 0,
      gunship: 0,
      tc: 0,
      carrier: 0,
      dreadnought: 0,
    },
    role: "unknown",
    group: "default",
    color: "#000000",
    msgID: "-1",
  };
}

async function clearMessages(channel) {
  console.log("clearing");
  setTimeout(() => {
    channel.messages.fetch().then((messages) => {
      messages.each((message) => {
        if (
          message.content[0] != "$" &&
          !config[channel.id]["msg"].includes(message.id)
        ) {
          message.delete().catch((err) => {
            console.log(err);
          });
        }
      });
    });
  }, 5000);
}

async function resendAll(channel) {
  config[channel.id]["msg"] = [];
  for (userID in config[channel.id]["usr"]) {
    config[channel.id]["usr"][userID].msgID = "-1";
    await updateMessage(channel, { id: userID });
  }
  await clearMessages(channel);
}

function updateUserName(channel, user) {
  config[channel.id]["usr"][user.id].userName = user.username;
  config[channel.id]["usr"][user.id].avatar = user.avatarURL();
}

function loadConfig() {
  config = JSON.parse(fs.readFileSync(path));
}

function saveConfig() {
  fs.writeFileSync(path, JSON.stringify(config));
}

function initChannel(channel) {
  if (channel.id in config) {
    return "Channel already tagged as fleet planner!";
  }
  config[channel.id] = {
    usr: {},
    msg: [],
  };
  saveConfig();
  return "Channel tagged successfully";
}

function deleteChannel(channel) {
  if (!(channel.id in config)) {
    return "Channel is not tagged as fleet planner!";
  }
  delete config[channel.id];
  saveConfig();
  return "Channel untagged successfully";
}

function checkUserConf(channel, user) {
  if (!(user.id in config[channel.id]["usr"])) {
    config[channel.id]["usr"][user.id] = defaults();
  }
  updateUserName(channel, user);
  saveConfig();
}

async function updateMessage(channel, user) {
  if (config[channel.id]["usr"][user.id].msgID == -1) {
    entry = new Messages.Entry(
      {
        info: config[channel.id]["usr"][user.id],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.fleetPlannerMsgEmbd,
      channel
    );
    await entry.sendMsg();
    config[channel.id]["usr"][user.id].msgID = entry.message.id;
    config[channel.id]["msg"].push(entry.message.id);
  } else if (config[channel.id]["usr"][user.id].msgID in Messages.entryDict) {
    Messages.entryDict[config[channel.id]["usr"][user.id].msgID].updateMsg();
  } else {
    channel.messages
      .fetch(config[channel.id]["usr"][user.id].msgID)
      .then((message) => {
        Messages.entryDict[config[channel.id]["usr"][user.id].msgID] =
          new Messages.Entry(
            {
              info: config[channel.id]["usr"][user.id],
              pages: {
                page: 0,
                limit: 1,
              },
            },
            Messages.fleetPlannerMsgEmbd,
            channel
          );
        Messages.entryDict[config[channel.id]["usr"][user.id].msgID].message =
          message;
        Messages.entryDict[
          config[channel.id]["usr"][user.id].msgID
        ].updateMsg();
      });
  }
  return;
}

function setUnits(channel, user, unit, count) {
  if (!(channel.id in config)) {
    return "Invalid channel";
  }
  checkUserConf(channel, user);
  config[channel.id]["usr"][user.id].units[unit] = count;
  saveConfig();
  updateMessage(channel, user);
  clearMessages(channel);
  return "units updated sucessfully";
}

function setField(channel, user, field, value) {
  if (!(channel.id in config)) {
    return "Invalid channel";
  }
  checkUserConf(channel, user);
  config[channel.id]["usr"][user.id][field] = value;
  saveConfig();
  updateMessage(channel, user);
  clearMessages(channel);
  return "value updated sucessfully";
}

function activeChannels() {
  return Object.keys(config);
}

const commands = {
  help: {
    description: "This command provides basic help",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!help",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return commands["help"].generateHelpEntries(message.channel);
    },
  },
  corvettes: {
    description: "Set your corvette ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!corvettes 125",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "corvette",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  patrols: {
    description: "Set your patrol ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!patrols 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "patrol",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  scouts: {
    description: "Set your scout ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!scouts 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "scout",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  industrials: {
    description: "Set your industrial ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!industrials 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "industrial",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  destroyers: {
    description: "Set your destroyer ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!destroyers 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "destroyer",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  frigates: {
    description: "Set your frigate ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!frigates 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "frigate",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  recons: {
    description: "Set your recon ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!recons 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "recon",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  gunships: {
    description: "Set your gunship ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!gunships 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "gunship",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  tcs: {
    description: "Set your TC ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!tcs 1",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "tc",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  carriers: {
    description: "Set your carrier ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!carriers 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "carrier",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  dreadnoughts: {
    description: "Set your dreadnought ship count",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: "!dreadnoughts 317",
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setUnits(
            message.channel,
            message.author,
            "dreadnought",
            validatedArgs.base.reduce((a, b) => a + b, 0)
          ),
          message.channel
        ),
      ];
    },
  },
  role: {
    description: "Set your role",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: `!role "Hammer"`,
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setField(
            message.channel,
            message.author,
            "role",
            validatedArgs.base[0]
          ),
          message.channel
        ),
      ];
    },
  },
  group: {
    description: "Set your group",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: `!group "border"`,
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setField(
            message.channel,
            message.author,
            "group",
            validatedArgs.base[0]
          ),
          message.channel
        ),
      ];
    },
  },
  color: {
    description: "Set your color with hex string (e. g. #00ff00)",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: `!color "#00ff00"`,
    requiredPermissionLevel: "human",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      return [
        Messages.textEntry(
          setField(
            message.channel,
            message.author,
            "color",
            validatedArgs.base[0]
          ),
          message.channel
        ),
      ];
    },
  },
  resend: {
    description: "Resends all user messages and updates them",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: `!resend`,
    requiredPermissionLevel: "admin",
    generateHelpEntries: function (channel) {
      return []; //TODO
    },
    run: function (validatedArgs, message) {
      resendAll(message.channel);
      return [];
    },
  },
};

exports.activeChannels = activeChannels;
exports.commands = commands;
exports.initChannel = initChannel;
exports.deleteChannel = deleteChannel;
exports.loadConfig = loadConfig;
exports.aliases = aliases;
