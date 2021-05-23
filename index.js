//TODO Parser should support floats sometimes
const Discord = require("discord.js");
const fs = require("fs");
const alarm = require("./alarmr")
const hexMath = require("./hexMath");
const mapCalcs = require("./mapCalcs");
const help = require("./help.js");
const { parse } = require("url");
const unitPlanner = require("./unitPlanner");
const stationPlanner = require("./stationPlanner");
const { exception } = require("console");
const pageSize = 10;
var channel;
const emoji = {
  crystal: "<:Crystal:757976643363930122>",
  metal: "<:Metal:757976643493953688>",
  gas: "<:Gas:757976643204546618>",
  labor: "<:labor:839506095864676363>",
};
const exampleEmbed = new Discord.MessageEmbed()
  .setColor("#0099ff")
  .setTitle("Some title")
  .setURL("https://discord.js.org/")
  .setAuthor(
    "Some name",
    "https://i.imgur.com/wSTFkRM.png",
    "https://discord.js.org"
  )
  .setDescription("Some description here")
  .setThumbnail("https://i.imgur.com/wSTFkRM.png")
  .addFields(
    { name: "Regular field title", value: "Some value here" },
    { name: "\u200B", value: "\u200B" },
    { name: "Inline field title", value: "Some value here", inline: true },
    { name: "Inline field title", value: "Some value here", inline: true }
  )
  .addField("Inline field title", "Some value here", true)
  .setImage("https://i.imgur.com/wSTFkRM.png")
  .setTimestamp()
  .setFooter("Some footer text here", "https://i.imgur.com/wSTFkRM.png");
const client = new Discord.Client(); // creates a discord client
const token = fs.readFileSync("token.txt").toString();
client.login(token);
const prefix = "!p";
const negativeIntegerErr = "```Yerr nuts, matey! Am not doing that```";
const unknownCommandErr = "```Unrecognized command! Squawk!```"; //Error for unknown command
function reqArgsOmmitedErr(command) {
  return (
    "```" +
    `You forrgot some rrequirred arguments, type "!p help ${command}" forr help` +
    "```"
  );
}
const needToSpecifyRadiusError =
  "```You need to specify RRadius for this command! (add 'r 4' for radius 4)```";
const wrongSyntaxErr =
  "```CaaCaaaw! Where is me rum swabbie? Did you use yer face to type that command?!?```"; //Wrong syntax error
function tooBigRadiusError(radius) {
  return (
    "```Radius " +
    radius +
    "?! I can do up to 10. Not like I couldn't calculate it, I'm a smarrt pirrate parrot afterr all! But I'm lazy!```"
  );
}

client.once("ready", () => {
  console.log("Ready!");
  channel = client.channels.cache.get("838491827400212513");
  client.user.setActivity("!p help", { type: "LISTENING" });
});
var entryDict = {};
class Entry {
  constructor(data, createMsgFnc, channel) {
    this.data = data;
    this.createMsgFnc = createMsgFnc;
    this.channel = channel;
  }
  sendMsg() {
    let msg = this.createMsgFnc(this.data);
    this.channel.send(msg).then((lastMessage) => {
      lastMessage.react("◀️").then(() => lastMessage.react("▶️"));
      this.message = lastMessage;
      entryDict[this.message.id] = this;
    });
  }
  editMsg() {
    this.message.edit(this.createMsgFnc(this.data));
  }
  scrollForward() {
    this.data.pages.page++;
    if (this.data.pages.page >= this.data.pages.limit) {
      this.data.pages.page = 0;
    }
    this.editMsg();
  }
  scrollBackwards() {
    this.data.pages.page--;
    if (this.data.pages.page < 0) {
      this.data.pages.page = this.data.pages.limit - 1;
    }
    this.editMsg();
  }
}

client.on("messageReactionAdd", (reaction, user) => {
  let message = reaction.message,
    emoji = reaction.emoji;
  if (user.bot || !(message.id in entryDict)) {
    return 0;
  }
  if (emoji.name == "◀️") {
    reaction.users.remove(user.id).catch((error) => {
      console.log(error);
    });
    entryDict[message.id].scrollBackwards();
  } else if (emoji.name == "▶️") {
    reaction.users.remove(user.id).catch((error) => {
      console.log(error);
    });
    entryDict[message.id].scrollForward();
  }
});

