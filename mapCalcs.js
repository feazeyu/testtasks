const fs = require("fs");
const hexMath = require("./hexMath");
var maps = {};
var hexArrays = {};
const CellDefinitions = JSON.parse(
  fs.readFileSync("./resources/CELL_DEFINITIONS.json")
);
const validMaps = ["omega", "thunderdome", "goldrush"];
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

function availableMaps() {
  let msg = "";
  for (i in validMaps) {
    msg += '"' + validMaps[i] + '" ';
  }
  return msg;
}

for (i in validMaps) {
  loadMap(validMaps[i]);
}
function loadMap(name) {
  let data = "";
  hexArrays[name] = [];
  maps[name] = JSON.parse(fs.readFileSync("./resources/" + name + ".map.json"));
  for (q = -maps[name].MapRadius; q <= maps[name].MapRadius; q++) {
    hexArrays[name].push([]);
    for (r = -maps[name].MapRadius; r <= maps[name].MapRadius; r++) {
      hexArrays[name][q + maps[name].MapRadius].push(new Hex(q, r, 0)); //Create a 2d array for further population.
    }
  }
  for (x = 0; x < maps[name].Templates.length; x++) {
    for (i = 0; i < maps[name].Templates[x].Hexes.length; i++) {
      hexArrays[name][
        maps[name].Templates[x].Hexes[i].Position.Q + maps[name].MapRadius
      ][maps[name].Templates[x].Hexes[i].Position.R + maps[name].MapRadius] =
        new Hex(
          maps[name].Templates[x].Hexes[i].Position.Q,
          maps[name].Templates[x].Hexes[i].Position.R,
          maps[name].Templates[x].Hexes[i].ContentID
        );
      //data += "{ Position: { Q: " + map.Templates[x].Hexes[i].Position.Q + ", R: " + map.Templates[x].Hexes[i].Position.R + " }, ContentID: " +  map.Templates[x].Hexes[i].ContentID + "},\n"
    }
  }
}

function readHexCoords(coords, map) {
  return readHex(coords.Q, coords.R, map);
}
function readHex(q, r, map) {
  if (Math.abs(q) > maps[map].MapRadius || Math.abs(r) > maps[map].MapRadius) {
    return new Hex(q, r, 0);
  }
  //console.log("Q: " + q + " R: " + r);
  return hexArrays[map][parseInt(q) + maps[map].MapRadius][
    parseInt(r) + maps[map].MapRadius
  ];
}

function comparatorTotal(a, b) {
  return b.total - a.total;
}

function comparatorDist(a, b) {
  return a.dist - b.dist;
}

function bestTotalSpots(fnc, middle, distance, entries, args) {
  let spots = [];
  let coordsArray = hexMath.coordsWithinRadius(middle, distance);
  for (i in coordsArray) {
    let hex = readHexCoords(coordsArray[i], args.map);
    //console.log(hex);
    if (hex.id == 0) {
      let data = fnc(hex.coords, args);
      data["coords"] = hex.coords;
      data.dist = hexMath.distance(hex.coords, middle);
      spots.push(data);
    }
  }
  spots.sort(comparatorTotal);
  spots = spots.slice(0, Math.min(entries, spots.length));
  for(i in spots){
    spots[i].rank = i;
  }
  if(args.closest){
    spots.sort(comparatorDist);
  }
  return spots;
}

function prospectAt(coords, args) {
  args.yields = {
    planets: {
      labor: 0,
      rss: 7.59, //7.59 because 6.9 is base, * 1.10 for apex mining lasers, ikr. Weird
    },
    fields: {
      labor: 0,
      rss: 2.5,
    },
  };
  return rssYieldAt(
    coords,
    args,
  );
}

function rssYieldAt(coords, args) {
  let harvestPlanets = planetsAt(coords, args);
  let harvestFields = fieldsAt(coords, args);
  let yield = {
    LQ:
      harvestFields.LQ * args.yields.fields.labor +
      harvestPlanets.LQ * args.yields.planets.labor,
    MR:
      harvestFields.MR * args.yields.fields.rss +
      harvestPlanets.MR * args.yields.planets.rss,
    GR:
      harvestFields.GR * args.yields.fields.rss +
      harvestPlanets.GR * args.yields.planets.rss,
    CR:
      harvestFields.CR * args.yields.fields.rss +
      harvestPlanets.CR * args.yields.planets.rss,
  };
  yield.total = yield.MR + yield.GR + yield.CR;
  return yield;
}

