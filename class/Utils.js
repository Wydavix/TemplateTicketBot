// Import Module
const fs = require('fs')
const Discord = require('discord.js')

// Import File
const config = require('../Config.json');
const TicketBdd = require('../Bdd/TicketBdd.json')

class Utils {

    // Function SaveTicketInfo
    static SaveTicketInfo(TicketInfo) {
        fs.writeFile(`./Bdd/TicketInfo.json`, JSON.stringify(TicketInfo), err => {
            if(err) console.log(err)
            })
    }

    // Function SaveTicketBdd
    static SaveTicketBdd(TicketBdd) {
        fs.writeFile(`./Bdd/TicketBdd.json`, JSON.stringify(TicketBdd), err => {
            if(err) console.log(err)
            })
    }

    // Function AwaitReact
    static async AwaitReact(message, author, time, validReactions) {
        time *= 1000;
        for (const reaction of validReactions) await message.react(reaction);
        const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === author.id;
        return message
            .awaitReactions(filter, { max: 1, time: time})
            .then(collected => collected.first() && collected.first().emoji.name);
    }

    // Function Reopen Ticket
    static async getReopen(emoji, channel, reaction, user, client) {

        if(emoji == "🔓") {
    
            channel.setName("s")
            channel.overwritePermissions([
                {
                    allow: 'VIEW_CHANNEL',
                    id: TicketBdd.Ticket[reaction.message.channel.id].UserId
                }
            ])
    
            const embed = new Discord.MessageEmbed()
                .setColor('#009432')
                .setDescription('Ticket Réouvert par '+ user.toString())
                .setTimestamp()
                .setFooter(config.BotName, client.user.avatarURL());
            return embed
        }
        else if (emoji == "⛔") {
            reaction.message.reactions.removeAll()
    
            const embed = new Discord.MessageEmbed()
                .setColor('#009432')
                .setDescription('Le ticket va se fermer dans 5 secondes')
                .setTimestamp()
                .setFooter(config.BotName, client.user.avatarURL());
                setTimeout(() => {
                    reaction.message.channel.delete();
                }, 5000);
            return embed
        }
    }

    // Function Close Ticket
    static async getResult(emoji, channel, reaction, user, client) {
        if (emoji == "✅") {
            const embed = new Discord.MessageEmbed()
                .setColor('#009432')
                .setDescription('Ticket Fermé par '+ user.toString()+'\n\n**-** 🔓 Rouvrir\n**-** ⛔ Fermer')
                .setTimestamp()
                .setFooter(config.BotName, client.user.avatarURL());
    
                reaction.message.reactions.removeAll()
                reaction.message.react('🔒')
    
                channel.setName("ticket-fermé")
                channel.overwritePermissions([
                    {
                        deny: 'VIEW_CHANNEL',
                        id: TicketBdd.Ticket[channel.id].UserId
                    }
                ])
            return embed
        } else if(emoji == "❎") {
            reaction.message.reactions.removeAll()
            reaction.message.react('🔒')
            const embed = new Discord.MessageEmbed()
                .setColor('#c0392b')
                .setDescription('`Action Annulé`')
                .setFooter(config.BotName, client.user.avatarURL());
            channel.send(embed)
        }
    } 
}

module.exports = Utils;