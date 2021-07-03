const Discord = require("discord.js");
const fs = require("fs");
const config = require("./config.js");
const client = new Discord.Client(); // creates a discord client
const token = fs.readFileSync("token.txt").toString();
const Messages = require("./messages");
const Commands = require("./commands");
const HexMath = require("./hexMath");
client.login(token);
const prefix = "!p";

client.once("ready", () => {
  console.log("Ready!");
  config.loadConfig();
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
function parseArgs(args, defaults) {
  let i = 2;
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
  if(message.content == "parrot, test yourself you scallywag!" && message.author.id == 306470357659811840){
    selfTest(message);
  }
  handleMsg(message);
});

function handleMsg(message) {
  let args = message.content.split(" ");
  if (args[0] != prefix) {
    return;
  }
  console.log(
    `inc request from user ${message.author.username} id ${message.author.id}`
  );
  console.log(args);
  let userConfig = config.getConfig(message.author);
  //try {
  if (args.length <= 1) {
    args = ["!p", "help"];
  }
  parsedArgs = parseArgs(args, userConfig);
  Commands.runCommand(args[1], parsedArgs, message);
}
function selfTest(message){
  message.author = {username: "TestUser", id: 0};
  for(command in Commands.commands){
    message.content = Commands.commands[command].example;
    handleMsg(message);
  }
}

HexMath.runTests();