function createBestSpotsMsg(data) {
  let spots = [];
  let begin = pageSize * data.pages.page;
  let end = Math.min(pageSize * (data.pages.page + 1), data.maxEntries);
  //console.log(begin);
  //console.log(end);
  for (x = begin; x < end; x++) {
    spots.push({
      name: x + 1 + ". " + data.harvest[x].coords.gotoCoords(),
      value: `${emoji.metal} ${data.harvest[x].MR} | ${emoji.gas} ${data.harvest[x].GR} | ${emoji.crystal} ${data.harvest[x].CR} | ${emoji.labor} ${data.harvest[x].LQ} | Total: ${data.harvest[x].total} | Dist: ${data.harvest[x].dist}`,
      /*value:
        data.harvest[x].MR +
        "<:Metal:757976643493953688> " +
        data.harvest[x].GR +
        "<:Gas:757976643204546618> " +
        data.harvest[x].CR +
        "<:Crystal:757976643363930122> " +
        data.harvest[x].LQ +
        "<:labor:839506095864676363>" +
        " | Total: " +
        data.harvest[x].total +
        " | Distance: " +
        data.harvest[x].dist,*/
    });
  }

  //console.log(spots);
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Best ${data.textData.title} spots page ${data.pages.page + 1}/${
        data.pages.limit
      }:`
    )
    .setDescription(
      `${data.textData.stuff} \n\tfor radius: ${
        data.radius
      } \n\tfor distance up to ${
        data.maxDistance
      } from ${data.middle.gotoCoords()}`
    )
    .addFields(spots);
}

function createBestHsaMsg(data) {
  let spots = [];
  let begin = pageSize * data.pages.page;
  let end = Math.min(pageSize * (data.pages.page + 1), data.maxEntries);
  //console.log(begin);
  //console.log(end);
  for (x = begin; x < end; x++) {
    spots.push({
      name: x + 1 + ". " + data.harvest[x].coords.gotoCoords(),
      value:
        " Moon Pts.: " +
        data.harvest[x].total +
        " | Distance: " +
        data.harvest[x].dist,
    });
  }

  //console.log(spots);
  return new Discord.MessageEmbed()
    .setColor("#FF0000")
    .setTitle(
      `Best ${data.textData.title} spots page ${data.pages.page + 1}/${
        data.pages.limit
      }:`
    )
    .setDescription(
      `${data.textData.stuff} \n\tfor distance up to ${
        data.maxDistance
      } from ${data.middle.gotoCoords()}`
    )
    .addFields(spots);
}

function twoDigitFormat(num) {
  if (num >= 10) {
    return num.toString(10);
  } else {
    return "0" + num.toString(10);
  }
}

function timeSecsToDHMS(timeSecs) {
  let secs = timeSecs % 60;
  let timeMins = Math.floor(timeSecs / 60 + hexMath.eps);
  let mins = timeMins % 60;
  let timeHours = Math.floor(timeMins / 60 + hexMath.eps);
  let hours = timeHours % 24;
  let days = Math.floor(timeHours / 24);
  return { secs: secs, mins: mins, hours: hours, days: days };
}

function DHMSTimeString(time) {
  return `${daysToWhenString(time.days)} at: ${twoDigitFormat(
    time.hours
  )}:${twoDigitFormat(time.mins)}:${twoDigitFormat(time.secs)}`;
}

function DHMSTimeEnumedString(time) {
  if (time.days != 0) {
    return `${time.days} days ${time.hours} h ${time.mins} m ${time.secs} s`;
  } else if (time.hours != 0) {
    return `${time.hours} h ${time.mins} m ${time.secs} s`;
  } else if (time.mins != 0) {
    return `${time.mins} m ${time.secs} s`;
  } else {
    return `${time.secs} s`;
  }
}

function daysToWhenString(days) {
  switch (days) {
    case 0:
      return "today";
    case 1:
      return "tomorrow";
    default:
      return `in ${days} days`;
  }
}

function calcRtime(args) {
  let origin = new hexMath.Coords(args.o[0], args.o[1]);
  let destination = new hexMath.Coords(args.d[0], args.d[1]);
  let speed = args.s[0];
  let impactTimeSeconds = args.t[2] + 60 * args.t[1] + 3600 * args.t[0];
  let distance = hexMath.distance(origin, destination);
  let travelTimeSeconds = Math.floor((distance * 3600) / speed + hexMath.eps);
  let travelTime = timeSecsToDHMS(travelTimeSeconds);
  let returnTimeSeconds = impactTimeSeconds + travelTimeSeconds;
  let returnTime = timeSecsToDHMS(returnTimeSeconds);
  let msg =
    "```" +
    `
Fleets at movement
from hex: ${origin.gotoCoords()}
to hex: ${destination.gotoCoords()}
with speed: ${speed}
with impact time: ${DHMSTimeString(timeSecsToDHMS(impactTimeSeconds))}
travel time: ${DHMSTimeEnumedString(travelTime)}
will return ${DHMSTimeString(returnTime)}`;

  if ("sg" in args && args.sg.length >= 1) {
    let travelTimeSecondsWithSGBug = Math.floor(
      (distance * 3600) / (speed + args.sg[0]) + hexMath.eps
    );
    let travelTimeWithSGBug = timeSecsToDHMS(travelTimeSecondsWithSGBug);
    let returnTimeSecondsWithSGBug =
      impactTimeSeconds + travelTimeSecondsWithSGBug;
    let returnTimeWithSGBug = timeSecsToDHMS(returnTimeSecondsWithSGBug);
    msg += `

If the movement is scheduled and SG bug active, the times are rather:  
travel time: ${DHMSTimeEnumedString(travelTimeWithSGBug)}
return ETA: ${DHMSTimeString(returnTimeWithSGBug)}`;
  }

  msg += "```";
  return msg;
}

