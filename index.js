// Import Module
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"] });

// Import File
const config = require('./Config.json');
const TicketInfo = require('./Bdd/TicketInfo.json');
const TicketBdd = require('./Bdd/TicketBdd.json')

// Import Class
const Utils = require('./class/Utils')

// Import Commands
const Ticket = require('./Commands/Ticket');
const Close = require('./Commands/Close');

// Login Client
client.login(config.token);

client.on('ready', () => {

    // Please do not modify these lines
    let statuses = [
        "Discord Ticket Bot V 2.0.0",
        config.prefix+"ticket | Setup TicketPanel",
        "By MJlulu02 | Wydavix.fr"
    ];

    let selected = 0;
    setInterval(() => {
        selected++;
        if((selected + 1) > statuses.length) selected = 0;
    
        client.user.setActivity(statuses[selected]).catch(console.error);
    }, 10000);

    console.log(`Logged in as ${client.user.tag} !`);
});

// Message

client.on('message', async (message) => {
    if(Ticket.match(message)){
        Ticket.action(message,Discord,client); return;
    }

    if(Close.match(message)){
        Close.action(message,Discord,client); return;
    }
})

// Message Reaction Open Ticket

client.on('messageReactionAdd', async (reaction,user) => {
    const members = reaction.message.guild.members.cache.get(user.id);
    
    if(members.user.bot) return;

    if(reaction.message.channel.id === TicketInfo.ChannelId){
        if(reaction.emoji.name === config.ReactEmoji){
            TicketInfo.NumberTicket++;
            Utils.SaveTicketInfo(TicketInfo)
            
            if (TicketInfo.NumberTicket >= 10) {
                TicketInfo.NumbersTicket = "00"
            }else if (TicketInfo.NumberTicket >= 100) {
                TicketInfo.NumbersTicket = "0"
            }else if (TicketInfo.NumberTicket >= 1000) {
                TicketInfo.NumbersTicket = ""
            }
            Utils.SaveTicketInfo(TicketInfo)

            reaction.remove(user.id)
            reaction.message.react(config.ReactEmoji);

            reaction.message.guild.channels.create('ticket-' + TicketInfo.NumbersTicket+TicketInfo.NumberTicket, {
                            type: "text", parent: reaction.message.channel.parent,
                    permissionOverwrites: [
                        {
                            allow: 'VIEW_CHANNEL',
                            deny: 'ADD_REACTIONS',
                            id: user.id
                        },
                        {
                            deny: 'VIEW_CHANNEL',
                            id: reaction.message.guild.id
                        },
                        {
                            allow: 'VIEW_CHANNEL',
                            deny: 'ADD_REACTIONS',
                            id: config.StaffID
                        }
                    ]
        }).then(channel => {
            const embed = new Discord.MessageEmbed()
            .setColor('#1abc9c')
            .setDescription(config.TicketDesc)
            .setTimestamp()
            .setFooter(config.BotName, client.user.avatarURL());
            channel.send("Hey "+user.toString() +", ")
            channel.send(embed).then(function (message) {
                message.react("🔒");
              });

            channel.setTopic("**User :** " + user.username +' **ID :** ' + user.id)
            TicketBdd.Ticket[channel.id] = {
                "UserId": user.id,
                "UserName": user.username,
                "ChannelName": 'ticket-' + TicketInfo.NumbersTicket+TicketInfo.NumberTicket
            }
            Utils.SaveTicketBdd(TicketBdd)
        });
        }
    }
})

// Message Reaction Close Ticket

client.on('messageReactionAdd', async (reaction,user) =>{
    
    const members = reaction.message.guild.members.cache.get(user.id);
    
    if(members.user.bot) return;

    if(reaction.emoji.name == "🔒"){
        if(TicketBdd.Ticket[reaction.message.channel.id]) {
            const ArrClose = ["✅","❎"]
            const ArrOpen = ["🔓","⛔"]
           
            const reacted = await Utils.AwaitReact(reaction.message,user,15,ArrClose)
            const result = await Utils.getResult(reacted, reaction.message.channel, reaction, user, client);
            const m = await reaction.message.channel.send(result)
            
            const react = await Utils.AwaitReact(m,user,30,ArrOpen)
            const results = await Utils.getReopen(react, reaction.message.channel, reaction, user, client)
            reaction.message.channel.send(results)
        }
    }
}) 