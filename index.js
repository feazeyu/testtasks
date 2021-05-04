const Discord = require("discord.js");
const fs = require("fs");
const hexMath = require("./hexMath");
const { parse } = require("url");
const unitPlanner = require("./unitPlanner");
const pageSize = 10;
var channel;
const emoji = { 
  crystal: "<:Crystal:757976643363930122>",
  metal:"<:Metal:757976643493953688>",
  gas:"<:Gas:757976643204546618>"
}
const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Some title')
	.setURL('https://discord.js.org/')
	.setAuthor('Some name', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
	.setDescription('Some description here')
	.setThumbnail('https://i.imgur.com/wSTFkRM.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addField('Inline field title', 'Some value here', true)
	.setImage('https://i.imgur.com/wSTFkRM.png')
	.setTimestamp()
	.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
var map;
var hexArray = [];
const client = new Discord.Client(); // creates a discord client
const token = fs.readFileSync("token.txt").toString();
client.login(token);
const prefix = "p!";
const unknownCommandErr = "```Unrecognized command! Squawk!```"; //Error for unknown command
function tooBigRadiusError(radius){
  return "```Radius " + radius + "?! I can do up to 10. Not like I couldn't calculate it, I'm a smarrt pirrate parrot afterr all! But I'm lazy!```";
}
const CellDefinitions = JSON.parse(
  fs.readFileSync("./resources/CELL_DEFINITIONS.json")
);
var CellDefinitionsDict = {};
var rData = {};
function initCellDefinitionDict() {
  for (x = 0; x < CellDefinitions.length; x++) {
    CellDefinitionsDict[CellDefinitions[x].Id] = CellDefinitions[x];
  }
}
initCellDefinitionDict();
client.once("ready", () => {
  console.log("Ready!");
  channel = client.channels.cache.get("838491827400212513");
});

class Hex {
  constructor(Q, R, id) {
    this.coords = new hexMath.Coords(Q, R);
    this.id = id;
    this.type = id.toString().charAt(0); //1 Planet 2 Field 3 Moon
    if (this.type == "3") {
      this.size = CellDefinitionsDict[this.id].Size;
    }
    this.HarvestValue = CellDefinitionsDict[this.id].HarvestValue;
  }
}
client.on('messageReactionAdd', (reaction, user) => {
  let message = reaction.message, emoji = reaction.emoji;
  if (user.bot){
    return 0;
  }
  if (emoji.name == '◀️') {
          console.log("Back at message: " + message.id)          
  }
  else if (emoji.name == '▶️') {
          console.log("Forward at message: " + message.id)
  }
});
client.on("message", (message) => {
  let args = message.content.split(" ");
  let harvest;
  if (args[0] == prefix) {
    //try {
    if (args.length > 1) {
      switch (args[1].toLowerCase()) {
        case "rss":                            //RSS command
          harvest = bestTotalSpots(rssAt, new hexMath.Coords(args[2], args[3]), args[4], args[5], args[6])
          //TODO Osetrit crashe pri nezadani argumentu
          if(parseInt(args[4]) > 10){
            message.channel.send(
              tooBigRadiusError(parseInt(args[4]))
            );
            break;
          }
         var pages = [];
         if(args[6] == undefined){
           args[6] = 10
         }
         let iters = 0;
         for(i = 0; i < Math.ceil(args[6]/pageSize);i++){
           pages.push([]);
          for(x = 0; x < pageSize && iters < args[6]; x++){
              pages[i].push({name:iters+1+". " + harvest[x].coords.gotoCoords(), value: harvest[x].LQ + "<:Salute1:786442517209415710> " + harvest[x].MR + "<:Metal:757976643493953688> " +harvest[x].GR + "<:Gas:757976643204546618> " + harvest[x].CR + "<:Crystal:757976643363930122>" + " | Total: " + harvest[x].total + " | Distance: " + harvest[x].dist})
              iters++;
            }
        }
         let msg = new Discord.MessageEmbed()
	          .setColor('#0099ff')
          	.setTitle('Best resource spots:')
          	.setDescription('Fields, Moons and planets for radius: ' + args[4])
            .addFields(
              pages[1]
         )
          message.channel.send(msg).then(() =>
            channel.messages.fetch({ limit: 1 }).then(messages => {
            let lastMessage = messages.first();
              lastMessage.react('◀️').then(() => lastMessage.react('▶️'));
              //TODO Reaction pages
          }));
          break;
        case "labor":
          harvest = laborAt(
            new hexMath.Coords(parseInt(args[2]), parseInt(args[3])),
            parseInt(args[4])
          );
          message.channel.send(
            "``` Labor: " +
              harvest.LQ +
              " \n" +
              " Metal: " +
              harvest.MR +
              " \n" +
              " Gas: " +
              harvest.GR +
              " \n" +
              " Crystal: " +
              harvest.CR +
              " \n" +
              " Total: " +
              harvest.total +
              "```"
              //TODO pekne vypisovani i pro jine prikazy nez je p! rss
          );
          break;
        case "planets":
          harvest = planetsAt(
            new hexMath.Coords(parseInt(args[2]), parseInt(args[3])),
            parseInt(args[4])
          );
          message.channel.send(
            "``` Labor: " +
              harvest.LQ +
              " \n" +
              " Metal: " +
              harvest.MR +
              " \n" +
              " Gas: " +
              harvest.GR +
              " \n" +
              " Crystal: " +
              harvest.CR +
              " \n" +
              " Total: " +
              harvest.total +
              "```"
          );
          break;
        case "fields":
          harvest = fieldsAt(
            new hexMath.Coords(parseInt(args[2]), parseInt(args[3])),
            parseInt(args[4])
          );
          message.channel.send(
            "``` Labor: " +
              harvest.LQ +
              " \n" +
              " Metal: " +
              harvest.MR +
              " \n" +
              " Gas: " +
              harvest.GR +
              " \n" +
              " Crystal: " +
              harvest.CR +
              " \n" +
              " Total: " +
              harvest.total +
              "```"
          );
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
            message.channel.send(
              "```Wrrong command usage! \nThe correct one is: p! dist x1 y1 x2 y2```"
            );
          }
          break;
        case "yo": message.channel.send(exampleEmbed);break;
        case "hex":
          if (args[2] != undefined && args[3] != undefined) {
            let hex = readHex(args[2], args[3]);
            message.channel.send("Hex: " + hex.id);
          } else {
            message.channel.send(
              "```Wrrong command usage! \nThe correct one is: p! hex x y```"
            );
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
          message.channel.send(unknownCommandErr);
          break;
      }
    } else {
      message.channel.send(unknownCommandErr);
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

loadMap("./resources/map.json");
function loadMap(path) {
  let data = "";
  map = JSON.parse(fs.readFileSync(path));
  for (q = -map.MapRadius; q <= map.MapRadius; q++) {
    hexArray.push([]);
    for (r = -map.MapRadius; r <= map.MapRadius; r++) {
      hexArray[q + map.MapRadius].push(new Hex(q, r, 0)); //Create a 2d array for further population.
    }
  }
  for (x = 0; x < map.Templates.length; x++) {
    for (i = 0; i < map.Templates[x].Hexes.length; i++) {
      hexArray[map.Templates[x].Hexes[i].Position.Q + map.MapRadius][
        map.Templates[x].Hexes[i].Position.R + map.MapRadius
      ] = new Hex(
        map.Templates[x].Hexes[i].Position.Q,
        map.Templates[x].Hexes[i].Position.R,
        map.Templates[x].Hexes[i].ContentID
      );
      //data += "{ Position: { Q: " + map.Templates[x].Hexes[i].Position.Q + ", R: " + map.Templates[x].Hexes[i].Position.R + " }, ContentID: " +  map.Templates[x].Hexes[i].ContentID + "},\n"
    }
  }
}
function readHexCoords(coords) {
  return readHex(coords.Q, coords.R);
}
function readHex(q, r) {
  if (Math.abs(q) > map.MapRadius || Math.abs(r) > map.MapRadius) {
    return new Hex(q, r, 0);
  }
  //console.log("Q: " + q + " R: " + r);
  return hexArray[parseInt(q) + map.MapRadius][parseInt(r) + map.MapRadius];
}
function calculateShips(shipType, moonPts = 0) {
  let shipId = NaN;
  for (x = 0; x < unitPlanner.ships.length; x++) {
    if (unitPlanner.ships[x].name == shipType.toLowerCase()) {
      shipId = x;
      console.log("Found a ship :>");
    }
  }
  let shipsPerHour = parseFloat(
    (60 / (unitPlanner.ships[shipId].time * (0.5 - (moonPts * 5) / 100))).toFixed(1)
  );
  let rssPerHour = {
    crystal: shipsPerHour * unitPlanner.ships[shipId].crystal,
    gas: shipsPerHour * unitPlanner.ships[shipId].gas,
    metal: shipsPerHour * unitPlanner.ships[shipId].metal,
  };
  let shipProduction = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Ship production: ' + shipsPerHour + " " + shipType + " per hour.")
	.setDescription('Ship production with maxed out HSA and mic offices.')
  .addFields(
    {name:'Metal usage', value: Math.floor(rssPerHour.metal), inline:true},
    {name:'Gas usage', value:Math.floor(rssPerHour.gas), inline:true},
    {name:'Crystal usage', value:Math.floor(rssPerHour.crystal), inline:true}
  )
	.setTimestamp()
  return (shipProduction
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
  );
  
}

function comparatorTotal(a, b){
  return b.total - a.total;
}

function bestTotalSpots(fnc, middle, radius, distance, entries = 50){
  let spots = [];
  let coordsArray = hexMath.coordsWithinRadius(middle, distance);
  for (i in coordsArray) {
    let hex = readHexCoords(coordsArray[i]);
    //console.log(hex);
    if (hex.id == 0) {
      let data = fnc(hex.coords, radius)
      data["coords"] = hex.coords;
      data.dist = hexMath.distance(hex.coords,middle);
      spots.push(data); 
    }
  }
  spots.sort(comparatorTotal);
  return spots.slice(0, entries);
}

function rssAt(coords, radius) {
  let data = accessRdata(coords, radius);
  //console.log(data);
  let HarvestValue = {
    LQ: data["1"].LQ + data["2"].LQ,
    MR: data["1"].MR + data["2"].MR,
    GR: data["1"].GR + data["2"].GR,
    CR: data["1"].CR + data["2"].CR,
  };
  HarvestValue["total"] = HarvestValue.MR + HarvestValue.GR + HarvestValue.CR;
  return HarvestValue;
}

function laborAt(coords, radius) {
  let data = accessRdata(coords, radius);
  let HarvestValue = {
    LQ: data["1"].LQ + data["2"].LQ,
    MR: data["1"].MR + data["2"].MR,
    GR: data["1"].GR + data["2"].GR,
    CR: data["1"].CR + data["2"].CR,
  };
  HarvestValue["total"] = HarvestValue.LQ;
  return HarvestValue;
}

function fieldsAt(coords, radius) {
  let data = accessRdata(coords, radius);
  let HarvestValue = {
    LQ: data["2"].LQ,
    MR: data["2"].MR,
    GR: data["2"].GR,
    CR: data["2"].CR,
  };
  HarvestValue["total"] = HarvestValue.MR + HarvestValue.GR + HarvestValue.CR;
  return HarvestValue;
}

function planetsAt(coords, radius) {
  let data = accessRdata(coords, radius);
  let HarvestValue = {
    LQ: data["1"].LQ,
    MR: data["1"].MR,
    GR: data["1"].GR,
    CR: data["1"].CR,
  };
  HarvestValue["total"] = HarvestValue.MR + HarvestValue.GR + HarvestValue.CR;
  return HarvestValue;
}

function accessRdata(coords, radius) {
  //console.log("acessing data within r: " + radius + " at:");
  //console.log(coords);
  if (!rData[radius]) {
    //console.log("precalcing data");
    precalcRdata(radius);
  }
  if (
    Math.abs(coords.Q) > map.MapRadius ||
    Math.abs(coords.R) > map.MapRadius
  ) {
    return {
      1: {
        LQ: 0,
        MR: 0,
        GR: 0,
        CR: 0,
      },
      2: {
        LQ: 0,
        MR: 0,
        GR: 0,
        CR: 0,
      },
    };
  }

  return rData[radius][coords.Q + map.MapRadius][coords.R + map.MapRadius];
}

function precalcRdata(radius) {
  console.log("precalcing data for r: " + radius);
  if (rData[radius]) {
    console.log("data already precalced");
    return;
  }
  rData[radius] = [];
  for (let q = -map.MapRadius; q <= map.MapRadius; q++) {
    rData[radius].push([]);
    for (let r = -map.MapRadius; r <= map.MapRadius; r++) {
      rData[radius][q + map.MapRadius].push({
        1: rssWithinRadius(new hexMath.Coords(q, r), radius, ["1", "3"]),
        2: rssWithinRadius(new hexMath.Coords(q, r), radius, ["2"]),
      });
    }
  }
}
function editMessageById(msgId, embed, message){
  message.channel.messages.fetch(msgId)
    .then(msg => {
        msg.edit(embed);
    }); 
}
function rssWithinRadius(middle, radius, types) {
  let HarvestValue = {
    LQ: 0,
    MR: 0,
    GR: 0,
    CR: 0,
  };
  //console.log("Cords with rad: " + hexMath.coordsWithinRadius(middle, radius));
  let coordsArray = hexMath.coordsWithinRadius(middle, radius);
  for (i in coordsArray) {
    let hex = readHexCoords(coordsArray[i]);
    //console.log(hex);
    if (types.includes(hex.type)) {
      for (key in hex.HarvestValue) {
        HarvestValue[key] += parseInt(hex.HarvestValue[key]);
      }
    }
  }
  return HarvestValue;
}

var testHex = new Hex(10, 10, 303);
hexMath.runTests();
