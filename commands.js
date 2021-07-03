const Options = require("./options");
const Messages = require("./messages");
const MapCalcs = require("./mapCalcs");
const HexMath = require("./hexMath");
const UnitPlanner = require("./unitPlanner");
const StationPlanner = require("./stationPlanner");
const Config = require("./config");
const Discord = require("discord.js");

function runCommand(command, parsedArgs, message) {
  console.log(parsedArgs);
  if (!(command in commands)) {
    entry = new Messages.Entry(
      {
        text: [
          `
*Parrot searches in his notes*
...
*Parrot throws his tricorne onto the ground angrily*
Cacaaaww!! I don't know this one! (command name: (${command}))
Did you use yerr face to type that command?!?
Where is me rrrum swabbie?

To list available commands type:
    !p help
          `,
        ],
        pages: {
          page: 0,
          limit: 0,
        },
      },
      Messages.textOnly,
      message.channel
    );
    entry.sendMsg();
    return;
  }
  errors = Options.validateOptions(
    parsedArgs,
    commands[command].requiredOptions,
    commands[command].optionalOptions
  );
  if (errors) {
    for (i in errors) {
      entry = new Messages.Entry(
        {
          text: [errors[i]],
          pages: {
            page: 0,
            limit: 0,
          },
        },
        Messages.textNoFormat,
        message.channel
      );
      entry.sendMsg();
    }
    return;
  }
  console.log(parsedArgs);
  entries = commands[command].run(parsedArgs, message);
  for (i in entries) {
    entries[i].sendMsg();
  }
}

