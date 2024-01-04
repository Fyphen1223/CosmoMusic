const util = require('./utils.js');
const config = require('../config.json');

const discord = require('discord.js');

function generateGenericEmbed(queue, guildId, type) {
	if (!type || type === 0) {
		const current = queue[guildId].queue[queue[guildId].index].data.info;
		let requester = '';
		if (queue[guildId].queue[queue[guildId].index].user === 'Auto Recommendation') {
			requester = 'Auto Recommendation';
		} else {
			requester = `<@${queue[guildId].queue[queue[guildId].index].user.id}>`;
		}
		const embed = new discord.EmbedBuilder()
			.setColor(config.config.color.info)
			.addFields({
				name: 'Author',
				value: current.author,
				inline: true
			}, {
				name: 'Title',
				value: current.title,
				inline: true
			}, {
				name: 'Duration',
				value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(Math.floor(current.length / 1000))}`,
				inline: true
			}, {
				name: 'Requested by',
				value: requester,
				inline: true
			}, {
				name: 'Volume',
				value: `${queue[guildId].volume}%`,
				inline: true
			}, {
				name: 'Position',
				value: `${queue[guildId].index + 1}/${queue[guildId].queue.length}`,
				inline: true
			})
			.setImage(current.artworkUrl);
		return embed;
	}
}

function generateStartEmbed(queue, guildId, type) {
	return generateGenericEmbed(queue, guildId, type);
}
function generatePauseEmbed(queue, guildId, type) {
	return generateGenericEmbed(queue, guildId, type);
}

function generateUnpauseEmbed(queue, guildId, type) {
	return generateGenericEmbed(queue, guildId, type);
}

function generateMessageEmbed(interaction, message) {
	const embed = new discord.EmbedBuilder()
		.setColor(config.config.color.info)
		.setAuthor({
			name: message,
			iconURL: interaction.user.avatarURL()
		});

	return embed;
}

module.exports = {
	generatePauseEmbed,
	generateStartEmbed,
	generateUnpauseEmbed,
	generateMessageEmbed
};
