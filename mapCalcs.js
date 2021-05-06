const fs = require("fs");
const hexMath = require("./hexMath");
var map;
var hexArray = [];
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

function comparatorTotal(a, b) {
  return b.total - a.total;
}

function bestTotalSpots(fnc, middle, radius, distance, entries) {
  let spots = [];
  let coordsArray = hexMath.coordsWithinRadius(middle, distance);
  for (i in coordsArray) {
    let hex = readHexCoords(coordsArray[i]);
    //console.log(hex);
    if (hex.id == 0) {
      let data = fnc(hex.coords, radius);
      data["coords"] = hex.coords;
      data.dist = hexMath.distance(hex.coords, middle);
      spots.push(data);
    }
  }
  spots.sort(comparatorTotal);
  return spots.slice(0, Math.min(entries, spots.length));
}

function prospectAt(coords, radius){
    return rssYieldAt(coords, radius, {
        planets: {
            labor: 0,
            rss: 7,
        },
        fields: {
            labor: 0,
            rss: 2.5,
        }
    })
}

function rssYieldAt(coords, radius, yields){
    let harvestPlanets = planetsAt(coords, radius);
    let harvestFields = fieldsAt(coords, radius);
    let yield = {
        LQ: harvestFields.LQ * yields.fields.labor + harvestPlanets.LQ * yields.planets.labor,
        MR: harvestFields.MR * yields.fields.rss + harvestPlanets.MR * yields.planets.rss,
        GR: harvestFields.GR * yields.fields.rss + harvestPlanets.GR * yields.planets.rss,
        CR: harvestFields.CR * yields.fields.rss + harvestPlanets.CR * yields.planets.rss,
    }
    yield.total = yield.MR + yield.GR + yield.CR;
    return yield;
}

function hsaAt(coords) {
  let data = accessRdata(coords, 1);
  let reductionValue = {
    hsaRed: data["1"].hsaRed,
    total: data["1"].hsaRed,
  };
  return reductionValue;
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
        hsaRed: 0,
      },
      2: {
        LQ: 0,
        MR: 0,
        GR: 0,
        CR: 0,
        hsaRed: 0,
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

function redFromSize(size) {
  switch (size) {
    case "Small":
      return 1;
    case "Medium":
      return 2;
    case "Large":
      return 3;
    default:
      throw `Unknown moon size: ${size}`;
  }
}

function rssWithinRadius(middle, radius, types) {
  let HarvestValue = {
    LQ: 0,
    MR: 0,
    GR: 0,
    CR: 0,
    hsaRed: 0,
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
      if (hex.type == "3") {
        HarvestValue.hsaRed += redFromSize(hex.size);
      }
    }
  }
  return HarvestValue;
}

exports.bestTotalSpots = bestTotalSpots;
exports.mapRadius = map.MapRadius;
exports.atFuncs = {
    hsaAt: hsaAt,
    rssAt: rssAt,
    fieldsAt: fieldsAt,
    planetsAt: planetsAt,
    laborAt: laborAt,
    prospectAt: prospectAt,
};