const ships = [
    {
        name:"corvette",
        time: 3.5,
        metal: 65,
		gas: 39,
		crystal: 26,
        maxReduction: 0.6,
        moonReduction: false,
        costReduction: 0.2,
        note: "Reduced with Royal pilot school + Card + Fleet docks + Policies \n(If you wanna include frontier league, add: f:1 behind the command)\n(For cost reduction from frontier piracy add cr:1 behind the command)"
    }   
    ,
    {
        name:"patrol",
        time: 5,
        metal: 49.5,
		gas: 33,
		crystal: 82.5,
        maxReduction: 0.7,
        moonReduction: false,
        costReduction: 0,
        note: "Reduced with Royal pilot school + Card + Fleet docks + Policies \n(If you wanna include frontier league, add: f:1 behind the command)"
    }
    ,
    {
        name:"scout",
        time: 6.33,
        metal: 58.5,
		gas: 97.5,
	    crystal: 39,
        maxReduction: 0.77,
        moonReduction: false,
        costReduction: 0,
        note: "Reduced with Royal pilot school + Card + Docking bay + Policies"
    },
    {
        name:"industrial",
        time:9,
        metal:130,
        gas:130,
        crystal:130,
        maxReduction: 0.4,
        moonReduction: false,
        costReduction: 0,
        note: "Reduced with Royal pilot school + Card"
    },
    {
        name:"destroyer",
        time:10.5,
        metal:358,
        gas:215,
        crystal:143,
        maxReduction:0.5,
        moonReduction:true,
        costReduction: 0.15,
        note: "Reduced with lvl.10 MIC, lvl.5 HSA near specified moons (If unspecified, then 0%) \n(To calculate with 'Rivet potential', add: cr:1 behind the command)"
    },
    {
        name:"frigate",
        time: 15.5,
        metal: 268.5,
		gas: 179,
		crystal: 447.5,
		maxReduction:0.5,
        moonReduction:true,
        costReduction: 0.15,		
        note: "Reduced with lvl.10 MIC, lvl.5 HSA near specified moons (If unspecified, then 0%) \n(To calculate with 'Rivet potential', add: cr:1 behind the command)"
    },
    {
        name:"recon",
        time: 21,
        metal: 322.5,
		gas: 537.5,
	    crystal: 215,
        maxReduction:0.5,
        moonReduction:true,
        costReduction: 0.15,		
        note: "Reduced with lvl.10 MIC, lvl.5 HSA near specified moons (If unspecified, then 0%) \n(To calculate with 'Rivet potential', add: cr:1 behind the command)"
    },
    {
        name:"gunship",
        time: 42,
        metal: 1072.5,
		gas: 643.5,
		crystal: 429,
		maxReduction:0.5,
        moonReduction:true,
        costReduction: 0.15,		
        note: "Reduced with lvl.10 MIC, lvl.5 HSA near specified moons (If unspecified, then 0%) \n(To calculate with 'Rivet potential', add: cr:1 behind the command)"
    },
    {
        name:"carrier",
        time: 42,
        metal: 2860,
		gas: 1716,
		crystal: 1144,
		maxReduction:0.5,
        moonReduction:true,
        costReduction: 0.15,		
        note: "Reduced with lvl.10 MIC, lvl.5 HSA near specified moons (If unspecified, then 0%) \n(To calculate with 'Astral confluence', add: cr:1 behind the command)"
    },
    {
        name:"dreadnought",
        time: 51,
        metal: 1716,
		gas: 1144,
		crystal: 2860,
		maxReduction:0.5,
        moonReduction:true,
        costReduction: 0.15,		
        note: "Reduced with lvl.10 MIC, lvl.5 HSA near specified moons (If unspecified, then 0%) \n(To calculate with 'Astral confluence', add: cr:1 behind the command)"
    }
    ]
    exports.ships = ships;