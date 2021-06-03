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
  "stn",
  "map",
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
    case "map":
      return mapHelp();
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
 This command will return a list of the best station spots by rss or labor (if specified), with specifed outposts.

Required args: 
    none

Optional args:

  outposts: <"Outpost"> <"Outpost"> <"Outpost">...:
    A list of outposts, valid outposts are: "MF" "TP" "MC" "HD" "HSA" "CSA"

  m: <min_hsa_red>:  
    Use this option only with "HSA" or "CSA" included in outposts.
    The results will show ONLY stations with HSA/CSA reduction equal or higher than <min_hsa_red>  
   
  station, MF, TP, MC, HD <radius> <harvest_rate>:
   
    These options will change the <radius> and <harvest_rate> of specified outpost (or the stn itself). Example:
      
      MF 3 450

    will set <radius> of mining facilites to 3 and their <harvest_rate> to 450%
  
  sort "labor":
    
    Include this option to sort the results by labor, not by rss

  d <x> <y> <max_distance>:
    
    Specifies the search area. Filters the results to show only stations with distance up to <max_distance> from the hex <x> <y> 
   
  e <entries>:
    
    Amount of entries to display.
  
Default Values:
    
  station: Radius 4 Harvest 73
  MF: Radius 1 Harvest 450
  TP: Radius 1 Harvest 400
  MC: Radius 2 Harvest 690
  HD: Radius 2 Harvest 700
  e: 50 entries
  d: 0 0 whole map
Example of a command I'd use to make a Workshed station:
  
  !p stns outposts "MF" "MF" "TP" "HSA" MF 3 400 TP 2 325 station 5 143 m 6 d 0 10 25 e 40

  This command would show best spots by rss for stations that have 2 MF, 1 TP, 1 HSA, where:
   MF's have radius 3 and harvest rate 400%, (MF 3 400)
   TP has radius 2 and harvest rate 325%, (TP 2 325)
   station with radius 5 (I plan NH) and harvest rate 143% (with RG) (station 5 143)
  the results would be filtered to those that:
   use at least 6% HSA (m 6)
   have distance from hex /goto 0 10 up to 25 (d 0 10 25)
   only top 40 spots will be shown (e 40)
`
 return msg;
}

function stnHelp(){
  let msg = `
This command will look at all the ways how to put outpost down with a station on a specified hex, then outpust them sorted, with outpost locations.

Required args: 
  
h <x> <y>:
  
  Specifies the hex where the station is built

Optional args:

outposts: <"Outpost"> <"Outpost"> <"Outpost">...:
  A list of outposts, valid outposts are: "MF" "TP" "MC" "HD" "HSA" "CSA"

m: <min_hsa_red>:  
  Use this option only with "HSA" or "CSA" included in outposts.
  The results will show ONLY stations with HSA/CSA reduction equal or higher than <min_hsa_red>  
 
station, MF, TP, MC, HD <radius> <harvest_rate>:
 
  These options will change the <radius> and <harvest_rate> of specified outpost (or the stn itself). Example:
    
    MF 3 450

  will set <radius> of mining facilites to 3 and their <harvest_rate> to 450%

sort "labor":
  
  Include this option to sort the results by labor, not by rss

e <entries>:
  
  Amount of entries to display.

Default Values:
  
station: Radius 4 Harvest 73
MF: Radius 1 Harvest 450
TP: Radius 1 Harvest 400
MC: Radius 2 Harvest 690
HD: Radius 2 Harvest 700
e: 50 entries
  `
  return msg;
}

function mapHelp(){
  let msg = `
This command is used to set user's default map that is used for the commands.
Usage:

!p map "<map_name>"

If the argument "<map_name>" is invalid or ommitted, the command will also list valid maps.

Example command, that will set map to omega:

!p map "omega"

Default map for each user is "omega".

`

return msg;

}

exports.help = help;
