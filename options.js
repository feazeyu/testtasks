unknownOptionError = function (optionName) {
  return "```Crrrocaaaww I don't know the option " + optionName + " !```";
};
function tooBigRadiusError(radius) {
  return (
    "```Radius " +
    radius +
    "?! I can do up to 10. Not like I couldn't calculate it, I'm a smarrt pirrate parrot afterr all! But I'm lazy!```"
  );
}
const mapCalcs = require("./mapCalcs");
const unitPlanner = require("./unitPlanner");
const stationPlanner = require("./stationPlanner");

argTypeCheck = {
  str: function (arg) {
    if (arg == undefined) {
      throw "arg is undefined!";
    }
    return;
  },
  int: function (arg) {
    float = parseFloat(arg);
    if (isNaN(float)) {
      throw "arg is not a number!";
    }
    if (float == Math.floor(float)) {
      return;
    } else {
      throw "arg is not int!";
    }
  },
  float: function (arg) {
    float = parseFloat(arg);
    if (isNaN(float)) {
      throw "arg is not a number!";
    }
    return;
  },
  uint: function (arg) {
    float = parseFloat(arg);
    if (isNaN(float)) {
      throw "arg is not a number!";
    }
    if (float == Math.floor(float) && float > 0) {
      return;
    } else {
      throw "arg is not int > 0!";
    }
  },
  ufloat: function (arg) {
    float = parseFloat(arg);
    if (isNaN(float)) {
      throw "arg is not a number!";
    }
    if (float > 0) {
      return;
    } else {
      throw "arg is not float > 0!";
    }
  },
};