commands = {
  help: {
    description:
      "This command provides basic help and detailed help for all commands",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: `!p help "rss"`,
    run: helpRun,
    generateHelpEntries: baseHelp,
  },
  rss: {
    description:
      "This command shows best spots by total Resources from Fields, Planets and Moons within selected radius",
    fullDescription: "",
    requiredOptions: ["r"],
    optionalOptions: ["map", "d", "closest", "e"],
    example: "!p rss r 4",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("rss", channel);
    },
    run: function (validatedArgs, message) {
      return bestSpotCommand(
        message.channel,
        validatedArgs,
        MapCalcs.atFuncs.rssAt,
        {
          title: "resource",
          stuff: "Fields, Planets and Moons",
          map: validatedArgs.map[0],
        },
        Messages.createBestSpotsMsg
      );
    },
  },
  labor: {
    description:
      "This command shows best spots by total Labor from Fields, Planets and Moons within selected radius",
    fullDescription: "",
    requiredOptions: ["r"],
    optionalOptions: ["map", "d", "closest", "e"],
    example: "!p labor r 4",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("labor", channel);
    },
    run: function (validatedArgs, message) {
      return bestSpotCommand(
        message.channel,
        validatedArgs,
        MapCalcs.atFuncs.laborAt,
        {
          title: "labor",
          stuff: "Fields, Planets and Moons",
          map: validatedArgs.map[0],
        },
        Messages.createBestSpotsMsg
      );
    },
  },
  planets: {
    description:
      "This command shows best spots by total Labor from Fields, Planets and Moons within selected radius",
    fullDescription: "",
    requiredOptions: ["r"],
    optionalOptions: ["map", "d", "closest", "e"],
    example: "!p planets r 4",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("planets", channel);
    },
    run: function (validatedArgs, message) {
      return bestSpotCommand(
        message.channel,
        validatedArgs,
        MapCalcs.atFuncs.planetsAt,
        {
          title: "resource",
          stuff: "Planets and Moons",
          map: validatedArgs.map[0],
        },
        Messages.createBestSpotsMsg
      );
    },
  },
  fields: {
    description:
      "This command shows best spots by total Resources from Fields within selected radius",
    fullDescription: "",
    requiredOptions: ["r"],
    optionalOptions: ["map", "d", "closest", "e"],
    example: "!p fields r 3",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("fields", channel);
    },
    run: function (validatedArgs, message) {
      return bestSpotCommand(
        message.channel,
        validatedArgs,
        MapCalcs.atFuncs.fieldsAt,
        {
          title: "resource",
          stuff: "Fields",
          map: validatedArgs.map[0],
        },
        Messages.createBestSpotsMsg
      );
    },
  },
  prospect: {
    description:
      "This command shows best spots by Total Resources from Prospect Inc. Mining Colony with Planet harvest 759% and Fields harvest 250%",
    fullDescription: "",
    requiredOptions: ["r"],
    optionalOptions: ["map", "d", "closest", "e"],
    example: "!p prospect r 4",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("prospect", channel);
    },
    run: function (validatedArgs, message) {
      return bestSpotCommand(
        message.channel,
        validatedArgs,
        MapCalcs.atFuncs.prospectAt,
        {
          title: "resource",
          stuff: "Total Prospect MC rss generation",
          map: validatedArgs.map[0],
        },
        Messages.createBestSpotsMsg
      );
    },
  },
  hsa: {
    description:
      "This command shows best spots by total HSA reduction from Moons (whithin radius 1)",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: ["map", "d", "closest", "e"],
    example: "!p hsa",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("hsa", channel);
    },
    run: function (validatedArgs, message) {
      validatedArgs.r = [1];
      return bestSpotCommand(
        message.channel,
        validatedArgs,
        MapCalcs.atFuncs.hsaAt,
        {
          title: "hsa",
          stuff: "Moons",
          map: validatedArgs.map[0],
        },
        Messages.createBestHsaMsg
      );
    },
  },
  rtime: {
    description:
      "This command is used to calculate return time (ETA) for fleets that are on a movement with known arrival time (ETA)",
    fullDescription: `
This may be useful when one wants to snipe fleets on a movement.
Calculation doesn't by default take into account changes in speed caused by known Star Gate schedule speed bug!!!
If you want to include the SG bug, add the "sg" option.
      `,
    requiredOptions: ["s", "orig", "dest", "t"],
    optionalOptions: ["sg"],
    example: "!p rtime orig 15 -45 dest -34 -65 s 12.5 t 13 45 00",
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("rtime", channel);
    },
    run: function (validatedArgs, message) {
      return calcRtime(validatedArgs, message.channel);
    },
  },
  ships: {
    description:
      "This command calculates ship production and its hourly cost based on moon reduction",
    fullDescription: `
The calculation assumes you have lvl 10 MIC offices and maxed out HSA/CSA
      `,
    requiredOptions: ["shipname"],
    optionalOptions: ["m"],
    example: `!p ships shipname "frigate" m 6`,
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("ships", channel);
    },
    run: function (validatedArgs, message) {
      return calculateShips(validatedArgs, message.channel);
    },
  },
  alarm: {
    description: "This command sets you an alarm with selected time",
    fullDescription: `The time is in GMT (same as in-game), you can set a reminder to remind you that you got attacked, your fleets returned, etc. At the time the alarm "activates" the bot will send you a DM.`,
    requiredOptions: ["t"],
    optionalOptions: ["text"],
    example: `!p alarm t 13 45 00 text "FOB has jumped"`,
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("alarm", channel);
    },
    run: function (validatedArgs, message) {
      return setAlarm(message.author, message.channel, validatedArgs);
    },
  },
  build: {
    description:
      "This command will look at all the ways how to place outposts for station on a specified hex, then output them sorted by rss/labor, with outpost locations.",
    fullDescription: "",
    requiredOptions: ["h"],
    optionalOptions: [
      "map",
      "outposts",
      "m",
      "station",
      "MF",
      "TP",
      "MC",
      "HD",
      "sort",
      "w",
      "e",
    ],
    example: `!p build outposts "MF" "MF" "TP" "HSA" m 3 h 35 -76 MF 3`,
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("build", channel);
    },
    run: function (validatedArgs, message) {
      return stnCommand(message.channel, validatedArgs, {
        stuff: validatedArgs.sort[0],
        map: validatedArgs.map[0],
      });
    },
  },
  stations: {
    description:
      "This command will return a list of the best station spots by rss or labor (if specified), with specifed outposts.",
    fullDescription:
      "The command will try every outpost placement combination within radius of station",
    requiredOptions: [],
    optionalOptions: [
      "map",
      "outposts",
      "m",
      "station",
      "MF",
      "TP",
      "MC",
      "HD",
      "sort",
      "w",
      "closest",
      "d",
      "e",
    ],
    example: `!p stations outposts "MF" "MF" "TP" "HSA" m 3 d 35 -76 50 MF 3`,
    generateHelpEntries: function (channel) {
      return Messages.generateHelpFromDescriptions("stations", channel);
    },
    run: function (validatedArgs, message) {
      return bestStnCommand(message.channel, validatedArgs, {
        stuff: validatedArgs.sort[0],
        map: validatedArgs.map[0],
      });
    },
  },
  map: {
    description:
      "This command is used to set user's default map that is used for the commands.",
    fullDescription: "",
    requiredOptions: [],
    optionalOptions: [],
    example: `!p map "omega"`,
    generateHelpEntries: function (channel) {
      return Messages.mapHelp(channel);
    },
    run: function (validatedArgs, message) {
      return mapCommand(validatedArgs, message);
    },
  },
};