function checkRtimeArguments(args) {
  console.log(args);
  if (!("o" in args) || args.o.length < 2) {
    return reqArgsOmmitedErr("rtime");
  }
  if (!("d" in args) || args.d.length < 2) {
    return reqArgsOmmitedErr("rtime");
  }
  if (!("s" in args) || args.s.length < 1) {
    return reqArgsOmmitedErr("rtime");
  }
  if (args.s[0] <= 0) {
    return (
      "```Those boats look rreally slow how would they manage to move with " +
      args.s[0] +
      " speed?! Did they get drunk and sail the wrong direction?!```"
    );
  }
  if (!("t" in args) || args.t.length < 3) {
    return reqArgsOmmitedErr("rtime");
  }
  if ("sg" in args && args.sg.length >= 1 && args.sg[0] < 0) {
    return "```Negative SG bug speed change?! Arr therr even moarr bugs there?!```";
  }
  if (
    args.t[2] < 0 ||
    args.t[2] >= 60 ||
    args.t[1] < 0 ||
    args.t[1] >= 60 ||
    args.t[0] < 0 ||
    args.t[0] >= 24
  ) {
    return "```Wrrong time forrmat!```";
  }
}

function checkHsaArguments(args) {
  if (!("e" in args) || args.e.length == 0) {
    // default size
    args.e = [50];
  }
  if (args.e[0] <= 0) {
    return "```Just tell me to shut up, no need to be mean```";
  }
  if (!("d" in args) || args.d.length < 2) {
    args.d = [0, 0, mapCalcs.mapRadius];
  }
  if (args.d.length == 2) {
    args.d.push(mapCalcs.mapRadius);
  }
  if (args.d[2] <= 0) {
    return negativeIntegerErr;
  }
  if (args.d[2] >= 2 * mapCalcs.mapRadius) {
    return "```The sea is not that big matey!```";
  }
  args.r = [1];
}

