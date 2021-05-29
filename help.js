const commands = [
  "help",
  "rss",
  "labor",
  "planets",
  "fields",
  "hsa",
  "rtime",
  "prospect",
  "ships",
  "stns",
  "stn"
];

function help(command) {
  if (!commands.includes(command)) {
    return `Command ${command} doesn't exist`;
  }
  switch (command) {
    case "help":
      return baseHelp();
    case "rss":
      return rsshelp(
        "This command shows best spots by total Resources from Fields, Planets and Moons within selected radius"
      );
    case "labor":
      return rsshelp(
        "This command shows best spots by total Labor from Fields, Planets and Moons within selected radius"
      );
    case "planets":
      return rsshelp(
        "This command shows best spots by total Resources from Planets and Moons within selected radius"
      );
    case "fields":
      return rsshelp(
        "This command shows best spots by total Resources from Fields within selected radius"
      );
    case "hsa":
      return hsaHelp();
    case "rtime":
      return rtimeHelp();
    case "prospect":
      return rsshelp(
        "This command shows best spots by Total Resources from Prospect Inc. Mining Colony with Planet harvest 600% and Fields harvest 250%"
      );
    case "ships":
      return shipshelp(
        "This command shows you how much ships will you make with a maxed out HSA and lvl.10 MIC offices near m moons."
      )
    case "stn" :
      return stnHelp();
    case "stns":
      return stnsHelp();
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

example command: !p 
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

Calculation doesn't take into account changes in speed caused by known Star Gate schedule speed bug!!!

required arguments are:
    s: speed
    
        speed of a movement, this can be found in Movements (M) tab in-game
        
    o: origin_x origin_y
    
        [origin_x, origin_y] are coordinates of origin hex of the movement
        
    d: dest_x dest_y
    
        [dest_x, dest_y] are coordinates of destination of the movement
        
    t: hours mins secs
    
        impact time (ETA) in format hours:mins:secs, for example:
        ETA 16:25:08 -> t 16 25 08
        
optional arguments are:
    
    sg: speed_boost

        speed_boost is a star gate speed bonus of the movement that is calculated an additional time as in the SG speed bug
    
    
`;

  return msg;
}
function shipshelp(){
  let msg = `
    Usage: !p ships <shipname> [m <moonvalue>]

    required arguments are:
    shipname: 

      Name of the ship you are making, just like it is ingame
    
    optional arguments are:

      m: The amount of moon points your hsa has around it, Small moon=1, Normal moon=2 Large moon=3 etc.

  `
  return msg;
}

function stnsHelp(){
 let msg = `
  This command will return a list of the best station spots resource wise, with specifed outposts.
  This is one hell of a command, so brace for a loooong one.

  Required args: 
      none, but it won't do much without any.
  
  Optional args:
    
  outposts <"Outpost"> <"Outpost"> <"Outpost">...: write the shorthand of an outpost after this in "" to add it to the station. For example, !p stns outposts "MF" "TP" would look for a station with a MF and a TP.
    
    m <number>: If you included "HSA" in your outposts, only stations with a hsa of <number> or more moon points will be shown. For example: !p stns outposts "MF" "HSA" m 6 would show the best resource spots for stations that have access to a 6% HSA
   
    MF, TP, MC, HD <radius> <harvestRate>: If you want different outposts than the default ones, add <OutpostName> <Radius> <HarvestRate>. For example: !p stns outposts "MF" "MF" "TP" MF 3 400 TP 2 325 would look for a station with 2 MF's that have 3 range each, 400% harvest rate and a TP with radius 2 and Harvest rate of 325%
   
    sort <"type">: Sort the results in different ways, currently supports only "rss" and "labor". For example: !p stns outposts "MF" "HD" HD 4 sort "labor" would look for a habdome, radius 4, MF radius 1 and would sort by labor.
   
    d <x> <y> <maxRadius>: Specify which hex to look from and how far. For example: !p stns d 0 0 5 outposts "MF" "TP" would look for a station to place up to 5 hexes away from 0 0, outposts can be outside this radius.
   
    e <entries>: Amount of entries to display.
   
    station <radius>: changes the station radius

    orgs <"Org"> <"Org"> <"Org">: Not yet implemented.
   
    f <"Faction">: Not yet implemented.
  
  Default Values:
    
  MF: Radius 1 Harvest 450
  
    TP: Radius 1 Harvest 400
  
    MC: Radius 2 Harvest 690
  
    HD: Radius 2 Harvest 700
  
    e: 50 entries
  
    d: 0 0 whole map

  Example of a command I'd use to make a Workshed station: !p stns outposts "MF" "MF" "TP" "HSA" MF 3 400 TP 2 325 m 6
    `
 return msg;
}

function stnHelp(){
  let msg = `
  This command will look at all the ways how to put outpost down with a station on a specified hex, then outpust them sorted, with outpost locations.
  The args are same as for !p stns, with an exception.
  d <x> <y> <maxDist> is replaced by h <x> <y>
  h <x> <y> is required.

  Example command: !p stn h 14 23 outposts "MF" "MF" "TP" "HSA" MF 3 400 TP 2 325 m 0 sort "rss" 
  `
  return msg;
}
exports.help = help;
