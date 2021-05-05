const Discord = require("discord.js");
const fs = require("fs");
const hexMath = require("./hexMath");
const mapCalcs = require("./mapCalcs");
const help = require("./help.js");
const { parse } = require("url");
const unitPlanner = require("./unitPlanner");
const pageSize = 10;
var channel;
const emoji = {
  crystal: "<:Crystal:757976643363930122>",
  metal: "<:Metal:757976643493953688>",
  gas: "<:Gas:757976643204546618>",
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
  client.user.setActivity('!p help', { type: 'LISTENING' })
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
    reaction.users.remove(user.id);
    entryDict[message.id].scrollBackwards();
  } else if (emoji.name == "▶️") {
    reaction.users.remove(user.id);
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
      value:
        data.harvest[x].LQ +
        "<:Salute1:786442517209415710> " +
        data.harvest[x].MR +
        "<:Metal:757976643493953688> " +
        data.harvest[x].GR +
        "<:Gas:757976643204546618> " +
        data.harvest[x].CR +
        "<:Crystal:757976643363930122>" +
        " | Total: " +
        data.harvest[x].total +
        " | Distance: " +
        data.harvest[x].dist,
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
    .setDescription(`${data.textData.stuff} \n\tfor radius: ${data.radius} \n\tfor distance up to ${data.maxDistance} from ${data.middle.gotoCoords()}`)
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
    .setDescription(`${data.textData.stuff} \n\tfor distance up to ${data.maxDistance} from ${data.middle.gotoCoords()}`)
    .addFields(spots);
}

function checkHsaArguments(args){
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
    return tooBigRadiusError(parseInt(args[4]));
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
// p! rss r 4 d -12 25 -> {"r": [r], "d": [-12, 25]}
function parseArgs(args) {
  let i = 2;
  let dict = { base: [] };
  let current = "base";
  while (i < args.length) {
    let num = parseInt(args[i]);
    if (isNaN(num)) {
      current = args[i];
      dict[current] = [];
    } else {
      dict[current].push(num);
    }
    i++;
  }
  return dict;
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
  if (args[0] == prefix) {
    //try {
    if (args.length > 1) {
      switch (args[1].toLowerCase()) {
        case "help":
          let helpMsg;
          if(args[2]){
            helpMsg = help.help(args[2]);
          } else {
            helpMsg = help.help("help")
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
          bestSpotCommand(message, parsedArgs, mapCalcs.atFuncs.rssAt, {
            title: "resource",
            stuff: "Fields, Planets and Moons",
          }, createBestSpotsMsg);
          break;
        case "labor":
          parsedArgs = parseArgs(args);
          err = checkArguments(parsedArgs);
          if (err) {
            message.channel.send(err);
            break;
          }
          bestSpotCommand(message, parsedArgs, mapCalcs.atFuncs.laborAt, {
            title: "labor",
            stuff: "Fields, Planets and Moons",
          }, createBestSpotsMsg);
          break;
        case "planets":
          parsedArgs = parseArgs(args);
          err = checkArguments(parsedArgs);
          if (err) {
            message.channel.send(err);
            break;
          }
          bestSpotCommand(message, parsedArgs, mapCalcs.atFuncs.planetsAt, {
            title: "resource",
            stuff: "Planets and Moons",
          }, createBestSpotsMsg);
          break;
        case "fields":
          parsedArgs = parseArgs(args);
          err = checkArguments(parsedArgs);
          if (err) {
            message.channel.send(err);
            break;
          }
          bestSpotCommand(message, parsedArgs, mapCalcs.atFuncs.fieldsAt, {
            title: "resource",
            stuff: "Fields",
          }, createBestSpotsMsg);
          break;
        case "hsa":
          parsedArgs = parseArgs(args);
          err = checkHsaArguments(parsedArgs);
          if (err) {
            message.channel.send(err);
            break;
          }
          bestSpotCommand(message, parsedArgs, mapCalcs.atFuncs.hsaAt, { 
            title: "hsa",
            stuff: "Moons",
          }, createBestHsaMsg);
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
        case "ships": //TODO Vice lodi, spravne delanou redukci pro light ships
          if (args[2] != undefined && args[3] != undefined) {
            message.channel.send(calculateShips(args[2], args[3]));
          } else if (args[2] != undefined) {
            message.channel.send(calculateShips(args[2]));
          } else {
            message.channel.send("```Gimme arrguments, landlubber!```");
          }
          break;
        default:
          message.channel.send(wrongSyntaxErr);
          break;
      }
    } else {
      message.channel.send(wrongSyntaxErr);
    }
  }
  /*} catch (e) {
      message.channel.send(
        "```No joke, don't do that again. Please send this error to feazeyu#9566" +
          "\n" +
          e + "```"
      );
    }*/
});

function calculateShips(shipType, moonPts = 0) {
  let shipId = NaN;
  for (x = 0; x < unitPlanner.ships.length; x++) {
    if (unitPlanner.ships[x].name == shipType.toLowerCase()) {
      shipId = x;
      console.log("Found a ship :>");
    }
  }
  let shipsPerHour = parseFloat(
    (
      60 /
      (unitPlanner.ships[shipId].time *
        (unitPlanner.ships[shipId].maxReduction / 100))
    ).toFixed(1)
  );
  if (unitPlanner.ships[shipId].moonReduction == true) {
    shipsPerHour = parseFloat(
      (
        60 /
        (unitPlanner.ships[shipId].time *
          (unitPlanner.ships[shipId].maxReduction - (moonPts * 5) / 100))
      ).toFixed(1)
    );
  }
  let rssPerHour = {
    crystal: shipsPerHour * unitPlanner.ships[shipId].crystal,
    gas: shipsPerHour * unitPlanner.ships[shipId].gas,
    metal: shipsPerHour * unitPlanner.ships[shipId].metal,
  };
  let shipProduction = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      "Ship production: " + shipsPerHour + " " + shipType + " per hour."
    )
    .setDescription(unitPlanner.ships[shipId].note)
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

hexMath.runTests();