function bestSpotCommand(channel, args, f, textData, msgGenFnc) {
  harvest = MapCalcs.bestTotalSpots(
    f,
    new HexMath.Coords(args.d[0], args.d[1]),
    args.d[2],
    args.e[0],
    {
      radius: args.r[0],
      map: args.map[0],
      closest: args.closest,
    }
  );

  new_entry = new Messages.Entry(
    {
      harvest: harvest,
      radius: args.r[0],
      middle: new HexMath.Coords(args.d[0], args.d[1]),
      maxDistance: args.d[2],
      pages: {
        page: 0,
        limit: Math.ceil(harvest.length / Messages.pageSize.rss),
      },
      maxEntries: harvest.length,
      textData: textData,
    },
    msgGenFnc,
    channel
  );
  return [new_entry];
}

function twoDigitFormat(num) {
  if (num >= 10) {
    return num.toString(10);
  } else {
    return "0" + num.toString(10);
  }
}

function timeSecsToDHMS(timeSecs) {
  let secs = timeSecs % 60;
  let timeMins = Math.floor(timeSecs / 60 + HexMath.eps);
  let mins = timeMins % 60;
  let timeHours = Math.floor(timeMins / 60 + HexMath.eps);
  let hours = timeHours % 24;
  let days = Math.floor(timeHours / 24);
  return { secs: secs, mins: mins, hours: hours, days: days };
}

function DHMSTimeString(time) {
  return `${daysToWhenString(time.days)} at: ${twoDigitFormat(
    time.hours
  )}:${twoDigitFormat(time.mins)}:${twoDigitFormat(time.secs)}`;
}

function DHMSTimeEnumedString(time) {
  if (time.days != 0) {
    return `${time.days} days ${time.hours} h ${time.mins} m ${time.secs} s`;
  } else if (time.hours != 0) {
    return `${time.hours} h ${time.mins} m ${time.secs} s`;
  } else if (time.mins != 0) {
    return `${time.mins} m ${time.secs} s`;
  } else {
    return `${time.secs} s`;
  }
}

function daysToWhenString(days) {
  switch (days) {
    case 0:
      return "today";
    case 1:
      return "tomorrow";
    default:
      return `in ${days} days`;
  }
}

function calcRtime(args, channel) {
  let origin = new HexMath.Coords(args.orig[0], args.orig[1]);
  let destination = new HexMath.Coords(args.dest[0], args.dest[1]);
  let speed = args.s[0];
  let impactTimeSeconds = args.t[2] + 60 * args.t[1] + 3600 * args.t[0];
  let distance = HexMath.distance(origin, destination);
  let travelTimeSeconds = Math.floor((distance * 3600) / speed + HexMath.eps);
  let travelTime = timeSecsToDHMS(travelTimeSeconds);
  let returnTimeSeconds = impactTimeSeconds + travelTimeSeconds;
  let returnTime = timeSecsToDHMS(returnTimeSeconds);
  let msg = `
Fleets at movement
from hex: ${origin.gotoCoords()}
to hex: ${destination.gotoCoords()}
with speed: ${speed}
with impact time: ${DHMSTimeString(timeSecsToDHMS(impactTimeSeconds))}
travel time: ${DHMSTimeEnumedString(travelTime)}
will return ${DHMSTimeString(returnTime)}`;

  if ("sg" in args && args.sg.length >= 1) {
    let travelTimeSecondsWithSGBug = Math.floor(
      (distance * 3600) / (speed + args.sg[0]) + hexMath.eps
    );
    let travelTimeWithSGBug = timeSecsToDHMS(travelTimeSecondsWithSGBug);
    let returnTimeSecondsWithSGBug =
      impactTimeSeconds + travelTimeSecondsWithSGBug;
    let returnTimeWithSGBug = timeSecsToDHMS(returnTimeSecondsWithSGBug);
    msg += `
  
If the movement is scheduled and SG bug active, the times are rather:  
travel time: ${DHMSTimeEnumedString(travelTimeWithSGBug)}
return ETA: ${DHMSTimeString(returnTimeWithSGBug)}`;
  }

  return [
    new Messages.Entry(
      { text: [msg], pages: { page: 0, limit: 0 } },
      Messages.textOnly,
      channel
    ),
  ];
}

