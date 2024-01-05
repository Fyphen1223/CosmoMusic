const fs = require('node:fs');

const config = require('./config.json');
const util = require('./utils/utils.js');
const embeds = require('./utils/embeds.js');
const playlist = util.tryRequire('./db/playlist.json');
const server = require('./server.js');
const { spotifyApiClient } = require('./utils/api-client.js');
const { gpts } = require('./utils/gpt-client.js');

const discord = require('discord.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Genius = require('genius-lyrics');
const { LLTurbo, Connectors } = require('llturbo');

const start = new Date();
if (config.config.console.consoleClear) console.clear();

const client = new discord.Client({
	intents: [
		discord.GatewayIntentBits.DirectMessageReactions,
		discord.GatewayIntentBits.DirectMessageTyping,
		discord.GatewayIntentBits.DirectMessages,
		discord.GatewayIntentBits.GuildBans,
		discord.GatewayIntentBits.GuildEmojisAndStickers,
		discord.GatewayIntentBits.GuildIntegrations,
		discord.GatewayIntentBits.GuildInvites,
		discord.GatewayIntentBits.GuildMembers,
		discord.GatewayIntentBits.GuildMessageReactions,
		discord.GatewayIntentBits.GuildMessageTyping,
		discord.GatewayIntentBits.GuildMessages,
		discord.GatewayIntentBits.GuildPresences,
		discord.GatewayIntentBits.GuildScheduledEvents,
		discord.GatewayIntentBits.GuildVoiceStates,
		discord.GatewayIntentBits.GuildWebhooks,
		discord.GatewayIntentBits.Guilds,
		discord.GatewayIntentBits.MessageContent
	],
	partials: [
		discord.Partials.Channel,
		discord.Partials.GuildMember,
		discord.Partials.GuildScheduledEvent,
		discord.Partials.Message,
		discord.Partials.Reaction,
		discord.Partials.ThreadMember,
		discord.Partials.User
	]
});

const lyricsSearcher = new Genius.Client(config.token.genius);
const spotifyClient = new spotifyApiClient({
	clientId: config.spotify.clientId,
	clientSecret: config.spotify.clientSecret,
});

const gptQueue = new gpts();

const llturboOptions = {
	resume: true,
	resumeTimeout: 0,
	resumeByLibrary: true,
	reconnectTries: 3,
	reconnectInterval: 100,
	restTimeout: 5,
	moveOnDisconnect: true,
	userAgent: 'Cosmo Music/0.0.1',
	voiceConnectionTimeout: 3
};

const llturbo = new LLTurbo(
	new Connectors.DiscordJS(client),
	config.lavalink,
	llturboOptions
);
const queue = new util.queue();
const log = new util.logger();

if (config.config.dashboard.boot) server.startServer(true);

const guildList = [];
const guildNameList = [];
client.llturbo = llturbo;

client.on('ready', async (u) => {
	log.ready(`Logged in as ${u.user.tag}`);

	for (const [key, value] of client.guilds.cache) {
		guildList.push(key);
		guildNameList.push(value['name']);
	}

	await spotifyClient.generateCredential();
});

client.on('messageCreate', async (message) => {
	if (message.author.bot || !gptQueue[message.guild.id]) return;

	await message.channel.sendTyping();

	const res = await gptQueue[message.guild.id].generate(message);

	await message.reply(res);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isAutocomplete()) return;

	const focusedValue = interaction.options.getFocused();

	const guildId = interaction.guild.id;
	if (interaction.commandName === 'queue' && interaction.options.getSubcommand() === 'delete') {
		const list = queue[guildId].getTitles();

		let filtered = list.filter((choice) => choice.startsWith(focusedValue));
		filtered = filtered.splice(0, 24);

		try {
			interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
		} catch { }

		return;
	}

	if (interaction.commandName === 'radio' && interaction.options.getSubcommand() === 'play') {
		const filtered = radioList.filter((choice) => choice.startsWith(focusedValue));

		try {
			interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
		} catch (err) {
			const rated = radioList.slice(0, 24);
			const rateFilt = rated.filter((choice) => choice.startsWith(focusedValue));

			interaction.respond(rateFilt.map((choice) => ({ name: choice, value: choice })));
		}
	}

	if (interaction.commandName === 'play') {
		const node = llturbo.options.nodeResolver(llturbo.nodes);
		const result = await node.rest.resolve(focusedValue);

		switch (result.loadType) {
			case 'empty': {
				try {
					const searchResult = await node.rest.resolve(`ytsearch:${focusedValue}`);

					if (!searchResult?.data.length) return;

					const list = [];
					for (let i = 0; i < 20 && i < searchResult.data.length; i++) {
						list.push(`${searchResult.data[i].info.title}`);
					}

					await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
				} catch (_) {
					return;
				}

				break;
			}
			case 'track': {
				const list = [result.data.info.title];

				await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));

				break;
			}
			case 'playlist': {
				const list = [];
				for (let i = 0; i < 25 && i < result.data.tracks.length; i++) {
					list.push(result.data.tracks[i].info.title);
				}

				await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));

				break;
			}
			case 'search': {
				if (!result?.data.length) return;

				const list = [];
				const urls = [];
				for (let i = 0; i < 5 && i < result.data.length; i++) {
					list.push(`${result.data[i].info.title}`);
				}

				await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
				break;
			}
			case 'error': {
				console.error('An expected error has occured.');
			}
		}
	}
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isAutocomplete()) return;

	const command = interaction.commandName;
	const customId = interaction.customId;
	const guildId = interaction.guild.id.toString();

	if (command === 'ping') {
		await interaction.deferReply();
		let ping = 'N/A';
		if (queue[guildId]) {
			ping = queue[guildId].player.ping;
		}
		await interaction.editReply(`Bot Ping: ${client.ws.ping}ms\nVoice Gateway Ping: ${ping}ms`);
		return;
	}
	else if (command === 'play') {
		await interaction.deferReply();

		if (!interaction.member.voice.channelId) {
			const noValidVCEmbed = new discord.EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({
					name: ` | 🚫 - Please join a valid voice channel first!`,
					iconURL: interaction.user.avatarURL({})
				});

			await interaction.editReply({ embeds: [noValidVCEmbed] });

			return;
		}

		if (!queue[guildId]) queue.add(guildId);
		if (!queue[guildId].node) queue[guildId].node = llturbo.options.nodeResolver(llturbo.nodes);
		const query = interaction.options.getString('query');
		const replay = interaction.options.getBoolean('autoreplay');

		queue[guildId].autoReplay = replay;

		const me = await interaction.guild.members.me;
		const voiceChannel = interaction.member.voice.channel;
		const permission = voiceChannel.permissionsFor(me);

		if (!permission.has(discord.PermissionsBitField.Flags.Connect)) {
			await interaction.editReply('I do not have enough permission!');

			return;
		}

		if (!permission.has(discord.PermissionsBitField.Flags.Speak)) {
			await interaction.editReply('I do not have enough permission!');

			return;
		}

		// Join channel first or after stop command
		if (!queue[guildId].voiceChannel && !query && queue[guildId].isEmpty()) {
			queue[guildId].player = await llturbo.joinVoiceChannel({
				guildId,
				channelId: interaction.member.voice.channelId,
				shardId: 0
			});

			queue[guildId].player.status = 'finished';

			const joinedEmbed = new discord.EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({
					name: ` | 👋 - I joined your voice channel.`,
					iconURL: interaction.user.avatarURL({})
				});

			await interaction.editReply({ embeds: [joinedEmbed] });

			queue[guildId].voiceChannel = interaction.member.voice.channelId;
			queue[guildId].textChannel = interaction.channel;

			addEventListenerToPlayer(guildId);

			return;
		}

		// Join and there is valid query
		if (!queue[guildId].voiceChannel && query) {
			try {
				queue[guildId].player = await llturbo.joinVoiceChannel({
					guildId,
					channelId: interaction.member.voice.channelId,
					shardId: 0
				});
			} catch (err) {
				queue[guildId].player = null;

				await interaction.editReply('Sorry, I cannot join your channel. Check my permissions.');

				return;
			}

			queue[guildId].player.status = 'finished';
			queue[guildId].voiceChannel = interaction.member.voice.channelId;
			queue[guildId].textChannel = interaction.channel;

			addEventListenerToPlayer(guildId);
		}

		// Already joined and no query
		if (queue[guildId].voiceChannel && !query && queue[guildId].player.status === 'finished') {
			await startPlay(guildId);

			await interaction.editReply('Started playing queue');

			return;
		}
		if (queue[guildId].voiceChannel && !query) {
			await interaction.editReply('Please input keywords');

			return;
		}

		// Valid queue and player has been finished and there is no query
		if (queue[guildId].queue.length !== 0 && queue[guildId].player.status === 'finished' && !query) {
			if (!queue[guildId].voiceChannel) {
				try {
					queue[guildId].player = await llturbo.joinVoiceChannel({
						guildId,
						channelId: interaction.member.voice.channelId,
						shardId: 0
					});
				} catch (err) {
					queue[guildId].player = null;

					await interaction.editReply('Sorry, I cannot join the voice channel. Please check my permissions.');

					return;
				}

				queue[guildId].voiceChannel = interaction.member.voice.channelId;
				queue[guildId].textChannel = interaction.channel;
			}

			await startPlay(guildId);

			await interaction.editReply('Started playing queue');

			return;
		}

		// Valid queue and player has been finished and there is query
		if (queue[guildId].queue.length !== 0 && queue[guildId].player.status === 'finished' && query) {
			if (!queue[guildId].voiceChannel) {
				try {
					queue[guildId].player = await llturbo.joinVoiceChannel({
						guildId,
						channelId: interaction.member.voice.channelId,
						shardId: 0
					});
				} catch (err) {
					queue[guildId].player = null;

					await interaction.editReply('Sorry, I cannot join the voice channel. Please check my permissions.');

					return;
				}

				queue[guildId].voiceChannel = interaction.member.voice.channelId;
				queue[guildId].textChannel = interaction.channel;
			}
		}

		// User did not join same voice channel as bot
		if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
			await interaction.editReply('Please join my VC!');

			return;
		}

		const result = await queue[guildId].node.rest.resolve(query);

		let res = '';
		switch (result.loadType) {
			case 'track': {
				res = result.data;

				break;
			}
			case 'empty': {
				const searchResult = await queue[guildId].node.rest.resolve(`ytsearch:${query}`);

				if (!searchResult?.data.length) {
					await interaction.editReply('Sorry, I could not find any data.');

					return;
				}

				res = searchResult.data.shift();

				break;
			}
			case 'playlist': {
				let i = 0;
				while (i !== result.data.tracks.length) {
					queue[guildId].add(result.data.tracks[i], interaction.user);
					i++;
				}

				const resultEmbed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setAuthor({
						name: ` | 🔍 Added ${result.data.info.name} to the queue.`,
						iconURL: interaction.user.avatarURL({}),
					});

				await interaction.editReply({ embeds: [resultEmbed] });

				if (queue[guildId].player.status === 'playing') return;

				await startPlay(guildId);

				return;
			}
			case 'search': {
				if (!result?.data.length) {
					await interaction.editReply('Sorry, I could not find any data.');

					return;
				}

				res = result.data.shift();

				break;
			}
			case 'error': {
				await interaction.editReply('Sorry, I could not find any data.');

				return;
			}
		}

		queue[guildId].add(res, interaction.user);

		const resultEmbed = new discord.EmbedBuilder()
			.setColor(config.config.color.info)
			.setAuthor({
				name: ` | 🔍 Added ${res.info.title} to the queue.`,
				iconURL: interaction.user.avatarURL({})
			});

		await interaction.editReply({ embeds: [resultEmbed] });

		if (queue[guildId].player.track) return;

		await startPlay(guildId);
	}

	else if (command === 'seek') {
		await interaction.deferReply();

		if (!queue[guildId]) queue.add(guildId);

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)
				]
			});

			return;
		}

		if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
			await interaction.editReply('Sorry, the resource is not seekable.');

			return;
		}

		const seek = interaction.options.getString('seek');
		const position = util.timeStringToSeconds(seek);
		const length = queue[guildId].queue[queue[guildId].index].data.info.length;

		if (length < position * 1000 || position < 1) {
			await interaction.editReply('Sorry, the input was invalid.');

			return;
		}

		await queue[guildId].player.seekTo(position * 1000);

		await interaction.editReply(`Seeked to ${seek}`);
	}

	else if ((command || customId) === 'pause') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)
				]
			});

			return;
		}

		try {
			queue[guildId].player.setPaused(true);

			await interaction.editReply(`Paused by ${interaction.user}`);

			eventOnPaused(guildId);
		} catch (err) {
			console.error(err);
		}
	}

	else if ((command || customId) === 'unpause') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)
				]
			});

			return;
		}

		try {
			queue[guildId].player.setPaused(false);

			await interaction.editReply(`Resumed by ${interaction.user}`);

			await eventOnResumed(guildId);
		} catch (err) {
			console.error(err);
		}
	}

	else if ((command || customId) === 'skip') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply('Sorry,the player is not playing any audio.');

			return;
		}

		const index = queue[guildId].index + 1;
		if (index === queue[guildId].queue.length) {
			await interaction.editReply('Sorry, you cannot do that due to lack of music.');

			return;
		}

		queue[guildId].suppressEnd = true;
		queue[guildId].player.position = 0;
		queue[guildId].index++;

		await queue[guildId].player.playTrack({
			track: queue[guildId].queue[index].data.encoded
		});

		await interaction.editReply('Skip');
	}

	else if ((command || customId) === 'back') {
		await interaction.deferReply();

		if (!queue[guildId]) queue.add(guildId);

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply('Sorry,the player is not playing any audio.');

			return;
		}

		const index = queue[guildId].index - 1;
		if (index === -1) {
			await interaction.editReply('Sorry, you cannot do that due to lack of music.');

			return;
		}

		queue[guildId].suppressEnd = true;
		queue[guildId].player.position = 0;
		queue[guildId].index = queue[guildId].index - 1;

		await queue[guildId].player.playTrack({
			track: queue[guildId].queue[index].data.encoded
		});

		await interaction.editReply('Back');
	}

	else if (((command || customId) === 'queue' && !interaction.isAutocomplete()) || customId === 'addR') {
		await interaction.deferReply();

		if (!queue[guildId]) queue.add(guildId);

		if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
			const noValidVCEmbed = new discord.EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({
					name: ` | 🚫 - Please join a valid voice channel first!`,
					iconURL: interaction.user.avatarURL({})
				});

			await interaction.editReply({ embeds: [noValidVCEmbed] });

			return;
		}

		if (customId === 'queue') {
			let content = '';

			if (queue[guildId].queue.length === 0) {
				const embed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription('No music added to the queue.');

				await interaction.editReply({ embeds: [embed] });
			} else {
				content += `📀 ${queue[guildId].queue[queue[guildId].index].data.info.title}`;

				queue[guildId].queue.forEach((item, i) => {
					content += `\n${i + 1}: ${item.data.info.title}`;
				});

				const embed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription(discord.codeBlock(util.formatString(content, 2000)));

				await interaction.editReply({ embeds: [embed] });
			}
		}

		else if (customId === 'addR') {
			const node = queue[guildId].node;

			if (queue[guildId].player.status !== 'playing') {
				await interaction.editReply('Nothing to search here.');

				return;
			} else {
				const current = queue[guildId].queue[queue[guildId].index].data.info;

				const res = await node.rest.resolve(`ytsearch:${current.author}`);

				queue[guildId].add(res.data[0], interaction.user);
				queue[guildId].add(res.data[1], interaction.user);

				await interaction.editReply(`Added ${res.data[0].info.title} and ${res.data[1].info.title} to the queue.`);
			}
		}

		else if (interaction.options.getSubcommand() === 'display') {
			let content = '';

			if (queue[guildId].queue.length === 0) {
				const embed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription('No music added to the queue.');

				await interaction.editReply({ embeds: [embed] });
			} else {
				content += `📀 ${queue[guildId].queue[queue[guildId].index].data.info.title}`;

				queue[guildId].queue.forEach((item, i) => {
					content += `\n${i + 1}: ${item.data.info.title}`;
				});

				const embed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription(discord.codeBlock(util.formatString(content, 2000)));

				await interaction.editReply({ embeds: [embed] });
			}
		}

		else if (interaction.options.getSubcommand() === 'clear') {
			if (!queue[guildId]) queue.add(guildId);

			if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
				const noValidVCEmbed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setAuthor({
						name: ` | 🚫 - Please join a valid voice channel first!`,
						iconURL: interaction.user.avatarURL({})
					});

				await interaction.editReply({ embeds: [noValidVCEmbed] });

				return;
			}

			try {
				queue[guildId].queue = [];
				queue[guildId].index = 0;
				queue[guildId].suppressEnd = true;
				queue[guildId].player.stopTrack();

				await interaction.editReply('Deleted all music');
			} catch (_err) {
				await interaction.editReply('Cannot delete music');
			}
		}

		else if (interaction.options.getSubcommand() === 'shuffle') {
			if (!queue[guildId]) queue.add(guildId);

			if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
				const noValidVCEmbed = new discord.EmbedBuilder()
					.setColor(config.config.color.info)
					.setAuthor({
						name: ` | 🚫 - Please join a valid voice channel first!`,
						iconURL: interaction.user.avatarURL({})
					});

				await interaction.editReply({ embeds: [noValidVCEmbed] })

				return;
			}

			const arrayTemp = util.shuffleArray(queue[guildId].queue);
			queue[guildId].queue = arrayTemp;

			await interaction.editReply(`Shuffled ${queue[guildId].queue.length} musics.`);
		}

		else if (interaction.options.getSubcommand() === 'delete') {
			const list = queue[guildId].getTitles();
			const query = interaction.options.getString('query');
			const index = list.indexOf(query);

			if (index === -1) {
				await interaction.editReply('Sorry, such music is not found.');

				return;
			} else {
				if (queue[guildId].index === index) {
					await interaction.editReply('Sorry, the song is currently playing.');

					return;
				}

				queue[guildId].remove(index);
				if (index < queue[guildId].index) {
					queue[guildId].index--;
				}
				await interaction.editReply(`Deleted ${query} from the queue.`);
				if (queue[guildId].isEmpty()) {
					queue[guildId].index = 0;
					queue[guildId].suppressEnd = true;
					queue[guildId].player.stopTrack();
				}
			}
		}
	}

	else if (['volumeDown', 'volumeUp'].includes(customId)) {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		const current = queue[guildId].volume;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply('Sorry,the player is not playing any audio.');

			return;
		}

		if (customId === 'volumeUp') {
			const before = current + 10;

			if (before < 200) {
				queue[guildId].player.setGlobalVolume(before);
				queue[guildId].volume = before;

				await interaction.editReply(`Set volume to ${before}%`);
			} else {
				await interaction.editReply(`Volume is too high!`);
			}
		} else if (customId === 'volumeDown') {
			const before = current - 10;

			if (before > 10) {
				queue[guildId].player.setGlobalVolume(before);
				queue[guildId].volume = before;

				await interaction.editReply(`Set volume to ${before}%`);
			} else {
				await interaction.editReply(`Volume is too low!`);
			}
		}
	}

	else if (customId === '30p') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)
				]
			});

			return;
		}

		if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
			await interaction.editReply('Sorry, the resource is not seekable.');

			return;
		}

		const current = queue[guildId].player.position;
		const after = current + 30000;

		if (after <= queue[guildId].queue[queue[guildId].index].data.length) {
			await interaction.editReply('Sorry, you cannnot seek to out of the range of duration of the resource.');

			return;
		}

		queue[guildId].player.seekTo(after);

		await interaction.editReply('Skip 30s');
	}

	else if (customId === '30m') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)
				]
			});

			return;
		}

		if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
			await interaction.editReply('Sorry, the resource is not seekable.');

			return;
		}

		const current = queue[guildId].player.position;
		const after = current - 30000;

		if (after <= 1) {
			await interaction.editReply('Sorry, you cannnot seek tover the duration of the resource.');

			return;
		}

		queue[guildId].player.seekTo(after);

		await interaction.editReply('Back 30s');
	}

	else if ((customId || command) === 'lyric') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply('Sorry,the player is not playing any audio.');
			return;
		}

		const index = queue[guildId].index;
		const song = queue[guildId].queue[index].data.info.title;
		const songs = await lyricsSearcher.songs.search(song);

		try {
			const target = await songs[0].lyrics();

			const embed = new discord.EmbedBuilder()
				.setColor(config.config.color.info)
				.setTitle('Lyrics')
				.setDescription(util.cutString(target));

			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			await interaction.editReply('Sorry, but the lyric was not found.');
		}
	}

	else if ((customId || command) === 'stop') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		queue[guildId].voiceChannel = '';
		queue[guildId].textChannel = '';
		queue[guildId].player.status = 'finished';

		await llturbo.leaveVoiceChannel(guildId);

		await interaction.editReply('Stopped playing');
	}

	else if (command === 'playlist') {
		await interaction.deferReply();

		if (!queue[guildId]) queue.add(guildId);

		if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
			const noValidVCEmbed = new discord.EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({
					name: ` | 🚫 - Please join a valid voice channel first!`,
					iconURL: interaction.user.avatarURL({})
				});

			await interaction.editReply({ embeds: [noValidVCEmbed] });

			return;
		}

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply('Sorry, the player is not playing any audio.');

			return;
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'save') {
			const index = playlist.playlist.length + 1;
			const data = {
				[index]: {
					queue: queue[guildId].queue,
					author: interaction.user
				}
			};

			playlist.playlist.push(data);

			fs.writeFileSync('./db/playlist.json', JSON.stringify(playlist));

			await interaction.editReply(`Added the queue to public playlist. Your playlist's ID is ${index}`);
		}

		else if (subcommand === 'load') {
			const id = interaction.options.getInteger('id');

			if (!playlist.playlist[id]) {
				await interaction.editReply('Sorry, the playlist does not exist.');

				return;
			}

			await interaction.editReply(`Added the public playlist to the queue.`);
		}
	}

	else if (command === 'skipto') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)
				]
			});

			return;
		}

		const position = interaction.options.getInteger('position');
		if (queue[guildId].queue.length < position || position <= 0) {
			await interaction.editReply({
				embeds: [
					embeds.generateMessageEmbed(interaction, `The position is invalid.`)
				]
			});

			return;
		}

		queue[guildId].index = position - 1;
		const index = queue[guildId].index;
		queue[guildId].suppressEnd = true;

		await queue[guildId].player.playTrack({
			track: queue[guildId].queue[index].data.encoded
		});

		await interaction.editReply({
			embeds: [
				embeds.generateMessageEmbed(interaction, `Skip to ${position}`)
			]
		});
	}

	else if (command === 'config') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (interaction.options.getSubcommand() === 'autoreplay') {
			if (interaction.options.getBoolean('autoreplay')) {
				queue[guildId].autoReplay = true;
				queue[guildId].autoPlay = false;
			} else {
				queue[guildId].autoReplay = false;
			}

			await interaction.editReply(`From now on, the queue will ${!queue[guildId].autoReplay ? 'not ' : ''}be automatically replayed when it has finished.`);
		}
		if (interaction.options.getSubcommand() === 'autoplay') {
			if (interaction.options.getBoolean('autoplay')) {
				queue[guildId].autoPlay = true;
				queue[guildId].autoRelay = false;
			} else {
				queue[guildId].autoPlay = false;
			}

			await interaction.editReply(`From now on, the queue will ${!queue[guildId].autoPlay ? 'not ' : ''}be automatically played when it has finished.`);
		}
	}

	else if (command === 'filter') {
		await interaction.deferReply();

		if (!(await hasValidVC(interaction))) return;

		if (queue[guildId].player.status !== 'playing') {
			await interaction.editReply('Player is not playing any song.');

			return;
		}

		queue[guildId].player.setFilters({
			tremolo: {
				frequency: 5.0,
				depth: 0.5
			}
		})

		await interaction.editReply('Set vibrato filter');
	}

	else if (command === 'gpt') {
		await interaction.deferReply();

		const option = interaction.options.getString('gpt');
		if (option === 'reset') {
			try {
				delete gptQueue[guildId];

				await interaction.editReply('Reset GPT. The GPT will no longer answer messages in this channel.');
			} catch { }

			return;
		}

		if (!gptQueue[guildId]) {
			gptQueue.add(guildId, Number(option));

			await interaction.editReply(`Set ${option} on this channel.`);
		} else {
			delete gptQueue[guildId];
			gptQueue.add(guildId, option);

			await interaction.editReply(`Set ${option} on this channel.`);
		}
	}
});

