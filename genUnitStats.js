const fs = require("fs");

let src = "./resources/UNIT_DEFINITIONS.json";
let dest = "./resources/unitStats.json";

console.log(fs.readFileSync(src));
const input = JSON.parse(fs.readFileSync(src));

var output = {};

const trans = {
  LightAssault: "corvette",
  LightDefense: "patrol",
  HeavyAssault: "destroyer",
  HeavyDefense: "frigate",
  Carrier: "carrier",
  Dreadnought: "dreadnought",
  Bomber: "gunship",
  Scout: "scout",
  HeavyScout: "recon",
  Corvette: "corvette",
  "Patrol Ship": "patrol",
  Destroyer: "destroyer",
  Frigate: "frigate",
  Recon: "recon",
  Gunship: "gunship",
};

const type = {
  corvette: "light",
  patrol: "light",
  scout: "light",
  destroyer: "heavy",
  frigate: "heavy",
  recon: "heavy",
  gunship: "heavy",
  carrier: "capital",
  dreadnought: "capital",
};

let conf = {
  lvl: 3,
  CD: {
    light: {
      UNIT_FIREPOWER: 8,
      UNIT_HP: 40,
    },
    heavy: {
      UNIT_FIREPOWER: 40,
      UNIT_HP: 200,
    },
    capital: {
      UNIT_FIREPOWER: 200,
      UNIT_HP: 1000,
    },
  },
  supply: {
    corvette: {
      UNIT_FIREPOWER: 8,
      UNIT_HP: 40,
    },
    patrol: {
      UNIT_FIREPOWER: 8,
      UNIT_HP: 40,
    },
    scout: {
      UNIT_FIREPOWER: 8,
      UNIT_HP: 40,
    },
    destroyer: {
      UNIT_FIREPOWER: 40,
      UNIT_HP: 100,
    },
    frigate: {
      UNIT_FIREPOWER: 40,
      UNIT_HP: 100,
    },
    recon: {
      UNIT_FIREPOWER: 40,
      UNIT_HP: 100,
    },
    dreadnought: {
      UNIT_FIREPOWER: 360,
    },
    gunship: {
      UNIT_HP: 100,
    },
    carrier: {
      UNIT_FIREPOWER: 400,
      UNIT_HP: 1000,
    },
  },
  cards: {
    light: {
      // rare
      UNIT_FIREPOWER: 20,
      UNIT_HP: 50,
      mult: 1.08,
    },
    heavy: {
      //rare
      UNIT_FIREPOWER: 100,
      UNIT_HP: 250,
      mult: 1.08,
    },
    capital: {
      //epic
      UNIT_FIREPOWER: 750,
      UNIT_HP: 1875,
      mult: 1.08,
    },
  },
};

for (i in input.Units) {
  obj = input.Units[i];
  if (obj.Name in trans) {
    output[trans[obj.Name]] = {
      base: {
        UNIT_HP: obj.Stats.UNIT_HP,
        UNIT_FIREPOWER: obj.Stats.UNIT_FIREPOWER,
      },
      average: {
        UNIT_HP: obj.Stats.UNIT_HP,
        UNIT_FIREPOWER: obj.Stats.UNIT_FIREPOWER,
      },
    };
  }
}

for (obj in input.StatProgression) {
  //levels
  if (obj.Target in trans) {
    let unit = trans[obj.Target];
    if (obj.TargetAttribute in output[unit].average) {
      output[unit].average[obj.TargetAttribute] +=
        obj.ModifierArray[conf.lvl - 1];
    }
  }
}

for (unit in output) {
  //CD
  for (stat in conf.CD[type[unit]]) {
    output[unit].average[stat] += conf.CD[type[unit]][stat];
  }
}

for (unit in output) {
  //supply
  for (stat in conf.supply[unit]) {
    output[unit].average[stat] += conf.supply[unit][stat];
  }
}

for (unit in output) {
  //cards
  obj = conf.cards[type[unit]];
  output[unit].average.UNIT_FIREPOWER += obj.UNIT_FIREPOWER;
  output[unit].average.UNIT_HP += obj.UNIT_HP;
  output[unit].average.UNIT_FIREPOWER *= obj.mult;
  output[unit].average.UNIT_HP *= obj.mult;
}

fs.writeFileSync(dest, JSON.stringify(output));