function checkArguments(args) {
  if (!("e" in args) || args.e.length == 0) {
    // default size
    args.e = [50];
  }
  if (!("r" in args) || args.r.length == 0) {
    return needToSpecifyRadiusError;
  }
  if (args.r[0] > 10) {
    return tooBigRadiusError(parseInt(args.r[0]));
  }
  if (args.r[0] <= 0) {
    return negativeIntegerErr;
  }
  if (args.e[0] <= 0) {
    return "```Just tell me to shut up, no need to be mean```";
  }
  if (!("d" in args) || args.d.length < 2) {
    args.d = [0, 0, mapCalcs.mapRadius];
  }
  if (args.d.length == 2) {
    args.d.push(mapCalcs.mapRadius);
  }
  if (args.d[2] <= 0) {
    return negativeIntegerErr;
  }
  if (args.d[2] >= 2 * mapCalcs.mapRadius) {
    return "```The sea is not that big matey!```";
  }
}
// !p rss r 4 d -12 25 -> {"r": [r], "d": [-12, 25]}
function parseArgs(args) {
  let i = 2;
  let argDict = { base: [] };
  let argKey = "base";
  while (i < args.length) {
    let value = undefined;
    let num = parseInt(args[i]);
    if (!isNaN(num)) {
      value = num;
    } else if (args[i][0] == '"') {
      args[i] = args[i].slice(1);
      value = "";
      while (args[i][args[i].length - 1] != '"' && i < args.length) {
        value += args[i] + " ";
        i++;
      }
      if(i < args.length){
        value += args[i].slice(0, -1);
      }
    } else {
      argKey = args[i];
    }
    if(!(argKey in argDict)){
      argDict[argKey] = [];
    }
    if (value != undefined) {
      argDict[argKey].push(value);
    }
    i++;
  }
  return argDict;
}

function bestSpotCommand(message, args, f, textData, msgGenFnc) {
  harvest = mapCalcs.bestTotalSpots(
    f,
    new hexMath.Coords(args.d[0], args.d[1]),
    args.r[0],
    args.d[2],
    args.e[0]
  );
  //TODO Osetrit crashe pri nezadani argumentu

  new_entry = new Entry(
    {
      harvest: harvest,
      radius: args.r[0],
      middle: new hexMath.Coords(args.d[0], args.d[1]),
      maxDistance: args.d[2],
      pages: {
        page: 0,
        limit: Math.ceil(harvest.length / pageSize),
      },
      maxEntries: harvest.length,
      textData: textData,
    },
    msgGenFnc,
    message.channel
  );
  new_entry.sendMsg();
}