function calculateShips(args, channel) {
  let ship = UnitPlanner.ships[args.shipname[0]];
  let shipsPerHour = (60 / (ship.time * (1 - ship.maxReduction))).toFixed(1);
  if (ship.moonReduction == true) {
    //console.log(typeof(args.m[0]));
    shipsPerHour = (
      60 /
      (ship.time * (1 - ship.maxReduction - args.m[0] * 0.05))
    ).toFixed(1);
  }
  let rssPerHour = {
    crystal: shipsPerHour * ship.crystal,
    gas: shipsPerHour * ship.gas,
    metal: shipsPerHour * ship.metal,
  };
  let shipProduction = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      "Ship production: " + shipsPerHour + " " + ship.name + " per hour."
    )
    .setDescription(ship.note)
    .addFields(
      {
        name: "Metal usage",
        value: Math.floor(rssPerHour.metal),
        inline: true,
      },
      { name: "Gas usage", value: Math.floor(rssPerHour.gas), inline: true },
      {
        name: "Crystal usage",
        value: Math.floor(rssPerHour.crystal),
        inline: true,
      }
    )
    .setTimestamp();
  return [
    new Messages.Entry(
      {
        text: [shipProduction],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.textNoFormat,
      channel
    ),
  ];
}

function setAlarm(user, channel, args) {
  time = { days: 0, hours: args.t[0], mins: args.t[1], secs: args.t[2] };
  message = `
Alarrrrm! Alarrrrrmm!!!
    ${args.text[0]}`;
  let currentTime = Math.floor(Date.now() / 1000) % 86400;
  let convertedTime = time.hours * 3600 + time.mins * 60 + time.secs;
  if (convertedTime < currentTime) {
    convertedTime += 86400;
    time.days = 1;
  }
  let remainingTime = convertedTime - (Math.floor(Date.now() / 1000) % 86400);
  setTimeout(() => {
    user.send(`${message}`);
  }, remainingTime * 1000);
  return [
    new Messages.Entry(
      {
        text: [
          `New alarm for user: ${user.username} at: ${DHMSTimeString(
            time
          )} GMT`,
        ],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.textOnly,
      channel
    ),
  ];
}

function stnCommand(channel, args, textData) {
  let possibilities = StationPlanner.calculateStn(args);
  new_entry = new Messages.Entry(
    {
      possibilities: possibilities,
      middle: new HexMath.Coords(args.h[0], args.h[1]),
      pages: {
        page: 0,
        limit: Math.ceil(possibilities.length / Messages.pageSize.stn),
      },
      maxEntries: possibilities.length,
      textData: textData,
    },
    Messages.createStationMessage,
    channel
  );
  return [new_entry];
}

function bestStnCommand(channel, args, textData) {
  harvest = MapCalcs.bestTotalSpots(
    StationPlanner.stnAt,
    new HexMath.Coords(args.d[0], args.d[1]),
    args.d[2],
    args.e[0],
    args
  );
  new_entry = new Messages.Entry(
    {
      harvest: harvest,
      middle: new HexMath.Coords(args.d[0], args.d[1]),
      maxDistance: args.d[2],
      pages: {
        page: 0,
        limit: Math.ceil(harvest.length / Messages.pageSize.rss),
      },
      maxEntries: harvest.length,
      textData: textData,
    },
    Messages.createBestStnMsg,
    channel
  );
  return [new_entry];
}

function mapCommand(args, message) {
  entries = [];
  if (args.base.length < 1 || !(args.base[0] in MapCalcs.maps)) {
    entries.push(
      new Messages.Entry(
        {
          text: ["Available maps are: " + MapCalcs.availableMaps()],
          pages: {
            page: 0,
            limit: 1,
          },
        },
        Messages.textOnly,
        message.channel
      )
    );
  } else {
    Config.editUserData(message.author, { map: args.base });
  }
  entries.push(
    new Messages.Entry(
      {
        text: [
          "Current selected map for user: " +
            message.author.username +
            " is: " +
            Config.getConfig(message.author).map[0],
        ],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.textOnly,
      message.channel
    )
  );
  return entries;
}

function helpRun(validatedArgs, message) {
  if (validatedArgs.base.length == 0) {
    return commands["help"].generateHelpEntries(message.channel);
  } else if (!(validatedArgs.base[0] in commands)) {
    return [
      new Messages.Entry(
        {
          text: [
            `
*Parrot searches in his notes*
...
*Parrot throws his tricorne onto the ground angrily*
Cacaaaww!! I don't know this one! (command name: ${validatedArgs.base[0]})
Did you use yerr face to type that command?!?
Where is me rrrum swabbie?
  
To list available commands type:
    !p help
            `,
          ],
          pages: {
            page: 0,
            limit: 1,
          },
        },
        Messages.textOnly,
        message.channel
      ),
    ];
  } else if (!("generateHelpEntries" in commands[validatedArgs.base[0]])) {
    return [
      new Messages.Entry(
        {
          text: [
            `
*Parrot starts to look around looking very confused*
...
What the scally sea bass! The stoopid pirrates didn't give me manual for this one!
Call for help swabbie!!
*Swabbie rings the bell*
<@306470357659811840> <@306470357659811840> <@306470357659811840> <@306470357659811840>
...
Once more swabbie!
<@306470357659811840>
Perrrfect!
  
The help for this command hasn't been added yet probably
             `,
          ],
          pages: {
            page: 0,
            limit: 1,
          },
        },
        Messages.textNoFormat,
        message.channel
      ),
    ];
  } else {
    return commands[validatedArgs.base[0]].generateHelpEntries(message.channel);
  }
}

function baseHelp(channel) {
  let entries = [];
  entries.push(
    new Messages.Entry(
      {
        text: [
          `
Yo, I am a Starborne helper bot developed by feazeyu#9566 and Chobochobo#6702.
This project is in early development, the bot may be unstable.
             
Use "!p" prefix to type commands, for example:
    !p hsa
              
current supported commands are:
    `,
        ],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.textOnly,
      channel
    )
  );

  for (command in commands) {
    entries.push(
      new Messages.Entry(
        {
          text: ["    " + command + ": " + commands[command].description],
          pages: {
            page: 0,
            limit: 1,
          },
        },
        Messages.textOnly,
        channel
      )
    );
  }

  entries.push(
    new Messages.Entry(
      {
        text: `
Each command has required and optional options. To add options to a command simply add options and their values after the command separated by spaces.
Example of command "rss" with options "r" and "d", both of the options have arguments specifying their value. Option "r" has 1 argument "4", "d" has 3 arguments: "10", "10", "10":
    !p rss r 4 d 10 10 10
or
    !p rss d 10 10 10 r 4
  
In this case "r 4" means search for radius 4 and "d 10 10 10" means search only around hex [10, 10] within distance 10.
            
Any unknown options are ignored as well as extra option arguments
            
For further help about a command type:
    !p help command
            `,
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.textOnly,
      channel
    )
  );
  entries.push(
    new Messages.Entry(
      {
        text: [
          `
Usage of help command:
                    
    !p help
for basic help
            
    !p help <command>
for detailed help about <command>
                    
<command> shall be valid command (that can be listed by "!p help")
<command> is passed as string and shall be surrounded by commas ""
Example:
    !p help "rss"
            `,
        ],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      Messages.textOnly,
      channel
    )
  );
  return entries;
}

exports.runCommand = runCommand;
exports.commands = commands;