async function startPlay(guildId) {
	queue[guildId].index = 0;
	const index = queue[guildId].index;

	await queue[guildId].player.playTrack({
		track: queue[guildId].queue[index].data.encoded
	});
}

function addEventListenerToPlayer(guildId) {
	queue[guildId].player.on('start', async () => {
		queue[guildId].player.status = 'playing';
		queue[guildId].player.setGlobalVolume(queue[guildId].volume);
		queue[guildId].suppressEnd = false;
		queue[guildId].player.position = 0;
		const embed = embeds.generateStartEmbed(queue, guildId, 0);

		const btn = new discord.ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('pause').setLabel('Pause').setEmoji('1117306256781230191').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('stop').setLabel('Stop').setEmoji('1100927733116186694').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId('back').setLabel('Back').setEmoji('1117303043743039599').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('skip').setLabel('Skip').setEmoji('1117303289365659648').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('addR').setLabel('Add Relate').setStyle(ButtonStyle.Secondary)
		);

		const subBtn = new discord.ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('volumeDown').setLabel('Down').setEmoji('1117303628349313035').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('volumeUp').setLabel('Up').setEmoji('1117304554216767558').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('lyric').setLabel('Lyric').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('queue').setLabel('Queue').setEmoji('1117304805237465138').setStyle(ButtonStyle.Secondary)
		);

		const seekBtn = new discord.ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('30m').setLabel('-30s').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('30p').setLabel('+30s').setStyle(ButtonStyle.Secondary)
		);

		const msg = await queue[guildId].textChannel.send({
			embeds: [embed],
			components: [btn, subBtn, seekBtn],
		});

		try {
			await queue[guildId].panel.delete();
		} catch (err) {
			queue[guildId].panel = msg;

			return;
		}

		queue[guildId].panel = msg;
	});

	queue[guildId].player.on('resumed', async function (s) {
		const embed = embeds.generateUnpauseEmbed(queue, guildId, 0, config);
		const btn = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('pause').setLabel('Pause').setEmoji('1117306256781230191').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('stop').setLabel('Stop').setEmoji('1100927733116186694').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId('back').setLabel('Back').setEmoji('1117303043743039599').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('skip').setLabel('Skip').setEmoji('1117303289365659648').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('addR').setLabel('Add Relate').setStyle(ButtonStyle.Secondary)
		);
		const subBtn = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('volumeDown').setLabel('Down').setEmoji('1117303628349313035').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('volumeUp').setLabel('Up').setEmoji('1117304554216767558').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('lyric').setLabel('Lyric').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('queue').setLabel('Queue').setEmoji('1117304805237465138').setStyle(ButtonStyle.Secondary)
		);
		const seekBtn = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('30m').setLabel('-30s').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('30p').setLabel('+30s').setStyle(ButtonStyle.Secondary)
		);
		const msg = await queue[guildId].textChannel.send({
			embeds: [embed],
			components: [btn, subBtn, seekBtn],
		});
		try {
			await queue[guildId].panel.delete();
		} catch (err) {
			queue[guildId].panel = msg;
			return;
		}
		queue[guildId].panel = msg;
	});

	queue[guildId].player.on('paused', async function (s) {
		const embed = embeds.generatePauseEmbed(queue, guildId, 0, config);
		const btn = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('unpause').setLabel('Resume').setEmoji('1117306258077257791').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('stop').setLabel('Stop').setEmoji('1100927733116186694').setStyle(ButtonStyle.Danger),
			new ButtonBuilder().setCustomId('back').setLabel('Back').setEmoji('1117303043743039599').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('skip').setLabel('Skip').setEmoji('1117303289365659648').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('addR').setLabel('Add Relate').setStyle(ButtonStyle.Secondary)
		);
		const subBtn = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('volumeDown').setLabel('Down').setEmoji('1117303628349313035').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('volumeUp').setLabel('Up').setEmoji('1117304554216767558').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('lyric').setLabel('Lyric').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('queue').setLabel('Queue').setEmoji('1117304805237465138').setStyle(ButtonStyle.Secondary)
		);
		const seekBtn = new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId('30m').setLabel('-30s').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('30p').setLabel('+30s').setStyle(ButtonStyle.Secondary)
		);
		const msg = await queue[guildId].textChannel.send({
			embeds: [embed],
			components: [btn, subBtn, seekBtn],
		});
		try {
			await queue[guildId].panel.delete();
		} catch (err) {
			queue[guildId].panel = msg;
			return;
		}
		queue[guildId].panel = msg;
	});

	queue[guildId].player.on('end', async function (s) {
		const index = queue[guildId].index + 1;
		queue[guildId].previous = queue[guildId].queue[queue[guildId].index];
		queue[guildId].player.status = 'finished';
		if (queue[guildId].suppressEnd) return;
		if (index === queue[guildId].queue.length) {
			if (queue[guildId].autoReplay) {
				await startPlay(guildId);
				return;
			}
			if (queue[guildId].autoPlay) {
				const previous = queue[guildId].previous;
				if (previous.data.info.sourceName === 'spotify') {
					const res = await spotifyClient.getRecommendations(previous.data.info.identifier);
					const track = await queue[guildId].node.rest.resolve(`https://open.spotify.com/intl-ja/track/${res}`);
					queue[guildId].add(track.data, 'Auto Recommendation');
					queue[guildId].index++;
					await queue[guildId].player.playTrack({
						track: queue[guildId].queue[index].data.encoded,
					});
				} else {
					const searchResult = await queue[guildId].node.rest.resolve(`ytsearch:${previous.data.info.author}`);
					if (!searchResult?.data.length) {
						await queue[guildId].textChannel.send('Finished playing queue. I was not able to find any recommendation for you.');
						return;
					}
					res = searchResult.data.shift();
					queue[guildId].add(res, 'Auto Recommendation');
					queue[guildId].index++;
					await queue[guildId].player.playTrack({
						track: queue[guildId].queue[index].data.encoded,
					});
				}
			} else {
				try {
					await queue[guildId].textChannel.send('Finished playing queue.');
				} catch(err) {
					return;
				}
				return;
			}
		} else {
			queue[guildId].index++;
			await queue[guildId].player.playTrack({
				track: queue[guildId].queue[index].data.encoded,
			});
			return;
		}
	});
}
async function eventOnPaused(guildId) {
	const embed = embeds.generatePauseEmbed(queue, guildId, 0, config);
	const btn = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('unpause').setLabel('Resume').setEmoji('1117306258077257791').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('stop').setLabel('Stop').setEmoji('1100927733116186694').setStyle(ButtonStyle.Danger),
		new ButtonBuilder().setCustomId('back').setLabel('Back').setEmoji('1117303043743039599').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('skip').setLabel('Skip').setEmoji('1117303289365659648').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('addR').setLabel('Add Relate').setStyle(ButtonStyle.Secondary)
	);
	const subBtn = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('volumeDown').setLabel('Down').setEmoji('1117303628349313035').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('volumeUp').setLabel('Up').setEmoji('1117304554216767558').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('lyric').setLabel('Lyric').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('queue').setLabel('Queue').setEmoji('1117304805237465138').setStyle(ButtonStyle.Secondary)
	);
	const seekBtn = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('30m').setLabel('-30s').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('30p').setLabel('+30s').setStyle(ButtonStyle.Secondary)
	);
	const msg = await queue[guildId].textChannel.send({
		embeds: [embed],
		components: [btn, subBtn, seekBtn],
	});
	try {
		await queue[guildId].panel.delete();
	} catch (err) {
		queue[guildId].panel = msg;
		return;
	}
	queue[guildId].panel = msg;
}

