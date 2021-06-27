// Import File
const config = require('../Config.json')
const TicketInfo = require('../Bdd/TicketInfo.json')

// Import class
const SaveBdd = require('../class/Utils')

module.exports = class Ticket {

    static match (message) {
        return message.content.startsWith(config.prefix +'ticket');
    }

    static action (message,Discord,client) {
        let args = message.content.trim().split(/ +/g)

        if(message.content.startsWith(config.prefix +"ticket")) {
            const Embeds = new Discord.MessageEmbed()
                .setColor("#EA2027")
                .setDescription("Vous n'avez pas la permission d'utiliser cette commande")
                .setFooter(config.BotName, client.user.avatarURL())

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(Embeds);

        if(args.length == 1) {
                const embed = new Discord.MessageEmbed()
                    .setColor("#EA2027")
                    .setDescription(`**Merci de définir le channel de ticket en utilisant la commande suivante :** \n\n\`${config.prefix}ticket #channel\``)
                    .setFooter(config.BotName, client.user.avatarURL())

            if(TicketInfo.ChannelSet == false) return message.channel.send(embed);

                const embeds = new Discord.MessageEmbed()
                    .setColor('#d63031')
                    .setDescription('`Chargement du système de ticket en cours...`')
                    .setFooter(config.BotName, client.user.avatarURL());
                message.channel.send(embeds)

            setTimeout(() => {
                if(TicketInfo.Status == false) {
                    const embed = new Discord.MessageEmbed()
                        .setColor('#f0932b')
                        .setDescription('`Système de ticket chargé, Message en cours D\'envoie...`')
                        .setFooter(config.BotName, client.user.avatarURL());
                    message.channel.send(embed);

                    TicketInfo.Status = true;
                    SaveBdd.SaveTicketInfo(TicketInfo)

                    setTimeout(() => {

                        const hour = new Date().getHours()
                        const min = new Date().getMinutes()
                        
                        const embed = new Discord.MessageEmbed()
                            .setColor(config.PanelColor)
                            .setTitle(config.PanelName)
                            .setDescription(`Veuillez réagir ${config.ReactEmoji} pour ouvrir un tickets.`)
                            .setFooter(config.BotName +' | Dernier Actualisation : '+hour+':'+min, client.user.avatarURL());
                        
                        message.member.guild.channels.resolve(TicketInfo.ChannelId).send(embed).then(function (message) {
                            message.react(config.ReactEmoji);
                            TicketInfo.MessageId = message.id
                            SaveBdd.SaveTicketInfo(TicketInfo)
                        });
                        
                        const embede = new Discord.MessageEmbed()
                        .setColor('#1e90ff')
                        .setDescription('`Envoie du message avec Succèe !`')
                        .setFooter(config.BotName, client.user.avatarURL());

                        message.channel.send(embede)
                    }, 5000);
                } else if(TicketInfo.Status == true){
                    
                }
            }, 10000);
        } else if(message.mentions.channels.first()){
            let tickets = args[1]
            const checkChannel = message.mentions.channels.first().id;

            const Embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setDescription(`**Channel défini en tans que channel de ticket :** ${tickets}`)
                .setFooter(config.BotName, client.user.avatarURL());
            message.channel.send(Embed)

            TicketInfo.ChannelId = checkChannel;
            TicketInfo.ChannelSet = true;
            SaveBdd.SaveTicketInfo(TicketInfo)
        } else if(args[1] === "reset"){
            TicketInfo.Status = false;
            TicketInfo.ChannelSet = false;
            SaveBdd.SaveTicketInfo(TicketInfo)

            const Embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setDescription(`**Panel de ticket reset veuillez effectuer la commande :** \`${config.prefix}ticket\``)
                .setFooter(config.BotName, client.user.avatarURL());
            message.channel.send(Embed)
        }
        }
    }
}