function hsaAt(coords, args) {
  let data = accessRdata(coords, 1, args.map);
  let reductionValue = {
    hsaRed: data["1"].hsaRed,
    total: data["1"].hsaRed,
  };
  return reductionValue;
}

function rssAt(coords, args) {
  let data = accessRdata(coords, args.radius, args.map);
  //console.log(data);
  let HarvestValue = {
    LQ: data["1"].LQ + data["2"].LQ,
    MR: data["1"].MR + data["2"].MR,
    GR: data["1"].GR + data["2"].GR,
    CR: data["1"].CR + data["2"].CR,
  };
  console.log(args);
  HarvestValue["total"] = HarvestValue.MR + HarvestValue.GR + HarvestValue.CR;
  return HarvestValue;
}

function laborAt(coords, args) {
  let data = accessRdata(coords, args.radius, args.map);
  let HarvestValue = {
    LQ: data["1"].LQ + data["2"].LQ,
    MR: data["1"].MR + data["2"].MR,
    GR: data["1"].GR + data["2"].GR,
    CR: data["1"].CR + data["2"].CR,
  };
  HarvestValue["total"] = HarvestValue.LQ;
  return HarvestValue;
}

function fieldsAt(coords, args) {
  let data = accessRdata(coords, args.radius, args.map);
  let HarvestValue = {
    LQ: data["2"].LQ,
    MR: data["2"].MR,
    GR: data["2"].GR,
    CR: data["2"].CR,
  };
  HarvestValue["total"] = HarvestValue.MR + HarvestValue.GR + HarvestValue.CR;
  return HarvestValue;
}

function planetsAt(coords, args) {
  let data = accessRdata(coords, args.radius, args.map);
  let HarvestValue = {
    LQ: data["1"].LQ,
    MR: data["1"].MR,
    GR: data["1"].GR,
    CR: data["1"].CR,
  };
  HarvestValue["total"] = HarvestValue.MR + HarvestValue.GR + HarvestValue.CR;
  return HarvestValue;
}

function accessRdata(coords, radius, map) {
  //console.log("acessing data within r: " + radius + " at:");
  //console.log(coords);
  if (!(map in rData)) {
    rData[map] = {};
  }
  if (!rData[map][radius]) {
    //console.log("precalcing data");
    precalcRdata(radius, map);
  }
  if (
    Math.abs(coords.Q) > maps[map].MapRadius ||
    Math.abs(coords.R) > maps[map].MapRadius
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

  return rData[map][radius][coords.Q + maps[map].MapRadius][
    coords.R + maps[map].MapRadius
  ];
}

function precalcRdata(radius, map) {
  console.log(`precalcing data for r: ${radius} map: ${map}`);
  if (rData[map][radius]) {
    console.log("data already precalced");
    return;
  }
  rData[map][radius] = [];
  for (let q = -maps[map].MapRadius; q <= maps[map].MapRadius; q++) {
    rData[map][radius].push([]);
    for (let r = -maps[map].MapRadius; r <= maps[map].MapRadius; r++) {
      rData[map][radius][q + maps[map].MapRadius].push({
        1: rssWithinRadius(new hexMath.Coords(q, r), radius, ["1", "3"], map),
        2: rssWithinRadius(new hexMath.Coords(q, r), radius, ["2"], map),
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

function rssWithinRadius(middle, radius, types, map) {
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
    let hex = readHexCoords(coordsArray[i], map);
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
exports.maps = maps;
exports.availableMaps = availableMaps;
exports.atFuncs = {
  hsaAt: hsaAt,
  rssAt: rssAt,
  fieldsAt: fieldsAt,
  planetsAt: planetsAt,
  laborAt: laborAt,
  prospectAt: prospectAt,
};
