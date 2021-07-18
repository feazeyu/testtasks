const Commands = require("./commands");
const Options = require("./options");
const Discord = require("discord.js");

var entryDict = {};

const emoji = {
  crystal: "<:Crystal:757976643363930122>",
  metal: "<:Metal:757976643493953688>",
  gas: "<:Gas:757976643204546618>",
  labor: "<:labor:839506095864676363>",
};

const pageSize = { rss: 10, stn: 5 };

function textOnly(data) {
  return "```" + data.text[data.pages.page] + "```";
}

function textNoFormat(data) {
  return data.text[data.pages.page];
}

const confusionText = `
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
  
Feel free to use other commands, but this one seems broken at the moment!
             `;

function createStationMessage(data) {
  let spots = [];
  let begin = pageSize.stn * data.pages.page;
  let end = Math.min(pageSize.stn * (data.pages.page + 1), data.maxEntries);
  for (x = begin; x < end; x++) {
    spots.push({
      name: x + 1 + ". ",
      value: `${emoji.metal} ${Math.round(
        data.possibilities[x].harvest.MR
      )} | ${emoji.gas} ${Math.round(data.possibilities[x].harvest.GR)} | ${
        emoji.crystal
      } ${Math.round(data.possibilities[x].harvest.CR)} | ${
        emoji.labor
      } ${Math.round(data.possibilities[x].harvest.LQ)} | Total: ${Math.round(
        data.possibilities[x].harvest.total
      )} | Hsa red: ${data.possibilities[x].harvest.hsaRed}
        Outpost coords: \n`,
    });
    for (key in data.possibilities[x].coords) {
      spots[spots.length - 1].value +=
        key + ": " + data.possibilities[x].coords[key] + "\n";
    }
  }

  //console.log(spots);
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Best outpost spots page ${data.pages.page + 1}/${data.pages.limit}:`
    )
    .setDescription(
      `sorted by ${data.textData.stuff}
        for stn at ${data.middle.gotoCoords()}
        map: ${data.textData.map}`
    )
    .addFields(spots);
}

function createBestStnMsg(data) {
  let spots = [];
  let begin = pageSize.rss * data.pages.page;
  let end = Math.min(pageSize.rss * (data.pages.page + 1), data.maxEntries);
  for (x = begin; x < end; x++) {
    spots.push({
      name:
        parseInt(data.harvest[x].rank) +
        1 +
        ". " +
        data.harvest[x].coords.gotoCoords(),
      value: `${emoji.metal} ${Math.floor(data.harvest[x].MR)} | ${
        emoji.gas
      } ${Math.floor(data.harvest[x].GR)} | ${emoji.crystal} ${Math.floor(
        data.harvest[x].CR
      )} | ${emoji.labor} ${Math.floor(
        data.harvest[x].LQ
      )} | Total: ${Math.floor(data.harvest[x].total)} | Hsa red: ${
        data.harvest[x].hsaRed
      } | Dist: ${data.harvest[x].dist}`,
    });
  }

  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Best stations spots page ${data.pages.page + 1}/${data.pages.limit}:`
    )
    .setDescription(
      `Sorted by ${data.textData.stuff} \n\tfor distance up to ${
        data.maxDistance
      } from ${data.middle.gotoCoords()}
        map: ${data.textData.map}`
    )
    .addFields(spots);
}

