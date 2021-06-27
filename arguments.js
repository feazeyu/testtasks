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

optionArgumentTypes = {
  base: [[]],
  r: [["uint"]],
  d: [
    ["int", "int", "uint"],
    ["int", "int"],
  ],
  closest: [[]],
  e: [["uint"]],
  s: [["ufloat"]],
  orig: [["int", "int"]],
  dest: [["int", "int"]],
  t: [["uint", "uint", "uint"]],
  sg: [["ufloat"]],
  shipname: [["str"]],
  m: [["uint"]],
  outposts: [
    ["str", "str", "str", "str", "str"],
    ["str", "str", "str", "str"],
    ["str", "str", "str"],
    ["str", "str"],
    ["str"],
    [],
  ],
  station: [["uint", "ufloat"], ["uint"]],
  MF: [["uint", "ufloat"], ["uint"]],
  TP: [["uint", "ufloat"], ["uint"]],
  MC: [["uint", "ufloat"], ["uint"]],
  HD: [["uint", "ufloat"], ["uint"]],
  sort: [["str"]],
  w: [
    ["float", "float", "float", "float"],
    ["float", "float", "float"],
  ],
  h: [["int", "int"]],
  map: [["str"], []],
};

optionArgumentBounds = {
  map: function (args) {
    if (!(args.map[0] in mapCalcs.maps)) {
      return "```Invalid map scrrrew it!```";
    }
  },
  r: function (args) {
    if (args.r[0] > 10) {
      return tooBigRadiusError(args.r[0]);
    }
  },
  d: function (args) {
    if (args.d[2] >= 2 * mapCalcs.maps[args.map[0]].MapRadius) {
      return "```The sea is not that big matey!```";
    }
  },
  t: function (args) {
    if (
      args.t[2] < 0 ||
      args.t[2] >= 60 ||
      args.t[1] < 0 ||
      args.t[1] >= 60 ||
      args.t[0] < 0 ||
      args.t[0] >= 24
    ) {
      return "```Wrrong time forrmat!```";
    }
  },
  sort: function (args) {
    if (args.sort[0] != "rss" && args.sort[0] != "labor") {
      return "````Valid sorting is only by 'rss' or 'labor' (or using 'w' as weight sorting)! ```";
    }
  },
  m: function (args){
      if(args.m[0] > 8){
          return "```Such high moon reduction?! Arr you drunk pirrrate or arr the Starborne developarrs stoned again?!```";
      }
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
    err += `${args}, `;
  }
  err += `
    didn't match any of those types:`;
  for (possibleArgTypes in optionArgumentTypes(option)) {
    err += possibleArgTypes.join(", ") + "\n";
  }
  return err + "```";
}

function validateOptionArgumentTypes(option, args) {
  if (!(option in optionArgumentTypes)) {
    throw unknownOptionError(option);
  }
  for (possibleArgTypes in optionArgumentTypes(option)) {
    try {
      fitArgsTypes(args, possibleArgTypes);
      return;
    } catch (error) {
      console.log(error);
    }
  }
  return badArgumentsError(option, args);
}

function validateOptions(parsedArgs) {
  for (keyword in parsedArgs) {
    err = validateOptionArgumentTypes(keyword, parseArgs[keyword]);
    if (err) {
      return err;
    }
  }
}