async function eventOnResumed(guildId) {
	const embed = embeds.generateUnpauseEmbed(queue, guildId, 0, config);
	const btn = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('pause').setLabel('Pause').setEmoji('1117306256781230191').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('stop').setLabel('Stop').setEmoji('1100927733116186694').setStyle(ButtonStyle.Danger),
		new ButtonBuilder().setCustomId('back').setLabel('Back').setEmoji('1117303043743039599').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('skip').setLabel('Skip').setEmoji('1117303289365659648').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('addR').setLabel('Add Relate').setStyle(ButtonStyle.Secondary)
	);
	const subBtn = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('volumeDown').setLabel('Down').setEmoji('1117303628349313035').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('volumeUp').setLabel('Up').setEmoji('1117304554216767558').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('lyric').setLabel('Lyric').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('queue').setLabel('Queue').setEmoji('1117304805237465138').setStyle(ButtonStyle.Secondary)
	);
	const seekBtn = new ActionRowBuilder().addComponents(
		new ButtonBuilder().setCustomId('30m').setLabel('-30s').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('30p').setLabel('+30s').setStyle(ButtonStyle.Secondary)
	);
	const msg = await queue[guildId].textChannel.send({
		embeds: [embed],
		components: [btn, subBtn, seekBtn],
	});
	try {
		await queue[guildId].panel.delete();
	} catch (err) {
		queue[guildId].panel = msg;
		return;
	}
	queue[guildId].panel = msg;
}

async function hasValidVC(interaction) {
	const guildId = interaction.guild.id;

	if (!queue[guildId]) queue.add(guildId);

	if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
		const noValidVCEmbed = new discord.EmbedBuilder()
			.setColor(config.config.color.info)
			.setAuthor({
				name: ` | 🚫 - Please join a valid voice channel first!`,
				iconURL: interaction.user.avatarURL({})
			});

		await interaction.editReply({ embeds: [noValidVCEmbed] });

		return false;
	}

	return true;
}

llturbo.on('error', (_, error) => log.error(error));

llturbo.on('ready', async (_data) => {
	log.ready(`Ready to accept commands. Boot took ${(new Date() - start) / 1000}s`);

	console.log(fs.readFileSync('./assets/logo.txt').toString());
});

process.on('uncaughtException', (err) => {
	log.error(err.stack);
});

client.login(config.bot.token);