function fleetPlannerMsgEmbd(data) {
  return new Discord.MessageEmbed()
    .setColor(data.info.color)
    .setTitle(data.info.userName)
    .setThumbnail(data.info.avatar)
    .addFields(
      {name: "Role", value: data.info.role, inline: true},
      {name: "Group", value: data.info.group, inline: true},
    )
    .addField('\u200b', '\u200b')
    .addFields(
      { name: "Indies", value: data.info.units.industrial, inline: true },
      { name: "Gunships", value: data.info.units.gunship, inline: true },
      { name: "TCs", value: data.info.units.tc, inline: true },
      { name: "Vettes", value: data.info.units.corvette, inline: true },
      { name: "Patrols", value: data.info.units.patrol, inline: true },
      { name: "Scouts", value: data.info.units.scout, inline: true },
      { name: "Dessies", value: data.info.units.destroyer, inline: true },
      { name: "Frigs", value: data.info.units.frigate, inline: true },
      { name: "Recons", value: data.info.units.recon, inline: true },
      { name: "Carriers", value: data.info.units.carrier, inline: true },
      { name: "Dreads", value: data.info.units.dreadnought, inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      );
    //.setFooter("\u3000".repeat(10 /*any big number works too*/) + "|");
}

function normalizeLength(text, length) {
  return (text + "                                   ").slice(0, length);
}

function fleetPlannerMsgTxt(data) {
  return (
    "```" +
    `
  ${normalizeLength(data.info.userName, 25)} role: ${normalizeLength(
      data.info.role,
      25
    )} group: ${normalizeLength(data.info.group, 25)}
  Vettes    Patrols   Scouts    Indies    Dessies   Frigs     Recons    Gunships  Carriers  Dreads    TCs
  ${normalizeLength(data.info.units.corvette, 10)}${normalizeLength(
      data.info.units.patrol,
      10
    )}${normalizeLength(data.info.units.scout, 10)}${normalizeLength(
      data.info.units.industrial,
      10
    )}${normalizeLength(data.info.units.destroyer, 10)}${normalizeLength(
      data.info.units.frigate,
      10
    )}${normalizeLength(data.info.units.recon, 10)}${normalizeLength(
      data.info.units.gunship,
      10
    )}${normalizeLength(data.info.units.carrier, 10)}${normalizeLength(
      data.info.units.dreadnought,
      10
    )}${normalizeLength(data.info.units.tc)}` +
    "```"
  );
}

function textEntry(text, channel) {
  return new Entry(
    {
      text: [text],
      pages: {
        page: 0,
        limit: 1,
      },
    },
    textOnly,
    channel
  );
}

function createBestSpotsMsg(data) {
  let spots = [];
  let begin = pageSize.rss * data.pages.page;
  let end = Math.min(pageSize.rss * (data.pages.page + 1), data.maxEntries);
  //console.log(begin);
  //console.log(end);
  for (x = begin; x < end; x++) {
    spots.push({
      name:
        parseInt(data.harvest[x].rank) +
        1 +
        ". " +
        data.harvest[x].coords.gotoCoords(),
      value: `${emoji.metal} ${Math.floor(data.harvest[x].MR)} | ${
        emoji.gas
      } ${Math.floor(data.harvest[x].GR)} | ${emoji.crystal} ${Math.floor(
        data.harvest[x].CR
      )} | ${emoji.labor} ${Math.floor(
        data.harvest[x].LQ
      )} | Total: ${Math.floor(data.harvest[x].total)} | Dist: ${
        data.harvest[x].dist
      }`,
    });
  }

  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Best ${data.textData.title} spots page ${data.pages.page + 1}/${
        data.pages.limit
      }:`
    )
    .setDescription(
      `${data.textData.stuff} \n\tfor radius: ${
        data.radius
      } \n\tfor distance up to ${
        data.maxDistance
      } from ${data.middle.gotoCoords()}
        map: ${data.textData.map}`
    )
    .addFields(spots);
}

function createBestHsaMsg(data) {
  let spots = [];
  let begin = pageSize.rss * data.pages.page;
  let end = Math.min(pageSize.rss * (data.pages.page + 1), data.maxEntries);
  //console.log(begin);
  //console.log(end);
  for (x = begin; x < end; x++) {
    spots.push({
      name:
        parseInt(data.harvest[x].rank) +
        1 +
        ". " +
        data.harvest[x].coords.gotoCoords(),
      value:
        " Moon Pts.: " +
        data.harvest[x].total +
        " | Distance: " +
        data.harvest[x].dist,
    });
  }

  //console.log(spots);
  return new Discord.MessageEmbed()
    .setColor("#FF0000")
    .setTitle(
      `Best ${data.textData.title} spots page ${data.pages.page + 1}/${
        data.pages.limit
      }:`
    )
    .setDescription(
      `${data.textData.stuff}
        for distance up to ${data.maxDistance} from ${data.middle.gotoCoords()}
        map: ${data.textData.map}`
    )
    .addFields(spots);
}

function generateHelpFromDescriptions(namespace, command, channel) {
  entries = [];
  entries.push(
    new Entry(
      {
        text: [
          Commands.commands[namespace][command].description +
            "\n\tExample:\n\t" +
            Commands.commands[namespace][command].example +
            "\nRequired options:",
        ],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      textOnly,
      channel
    )
  );
  if (Commands.commands[namespace][command].requiredOptions.length == 0) {
    entries.push(
      new Entry(
        {
          text: ["none"],
          pages: {
            page: 0,
            limit: 1,
          },
        },
        textOnly,
        channel
      )
    );
  } else {
    for (i in Commands.commands[namespace][command].requiredOptions) {
      let option = Commands.commands[namespace][command].requiredOptions[i];
      entries.push(
        new Entry(
          {
            text: [
              option + ": " + Options.options[option].description,
              option +
                ": " +
                Options.options[option].description +
                "\n" +
                Options.options[option].fullDescription,
            ],
            pages: {
              page: 0,
              limit: 2,
            },
          },
          textOnly,
          channel
        )
      );
    }
  }
  entries.push(
    new Entry(
      {
        text: ["Optional options:"],
        pages: {
          page: 0,
          limit: 1,
        },
      },
      textOnly,
      channel
    )
  );
  if (Commands.commands[namespace][command].optionalOptions.length == 0) {
    entries.push(
      new Entry(
        {
          text: ["none"],
          pages: {
            page: 0,
            limit: 1,
          },
        },
        textOnly,
        channel
      )
    );
  } else {
    for (i in Commands.commands[namespace][command].optionalOptions) {
      let option = Commands.commands[namespace][command].optionalOptions[i];
      entries.push(
        new Entry(
          {
            text: [
              option + ": " + Options.options[option].description,
              option +
                ": " +
                Options.options[option].description +
                "\n" +
                Options.options[option].fullDescription,
            ],
            pages: {
              page: 0,
              limit: 2,
            },
          },
          textOnly,
          channel
        )
      );
    }
  }
  return entries;
}

class Entry {
  constructor(data, createMsgFnc, channel) {
    this.data = data;
    this.createMsgFnc = createMsgFnc;
    this.channel = channel;
  }
  async sendMsg() {
    let msg = this.createMsgFnc(this.data);
    await this.channel.send(msg).then((lastMessage) => {
      if (this.data.pages.limit > 1) {
        lastMessage.react("◀️").then(() => lastMessage.react("▶️"));
      }
      this.message = lastMessage;
      entryDict[this.message.id] = this;
    });
  }
  updateMsg() {
    this.message.edit(this.createMsgFnc(this.data));
  }
  scrollForward() {
    this.data.pages.page++;
    if (this.data.pages.page >= this.data.pages.limit) {
      this.data.pages.page = 0;
    }
    this.updateMsg();
  }
  scrollBackwards() {
    this.data.pages.page--;
    if (this.data.pages.page < 0) {
      this.data.pages.page = this.data.pages.limit - 1;
    }
    this.updateMsg();
  }
}

function mapHelp(channel) {
  return [
    new Entry(
      {
        text: `
This command is used to set user's default map that is used for the commands.
Usage:
        
    !p map "<map_name>"
        
If the argument "<map_name>" is invalid or ommitted, the command will also list valid maps.
        
Example command, that will set map to omega:
        
    !p map "omega"
        
Default map for each user is "thunderdome".
        `,
        pages: {
          page: 0,
          limit: 1,
        },
      },
      textOnly,
      channel
    ),
  ];
}

exports.generateHelpFromDescriptions = generateHelpFromDescriptions;
exports.Entry = Entry;
exports.createBestHsaMsg = createBestHsaMsg;
exports.createBestSpotsMsg = createBestSpotsMsg;
exports.createBestStnMsg = createBestStnMsg;
exports.createStationMessage = createStationMessage;
exports.textOnly = textOnly;
exports.textNoFormat = textNoFormat;
exports.mapHelp = mapHelp;
exports.textEntry = textEntry;
exports.entryDict = entryDict;
exports.pageSize = pageSize;
exports.fleetPlannerMsgTxt = fleetPlannerMsgTxt;
exports.fleetPlannerMsgEmbd = fleetPlannerMsgEmbd;
exports.confusionText = confusionText;
