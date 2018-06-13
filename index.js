const Discord = require("discord.js");
const winston = require("winston");
const waitUntil = require('wait-until');
const DOMParser = require('xmldom').DOMParser;
const fetch = require('node-fetch');

require('dotenv').config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    // new winston.transports.File({ filename: "error.log", level: "error" }),
    // new winston.transports.File({ filename: "combined.log" })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.simple(),
      winston.format.colorize()
    )
  }));
}

// Initialize Discord Bot
const client = new Discord.Client();

client.on("ready", evt => {
  logger.info("Connected");
  const { username, id } = client.user;
  logger.info(`Logged in as: ${username} (${id})`);
  // client.user.setActivity(`Serving ${client.guilds.size} servers`);
  client.user.setActivity(`Looking for steam id's`);
});


// TODO: post message when first joining
// client.on('guildCreate', guild => {
//   // waituntil guild is available
//   waitUntil()
//     .interval(1000)
//     .times(30)
//     .condition(() => guild.available)
//     .done(result => {
//       if (result) {
//         // console.log(guild.channels.find("name", "general"));
//         const channel = guild.channels.find("name", "general");
//         guild.systemChannel.send
//         // guild.defaultChannel.sendMessage("DM me your steam profile URL and I will give you your steam ID");
//       }
//     });

//   // message.channel.send("DM me your steam profile URL and I will give you your steam ID");
// });

client.on("message", async message => {

  switch(message.channel.type) {
    case "dm":
      if (message.content.includes("help")) {
        message.channel.send("Enter your steam profile URL to get your steam ID. It should look like so: `https://steamcommunity.com/id/your_profile_name/`");
      }
      
      if (message.content.includes("https://steamcommunity.com/id") && !message.content.includes("your_profile_name")) {
        const url = message.content.concat("?xml=1");
        try {
          const resp = await fetch(url);
          const text = await resp.text();
          const doc = new DOMParser().parseFromString(text);
          const ele = doc.documentElement.getElementsByTagName("steamID64");
          const steamID = ele.item(0).firstChild.nodeValue;
          message.channel.send(`Your steam id: ${steamID}`);
        } catch (error) {
          console.log(error);
          message.channel.send("An error occurred retrieving your steam id");
        }
      }
  }

  if (message.isMentioned(client.user)) {
    message.channel.send('You must DM me your steam profile URL to receive your steam id');
  }

});

client.login(process.env.TOKEN);