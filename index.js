const Discord = require("discord.js");
const fs = require("fs");
const config = require("./config.js");
const client = new Discord.Client(); // creates a discord client
const token = fs.readFileSync("token.txt").toString();
const Messages = require("./messages");
const Commands = require("./commands");
const HexMath = require("./hexMath");
const FleetPlanner = require("./fleetPlanner");
client.login(token);
const prefix = "!p";

client.once("ready", () => {
  console.log("Ready!");
  config.loadConfig();
  FleetPlanner.loadConfig(client);
  client.user.setActivity("!p help", { type: "LISTENING" });
});

client.on("messageReactionAdd", (reaction, user) => {
  let message = reaction.message,
    emoji = reaction.emoji;
  if (user.bot || !(message.id in Messages.entryDict)) {
    return 0;
  }
  if (emoji.name == "◀️") {
    reaction.users.remove(user.id).catch((error) => {
      console.log(error);
    });
    Messages.entryDict[message.id].scrollBackwards();
  } else if (emoji.name == "▶️") {
    reaction.users.remove(user.id).catch((error) => {
      console.log(error);
    });
    Messages.entryDict[message.id].scrollForward();
  }
});

// !p rss r 4 d -12 25 -> {"base": [], "r": [r], "d": [-12, 25]}
function parseArgs(args, defaults, start) {
  let i = start;
  let argDict = { ...defaults };
  argDict["base"] = [];
  let argKey = "base";
  while (i < args.length) {
    let value = undefined;
    let num = parseFloat(args[i]);
    if (!isNaN(num)) {
      value = num;
    } else if (args[i][0] == '"') {
      args[i] = args[i].slice(1);
      value = "";
      while (i < args.length && args[i][args[i].length - 1] != '"') {
        value += args[i] + " ";
        i++;
      }
      if (i < args.length) {
        value += args[i].slice(0, -1);
      } else {
        value = value.slice(0, -1);
      }
    } else {
      argKey = args[i];
      argDict[argKey] = [];
    }
    /*if (!(argKey in argDict)) {
      argDict[argKey] = [];
    }*/
    if (value != undefined) {
      argDict[argKey].push(value);
    }
    i++;
  }
  return argDict;
}

client.on("message", (message) => {
  if (
    message.content == "parrot, test yourself you scallywag" &&
    config.isUserEligible(message.author, "captain")
  ) {
    selfTest(message);
  }
  handleMsg(message) || fleetHandle(message);
});

function handleMsg(message) {
  let args = message.content.split(" ");
  if (args[0] != prefix) {
    return false;
  }
  console.log(
    `inc request from user ${message.author.username} id ${message.author.id}`
  );
  console.log(args);
  let userConfig = config.getUserPreferences(message.author);
  //try {
  if (args.length <= 1) {
    args = ["!p", "help"];
  }
  let parsedArgs = parseArgs(args, userConfig, 2);
  Commands.runCommand("!p", args[1], parsedArgs, message);
  return true;
}
function selfTest(message) {
  message.author = { username: "TestUser", id: 1 };
  for (command in Commands.commands["!p"]) {
    message.content = Commands.commands["!p"][command].example;
    handleMsg(message);
  }
}

function fleetHandle(message) {
  if (
    message.content[0] != "!" ||
    !FleetPlanner.activeChannels().includes(message.channel.id)
  ) {
    return;
  }
  let commands = message.content.split("!");
  for (i in commands) {
    if(i==0){
      continue;
    }
    console.log(
      `inc Fleet request from user ${message.author.username} id ${message.author.id}`
    );
    console.log(commands[i]);
    let userConfig = config.getUserPreferences(message.author);
    let args = commands[i].split(" ");
    let parsedArgs = parseArgs(args, userConfig, 1);
    let cmd = args[0].toLowerCase();
    if(cmd in FleetPlanner.aliases){
      cmd = FleetPlanner.aliases[args[0]]
    }
    Commands.runCommand("fleet", cmd, parsedArgs, message);
  }
}

HexMath.runTests();