options = {
  base: {
    description: "This option has specific uses for each command.",
    fullDescription: "Arguments right after command name are stored here.",
    argumentTypes: [[]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  r: {
    description: "This option sets the radius of the command",
    fullDescription: `
    Usage:
    r <radius>
    
    Where <radius> is the selected radius whithin which the command calculates rss.
    <radius> shall be positive integer less or equal to 10.
    
    Example:
    r 4
    `,
    argumentTypes: [["uint"]],
    validator: function (args) {
      if (args.r[0] > 10) {
        return tooBigRadiusError(args.r[0]);
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  d: {
    description:
      "This option is used to restrict search area to a specific place",
    fullDescription: `
    The command shall search for the results only within specified distance around specified (central) hex
    
    Usage:
    d <x> <y> <max_distance>:
    The option filters the results only to those with distance up to <max_distance> from the hex <x> <y>
    
    The <x> <y> shall be integers
    The <max_distance> shall be positive integer.
    <max_distance> shall not exceed double the radius of selected map
    
    Default values:
    0 0 <map_radius>
    
    Example:
    d 5 -56 20
    `,
    argumentTypes: [
      ["int", "int", "uint"],
    ],
    validator: function (args) {
      if (args.d[2] >= 2 * mapCalcs.maps[args.map[0]].MapRadius) {
        return "```The sea is not that big matey!```";
      }
    },
    setDefaults: function (args) {
      if (!("d" in args) || args.d.length < 2) {
        args.d = [0, 0, mapCalcs.maps[args.map[0]].MapRadius];
      }
      if (args.d.length == 2) {
        args.d.push(mapCalcs.maps[args.map[0]].MapRadius);
      }
    },
  },
  closest: {
    description: "Adding this option will sort results by distance.",
    fullDescription: `
    Usage:

    closest
    `,
    argumentTypes: [[]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  e: {
    description:
      "This option is used to set the number of entries (top results) displayed.",
    fullDescription: `
    Usage:
    e <entries>
    
    Parrot will list only top <entries> results.
    <entries> shall be a positive integer (of any size).

    Default values:
    e 50

    Example:
    e 300
    `,
    argumentTypes: [["uint"]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      if (!("e" in args) || args.e.length == 0) {
        args.e = [50];
      }
    },
  },
  s: {
    description: "This option sets the speed of the tracked movement.",
    fullDescription: `
    Usage:
    s <speed>
    
    Sets the speed of the movement to <speed>.
    <speed> shall be a positive number.
    
    Example:
    s 11.5
    `,
    argumentTypes: [["ufloat"]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  orig: {
    description: "This option sets the origin hex of the movement.",
    fullDescription: `
    Usage:
    orig <x> <y>
    
    <x>, <y> represent the coordinates of the origin hex.
    <x> and <y> shall be integers.
    
    Example:
    orig 15 -43
    `,
    argumentTypes: [["int", "int"]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  dest: {
    description: "This option sets the destination hex of the movement.",
    fullDescription: `
    Usage:
    orig <x> <y>
    
    <x>, <y> represent the coordinates of the destination hex.
    <x> and <y> shall be integers.
    
    Example:
    orig 15 -43
    `,
    argumentTypes: [["int", "int"]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  t: {
    description: "This option is used to pass time in format hh:mm:ss",
    fullDescription: `
    For command rtime this time corresponds to impact time.
    
    Usage:
    t <hours> <mins> <secs>
    
    The arguments represent time in format <hours>:<mins>:<secs>.
    <hours>, <mins>, <secs> shall be valid integers,
    
    Example: (corresponds to 12:34:45)
    t 12 34 45

    NOTE: This option doesn't support date (or at least not yet, for simplicity), but Starborne doesn't as well.
    `,
    argumentTypes: [["int", "int", "int"]],
    validator: function (args) {
      if (args.t[2] >= 60 || args.t[2] < 0 || args.t[1] >= 60 || args.t[1] < 0 || args.t[0] >= 24 || args.t[0] < 0) {
        return "```Wrrong time forrmat!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  sg: {
    description: "This option enabled taking into account Star Gate bug",
    fullDescription: `
    The Star Gate Bug involves speeding up fleets on their way back while scheduled.
    If one schedules a movement, then they will have their SG bonus counted twice on the reeturn movement.
    This option sets the SG speed bonus to calculate an additional ETA if the movement has been scheduled.
    
    Usage:
    sg <speed_bonus>
    
    <speed_bonus> is the SG speed bonus.
    <speed_bonus> shall be a positive number
    
    Example:
    sg 7
    `,
    argumentTypes: [["ufloat"]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  shipname: {
    description: "This option is used to select ship type.",
    fullDescription: `
    Usage:
    shipname <ship_name>
    
    <ship_name> shall be lowercase and singular ship name same as in-game.
    <ship_name> is passed as a string argument and shall be surounded by commas "".
    
    Example:
    shipname "frigate"
    `,
    argumentTypes: [["str"]],
    validator: function (args) {
      if (!(args.shipname[0] in unitPlanner.ships)) {
        return "````Did yo just a new ship type?! Lemme know!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  m: {
    description: "This option is used to describe moon reduction for HSA/CSA.",
    fullDescription: `
    For stations and build commands the results are filtered to stations with moon reduction at least <moon_reduction>.
    For ships command the results take into account <moon_reduction> in the calculations
    
    Usage:
    m <moon_reduction>
    
    <moon_reduction> shall be a non-negative integer less or equal to 8.
    
    Example:
    m 6

    Default values:
    m 0
    `,
    argumentTypes: [["int"]],
    validator: function (args) {
      if (args.m[0] < 0 || args.m[0] > 8) {
        return "```Invalid moon rrreduction!```";
      }
    },
    setDefaults: function (args) {
      if (!("m" in args || args.m.length < 1)) {
        args.m = [0];
      }
    },
  },
  outposts: {
    description: "This option describes outposts built at a station",
    fullDescription: `
    The command searches for best spots for selected outposts within station radius
    
    Usage:
    outposts <outpost> <outpost> ...
    
    <outpost> has to be a valid outpost. Valid outposts:
    
    "MF" "TP" "MC" "HD" "CSA" "HSA"

    <outpost> is passed as a string argument and shall be surrounded by commas "".
    Up to 5 outposts are allowed for a station.
    
    Example:
    outposts "MF" "MF" "TP" "HSA"
    
    NOTE: Forts and missile batteries are not supported yet.
    `,
    argumentTypes: [
      ["str", "str", "str", "str", "str"],
      ["str", "str", "str", "str"],
      ["str", "str", "str"],
      ["str", "str"],
      ["str"],
      [],
    ],
    validator: function (args) {
      for (i in args.outposts) {
        if (!(stationPlanner.validOutposts.includes(args.outposts[i]))) {
          return "```" + args.outposts[i] + "is not a valid outpost!```";
        }
      }
      if (args.outposts.length > 5) {
        return "```You won't fit that many outposts, or will ya?!```";
      }
    },
    setDefaults: function (args) {
      if (!args.outposts) {
        args.outposts = [];
      }
    },
  },
  station: {
    description: "Sets the radius of station and its harverest rate.",
    fullDescription: `
    Usage:
    station <radius> <harvest_rate>
    
    <radius> is radius of the station.
    <radius> shall be positive integer less or equal to 5 (for the NH org)
    <harvest_rate> is harvest rate of the station in %.
    <harvest_rate> shall be a positive number.
    
    Example: (for station with NH and harvest rate 143%)
    station 5 143
    
    Default values:
    station 4 73 (station hall only)

    NOTE: command "stns" places outposts in radius of station, which can be set by this option
    `,
    argumentTypes: [["uint", "ufloat"], ["uint"]],
    validator: function (args) {
      if (args.station[0] > 5) {
        return "```I bet you won't build such big station pal!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  MF: {
    description:
      "Sets the radius of mining facilities and their harverest rate.",
    fullDescription: `
    Usage:
    MF <radius> <harvest_rate>
    
    <radius> is radius of mining facilities.
    <radius> shall be positive integer less or equal to 3 (for the double repair drones)
    <harvest_rate> is harvest rate of mining facilities in %.
    <harvest_rate> shall be a positive number.
    
    Example: (for radius 3 MFs and harvest rate 400%)
    MF 3 400

    Default values:
    MF 1 450 (frachead + augment)
    `,
    argumentTypes: [["uint", "ufloat"], ["uint"]],
    validator: function (args) {
      if (args.MF[0] > 5) {
        return "```I bet yerr mining facility cannot get that big you drrunk pirrates!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  TP: {
    description: "Sets the radius of trading ports and their harverest rate.",
    fullDescription: `
    Usage:
    TP <radius> <harvest_rate>
    
    <radius> is radius of trading ports.
    <radius> shall be positive integer less or equal to 2 (for MPL)
    <harvest_rate> is harvest rate of trading ports in %.
    <harvest_rate> shall be a positive number.
    
    Example: (for radius 2 TP's and harvest rate 265%)
    TP 2 365

    Default values:
    TP 1 400 (augment)
    `,
    argumentTypes: [["uint", "ufloat"], ["uint"]],
    validator: function (args) {
      if (args.TP[0] > 2) {
        return "```I bet yerr trading ports cannot get that big you drrunk pirrates!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  MC: {
    description: "Sets the radius of mining colony and its harverest rate.",
    fullDescription: `
    Usage:
    MC <radius> <harvest_rate>
    
    <radius> is radius of the mining colonoy.
    <radius> shall be positive integer less or equal to 4 (for double rss silos)
    <harvest_rate> is (planet) harvest rate of mining colony in %.
    <harvest_rate> shall be a positive number.
    
    Example: (for radius 4 MC and harvest rate 789%)
    MC 4 789

    Default values:
    MC 2 690 (augment + colo relay)
    `,
    argumentTypes: [["uint", "ufloat"], ["uint"]],
    validator: function (args) {
      if (args.MC[0] > 4) {
        return "```I bet yerr mining colony cannot get that big you drrunk pirrates!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  HD: {
    description: "Sets the radius of habitation dome and its harverest rate.",
    fullDescription: `
    Usage:
    HD <radius> <harvest_rate>
    
    <radius> is radius of the habitation dome.
    <radius> shall be positive integer less or equal to 4 (for double filtration)
    <harvest_rate> is harvest rate of habitation dome in %.
    <harvest_rate> shall be a positive number.
    
    Example: (for radius 4 HD and harvest rate 650%)
    HD 4 650

    Default values:
    HD 2 650 (augment + pub transport)
    `,
    argumentTypes: [["uint", "ufloat"], ["uint"]],
    validator: function (args) {
      if (args.MC[0] > 4) {
        return "```I bet yerr hab dome cannot get that big you drrunk pirrates!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  sort: {
    description: "Select sorting results by labor or rss",
    fullDescription: `
    Usage:
    sort <sort_type>
    
    <sort_type> is either "rss" or "labor"
    <sort_type> is passed as a string argument and shall be surrounded by commas "".

    Example:
    sort "labor"

    Default values:
    sort "rss"

    NOTE: This option doesn't have any effect when combined with "w" option.
    `,
    argumentTypes: [["str"]],
    validator: function (args) {
      if (args.sort[0] != "rss" && args.sort[0] != "labor") {
        return "````Valid sorrting is only by 'rss' or 'labor' (orr using 'w' as weight sorrting)! ```";
      }
    },
    setDefaults: function (args) {
      if (!args.sort || !args.sort[0]) {
        args.sort = ["rss"];
      }
    },
  },
  w: {
    description:
      "An advanced sorting weighting each of rss and labor by selected weights",
    fullDescription: `
    The values of Metal, Gas, Crystal and Labor are each multiplied by selected weights, then summed up as 'total'.
    The results are sorted by 'total'. If this option is selected, option "sort" doesn't have any effect.
    
    Usage:
    w <metal_weight> <gas_weight> <crystal_weight> <labor_weight>

    <metal_weight>, <gas_weight>, <crystal_weight> and <labor_weight> shall be numbers

    Example:
    w 1 0.5 1 0

    Default values:
    w 0 0 0 0
    `,
    argumentTypes: [
      ["float", "float", "float", "float"],
      ["float", "float", "float"],
    ],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      if (args.w) {
        while (args.w.length < 4) {
          args.w.push(0);
        }
      }
    },
  },
  h: {
    description: "This option selects hex at which the build is evaluated",
    fullDescription: `
    Usage:
    h <x> <y>
    
    <x> <y> are coordinates of the hex
    <x>, <y> shall be integers
    
    Example:
    h 35 -15`,
    argumentTypes: [["int", "int"]],
    validator: function (args) {
      return;
    },
    setDefaults: function (args) {
      return;
    },
  },
  map: {
    description: "Determines the map in which the search is executed",
    fullDescription: `
    Usage:
    map <map_name>
    
    <map_name> shall be valid map listed by command "!p map", <map_name> is passed as a string and shall se surrounded by commas "".
    Default value of <map_name> is set by the command "!p map". It is recommended to use the "!p map" command instead of this option
    
    Example:
    map "omega"
    `,
    argumentTypes: [["str"]],
    validator: function (args) {
      if (!(args.map[0] in mapCalcs.maps)) {
        return "```Invalid map scrrrew it!```";
      }
    },
    setDefaults: function (args) {
      return;
    },
  },
  text: {
    description: "The alarm text",
    fullDescription: `
    Usage:
    text <alarm_text>
    
    <alarm_text> is passed as a string and shall se surrounded by commas "".
    
    Example:
    text "Wake up, your TC is ready for another run you scumbag!"
    `,
    argumentTypes: [["str"]],
    validator: function(args){
      return;
    },
    setDefaults: function (args) {
      if(!("text" in args)){
        args.text = ["No text selected"];
      };
    },
  },
  id: {
    description: "User's id that is target of a command",
    fullDescription: `
    Usage:
    id <user_id>

    <user_id> shall be valid positive integer.

    Example:
    id 306470357659811840

    `,
    argumentTypes: [["uint"]],
    validator: function(args){
      return;
    },
    setDefaults: function(args){
      return;
    },
  },
  mention: {
    description: "mention of a user that is target of a command",
    fullDescription: `
    Usage:
    mention "<@user>"

    <@user> shall be valid user mention.
    <@user> is passed as a string and shall be surrounded by commas "".

    Example:
    mention "@Chobochobo"

    `,
    argumentTypes: [["str"]],
    validator: function(args){
      return;
    },
    setDefaults: function(args){
      return;
    },
  }
};

function fitArgsTypes(args, argTypes) {
  for (i in argTypes) {
    argTypeCheck[argTypes[i]](args[i]); //throws error whenever type of args[i] doesn't match argTypes[i]
  }
}

function badArgumentsError(option, args) {
  err =
    "```" +
    `
arguments for option ${option}:
    `;
  for (i in args) {
    err += `${args[i]}, `;
  }
  err += `
didn't match any of those types:\n`;
  for (i in options[option].argumentTypes) {
    possibleArgTypes = options[option].argumentTypes[i];
    err += "\t" + possibleArgTypes.join(", ") + "\n";
  }
  return err + "```";
}

function validateOptionArgumentTypes(option, args) {
  if (!(option in options)) {
    return unknownOptionError(option);
  }
  for (i in options[option].argumentTypes) {
    try {
      fitArgsTypes(args, options[option].argumentTypes[i]);
      return;
    } catch (error) {
      console.log(error);
    }
  }
  return badArgumentsError(option, args);
}

function validateOptions(parsedArgs, requiredOptions, optionalOptions) {
  for (keyword in parsedArgs) {
    if (!(keyword in options)) {
      return [unknownOptionError(keyword)];
    }
  }
  for (keyword in parsedArgs) {
    err = validateOptionArgumentTypes(keyword, parsedArgs[keyword]);
    if (err) {
      return [err, "```" + options[keyword].fullDescription + "```"];
    }
  }
  for (keyword in parsedArgs) {
    err = options[keyword].validator(parsedArgs);
    if (err) {
      return [err, "```" + options[keyword].fullDescription + "```"];
    }
  }
  for (i in requiredOptions){
    keyword = requiredOptions[i];
    if(!(keyword in parsedArgs)){
      return ["```Oh, pirrate you forrgot some rrequirred options!```", "```" + options[keyword].fullDescription + "```"];
    }
    options[keyword].setDefaults(parsedArgs);
  }
  for (i in optionalOptions){
    keyword = optionalOptions[i];
    options[keyword].setDefaults(parsedArgs);
  }
  for (keyword in parsedArgs) {
    err = validateOptionArgumentTypes(keyword, parsedArgs[keyword]);
    if (err) {
      return [err, "```" + options[keyword].fullDescription + "```"];
    }
  }
  for (keyword in parsedArgs) {
    err = options[keyword].validator(parsedArgs);
    if (err) {
      return [err, "```" + options[keyword].fullDescription + "```"];
    }
  }
}

exports.validateOptions = validateOptions;
exports.options = options;
