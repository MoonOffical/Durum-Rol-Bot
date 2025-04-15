const { Client, GatewayIntentBits, Partials, ButtonBuilder, ButtonComponent, ButtonStyle, ActionRowBuilder, PermissionsFlags, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, AttachmentBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, PresenceUpdateStatus } = require("discord.js");
const fs = require("fs")
const ayarlar = require("./ayarlar.js")
const { durumyazi, rolid, sunucuid, log } = require("./ayarlar.js")
const client = new Client({
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember,
    ],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
});

client.on("ready", async () => {
    client.user.setPresence({ activities: [{ name: ayarlar.botdurum }], status: PresenceUpdateStatus.Idle });
    console.log(`Bot ${client.user.username} adlı olarak giriş yaptı!`)
})


client.login(ayarlar.token)

setInterval(async () => {
    try {
        const guild = client.guilds.cache.get(sunucuid);
        if (!guild) {
            console.log('Sunucu bulunamadı!');
            return;
        }

        const rol = guild.roles.cache.get(rolid);
        if (!rol) {
            console.log("Rol bulunamadı!");
            return;
        }

        const members = await guild.members.fetch();

        members.forEach(async (member) => {
            const presence = member.presence;

            if (!presence || !presence.status || presence.status === 'offline') {
                return;
            }

            const hasMatchingState = presence.activities.some(
                (durum) =>
                    durum.type === 4 &&
                    durum.state &&
                    durumyazi.some((keyword) => durum.state.includes(keyword))
            );

            if (hasMatchingState) {
                if (!member.roles.cache.has(rol.id)) {
                    await member.roles.add(rol);
                    if (log) {
                        const logChannel = guild.channels.cache.get(log);
                        if (logChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setColor('#00ff00')
                                .setAuthor({ name: member.user.tag, iconURL: member.user.avatarURL() })
                                .setDescription(`Daltons URL'sini durumuna aldı ve ona ${rol} rolünü verdim!`)
                                .setTimestamp();
                            await logChannel.send({ embeds: [logEmbed] });
                        }
                    }
                }
            } else {
                if (member.roles.cache.has(rol.id)) {
                    await member.roles.remove(rol);
                    if (log) {
                        const logChannel = guild.channels.cache.get(log);
                        if (logChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setAuthor({ name: member.user.tag, iconURL: member.user.avatarURL() })
                                .setDescription(`Durumundan URL'yi çıkardığı için ${rol} rolünü aldım!`)
                                .setTimestamp();
                            await logChannel.send({ embeds: [logEmbed] });
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.log(err);
    }
}, 300000);









