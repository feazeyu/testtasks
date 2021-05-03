const Discord = require("discord.js"); 
const fs = require("fs"); 
const { parse } = require("url");
var map;
var hexArray = [];
const client = new Discord.Client(); // creates a discord client
const token = fs.readFileSync("token.txt").toString(); 
const prefix = 'p!';
const unknownCommandErr = "Unrecognized command! Squawk!"; //Error for unknown command
const ships = [{name:"destroyer", time:10.5, metal:358, gas:215, crystal:143}                        
              ]
client.once("ready", () => { 
	console.log("Ready!");
});
client.on("message", message => {
let args = message.content.split(' ');
if(args[0] == 'p!'){
    try {
    if(args.length > 1){
    switch(args[1].toLowerCase()){
        case 'hex': let hex = readHexId(args[2], args[3]);message.channel.send("Hex: " + hex) ;break;
        case 'yo': message.channel.send("Yo");
            break;
        case 'ships': if(args[2] != undefined && args[3] != undefined){
            message.channel.send(calculateShips(args[2], args[3]));
        } else if(args[2]!= undefined){
            message.channel.send(calculateShips(args[2]));
        } else {message.channel.send("Gimme arrguments, landlubber!")};
            break;
        default: message.channel.send(unknownCommandErr);
            break;
        }
    } else {
        message.channel.send(unknownCommandErr);
    }
    } catch(e){
        message.channel.send("No joke, don't do that again. Please send this error to feazeyu#9566" + "\n" + e);
    }
    }
})
client.login(token); 
loadMap("map.json");
function loadMap(path){
    let data = "";
    map = JSON.parse(fs.readFileSync("map.json"));
    for(q = 0; q <= map.MapRadius*2; q++){
        hexArray.push([]);
        for(r = 0; r <= map.MapRadius*2;r++){
            hexArray[q].push("0");                           //Create a 2d array for further population.
        }
    }
    console.log("hexArrayContent: " + hexArray[24][78]/*+" hexArray[r].length: "+ hexArray[r].length*/  )
    for(x = 0; x < map.Templates.length;x++){
        for(i = 0; i < map.Templates[x].Hexes.length;i++){
            hexArray[map.Templates[x].Hexes[i].Position.Q +map.MapRadius][map.Templates[x].Hexes[i].Position.R+map.MapRadius] = map.Templates[x].Hexes[i].ContentID;
            //data += "{ Position: { Q: " + map.Templates[x].Hexes[i].Position.Q + ", R: " + map.Templates[x].Hexes[i].Position.R + " }, ContentID: " +  map.Templates[x].Hexes[i].ContentID + "},\n"
        }
    }
};
function readHexId(q, r){
    return hexArray[parseInt(q)+map.MapRadius][parseInt(r)+map.MapRadius];               
}
function calculateShips(shipType, moonPts = 0){
    let shipId = NaN;
    for(x = 0; x < ships.length; x++){
        if (ships[x].name == shipType.toLowerCase()){
            shipId = x;
            console.log("Found a ship :>")
        }
    }
    let shipsPerHour = parseFloat((60 / (ships[shipId].time * (0.5 - moonPts*5/100))).toFixed(1));
    let rssPerHour = {
                        crystal:shipsPerHour*ships[shipId].crystal,
                        gas:shipsPerHour*ships[shipId].gas,
                        metal:shipsPerHour*ships[shipId].metal
                    }
    return "You'll make: "+ shipsPerHour + " " + shipType + " per hour. \nFor sustained production you'll need: \n**" + Math.floor(rssPerHour.metal) + "** metal/h" + Math.floor(rssPerHour.gas) + "** gas/h \n**" + Math.floor(rssPerHour.crystal) + "** crystals/h \n**";
}

class Field {
    constructor(Q, R, id){
        this.q = Q;
        this.r = R;
        this.id = id;
    }

}