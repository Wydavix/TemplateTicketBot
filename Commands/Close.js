// Import File
const config = require('../Config.json')
const TicketBdd = require('../Bdd/TicketBdd.json')

// Import class
const SaveBdd = require('../class/Utils')

module.exports = class Close {

    static match (message) {
        return message.content.startsWith(config.prefix +'close');
    }

    static action (message,Discord,client) {
        if(TicketBdd.Ticket[message.channel.id]) {
            const chooseArr = ["✅","❎"]
            const embed = new Discord.MessageEmbed()
                .setColor('#009432')
                .setDescription('`Voulez vous fermez le ticket ?`')
                .setTimestamp()
                .setFooter(config.BotName, client.user.avatarURL());
            getMsg(message, embed, chooseArr)
        }

        async function getMsg(message, embed, chooseArr) {
            const m = await message.channel.send(embed);
            const reacted = await SaveBdd.AwaitReact(m,message.author,10,chooseArr);
            const result = await getResult(reacted);
            m.reactions.removeAll()
            message.channel.send(result)
            return;
        }

        function getResult(me) {
            if(me === "❎") {
                const embed = new Discord.MessageEmbed()
                    .setColor('#c0392b')
                    .setDescription('`Action Annulé`')
                    .setTimestamp()
                    .setFooter(config.BotName, client.user.avatarURL());
                return embed
            }else if (me === "✅") {
                const embed = new Discord.MessageEmbed()
                .setColor('#009432')
                .setDescription('`Le ticket va se fermer dans 5 secondes`')
                .setTimestamp()
                .setFooter(config.BotName, client.user.avatarURL());
                message.channel.setName("Ticket-Fermé")
                setTimeout(() => {
                    message.channel.delete();
                }, 5000);
                return embed
            }
        }
    }
}