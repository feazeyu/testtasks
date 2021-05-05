const commands = ["help", "rss", "labor", "planets", "fields", "hsa", "rtime"];

function help(command) {
  if (!commands.includes(command)) {
    return `Command ${command} doesn't exist`;
  }
  switch (command) {
    case "help":
      return baseHelp();
    case "rss":
      return rsshelp(
        "This command shows best spots by total Resources from Fields, Planets and Moons whithin selected radius"
      );
    case "labor":
      return rsshelp(
        "This command shows best spots by total Labor from Fields, Planets and Moons whithin selected radius"
      );
    case "planets":
      return rsshelp(
        "This command shows best spots by total Resources from Planets and Moons whithin selected radius"
      );
    case "fields":
      return rsshelp(
        "This command shows best spots by total Resources from Fields whithin selected radius"
      );
    case "hsa":
      return hsaHelp();
    case "rtime":
      return rtimeHelp();
    default:
      return `Help for command "${command}" hasn't been added yet, please contact feazeyu#9566 or Chobochobo#6702 for further help`;
  }
}

function baseHelp() {
  let msg = `Yo, I am a Starborne helper bot developed by feazeyu#9566 and Chobochobo#6702.
This project is in early development, the bot may be unstable. The bot is currently hosted on Chobo's PC, if the bot is offline due to crash or whatever other reason, contact developers.
    
Use "!p" prefix to type commands, for example:
    !p hsa
    
current supported commands are:
`;

  for (i in commands) {
    msg += "\n    " + commands[i];
  }

  msg += `

Each command has required and optional arguments. To add arguments to a command simply add arguments and their values after the command separated by spaces.
Example of command "rss" with arguments "r 4" and "d 10 10 10":
    !p rss r 4 d 10 10 10
or
    !p rss d 10 10 10 r 4

Any unknown arguments are ignored as well as extra values of the arguments

For further help about a command type:
!p help command
`;

  return msg;
}

function rsshelp(text) {
  let msg = text;
  msg += `

required arguments are:
    r:  radius

        radius: selects radius around a hex in which the resources are calculated

optional arguments are:
    d:  hex_x hex_y max_distance

        hex_x, hex_y: selects coordinates of a hex [hex_x, hex_y]. All distances are calculated in respect to the hex.
        max_distance: The command will show only hexes that have distance at most max_distance from [hex_x, hex_y]

        default values:
            d 0 0 map_radius

    e: entries

        entries: selects the number of top hexes shown

        default values:
            e 50

`;

  return msg;
}

function hsaHelp() {
  let msg = `
This command shows best spots by total HSA reduction from Moons whithin radius 1

required arguments are:
    none

optional arguments are:
    d:  hex_x hex_y max_distance

        hex_x, hex_y: selects coordinates of a hex [hex_x, hex_y]. All distances are calculated in respect to the hex.
        max_distance: The command will show only hexes that have distance at most max_distance from [hex_x, hex_y]

        default values:
            d 0 0 map_radius

    e: entries

        entries: selects the number of top hexes shown

        default values:
            e 50

`;

  return msg;
}

function rtimeHelp() {
  let msg = `
This command is used to calculate return time (ETA) for fleets that are on a movement with known arrival time (ETA)
This may be useful when one wants to snipe fleets on a movement

Calculation don't take into account changes in speed caused by known Star Gate schedule speed bug!!!

required arguments are:
    s: speed
    
        speed of a movement, this can be found in Movements (M) tab in-game
        
    o: origin_x origin_y
    
        [origin_x, origin_y] are coordinates of origin hex of the movement
        
    d: dest_x dest_y
    
        [dest_x, dest_y] are coordinates of destionation of the movement
        
    t: hours mins secs
    
        impact time (ETA) in format hours:mins:secs, for example:
        ETA 16:25:08 -> t 16 25 08
        
optional arguments are:
    none
    
`;

  return msg;
}

exports.help = help;