client.on("message", (message) => {
  let args = message.content.split(" ");
  let err;
  let parsedArgs;
  if (args[0] != prefix) {
    return;
  }
  console.log("inc request");
  console.log(args);
  //try {
  if (args.length <= 1) {
    message.channel.send(wrongSyntaxErr);
    return;
  }
  switch (args[1].toLowerCase()) {
    case "help":
      let helpMsg;
      if (args[2]) {
        helpMsg = help.help(args[2]);
      } else {
        helpMsg = help.help("help");
      }
      message.channel.send("```" + helpMsg + "```");
      break;
    case "rss": //RSS command
      parsedArgs = parseArgs(args);
      err = checkArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      bestSpotCommand(
        message,
        parsedArgs,
        mapCalcs.atFuncs.rssAt,
        {
          title: "resource",
          stuff: "Fields, Planets and Moons",
        },
        createBestSpotsMsg
      );
      break;
    case "labor":
      parsedArgs = parseArgs(args);
      err = checkArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      bestSpotCommand(
        message,
        parsedArgs,
        mapCalcs.atFuncs.laborAt,
        {
          title: "labor",
          stuff: "Fields, Planets and Moons",
        },
        createBestSpotsMsg
      );
      break;
    case "planets":
      parsedArgs = parseArgs(args);
      err = checkArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      bestSpotCommand(
        message,
        parsedArgs,
        mapCalcs.atFuncs.planetsAt,
        {
          title: "resource",
          stuff: "Planets and Moons",
        },
        createBestSpotsMsg
      );
      break;
    case "fields":
      parsedArgs = parseArgs(args);
      err = checkArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      bestSpotCommand(
        message,
        parsedArgs,
        mapCalcs.atFuncs.fieldsAt,
        {
          title: "resource",
          stuff: "Fields",
        },
        createBestSpotsMsg
      );
      break;
    case "prospect":
      parsedArgs = parseArgs(args);
      err = checkArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      bestSpotCommand(
        message,
        parsedArgs,
        mapCalcs.atFuncs.prospectAt,
        {
          title: "resource",
          stuff: "Total Prospect MC rss generation",
        },
        createBestSpotsMsg
      );
      break;
    case "hsa":
      parsedArgs = parseArgs(args);
      err = checkHsaArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      bestSpotCommand(
        message,
        parsedArgs,
        mapCalcs.atFuncs.hsaAt,
        {
          title: "hsa",
          stuff: "Moons",
        },
        createBestHsaMsg
      );
      break;
    case "rtime":
      parsedArgs = parseArgs(args);
      err = checkRtimeArguments(parsedArgs);
      if (err) {
        message.channel.send(err);
        break;
      }
      message.channel.send(calcRtime(parsedArgs));
      break;
    case "dist":
      if (
        args[2] != undefined &&
        args[3] != undefined &&
        args[4] != undefined &&
        args[5] != undefined
      ) {
        let A = {
          Q: args[2],
          R: args[3],
        };
        let B = {
          Q: args[4],
          R: args[5],
        };
        message.channel.send(hexMath.distance(A, B));
      } else {
        message.channel.send(wrongSyntaxErr);
      }
      break;
    /*
        case "yo":
          message.channel.send(exampleEmbed);
          break;*/
    case "hex":
      if (args[2] != undefined && args[3] != undefined) {
        let hex = readHex(args[2], args[3]);
        message.channel.send("Hex: " + hex.id);
      } else {
        message.channel.send(wrongSyntaxErr);
      }
      break;
    case "ships":
      args = parseArgs(args);
      checkShipArgs(args);
      message.channel.send(calculateShips(args));

      break;
    default:
      message.channel.send(wrongSyntaxErr);
      break;
    case "alarm":
      parsedArgs = parseArgs(args);
      alarm.setAlarm(message.author, parsedArgs);
      
      break;
  }

  /*} catch (e) {
      message.channel.send(
        "```No joke, don't do that again. Please send this error to feazeyu#9566" +
          "\n" +
          e + "```"
      );
    }*/
});
function checkShipArgs(args) {
  if (!("m" in args) || args.m.length == 0) {
    args.m = [0];
  }
}
function calculateShips(args) {
  //console.log(args);
  let ship = NaN;
  for (x = 0; x < unitPlanner.ships.length; x++) {
    if (unitPlanner.ships[x].name in args) {
      ship = unitPlanner.ships[x];
    }
  }
  //console.log(ship);
  let shipsPerHour = (60 / (ship.time * (1 - ship.maxReduction))).toFixed(1);
  if (ship.moonReduction == true) {
    //console.log(typeof(args.m[0]));
    shipsPerHour = (
      60 /
      (ship.time * (1 - ship.maxReduction - args.m[0] * 0.05))
    ).toFixed(1);
  }
  let rssPerHour = {
    crystal: shipsPerHour * ship.crystal,
    gas: shipsPerHour * ship.gas,
    metal: shipsPerHour * ship.metal,
  };
  let shipProduction = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      "Ship production: " + shipsPerHour + " " + ship.name + " per hour."
    )
    .setDescription(ship.note)
    .addFields(
      {
        name: "Metal usage",
        value: Math.floor(rssPerHour.metal),
        inline: true,
      },
      { name: "Gas usage", value: Math.floor(rssPerHour.gas), inline: true },
      {
        name: "Crystal usage",
        value: Math.floor(rssPerHour.crystal),
        inline: true,
      }
    )
    .setTimestamp();
  return shipProduction;
  /*"```You'll make: " +
    shipsPerHour +
    " " +
    shipType +
    " per hour. \nFor sustained production you'll need: \n" +
    Math.floor(rssPerHour.metal) +
    " metal/h\n" +
    Math.floor(rssPerHour.gas) +
    " gas/h \n" +
    Math.floor(rssPerHour.crystal) +
    " crystals/h ```"*/
}
var testStation = new stationPlanner.Station(-96, 158);
console.log(testStation.totalRSS);
hexMath.runTests();
