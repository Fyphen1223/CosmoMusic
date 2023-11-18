const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const util = require("./utils.js");
const config = require("../config.json");

function generatePauseEmbed(queue, guildId, type) {
    if (!type || type === 0) {
        const current = queue[guildId].queue[queue[guildId].index].data.info;
        const embed = new EmbedBuilder()
            .setColor(config.config.color.info)
            .addFields(
                {
                    name: "Author",
                    value: current.author,
                    inline: true,
                },
                { name: "Title", value: current.title, inline: true },
                {
                    name: "Duration",
                    value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))} / ${util.formatTime(Math.floor(current.length / 1000))}`,
                    inline: true,
                },
                {
                    name: "Requested by",
                    value: `${queue[guildId].queue[queue[guildId].index].user}`,
                    inline: true,
                },
                {
                    name: "Volume",
                    value: `${queue[guildId].volume} % `,
                    inline: true,
                },
                {
                    name: "Position",
                    value: `${queue[guildId].index + 1} / ${queue[guildId].queue.length}`,
                    inline: true,
                }
            )
            .setImage(current.artworkUrl);
        return embed;
    }
}

function generateStartEmbed(queue, guildId, type) {
    if (!type || type === 0) {
        const current = queue[guildId].queue[queue[guildId].index].data.info;
        const embed = new EmbedBuilder()
            .setColor(config.config.color.info)
            .addFields(
                {
                    name: "Author",
                    value: current.author,
                    inline: true,
                },
                { name: "Title", value: current.title, inline: true },
                {
                    name: "Duration",
                    value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(Math.floor(current.length / 1000))}`,
                    inline: true,
                },
                {
                    name: "Requested by",
                    value: `${queue[guildId].queue[queue[guildId].index].user}`,
                    inline: true,
                },
                {
                    name: "Volume",
                    value: `${queue[guildId].volume}%`,
                    inline: true,
                },
                {
                    name: "Position",
                    value: `${queue[guildId].index + 1}/${queue[guildId].queue.length}`,
                    inline: true,
                }
            )
            .setImage(current.artworkUrl);
        return embed;
    }
}

function generateUnpauseEmbed(queue, guildId, type) {
    if (!type || type === 0) {
        const current = queue[guildId].queue[queue[guildId].index].data.info;
        const embed = new EmbedBuilder()
            .setColor(config.config.color.info)
            .addFields(
                {
                    name: "Author",
                    value: current.author,
                    inline: true,
                },
                { name: "Title", value: current.title, inline: true },
                {
                    name: "Duration",
                    value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))} / ${util.formatTime(Math.floor(current.length / 1000))}`,
                    inline: true,
                },
                {
                    name: "Requested by",
                    value: `${queue[guildId].queue[queue[guildId].index].user}`,
                    inline: true,
                },
                {
                    name: "Volume",
                    value: `${queue[guildId].volume} % `,
                    inline: true,
                },
                {
                    name: "Position",
                    value: `${queue[guildId].index + 1} / ${queue[guildId].queue.length}`,
                    inline: true,
                }
            )
            .setImage(current.artworkUrl);
        return embed;
    }
}

function generateMessageEmbed(interaction, message) {
    const embed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
        name: message,
        iconURL: `${interaction.user.avatarURL({})}`,
    });
    return embed;
}

module.exports = { generatePauseEmbed, generateStartEmbed, generateUnpauseEmbed, generateMessageEmbed };
