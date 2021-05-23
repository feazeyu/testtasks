const mapCalcs = require("./mapCalcs.js");
const hexMath = require("./hexMath.js");
class Station {
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.template = "MF MF TP HSA";
    this.MPL = false; //Is mars prosper league?
    this.FL = false; //Is frontier legion?
    this.NH = false; //Can it have new horizons?
    this.MFRadius = 3;
    this.MFEfficiency = 4;
    this.TPRadius = 1;
    this.TPBase = 4;
    this.MFcount = 0;
    this.TPcount = 0;
    this.stationHarvest = 1.43;
    this.radius = 4;
    this.multiplier = 1.15;
    this.occupiedSpots = [];
    this.totalRSS = {
        LQ: 0,
        MR: 700,
        GR: 700,
        CR: 700
    }
    this.parseTemplate();
    this.calculateProduction();
  }

  options() {
    if (this.FL) {
      this.stationHarvest += 0.4;
    }
    if (this.NH) {
      this.radius++;
    }
    if (this.MPL) {
      this.TPRadius++;
      this.TPBase = 3.25;
      this.multiplier *= 1.15;
    }
  }

  parseTemplate() {
    let args = this.template.split(" ");
    for (x in args) {
      switch (args[x]) {
        case "MF":
          this.MFcount++;
          break;
        case "TP":
            this.TPcount++;
          break;
        case "HSA":
          break;
      }
    }
  }
  calculateProduction(){
    for(x = 0; x < this.MFcount; x++){
    let harvest = mapCalcs.bestTotalSpots(
        mapCalcs.atFuncs.fieldsAt,
        new hexMath.Coords(this.q, this.r),
        this.MFRadius,
        this.radius,
        5
      );
      console.log(`Found a spot! Its values are: ${harvest[x].MR} metal, ${harvest[x].GR} gas and ${harvest[x].CR} crystal`)
      this.totalRSS.MR += harvest[x].MR*this.MFEfficiency;
      this.totalRSS.GR += harvest[x].GR*this.MFEfficiency;
      this.totalRSS.CR += harvest[x].CR*this.MFEfficiency;
    }
  }
}
 exports.Station = Station;