const mapCalcs = require("./mapCalcs.js");
const hexMath = require("./hexMath.js");

const topSpotCount = 5;
const defaults = {
  station: {
    radius: 4,
    harvestRate: 0.73,
  },
  MF: {
    radius: 1,
    harvestRate: 4.5, //with frachead
  },
  TP: {
    radius: 1,
    harvestRate: 4.0,
  },
  MC: {
    radius: 2,
    harvestRate: 6.9,
  },
  HD: {
    radius: 2,
    harvestRate: 6.5,
  },
};

function calculateOutpostProduction(outposts, options) {
  if (outposts.length == 0) {
    return [
      {
        harvest: {
          LQ: 0,
          MR: 0,
          GR: 0,
          CR: 0,
          hsaRed: 0,
        },
        coords: [],
      },
    ];
  }
  let harvests;
  let outpost = outposts.pop();
  possibilities = calculateOutpostProduction(outposts, options);
  switch (outpost) {
    case "MF":
      harvests = mapCalcs.bestTotalSpots(
        mapCalcs.atFuncs.fieldsAt,
        options.coords,
        options.station.radius,
        topSpotCount,
        { radius: options.MF.radius }
      );
      for (let i = 0; i < topSpotCount; i++) {
        harvests[i].LQ *= options.MF.harvestRate;
        harvests[i].MR *= options.MF.harvestRate;
        harvests[i].GR *= options.MF.harvestRate;
        harvests[i].CR *= options.MF.harvestRate;
      }
      break;
    case "TP":
      harvests = mapCalcs.bestTotalSpots(
        mapCalcs.atFuncs.fieldsAt,
        options.coords,
        options.station.radius,
        topSpotCount,
        { radius: options.TP.radius }
      );
      for (let i = 0; i < topSpotCount; i++) {
        harvests[i].LQ = 0;
        harvests[i].MR *= options.TP.harvestRate;
        harvests[i].GR *= options.TP.harvestRate;
        harvests[i].CR *= options.TP.harvestRate;
      }
      break;
    case "MC":
      harvests = mapCalcs.bestTotalSpots(
        mapCalcs.atFuncs.planetsAt,
        options.coords,
        options.station.radius,
        topSpotCount,
        { radius: options.MC.radius }
      );
      for (let i = 0; i < topSpotCount; i++) {
        harvests[i].LQ = 0;
        harvests[i].MR *= options.MC.harvestRate;
        harvests[i].GR *= options.MC.harvestRate;
        harvests[i].CR *= options.MC.harvestRate;
      }
      break;
    case "HD":
      harvests = mapCalcs.bestTotalSpots(
        mapCalcs.atFuncs.laborAt,
        options.coords,
        options.station.radius,
        topSpotCount,
        { radius: options.HD.radius }
      );
      for (let i = 0; i < topSpotCount; i++) {
        harvests[i].LQ *= options.HD.harvestRate;
        harvests[i].MR = 0;
        harvests[i].GR = 0;
        harvests[i].CR = 0;
      }
      break;
    case "HSA":
    case "CSA":
      harvests = mapCalcs.bestTotalSpots(
        mapCalcs.atFuncs.hsaAt,
        options.coords,
        options.station.radius,
        topSpotCount,
        {},
      )
      break;
  }

  newPossibilities = [];
  for (i in possibilities) {
    for (j in harvests) {
      if (harvests[j].coords.gotoCoords() in possibilities[i].coords) {
        continue;
      }
      let newPossibility = {
        harvest: {
          LQ: possibilities[i].harvest.LQ,
          MR: possibilities[i].harvest.MR,
          GR: possibilities[i].harvest.GR,
          CR: possibilities[i].harvest.CR,
          hsaRed: possibilities[i].harvest.hsaRed,
        },
        coords: { ...possibilities[i].coords },
      };
      for (key in newPossibility.harvest) {
        if (key in harvests[j]) {
          newPossibility.harvest[key] += harvests[j][key];
        }
      }
      newPossibility.coords[harvests[j].coords.gotoCoords()] = outpost;
      newPossibilities.push(newPossibility);
    }
  }
  return newPossibilities;
}

function comparatorTotal(a, b) {
  return b.harvest.total - a.harvest.total;
}

function stnAt(coords, args) {
  args.h = [coords.Q, coords.R];
  possibilities = calculateStn(args);
  return possibilities[0].harvest;
}

function loadOptions(args){
  let options = {
  station: {...defaults.station},
    MF: {...defaults.MF},
    TP: {...defaults.TP},
    MC: {...defaults.MC},
    HD: {...defaults.HD},
    coords: new hexMath.Coords(args.h[0], args.h[1]),
  };
  for(key in defaults){
    if(args[key] && args[key][0]){
      options[key].radius = args[key][0];
      if(args[key][1]){
        options[key].harvestRate = args[key][1] / 100;
      }
    }
  }
  if (args.m && args.m[0]){
    options.minHsa = args.m[0];
  }
  if (args.sort && args.sort[0] && args.sort == "labor"){
    options.sort = "labor";
  } else {
    options.sort = "rss";
  }
  //console.log(options);
  return options;
}

function calculateStn(args) {
  let outposts = [...args.outposts];
  let entries = 15;
  let options = loadOptions(args);
  let stationHarvest = mapCalcs.atFuncs.rssAt(options.coords, options.station);
  for (key in stationHarvest) {
    stationHarvest[key] *= options.station.harvestRate;
  }
  let refineryProduction = {
    LQ: 800,
    MR: 700,
    GR: 700,
    CR: 700,
  };
  let possibleOutpostProductions = calculateOutpostProduction(
    outposts,
    options
  );
  let possibleProductions = possibleOutpostProductions;
  //console.log(options);
  for (i in possibleProductions) {
    for (key in refineryProduction) {
      possibleProductions[i].harvest[key] +=
        refineryProduction[key] + stationHarvest[key];
    }
    if(options.sort == "rss"){
      possibleProductions[i].harvest.total =
      possibleProductions[i].harvest.MR +
      possibleProductions[i].harvest.GR +
      possibleProductions[i].harvest.CR;
    } else {
      possibleProductions[i].harvest.total =
      possibleProductions[i].harvest.LQ;
    }
    if(possibleProductions[i].harvest.hsaRed < options.minHsa){
      possibleProductions[i].harvest.total = -1;
    }
  }
  possibleProductions.sort(comparatorTotal);
  return possibleProductions.slice(
    0,
    Math.min(entries, possibleProductions.length)
  );
}

exports.calculateStn = calculateStn;
exports.stnAt = stnAt;
