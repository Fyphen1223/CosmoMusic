const start = new Date();
const config = require('./config.json');
if (config.config.console.consoleClear) console.clear();
console.log('🏁 - \x1b[34mReady... Please wait, now loading packages... (Step 1/4)\x1b[39m');
const discord = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageAttachment, AttachmentBuilder, codeBlock } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, VoiceConnectionStatus, AudioPlayerStatus, NoSubscriberBehavior, StreamType, AudioReceiveStream, EndBehaviorType, entersState } = require('@discordjs/voice');
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
	], partials: [
		discord.Partials.Channel,
		discord.Partials.GuildMember,
		discord.Partials.GuildScheduledEvent,
		discord.Partials.Message,
		discord.Partials.Reaction,
		discord.Partials.ThreadMember,
		discord.Partials.User
	]
});
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
var radio = {};
var audio = {};
var ttsList = [];
var freetalkList = [];
const radioList = ["Nature 1", "Nature 2", "Nature 3", "Nature 4", "Nature 5", "ASMR 1", "ASMR 2", "Music 1", "Music 2", "Music 3", "Music 4", "Music 5", "Jazz 1", "Jazz 2"];
const radioUrl = ["https://purenature-mynoise.radioca.st/stream", "https://maggie.torontocast.com:2020/stream/natureradiorain", "https://mpc2.mediacp.eu/stream/natureradiosleep", "http://air.radioart.com/fNature.mp3", "http://orion.shoutca.st:8157/stream", "https://drive.uber.radio/uber/asmrmouthsounds/icecast.audio", "https://drive.uber.radio/uber/asmrtapping/icecast.audio", "https://mediaserv38.live-streams.nl:18040/live"];
console.log("🔵 - Loaded Discord.js... (Step 2/4)");
const fs = require('fs');
const { request } = require('undici');
const requester = require("request");
const puppeteer = require('puppeteer');
const whois = new require('whois');
const Genius = require("genius-lyrics");
const lyricsSearcher = new Genius.Client(config.token.genius);
const { NekoBot } = require("nekobot-api");
const nekoApi = new NekoBot();
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const http = require('http');
const https = require('https');
const express = require('express');
const socketio = require('socket.io');
//Admin panel
const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);
//User Panel
const userApp = express();
const userServer = https.createServer({
	key: fs.readFileSync('./ssl/privatekey.pem'),
	cert: fs.readFileSync('./ssl/cert.pem'),
	ca: fs.readFileSync('./ssl/chain.pem'),
}, userApp);
const userIo = new socketio.Server(userServer);

const sess = {
	secret: 'secretsecretsecret',
	cookie: {
		maxAge: 600000
	},
	resave: false,
	saveUninitialized: false,
};
const { ytUtil } = require("./packages/ytUtil.js");
const ytU = new ytUtil();
const util = require('./utils/utils.js');
const session = require('express-session');
const bodyParser = require('body-parser');
const prism = require("prism-media");
const YoutubeMusicApi = require("youtube-music-api");
const tesseract = require("node-tesseract-ocr");
const ocrConfig = {
	lang: "eng",
	oem: 1,
	psm: 3,
};
const chatAi = require('api')('@writesonic/v2.2#4enbxztlcbti48j');
const gtts = require('node-gtts')('en');
const jpGtts = require('node-gtts')('ja');
const wait = require('node:timers/promises').setTimeout;
const updater = require("request");
const cpuStat = require("cpu-stat");
const vosk = require('vosk');
const { Readable } = require("stream");
const wav = require("wav");
const ffmpeg = require('fluent-ffmpeg');
const voskModelPath = "./vosk-model-ja-fast";
const voskModel = new vosk.Model(voskModelPath);
vosk.setLogLevel(0);
console.log("🔵 - Loaded other packages... (Step 3/4)");
const updaterInfo = {
	url: 'https://G-Music-Bot.ssfyphen.repl.co',
	method: 'GET'
};
const currentVersion = "1.1.0 - A";
console.log(`🏁 - Version: ${currentVersion}`);
updater(updaterInfo, function (error, response, body) {
	if (body !== currentVersion) {
		createWarn(`Please update Net Hacker! Current Version: ${currentVersion} Latest Version: ${body}`);
	} else {
		return;
	}
});
const fsEx = require("fs-extra");
fsEx.remove('./rec', (err) => {
	if (err) return;
	console.log('Directory Rec Inited');
	fs.mkdir('./rec', (err) => {
		if (err) return;
	});
});
function generateTimeString() {
	return `${new Date().toLocaleString()}`;
}
function createInfo(title) {
	console.log(`[INFO]: ${title} [TIME]: ${generateTimeString()}`);
}
function createWarn(title) {
	console.log(`\x1b[41m[WARN]\x1b[49m: ${title} [TIME]: ${generateTimeString()}`);
}
function addEventListenerToPlayer(player, guildId) {
	player.on('error', error => { console.error(error); });
	player.on(AudioPlayerStatus.Playing, async (meta) => {
		const embed = new EmbedBuilder()
			.setColor(config.config.color.info)
			.addFields(
				{ name: 'Author', value: audio[guildId]["artist"], inline: true },
				{ name: 'Title', value: audio[guildId]["title"], inline: true },
				{ name: 'Duration', value: `${util.formatTime(Math.floor(audio[guildId]["seek"] + (meta.resource.playbackDuration / 1000)))}/${util.formatTime(meta.resource.metadata.length)}`, inline: true },
				{ name: 'Started by', value: `${meta.resource.metadata.user}`, inline: true },
				{ name: 'Volume', value: `${Math.floor((audio[guildId]["volume"] * 10)) * 10}%`, inline: true },
				{ name: 'Position', value: `${audio[guildId]["index"] + 1}/${audio[guildId]["queue"].length}`, inline: true },
			)
			.setThumbnail(getThumbnails(meta.resource.metadata.id));
		const btn = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('pause')
					.setLabel('Pause')
					.setEmoji('1117306256781230191')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('stop')
					.setLabel('Stop')
					.setEmoji('1100927733116186694')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('Back')
					.setEmoji('1117303043743039599')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('skip')
					.setLabel('Skip')
					.setEmoji('1117303289365659648')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('addR')
					.setLabel('Add Relate')
					.setStyle(ButtonStyle.Secondary));
		const subBtn = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('volumeDown')
					.setLabel('Down')
					.setEmoji('1117303628349313035')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('volumeUp')
					.setLabel('Up')
					.setEmoji('1117304554216767558')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('lyric')
					.setLabel('Lyric')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('queue')
					.setLabel('Queue')
					.setEmoji("1117304805237465138")
					.setStyle(ButtonStyle.Secondary));
		const seekBtn = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('30m')
					.setLabel('-30s')
					//.setEmoji('1117303628349313035')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('30p')
					.setLabel('+30s')
					//.setEmoji('1117304554216767558')
					.setStyle(ButtonStyle.Secondary));
		const msg = await audio[guildId]["previousChannel"].send({ embeds: [embed], components: [btn, subBtn, seekBtn] });
		audio[guildId]["previousChannel"].setTopic(`♬ - Playing ${meta.resource.metadata.title} by ${meta.resource.metadata.artist} Length: ${util.formatTime(meta.resource.playbackDuration / 1000)}/${util.formatTime(audio[guildId]["length"])}`);
		if (!audio[guildId]["previousPanel"]) {
			audio[guildId]["previousPanel"] = msg;
			return;
		} else {
			try {
				audio[guildId]["previousPanel"].delete();
			} catch (err) { }
			audio[guildId]["previousPanel"] = msg;
			return;
		}
		return;
	});
	player.on(AudioPlayerStatus.Paused, async (meta) => {
		const embed = new EmbedBuilder()
			.setColor(config.config.color.info)
			.addFields(
				{ name: 'Author', value: audio[guildId]["artist"], inline: true },
				{ name: 'Title', value: audio[guildId]["title"], inline: true },
				{ name: 'Duration', value: `${util.formatTime(Math.floor(audio[guildId]["seek"] + (meta.resource.playbackDuration / 1000)))}/${util.formatTime(meta.resource.metadata.length)}`, inline: true },
				{ name: 'Started by', value: `${meta.resource.metadata.user}`, inline: true },
				{ name: 'Volume', value: `${Math.floor((audio[guildId]["volume"] * 10)) * 10}%`, inline: true },
				{ name: 'Position', value: `${audio[guildId]["index"] + 1}/${audio[guildId]["queue"].length}`, inline: true },
			)
			.setThumbnail(getThumbnails(meta.resource.metadata.id));
		const btn = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('unpause')
					.setLabel('Resume')
					.setEmoji('1117306258077257791')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('stop')
					.setLabel('Stop')
					.setEmoji('1100927733116186694')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('back')
					.setLabel('Back')
					.setEmoji('1117303043743039599')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('skip')
					.setLabel('Skip')
					.setEmoji('1117303289365659648')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('addR')
					.setLabel('Add Relate')
					.setStyle(ButtonStyle.Secondary));
		const subBtn = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('volumeDown')
					.setLabel('Down')
					.setEmoji('1117303628349313035')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('volumeUp')
					.setLabel('Up')
					.setEmoji('1117304554216767558')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('lyric')
					.setLabel('Lyric')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('queue')
					.setLabel('Queue')
					.setEmoji("1117304805237465138")
					.setStyle(ButtonStyle.Secondary));
		const seekBtn = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('30m')
					.setLabel('-30s')
					//.setEmoji('1117303628349313035')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('30p')
					.setLabel('+30s')
					//.setEmoji('1117304554216767558')
					.setStyle(ButtonStyle.Secondary));
		const msg = await audio[guildId]["previousChannel"].send({ embeds: [embed], components: [btn, subBtn, seekBtn] });
		audio[guildId]["previousChannel"].setTopic(`♬ - Playing ${meta.resource.metadata.title} by ${meta.resource.metadata.artist} Length: ${util.formatTime(meta.resource.playbackDuration / 1000)} / ${util.formatTime(audio[guildId]["length"])}`);
		if (!audio[guildId]["previousPanel"]) {
			audio[guildId]["previousPanel"] = msg;
			return;
		} else {
			try {
				audio[guildId]["previousPanel"].delete();
			} catch (err) { }
			audio[guildId]["previousPanel"] = msg;
			return;
		}
	});
	player.on('stateChange', async (oldState, newState) => {
		console.log(oldState.status, newState.status);
		if (oldState.status === "playing" && newState.status === "idle") {
			if (audio[guildId]["index"] + 1 === audio[guildId]["queue"].length) {
				if (audio[guildId]["autoReplay"] === true) {
					audio[guildId]["index"] = 0;
					const queueUrl = audio[guildId]["queue"][0];
					try {
						audio[guildId]['stream'] = ytU.downloadRaw(queueUrl);
						audio[guildId]['seekStream'] = ytU.downloadRaw(queueUrl);
					} catch (err) {
						console.log(err.stack);
						return;
					}
					audio[guildId]["id"] = ytdl.getURLVideoID(queueUrl);
					await getVideoInfo(audio[guildId]["id"], audio[guildId]);
					audio[guildId]["seek"] = 0;
					audio[guildId]['resource'] = createAudioResource(audio[guildId]['stream'], {
						metadata: {
							title: audio[guildId]['title'],
							artist: audio[guildId]['artist'],
							length: audio[guildId]['length'],
							id: audio[guildId]['id'],
							user: audio[guildId]["previousUser"],
							autoreplay: audio[guildId]['autoReplay'],
							channel: audio[guildId]["previousChannel"],
						},
						inlineVolume: true,
					});
					try {
						audio[guildId]["player"].play(audio[guildId]["resource"]);
					} catch (err) {
						audio[guildId]["previousChannel"].send("An error occured. Please try again or check URL.");
						audio[guildId]["id"] = "";
						console.log(err.stack);
						return;
					}
					return;
				} else {
					await audio[guildId]["previousChannel"].send("Finished Playing Queue.");
					audio[guildId]["status"] = "Stopping";
					audio[guildId]["resource"] = "";
					audio[guildId]["title"] = "";
					audio[guildId]["id"] = "";
					audio[guildId]["artist"] = "";
					audio[guildId]["length"] = "";
					return;
				}
			}

			if ((audio[guildId]["index"] + 1) < audio[guildId]["queue"].length) {
				const queueUrl = audio[guildId]["queue"][audio[guildId]["index"] + 1];
				audio[guildId]["index"]++;

				try {
					audio[guildId]['stream'] = ytU.downloadRaw(queueUrl);
					audio[guildId]['seekStream'] = ytU.downloadRaw(queueUrl);
				} catch (err) {
					console.log(err.stack);
					return;
				}

				audio[guildId]["id"] = ytdl.getURLVideoID(queueUrl);
				await getVideoInfo(audio[guildId]["id"], audio[guildId]);
				audio[guildId]["seek"] = 0;
				audio[guildId]['resource'] = createAudioResource(audio[guildId]['stream'], {
					metadata: {
						title: audio[guildId]['title'],
						artist: audio[guildId]['artist'],
						length: audio[guildId]['length'],
						id: audio[guildId]['id'],
						user: audio[guildId]["previousUser"],
						autoreplay: audio[guildId]['autoReplay'],
						channel: audio[guildId]["previousChannel"],
					},
					inlineVolume: true,
				});
				try {
					audio[guildId]["player"].play(audio[guildId]["resource"]);
				} catch (err) {
					audio[guildId]["previousChannel"].send("An error occured. Please try again or check URL.");
					audio[guildId]["id"] = "";
					console.log(err.stack);
					return;
				}
			}
		} else {
			return;
		}
	});
	return;
}
async function startPlay(guildId, interaction, msg) {
	const queueUrl = audio[guildId]["queue"][0];
	audio[guildId]["rawStream"] = ytU.downloadRaw(queueUrl);
	audio[guildId]["seekStream"] = ytU.downloadRaw(queueUrl);
	const stream = createFFmpegStream(audio[guildId]["rawStream"], 0);
	audio[guildId]["stream"] = stream;
	audio[guildId]["previousChannel"] = interaction.channel;
	audio[guildId]["index"] = 0;
	audio[guildId]["volume"] = 1.0;
	audio[guildId]["seek"] = 0;
	audio[guildId]["id"] = ytdl.getURLVideoID(audio[guildId]["queue"][0]);
	await getVideoInfo(audio[guildId]["id"], audio[guildId]);
	let user = "";
	let channel = "";
	if (!interaction) {
		user = msg.author;
		channel = msg.channel;
	} else {
		user = interaction.user;
		channel = interaction.channel;
	}
	const resource = createAudioResource(audio[guildId]['stream'], {
		metadata: {
			title: audio[guildId]['title'],
			artist: audio[guildId]['artist'],
			length: audio[guildId]['length'],
			id: audio[guildId]['id'],
			user: user,
			autoreplay: audio[guildId]['autoReplay'],
			channel: channel,
		},
		inlineVolume: true,
	});
	audio[guildId]["resource"] = resource;
	try {
		audio[guildId]["player"].play(resource);
	} catch (err) {
		console.log(err.stack);
	}
	return;
}
if (!configChecker()) {
	createWarn("Please input valid config to config.json!");
	process.exit();
}
var guildList = [];
var guildNameList = [];
var ttsConnection = "";
var ttsPlayer = createAudioPlayer();
var previousTts = "";
async function fetchMany(channel, options = { limit: 50 }) {
	if ((options.limit ?? 50) <= 100) {
		return channel.messages.fetch(options);
	}

	if (typeof options.around === "string") {
		const messages = await channel.messages.fetch({ ...options, limit: 100 });
		const limit = Math.floor((options.limit - 100) / 2);
		if (messages.size < 100) {
			return messages;
		}
		const backward = fetchMany(channel, { limit, before: messages.last().id });
		const forward = fetchMany(channel, { limit, after: messages.first().id });
		return util.array2Collection([messages, ...await Promise.all([backward, forward])].flatMap(
			e => [...e.values()]
		));
	}
	let temp;
	function buildParameter() {
		const req_cnt = Math.min(options.limit - messages.length, 100);
		if (typeof options.after === "string") {
			const after = temp
				? temp.first().id : options.after
			return { ...options, limit: req_cnt, after };
		}
		const before = temp
			? temp.last().id : options.before;
		return { ...options, limit: req_cnt, before };
	}
	const messages = [];
	while (messages.length < options.limit) {
		const param = buildParameter();
		temp = await channel.messages.fetch(param);
		messages.push(...temp.values());
		if (param.limit > temp.size) {
			break;
		}
	}
	return util.array2Collection(messages);
}
client.on('ready', async () => {
	var now = new Date();
	console.log(`🟢 -\x1b[46m${client.user.tag} has started. Now version is ${currentVersion}. Boot time:${(now - start) / 1000}s\x1b[49m`);
	setInterval(() => {
		let ping = client.ws.ping;
		let speed = "";
		if (ping < 40) {
			speed = "Fast"
		} else if (ping > 40 && ping < 80) {
			speed = "Normal"
		} else if (ping > 80 && ping < 120) {
			speed = "Slow"
		} else {
			speed = "Heavy"
		}
		client.user.setActivity({
			name: `${ping}ms - ${speed} Supporting ${client.guilds.cache.size} guilds.`
		});
		io.emit("ping", client.ws.ping);
	}, 30000);
	for (const [key, value] of client.guilds.cache) {
		guildList.push(key);
	}
	for (const [key, value] of client.guilds.cache) {
		guildNameList.push(value["name"]);
	}
	//const guild = await client.guilds.cache.get("891638532353949706");
	//const channels = guild.channels.cache.map(channel => `${channel.name}:${channel.id}`);
	//console.log(channels);
	//const channel = await client.channels.cache.get("891638532353949709");
	//let list = [];
	/* 
	await channel.messages.fetch({ limit: 100 })
		.then(messages => {
			messages.forEach(message =>
				list.push(`${message.author.tag}: ${message.content}: ${message.createdAt}`));
		})
		.catch(console.error);
	*/
	/*
	const fetch = await fetchMany(channel, {
		limit: 500,
	});
	let msg = [];
	await fetch.forEach(message =>
		msg.push(`${message.author.tag}: ${message.content}: ${message.createdAt}`)
	);
	console.log(msg.join('\n'));
	*/

});

client.on('messageCreate', async (msg) => {
	console.log(`----\nContent: ${msg.content}\nAuthor: ${msg.author.tag}\nBot: ${msg.author.bot.toString()}\nChannel: ${msg.channel}\nTime: ${generateTimeString()}`);
	if (msg.author.bot) {
		return;
	}
	if (msg.channel.id === "1028891093544226928") {
		io.emit("dmgeted", msg.content, msg.author.tag, msg.author.id);
	}
	if (ttsList.indexOf(msg.channel.id) !== -1) {
		if (!msg.member.voice) return;
		ttsConnection = joinVoiceChannel({
			channelId: msg.member.voice.channelId,
			guildId: msg.channel.guild.id,
			adapterCreator: msg.channel.guild.voiceAdapterCreator,
			selfDeaf: false
		});
		await ttsConnection.subscribe(ttsPlayer);
		previousTts = msg.content;
		jpGtts.save("./audio/tts.wav", msg.content, async function () {
			const resource = createAudioResource("./audio/tts.wav");
			ttsPlayer.play(resource);
		});
	}
	if (freetalkList.indexOf(msg.channel.id) !== -1) {
		msg.channel.sendTyping();
		if (msg.content.startsWith("clever!")) {
			chatAi.auth(config.token.chatsonic);
			chatAi.chatsonic_V2BusinessContentChatsonic_post({
				enable_google_results: false,
				enable_memory: false,
				input_text: msg.content.replace("c!", "")
			}, { engine: 'premium' })
				.then(({ data }) => {
					msg.reply(data.message);
				})
				.catch(err => console.error(err));
		} else {
			let options = {
				url: 'https://api.a3rt.recruit.co.jp/talk/v1/smalltalk',
				method: 'POST',
				form: {
					"apikey": config.token.talk,
					"query": msg.content,
				},
				json: true
			}
			requester(options, async function (error, response, body) {
				if (!msg.member.voice) return;
				ttsConnection = joinVoiceChannel({
					channelId: msg.member.voice.channelId,
					guildId: msg.channel.guild.id,
					adapterCreator: msg.channel.guild.voiceAdapterCreator,
					selfDeaf: false
				});
				await ttsConnection.subscribe(ttsPlayer);
				previousTts = msg.content;
				jpGtts.save("./audio/tts.wav", body.results[0].reply, async function () {
					const resource = createAudioResource("./audio/tts.wav");
					ttsPlayer.play(resource);
				});
				msg.reply(body.results[0].reply);
			});
		}
	}
	if (msg.content.match("s!")) {
		if (msg.content.match("s!img")) {
			if (msg.channel.id === "906717644282023996" || "1082192799874691126") {
				msg.react("☑");
				var msgcontentimg = msg.content.replace("s!img ", "");
				(async () => {
					let image = await nekoApi.get(msgcontentimg);
					console.log(image);
					msg.channel.send({ files: [image] });
				})();
			} else {
				return;
			}
		}
	}
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isAutocomplete()) return;
	if (interaction.commandName === "queue" && interaction.options.getSubcommand() === "delete") {
		const focusedValue = interaction.options.getFocused();
		const filtered = audio[interaction.guild.id.toString()]["queue"].filter(choice => choice.startsWith(focusedValue));
		try {
			interaction.respond(
				filtered.map(choice => ({ name: choice, value: choice })),
			);
		} catch (err) {
			const rated = audio[interaction.guild.id.toString()]["queue"].slice(0, 24);
			const rateFilt = rated.filter(choice => choice.startsWith(focusedValue));
			interaction.respond(
				rateFilt.map(choice => ({ name: choice, value: choice })),
			);
		}
	}
	if (interaction.commandName === "radio" && interaction.options.getSubcommand() === "play") {
		const focusedValue = interaction.options.getFocused();
		const filtered = radioList.filter(choice => choice.startsWith(focusedValue));
		try {
			interaction.respond(
				filtered.map(choice => ({ name: choice, value: choice })),
			);
		} catch (err) {
			const rated = radioList.slice(0, 24);
			const rateFilt = rated.filter(choice => choice.startsWith(focusedValue));
			interaction.respond(
				rateFilt.map(choice => ({ name: choice, value: choice })),
			);
		}
	}
	if (interaction.commandName === "play") {
		const focusedValue = interaction.options.getFocused();
		const res = await ytU.search(focusedValue);
		const list = [];
		let i = 0;
		while (i < 5) {
			try {
				list.push(`${res[i].title}`);
			} catch (err) { }
			i++;
		}
		const filtered = list.filter(choice => choice);
		await interaction.respond(
			list.map(choice => ({ name: choice, value: choice })),
		);

	}
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.commandName === "ping") {
		let ping = client.ws.ping;
		let speed = "";
		if (ping < 40) {
			speed = "Fast"
		} else if (ping > 40 && ping < 80) {
			speed = "Normal"
		} else if (ping > 80 && ping < 120) {
			speed = "Slow"
		} else {
			speed = "Heavy"
		}
		const embed = new EmbedBuilder()
			.setColor(config.config.color.info)
			.setTitle('Ping')
			.setTimestamp()
			.addFields(
				{ name: 'Web Socket Ping', value: `${client.ws.ping}ms`, inline: true },
				{ name: 'Message Delay', value: `Pinging...`, inline: true },
				{ name: 'Status', value: `${speed}`, inline: true },
			);
		const rep = await interaction.reply({ content: "🏓 - Please wait, pinging...", embeds: [embed], fetchReply: true });
		const resultEmbed = new EmbedBuilder()
			.setColor(config.config.color.info)
			.setTitle('Ping')
			.setTimestamp()
			.addFields(
				{ name: 'Web Socket Ping', value: `${client.ws.ping}ms`, inline: true },
				{ name: 'Message Delay', value: `${rep.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
				{ name: 'Status', value: `${speed}`, inline: true },
			);
		await interaction.editReply({ content: "🏓 - Pong!", embeds: [resultEmbed] });
	} if (interaction.commandName === "clear") {
		try {
			const num = interaction.options.getInteger('clear');
			const user = interaction.member;
			const messages = await interaction.channel.messages.fetch({ limit: num });
			await interaction.channel.bulkDelete(messages);
			await interaction.reply({ content: `Clear message number of ${num}`, ephemeral: true });
		} catch (err) {
			interaction.reply({ content: 'An error occurred when try to delete message', ephemeral: true });
		}
	} if (interaction.commandName === "whois") {
		try {
			const domain = interaction.options.getString('domain');
			whois.lookup(domain, function (err, data) {
				console.log(data);
				let content = data.slice(0, 2000);
				interaction.reply(content);
			});
		} catch (err) {
			interaction.reply({ content: "I'm sorry, Error with whois command.", ephemeral: true });
		}
	} if (interaction.commandName === "screenshot") {
		await interaction.reply('Taking screenshot...');
		var surl = interaction.options.getString('url');
		if (!surl.match("https") && !surl.match("http")) {
			surl = "https://" + surl;
		}
		var img;
		(async () => {
			const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disabled-setuid-sandbox'], ignoreDefaultArgs: ['--disable-extensions'] });
			const page = await browser.newPage();
			await page.setViewport({ width: 1920, height: 1080 });
			try {
				await page.goto(surl, { waitUntil: 'networkidle2' });
				img = await page.screenshot({ path: "ss.png", fullPage: true });
				await browser.close();
				await interaction.editReply({ content: 'Screenshot Done', files: [img] });
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply({ content: "Cannot take screenshot", ephemeral: true });
			}
		})();
	} if (interaction.commandName === "pause" || interaction.customId === "pause") {
		await interaction.deferReply();
		const guildId = interaction.guild.id.toString();
		if (!audio[guildId]) {
			await interaction.editReply(`Sorry, you are not playing any song.`);
			return;
		}
		if (!interaction.member.voice.channelId) { await interaction.editReply("Please connect voice channel."); return; }
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		try {
			if (audio[guildId]["player"].pause()) {
				await interaction.editReply(`Paused by ${interaction.user}`);
			} else {
				await interaction.editReply(`Sorry, you are not playing any song.`);
			}
		} catch (err) {
			await interaction.editReply("Cannot pause the audio.");
		}
	} if (interaction.commandName === "unpause" || interaction.customId === "unpause") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) { await interaction.editReply("Please connect voice channel."); return; }
		const guildId = interaction.guild.id.toString();
		if (!audio[guildId]) {
			await interaction.editReply(`Sorry, you are not playing any song.`);
			return;
		}
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		try {
			if (audio[guildId]["player"].unpause()) {
				await interaction.editReply(`Unpaused by ${interaction.user}`);
			} else {
				await interaction.editReply(`Sorry, you are not playing any song.`);
			}
		} catch (err) {
			await interaction.editReply("Couldn't unpause audio resource");
		}
	} if (interaction.commandName === "stop" || interaction.customId === "stop") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) { await interaction.editReply("Please connect voice channel."); return; }
		const guildId = interaction.guild.id.toString();
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		try {
			await audio[guildId]["player"].stop();
			await audio[guildId]["connection"].disconnect(audio[guildId]["player"]);
			audio[guildId]["resource"] = "";
			audio[guildId]["stream"].destroy();
			audio[guildId]["channel"] = "";
			audio[guildId]["queue"] = [];
			audio[guildId]["previousChannel"] = "";
			audio[guildId]["id"] = "";
			const embed = new EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({ name: ` | 👋 - Stopped playing song`, iconURL: `${interaction.user.avatarURL({})}` });
			interaction.editReply({ embeds: [embed] });
		} catch (err) {
			interaction.editReply("Failed to stop music");
		}
	} if (interaction.commandName === "queue" && !interaction.isAutocomplete() || interaction.customId === "queue" && !interaction.isAutocomplete() || interaction.customId === "addR") {
		await interaction.deferReply();
		const guildId = interaction.guild.id.toString();
		if (audio[guildId] === undefined || null) {
			const temp = {
				[guildId]: {
					"previousUser": "",
					"previousChannel": "",
					"stream": "",
					"connection": "",
					"title": "",
					"artist": "",
					"length": "",
					"id": "",
					"autoReplay": "false",
					"player": "",
					"channel": "",
					"queue": [],
					"resource": "",
					"volume": "",
					"index": 0,
					"previousPanel": "",
					"savedQueue": [],
					"status": "",
					"rawStream": "",
					"seek": 0,
					"seekStream": "",
					"subSeekStream": "",
					"seekStreamInt": 0,
				}
			};
			audio = { ...audio, ...temp }
		}
		if (interaction.customId === "queue") {
			const guildId = interaction.guild.id.toString();
			let content = "";
			if (audio[guildId]["queue"].length === 0) {
				const embed = new EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription("No music added to the queue.");
				await interaction.editReply({ embeds: [embed] });
			} else {
				content = audio[guildId]["queue"].join("\n");
				const embed = new EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription(content);
				await interaction.editReply({ embeds: [embed] });
			}
			return;
		}
		if (interaction.customId === "addR") {
			if (!audio[guildId]["id"]) {
				await interaction.editReply("Nothing to search here.");
				return;
			} else {
				const res = await ytU.search(`${audio[guildId]["artist"]}`);
				audio[guildId]["queue"].push(res[0]["link"], res[1]["link"]);
				await interaction.editReply(`Added ${res[0]["title"]} and ${res[1]["title"]} to the queue.`)
			}
			return;
		}
		if (interaction.options.getSubcommand() === "display") {
			let content = "";
			if (audio[interaction.guild.id.toString()]["queue"].length === 0) {
				const embed = new EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription("No music added to the queue.");
				await interaction.editReply({ embeds: [embed] });
			} else {
				content = audio[interaction.guild.id.toString()]["queue"].join("\n");
				const embed = new EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle('Queue')
					.setDescription(content);
				await interaction.editReply({ embeds: [embed] });
			}
		} else if (interaction.options.getSubcommand() === "add") {
			let url = interaction.options.getString('url');
			try {
				const playlist = await ytpl(await ytpl.getPlaylistID(url));
				for (i = 0; i < playlist.items.length; i++) {
					audio[guildId]["queue"].push(playlist.items[i].url);
				}
				await interaction.editReply(`Added ${playlist.items.length} items to queue.`);
				return;
			} catch (err) {
				if (ytdl.validateURL(url)) {
					if (await ytU.isValidVideo(url)) {
						audio[guildId]["queue"].push(url);
						await interaction.editReply(`Added ${url} to the queue.`);
						return;
					} else {
						await interaction.editReply("Please type accurate YouTube Video Link.");
					}
				} else if (url.match("open.spotify.com")) {
					const raw = await ytU.spotifyToYT(url);
					audio[guildId]["queue"].push(raw);
					await interaction.editReply(`Added ${raw} to the queue.`);
				} else {
					await interaction.editReply("Your URL was invalid or not found.");
					return;
				}
			}
		} else if (interaction.options.getSubcommand() === "delete") {
			try {
				let url = interaction.options.getString('url');
				let num = audio[interaction.guild.id.toString()]["queue"].indexOf(url);
				audio[interaction.guild.id.toString()]["queue"].splice(num, 1);
				await interaction.editReply(`Deleted ${url} from queue`);
			} catch (err) {
				await interaction.editReply({ content: "Cannot remove music from queue", ephemeral: true });
			}
		} else if (interaction.options.getSubcommand() === "clear") {
			try {
				audio[guildId]["queue"] = [];
				audio[guildId]["player"].stop();
				guildAudioListInit(guildId);
				await interaction.editReply("Deleted all music");
			} catch (err) {
				await interaction.editReply('Cannot delete music');
			}
		} else if (interaction.options.getSubcommand() === "addrelate") {
			if (audio[guildId]["id"] === "" || audio[guildId]["id"] === null || audio[guildId]["id"] === undefined) {
				await interaction.editReply("Nothing to search here.");
				return;
			} else {
				const res = await ytU.search(`${audio[guildId]["artist"]}`);
				audio[guildId]["queue"].push(res[0]["link"], res[1]["link"]);
				await interaction.editReply(`Added ${res[0]["title"]} and ${res[1]["title"]} to the queue.`)
			}
		} else if (interaction.options.getSubcommand() === "shuffle") {
			const arrayTemp = util.shuffleArray(audio[guildId]["queue"]);
			audio[guildId]["queue"] = arrayTemp;
			await interaction.editReply(`Shuffled ${audio[guildId]["queue"].length} musics.`);
			return;
		}
	} if (interaction.commandName === "youtube") {
		await interaction.deferReply();
		if (interaction.options.getSubcommand() === "search") {
			const key = interaction.options.getString('keyword');
			const res = await ytU.search(key);
			const embed = new EmbedBuilder()
				.setTitle("Search Results")
				.setColor(config.config.color.info);
			if (res.length === 0) {
				await interaction.editReply("Sorry, there's no result.");
				return;
			}
			let i = 0;
			while (i < 5 && i < res.length) {
				embed.addFields(
					{ name: `${res[i].title + " | " + res[i].channel.name}`, value: res[i].link, inline: false },
				);
				i++;
			}
			interaction.editReply({ embeds: [embed] });
		} else if (interaction.options.getSubcommand() === "info") {
			let url = interaction.options.getString("url");
			let videoChannel = "";
			let videoTitle = "";
			let videoLength = "";
			url = url.replace("https://www.youtube.com/watch?v=", "");
			url = url.replace("https://youtube.com/watch?v=", "");
			try {
				videoTitle = await ytdl.getInfo(url).then(info => {
					let title = info.videoDetails.title;
					return title;
				});
			} catch (err) {
				return;
			}
			try {
				videoChannel = await ytdl.getInfo(url).then(info => {
					let artist = info.videoDetails.author.name;
					return artist;
				});
			} catch (err) {
				return;
			}
			try {
				videoLength = await ytdl.getInfo(url).then(info => {
					let len = info.videoDetails.lengthSeconds;
					return len;
				});
			} catch (err) {
				return;
			}
			const embed = new EmbedBuilder()
				.setTitle('YouTube Info')
				.setColor(config.config.color.info)
				.addFields(
					{ name: `Video Title`, value: videoTitle, inline: false },
					{ name: `Channel Name`, value: videoChannel, inline: true },
					{ name: `Length`, value: `${videoLength}s`, inline: true },
					{ name: `URL`, value: interaction.options.getString('url'), inline: true }
				)
				.setImage(getThumbnails(url));
			await interaction.editReply({ content: "Results", embeds: [embed] });
		} else if (interaction.options.getSubcommand() === "playlist") {
			let url = interaction.options.getString("url");
			const playlist = await ytpl(await ytpl.getPlaylistID(url));
			let cont = "";
			for (i = 0; i < playlist.items.length; i++) {
				cont = cont + "\n" + playlist.items[i].title;
				console.log(playlist.items[i].title);
			}
			try {
				await interaction.editReply(cont);
			} catch (err) {
				await interactin.editReply("Cannot send playlist due to an error.");
			}
		}
	} if (interaction.commandName === "skip" || interaction.customId === "skip") {
		await interaction.deferReply();
		const guildId = interaction.guild.id.toString();
		if (!interaction.member.voice.channelId) {
			await interaction.editReply("Please connect voice channel."); return;
		}
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) {
			await interaction.editReply("You are not in my voice channel."); return;
		}
		if (await skip(guildId)) {
			await interaction.editReply('Skip');
		} else {
			await interaction.editReply("You cannot do that due to luck of music.");
			return;
		}
	} if (interaction.commandName === "back" || interaction.customId === "back") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) {
			await interaction.editReply("Please connect voice channel."); return;
		}
		const guildId = interaction.guild.id.toString();
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) {
			await interaction.editReply("You are not in my voice channel."); return;
		}
		if (await back(guildId)) {
			await interaction.editReply('Back');
		} else {
			await interaction.editReply('You cannot do that due to lack of music.');
		}
	} if (interaction.commandName === "tts") {
		await interaction.deferReply();
		const content = interaction.options.getString('content');
		try {
			await genAudio(content, "./audio/tts.wav");
		} catch (err) {
			await interaction.editReply("I'm sorry, but I cannot play the audio right now.");
			return;
		}
		ttsStream = "";
		if (!interaction.member.voice.channelId) { await interaction.editReply('Please connect voice channel.'); return; }
		if (interaction.member.voice.channelId === client.voice.channelId) {
			const resource = await createAudioResource('./audio/tts.wav', {
				inputType: StreamType.WebmOpus
			});
			await ttsPlayer.play(resource);
			await interaction.editReply({ content: `${content} has been played.` });
			return;
		}
		if (interaction.member.voice.channelId) {
			ttsConnection = await joinVoiceChannel({
				channelId: interaction.member.voice.channelId,
				guildId: interaction.channel.guild.id,
				adapterCreator: interaction.channel.guild.voiceAdapterCreator,
				selfDeaf: false
			});
			await ttsConnection.subscribe(ttsPlayer);
		}
		const resource = await createAudioResource('./audio/tts.wav', {
			inputType: StreamType.WebmOpus
		});
		await ttsPlayer.play(resource);
		await interaction.editReply({ content: `${content} has been played.` });
	} if (interaction.commandName === "config") {
		await interaction.deferReply();
		if (interaction.options.getSubcommand() === "autoreplay") {
			let guildId = interaction.guild.id.toString();
			if (interaction.options.getBoolean('autoreplay') === true) {
				audio[guildId]['autoReplay'] = true;
			} else {
				audio[guildId]['autoReplay'] = false;
			}
			const embed = new EmbedBuilder()
				.setTitle(`Set your guild's auto-replay to ${interaction.options.getBoolean('autoreplay').toString().toUpperCase()}`);
			await interaction.editReply({ embeds: [embed] });
		}
		if (interaction.options.getSubcommand() === "useytm") {
			let guildId = interaction.guild.id.toString();
			if (interaction.options.getBoolean('bool') === true) {
				audio[guildId]['useYTM'] = true;
			} else {
				audio[guildId]['useYTM'] = false;
			}
			const embed = new EmbedBuilder()
				.setTitle(`Set your guild's auto-use ytm to ${interaction.options.getBoolean('bool').toString().toUpperCase()}`);
			await interaction.editReply({ embeds: [embed] });
		}
	} if (interaction.customId === "volumeUp" || interaction.customId === "volumeDown") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) return await interaction.editReply("Please connect voice channel.");
		const guildId = interaction.guild.id.toString();
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		let currentVolume = audio[guildId]["volume"];
		if (interaction.customId === "volumeUp") {
			if (currentVolume >= 3.0) { await interaction.editReply("You cannot set volume higher than 300%."); return; }
			else {
				audio[guildId]["resource"].volume.setVolume(Math.floor((currentVolume * 10) + 1) / 10);
				audio[guildId]["volume"] = Math.floor((currentVolume * 10) + 1) / 10;
				const embed = new EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle(`Set volume to ${Math.floor((currentVolume * 10) + 1) * 10}%`);
				await interaction.editReply({ embeds: [embed] });
				return;
			}
		} else {
			if (currentVolume <= 0.1) { await interaction.editReply("You cannot set volume to 0."); return; }
			else {
				audio[guildId]["resource"].volume.setVolume(Math.floor((currentVolume * 10) - 1) / 10);
				audio[guildId]["volume"] = Math.floor((currentVolume * 10) - 1) / 10;
				const embed = new EmbedBuilder()
					.setColor(config.config.color.info)
					.setTitle(`Set volume to ${Math.floor((currentVolume * 10) - 1) * 10}%`);
				await interaction.editReply({ embeds: [embed] });
				return;
			}
		}
	} if (interaction.customId === "lyric" || interaction.commandName === "lyric") {
		await interaction.deferReply();
		const guildId = interaction.guild.id.toString();
		let artist = audio[guildId]["artist"];
		let song = audio[guildId]["title"];
		let songs = await lyricsSearcher.songs.search(`${artist.replace(" - Topic", "")} ${song}`);
		const target = await songs[0].lyrics();
		const embed = new EmbedBuilder()
			.setColor(config.config.color.info)
			.setTitle("Lyrics")
			.setDescription(util.cutString(target));
		await interaction.editReply({ embeds: [embed] });
	} if (interaction.commandName === "suggest") {
		if (interaction.options.getSubcommand() === "yesorno") {
			await interaction.deferReply();
			const {
				body
			} = await request('https://yesno.wtf/api');
			const ans = await body.json();
			const embed = new EmbedBuilder()
				.setColor(config.config.color.info)
				.setTitle(ans.answer.toUpperCase())
				.setDescription(ans.answer.toUpperCase())
				.setImage(ans.image);
			await interaction.editReply({ content: "Result", embeds: [embed] });
		}
	} if (interaction.commandName === "playlist") {
		await interaction.deferReply();
		const guildId = interaction.guild.id.toString();
		if (interaction.options.getSubcommand() === "save") {
			if (music[0][guildId]["queue"].length === 0) {
				await interaction.editReply("Your guild does not have any valid queue.");
				return;
			}
			music[0][guildId]["savedQueue"][music[0][guildId]["savedQueue"].length] = music[0][guildId]["queue"];
			await interaction.editReply({ content: `Added current queue to saved queue. Items:${music[0][guildId]["queue"].length} ID: ${music[0][guildId]["savedQueue"]}` });
		}
	} if (interaction.commandName === "play" && !interaction.isAutocomplete()) {
		await interaction.deferReply();
		const guildId = interaction.guild.id.toString();
		const url = interaction.options.getString("query");
		if (!interaction.member.voice.channelId) {
			const noValidVCEmbed = new EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({ name: ` | 🚫 - Please join a voice channel first!`, iconURL: `${interaction.user.avatarURL({})}` })
			await interaction.editReply({ embeds: [noValidVCEmbed] });
			return;
		}
		if (!audio[guildId]) {
			const temp = {
				[guildId]: {
					"previousUser": "",
					"previousChannel": "",
					"stream": "",
					"connection": "",
					"title": "",
					"artist": "",
					"length": "",
					"id": "",
					"autoReplay": "false",
					"player": "",
					"channel": "",
					"queue": [],
					"resource": "",
					"volume": "",
					"index": 0,
					"previousPanel": "",
					"savedQueue": [],
					"status": "",
					"rawStream": "",
					"seek": 0,
					"seekStream": "",
					"subSeekStream": "",
					"seekStreamInt": 0,
					"useYTM": true,
				}
			};
			audio = { ...audio, ...temp };
		}
		if (interaction.options.getBoolean('autoreplay') === true) {
			audio[guildId]['autoReplay'] = true;
		} else {
			audio[guildId]['autoReplay'] = false;
		}
		audio[guildId]["previousChannel"] = interaction.channel;
		audio[guildId]["previousUser"] = interaction.user;
		if (!audio[guildId]["player"]) {
			audio[guildId]["player"] = createAudioPlayer();
		}
		audio[guildId]["channel"] = interaction.member.voice.channelId;
		audio[guildId]["connection"] = joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.channel.guild.id,
			adapterCreator: interaction.channel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});
		audio[guildId]["connection"].receiver.speaking.removeAllListeners();
		audio[guildId]["connection"].receiver.speaking.on('start', (userId) => {
			const voiceStream = audio[guildId]["connection"].receiver.subscribe(userId, {
				end: {
					behavior: EndBehaviorType.AfterInactivity,
					duration: 1000,
				}
			});
			const decoder = new prism.opus.Decoder({ rate: 48000, channels: 1, frameSize: 960 });
			const filename = `./rec/${Date.now()}-${userId}`;
			console.log(`👂 Started recording ${filename}.pcm`);
			let stream = "";
			const writer = voiceStream
				.pipe(decoder)
				.pipe(stream);
			writer.on("finish", () => {
				ffmpeg()
					.on("end", function () {
						console.log(`🔴 Finished recording ${filename}.pcm`);
						const wfReader = new wav.Reader();
						const wfReadable = new Readable().wrap(wfReader);
						wfReader.on('format', async ({ audioFormat, sampleRate, channels }) => {
							const rec = new vosk.Recognizer({ model: voskModel, sampleRate: sampleRate });
							rec.setMaxAlternatives(1);
							rec.setWords(true);
							rec.setPartialWords(true);
							for await (const data of wfReadable) {
								const end_of_speech = rec.acceptWaveform(data);
							}
							const result = rec.finalResult(rec);
							let finResult = result.alternatives[0].text;
							rec.free();
							fs.unlinkSync(`${filename}.pcm`);
							fs.unlinkSync(`${filename}.wav`);
							if (finResult) {
								interaction.channel.send(`${await client.users.cache.get(userId).username}: ${finResult}`);
								if (finResult.match("停止" || "停" || "止")) {
									audio[interaction.channel.guild.id]["player"].pause();
								}
								if (finResult.match("再開")) {
									audio[interaction.channel.guild.id]["player"].unpause();
								}
								if (finResult.match("再生")) {
									startPlay(interaction.guild.id, null, msg);
								}
								if (finResult === "バック") {
									back(interaction.guild.id);
								}
								if (finResult === "スキップ") {
									skip(interaction.guild.id);
								}
							}
							return;
						});
						fs.createReadStream(`${filename}.wav`, { 'highWaterMark': 4096 }).pipe(wfReader).on('finish',
							function (err) { }
						);
						return;
					})
					.input(`${filename}.pcm`)
					.inputFormat('s16le')
					.output(`${filename}.wav`)
					.audioBitrate('48k')
					.audioChannels(1)
					.run();
			});
		});
		audio[guildId]["connection"].subscribe(audio[guildId]["player"]);
		if (url === null && audio[guildId]["queue"].length !== 0) {
			startPlay(guildId, interaction);
			await interaction.editReply('Started playing queue');
			return;
		}

		if (url === null) {
			const joinedEmbed = new EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({ name: ` | 👋 - I joined your voice channel.`, iconURL: `${interaction.user.avatarURL({})}` })
			await interaction.editReply({ embeds: [joinedEmbed] }); return;
		}

		try {
			await ytpl.getPlaylistID(url);
			const playlist = await ytpl(ytpl.getPlaylistID(url));
			const playlitAddEmbed = new EmbedBuilder()
				.setColor(config.config.color.info)
				.setAuthor({ name: ` | ✅ - Added ${playlist.items.length} items to the queue.`, iconURL: `${interaction.user.avatarURL({})}` })
			if (audio[guildId]["id"] === undefined || "") {
				for (i = 0; i < playlist.items.length; i++) {
					audio[guildId]["queue"].push(playlist.items[i].url);
				}
				interaction.editReply({ embeds: [playlistAddEmbedd] });
			} else {
				for (i = 0; i < playlist.items.length; i++) {
					audio[guildId]["queue"].push(playlist.items[i].url);
				}
				interaction.editReply({ embeds: [playlistAddEmbed] });
				return;
			}
		} catch (err) {
			if (ytdl.validateURL(url)) {
				if (!await ytU.isValidVideo(url)) {
					interaction.editReply("Please type accurate YouTube Video Link.");
					return;
				}
				if (!audio[guildId]["id"]) {
					audio[guildId]["queue"].push(url);
					const addUrlEmbed = new EmbedBuilder()
						.setColor(config.config.color.info)
						.setAuthor({ name: ` | ✅ - Added ${url} to the queue.`, iconURL: `${interaction.user.avatarURL({})}` })
					await interaction.editReply({ embeds: [addUrlEmbed] });
				} else {
					audio[guildId]["queue"].push(url);
					const addUrlEmbed = new EmbedBuilder()
						.setColor(config.config.color.info)
						.setAuthor({ name: ` | ✅ - Added ${url} to the queue.`, iconURL: `${interaction.user.avatarURL({})}` })
					await interaction.editReply({ embeds: [addUrlEmbed] });
					return;
				}
			} else if (url.match("open.spotify.com")) {
				try {
					const raw = await ytU.spotifyToYT(url);
					audio[guildId]["queue"].push(raw);
					const resultEmbed = new EmbedBuilder()
						.setColor(config.config.color.info)
						.setAuthor({ name: ` | 🔍 Added ${raw} to the queue.`, iconURL: `${interaction.user.avatarURL({})}` })
					if (!audio[guildId]["id"]) {
						await interaction.editReply({ embeds: [resultEmbed] });
					} else {
						await interaction.editReply({ embeds: [resultEmbed] });
						return;
					}
				} catch (err) {
					await interaction.editReply('Please enter valid Spotify track URL. Album is not supported.');
				}
			} else {
				if (audio[guildId]["useYTM"]) {
					const api = new YoutubeMusicApi();
					await api.initalize();
					const stat = await api.search(url, "song")
						.then(async (result) => {
							if (result["content"].length === 0) { interaction.editReply("There's no music."); return "PLAYING"; }
							const resultEmbed = new EmbedBuilder()
								.setColor(config.config.color.info)
								.setAuthor({ name: ` | 🔍 Added ${result["content"][0]["name"]} to the queue.`, iconURL: `${interaction.user.avatarURL({})}` })
							interaction.editReply({ embeds: [resultEmbed] });
							if (!audio[guildId]["id"]) {
								audio[guildId]["queue"].push(`https://youtube.com/watch?v=${result["content"][0]["videoId"]}`);
								return "NO";
							} else {
								audio[guildId]["queue"].push(`https://youtube.com/watch?v=${result["content"][0]["videoId"]}`);
								return "PLAYING";
							}
						});
					if (stat === "PLAYING") {
						return;
					}
				} else {
					const result = await ytU.search(url);
					if (result.length === 0) { interaction.editReply("There's no music."); return "PLAYING"; }
					const resultEmbed = new EmbedBuilder()
						.setColor(config.config.color.info)
						.setAuthor({ name: ` | 🔍 Added ${result[0]["title"]} to the queue.`, iconURL: `${interaction.user.avatarURL({})}` })
					interaction.editReply({ embeds: [resultEmbed] });
					if (!audio[guildId]["id"]) {
						audio[guildId]["queue"].push(`${result[0]["link"]}`);
						return "NO";
					} else {
						audio[guildId]["queue"].push(`${result[0]["link"]}`);
						return "PLAYING";
					}
					if (stat === "PLAYING") {
						return;
					}
				}
			}
		}
		addEventListenerToPlayer(audio[guildId]["player"], guildId);
		await startPlay(guildId, interaction);
		return;
	} if (interaction.commandName === "help") {
		await interaction.deferReply();
		const embed = new EmbedBuilder()
			.setColor(config.config.color.info)
			.setTitle('Help Menu')
			.setTimestamp()
			.addFields(
				{ name: 'Status', value: "/ping /status", inline: true },
				{ name: 'Music', value: "/play /pause /unpause /stop", inline: true },
				{ name: 'Queue', value: `/ queue display / queue add / queue remove / queue delete `, inline: true },
				{ name: 'Web', value: `/ screenshot / whois`, inline: true },
				{ name: 'Image', value: `/ image ocr`, inline: true },
				{ name: 'Radio', value: `/ radio play / radio stop`, inline: true },
				{ name: 'Search', value: `/ youtube search / ncs search`, inline: true }
			);
		await interaction.editReply({ embeds: [embed] });
	} if (interaction.commandName === "radio" && !interaction.isAutocomplete()) {
		const guildId = interaction.guild.id.toString();
		await interaction.deferReply();
		if (radio[guildId] === undefined || null) {
			const temp = {
				[guildId]: {
					"previousUser": "",
					"previousChannel": "",
					"stream": "",
					"connection": "",
					"title": "",
					"player": "",
					"channel": "",
					"previousPanel": "",
				}
			};
			radio = { ...radio, ...temp }
		}
		if (interaction.options.getSubcommand() === "play") {
			if (radio[guildId]["player"] === "") {
				radio[guildId]["player"] = createAudioPlayer();
				radio[guildId]["player"].setMaxListeners(100);
			}
			const connection = joinVoiceChannel({
				channelId: interaction.member.voice.channelId,
				guildId: interaction.channel.guild.id,
				adapterCreator: interaction.channel.guild.voiceAdapterCreator,
				selfDeaf: false
			});
			radio[guildId]["connection"] = connection;
			await connection.subscribe(radio[guildId]["player"]);
			const resource = createAudioResource((radioUrl[radioList.indexOf(interaction.options.getString("query"))]), {
				inlineVolume: true,
			});
			radio[guildId]["resource"] = resource;
			radio[guildId]["player"].play(resource);
			await interaction.editReply("Started Playing Radio");
		}
		if (interaction.options.getSubcommand() === "stop") {
			if (radio[guildId]["player"] === "") {
				await interaction.editReply("Sorry, you are not playing any radio right now :(");
				return;
			}
			await radio[guildId]["connection"].disconnect(radio[guildId]["player"]);
			radio[guildId]["player"].stop();

			await interaction.editReply("I finished playing radio.");
		}
	} if (interaction.commandName === "status") {
		await interaction.deferReply();
		const os = require("os");
		var totalCores = "";
		var avgClockMHz = "";
		var percents = "";
		var osInfo = "";
		avgClockMHz = await cpuStat.avgClockMHz();
		osInfo = os.cpus();
		await cpuStat.usagePercent(function (err, percent, seconds) {
			if (err) {
				return console.log(err);
			}
			totalCores = cpuStat.totalCores();
			console.log(percent);
			const embed = new EmbedBuilder()
				.setColor(config.config.color.info)
				.setTitle('Status')
				.setTimestamp()
				.addFields(
					{ name: 'CPU', value: `${osInfo[0].model}`, inline: true },
					{ name: 'Usage', value: `${percent * 100} % `, inline: true },
					{ name: 'Clock', value: `${avgClockMHz}MHz`, inline: true },
					{ name: 'CPU Count', value: `${totalCores}`, inline: false },
				);
			interaction.editReply({ embeds: [embed] });
		});
	} if (interaction.commandName === "image") {
		if (interaction.options.getSubcommand() === "ocr") {
			await interaction.deferReply();
			const image = interaction.options._hoistedOptions[0].attachment.url;
			if (image.endsWith("png") === false) {
				await interaction.editReply("Sorry, currently I cannot process your file .");
				return;
			}
			tesseract
				.recognize(image, ocrConfig)
				.then((text) => {
					interaction.editReply(`OCR Results: ${text}`);
					return;
				})
				.catch((error) => {
					interaction.editReply("Sorry, I couldn't process your file.");
				});
		}
	} if (interaction.commandName === "learn") {
		if (interaction.options.getSubcommand() === "speak") {
			await interaction.deferReply();
			const text = interaction.options.getString("text");
			if (!interaction.member.voice) { await interaction.editReply("Please connect a voice channel!"); return; }
			const connection = joinVoiceChannel({
				channelId: interaction.member.voice.channelId,
				guildId: interaction.channel.guild.id,
				adapterCreator: interaction.channel.guild.voiceAdapterCreator,
				selfDeaf: false
			});
			const player = createAudioPlayer();
			await connection.subscribe(player);
			await gtts.save("./audio/tts.wav", text, async function () {
				const resource = createAudioResource("./audio/tts.wav");
				await wait(1000);
				await player.play(resource);
				await interaction.editReply(`Played ${text} to your voice channel.`);
			});
		}
		if (interaction.options.getSubcommand() === "start") {
			await interaction.deferReply();
			if (ttsList.indexOf(interaction.channel.id) === -1) {
				ttsList.push(interaction.channel.id);
				await interaction.editReply("Set TTS");
				return;
			} else {
				await interaction.editReply("Your channel already set up as a TTS channel.");
			}
		}
		if (interaction.options.getSubcommand() === "stop") {
			await interaction.deferReply();
			if (ttsList.indexOf(interaction.channel.id) === -1) {
				await interaction.editReply("You didn't set up this channel as a TTS channel.");
				return;
			} else {
				let num = ttsList.indexOf(interaction.channel.id);
				ttsList.splice(num, 1);
				await interaction.editReply("Disabled TTS");
				return;
			}
		}
	} if (interaction.commandName === "freetalk") {
		if (interaction.options.getSubcommand() === "enable") {
			freetalkList.push(interaction.channel.id.toString());
			await interaction.reply("Set up AI Bot");
		} else {
			freetalkList.splice(freetalkList.indexOf(interaction.channel.id.toString()), 1);
			await interaction.reply("Finished AI Bot");
		}
	} if (interaction.commandName === "events") {
		await interaction.deferReply();
		if (interaction.options.getSubcommand() === 'youtube') {
			if (interaction.member.voice.channel) {
				client.discordTogether.createTogetherCode(interaction.member.voice.channelId, 'youtube').then(async invite => {
					interaction.editReply(`Event has been created! Join with here: ${invite.code} `);
				});
			} else {
				interaction.editReply("You are not in any voice channel!");
			}
		};
	} if (interaction.commandName === "seek") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) { await interaction.editReply("Please connect voice channel."); return; }
		const guildId = interaction.guild.id.toString();
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		if (!audio[guildId]["resource"]) {
			await interaction.editReply('Sorry, you are not playing any song.');
			return;
		}
		let seekDuration = timeStringToSeconds(interaction.options.getString('seek'));
		if (audio[guildId]["length"] - 1 < seekDuration || seekDuration <= 0) {
			await interaction.editReply(`Sorry, you can't do that.`);
			return;
		}
		if (audio[guildId]["seekStreamInt"] === 0) {
			audio[guildId]["rawStream"] = audio[guildId]["seekStream"];
			audio[guildId]["subSeekStream"] = ytU.downloadId(audio[guildId]["id"]);
			const stream = createFFmpegStream(audio[guildId]["rawStream"], seekDuration);
			audio[guildId]["stream"] = stream;
			audio[guildId]["seek"] = seekDuration;
			const resource = createAudioResource(audio[guildId]["stream"], {
				metadata: {
					title: audio[guildId]["title"],
					artist: audio[guildId]["artist"],
					length: audio[guildId]["length"],
					id: audio[guildId]["id"],
					user: interaction.user,
					channel: interaction.channel,
				},
				inlineVolume: true
			});
			audio[guildId]["resource"] = resource;
			audio[guildId]["seekStreamInt"] = 1;
			try {
				audio[guildId]["player"].play(resource);
				await interaction.editReply(`Seek to ${seekDuration}`);
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply("An error occurred. Please try again and check URL.");
			}
		} else {
			audio[guildId]["rawStream"] = audio[guildId]["subSeekStream"];
			audio[guildId]["seekStream"] = ytU.downloadId(audio[guildId]["id"]);
			const stream = createFFmpegStream(audio[guildId]["rawStream"], seekDuration);
			audio[guildId]["stream"] = stream;
			audio[guildId]["seek"] = seekDuration;
			const resource = createAudioResource(audio[guildId]["stream"], {
				metadata: {
					title: audio[guildId]["title"],
					artist: audio[guildId]["artist"],
					length: audio[guildId]["length"],
					id: audio[guildId]["id"],
					user: interaction.user,
					channel: interaction.channel,
				},
				inlineVolume: true
			});
			audio[guildId]["resource"] = resource;
			audio[guildId]["seekStreamInt"] = 0;
			try {
				audio[guildId]["player"].play(resource);
				await interaction.editReply(`Seek to ${seekDuration}`);
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply("An error occurred. Please try again and check URL.");
			}
		}
	} if (interaction.customId === "30p") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) { await interaction.editReply("Please connect voice channel."); return; }
		const guildId = interaction.guild.id.toString();
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		if (!audio[guildId]["resource"]) {
			await interaction.editReply('Sorry, you are not playing any song.');
			return;
		}
		let seekDuration = 0;
		if ((audio[guildId]["length"] - 31) < (audio[guildId]["resource"].playbackDuration / 1000) + 30 + audio[guildId]["seek"]) {
			await interaction.editReply(`Sorry, you can't do that.`);
			return;
		}
		seekDuration = (audio[guildId]["resource"].playbackDuration / 1000) + 30;
		if (audio[guildId]["seekStreamInt"] === 0) {
			audio[guildId]["rawStream"] = audio[guildId]["seekStream"];
			audio[guildId]["subSeekStream"] = ytU.downloadId(audio[guildId]["id"]);
			const stream = createFFmpegStream(audio[guildId]["rawStream"], audio[guildId]["seek"] + seekDuration);
			audio[guildId]["stream"] = stream;
			audio[guildId]["seek"] = audio[guildId]["seek"] + seekDuration;
			const resource = createAudioResource(audio[guildId]["stream"], {
				metadata: {
					title: audio[guildId]["title"],
					artist: audio[guildId]["artist"],
					length: audio[guildId]["length"],
					id: audio[guildId]["id"],
					user: interaction.user,
					channel: interaction.channel,
				},
				inlineVolume: true
			});
			audio[guildId]["resource"] = resource;
			audio[guildId]["seekStreamInt"] = 1;
			try {
				audio[guildId]["player"].play(resource);
				await interaction.editReply(`Seek +30s`);
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply("An error occurred. Please try again and check URL.");
			}
		} else {
			audio[guildId]["rawStream"] = audio[guildId]["subSeekStream"];
			audio[guildId]["seekStream"] = ytU.downloadId(audio[guildId]["id"]);
			const stream = createFFmpegStream(audio[guildId]["rawStream"], audio[guildId]["seek"] + seekDuration);
			audio[guildId]["stream"] = stream;
			audio[guildId]["seek"] = audio[guildId]["seek"] + seekDuration;
			const resource = createAudioResource(audio[guildId]["stream"], {
				metadata: {
					title: audio[guildId]["title"],
					artist: audio[guildId]["artist"],
					length: audio[guildId]["length"],
					id: audio[guildId]["id"],
					user: interaction.user,
					channel: interaction.channel,
				},
				inlineVolume: true
			});
			audio[guildId]["resource"] = resource;
			audio[guildId]["seekStreamInt"] = 0;
			try {
				audio[guildId]["player"].play(resource);
				await interaction.editReply(`Seek +30s`);
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply("An error occurred. Please try again and check URL.");
			}
		}
		return;
	} if (interaction.customId === "30m") {
		await interaction.deferReply();
		if (!interaction.member.voice.channelId) { await interaction.editReply("Please connect voice channel."); return; }
		const guildId = interaction.guild.id.toString();
		if (interaction.member.voice.channelId !== audio[guildId]["channel"]) { await interaction.editReply("You are not in my voice channel."); return; }
		if (!audio[guildId]["resource"]) {
			await interaction.editReply('Sorry, you are not playing any song.');
			return;
		}
		if (audio[guildId]["seek"] < 31 && (audio[guildId]["resource"].playbackDuration / 1000) < 31) {
			await interaction.editReply(`Sorry, you can't do that.`);
			return;
		}
		let seek = 0;
		if (audio[guildId]["seek"]) {
			seek = audio[guildId]["seek"];
		}
		let seekDuration = ((audio[guildId]["resource"].playbackDuration / 1000) + seek) - 30;
		if (audio[guildId]["seekStreamInt"] === 0) {
			audio[guildId]["rawStream"] = audio[guildId]["seekStream"];
			audio[guildId]["subSeekStream"] = ytU.downloadId(audio[guildId]["id"]);
			const stream = createFFmpegStream(audio[guildId]["rawStream"], audio[guildId]["seek"] + seekDuration);
			audio[guildId]["stream"] = stream;
			audio[guildId]["seek"] = seekDuration;
			const resource = createAudioResource(audio[guildId]["stream"], {
				metadata: {
					title: audio[guildId]["title"],
					artist: audio[guildId]["artist"],
					length: audio[guildId]["length"],
					id: audio[guildId]["id"],
					user: interaction.user,
					channel: interaction.channel,
				},
				inlineVolume: true
			});
			audio[guildId]["resource"] = resource;
			audio[guildId]["seekStreamInt"] = 1;
			try {
				audio[guildId]["player"].play(resource);
				await interaction.editReply(`Seek -30s`);
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply("An error occurred. Please try again and check URL.");
			}
		} else {
			audio[guildId]["rawStream"] = audio[guildId]["subSeekStream"];
			audio[guildId]["seekStream"] = ytU.downloadId(audio[guildId]["id"]);
			const stream = createFFmpegStream(audio[guildId]["rawStream"], audio[guildId]["seek"] + seekDuration);
			audio[guildId]["stream"] = stream;
			audio[guildId]["seek"] = seekDuration;
			const resource = createAudioResource(audio[guildId]["stream"], {
				metadata: {
					title: audio[guildId]["title"],
					artist: audio[guildId]["artist"],
					length: audio[guildId]["length"],
					id: audio[guildId]["id"],
					user: interaction.user,
					channel: interaction.channel,
				},
				inlineVolume: true
			});
			audio[guildId]["resource"] = resource;
			audio[guildId]["seekStreamInt"] = 0;
			try {
				audio[guildId]["player"].play(resource);
				await interaction.editReply(`Seek -30s`);
			} catch (err) {
				console.log(err.stack);
				await interaction.editReply("An error occurred. Please try again and check URL.");
			}
		}
		return;
	}
});

// ! These process are system process!!!
process.on('uncaughtException', (err) => {
	console.log(`\x1b[41m[ERROR]\x1b[49m: ${err.stack} `);
	return;
});
if (app.get('env') === 'production') {
	app.set('trust proxy', 1);
	sess.cookie.secure = true;
}
app.use(session(sess));
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/login', async (req, res) => {
	res.set('Content-Type', 'text/html');
	res.send(fs.readFileSync('./web/login.html'));
});
app.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	if (username === config.config.dashboard.admin.username && password === config.config.dashboard.admin.password) {
		req.session.regenerate((err) => {
			req.session.username = 'admin';
			res.redirect('/');
		});
	} else {
		res.redirect('/login');
	}
});
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		res.redirect('/');
	});
});
app.get('/icon', (req, res) => {
	res.send(fs.readFileSync("./icon.webp"));
});
app.get('/', async (req, res) => {
	const params = req.query;
	const code = params.code;
	if (code) {
		try {
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: config.bot.clientId,
					client_secret: config.bot.clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `https://hacker-bot.ddns.net`,
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			const oauthData = await tokenResponseData.body.json();
			if (tokenResponseData.statusCode !== 200) {
				res.redirect("/login");
				return;
			}
		} catch (error) {
			console.error(error);
		}
		req.session.regenerate((err) => {
			req.session.username = 'user';
			req.session.token = code;
			res.redirect('/');
		});
		return;
	}
	if (!req.session.username) {
		res.redirect("/login");
	} else {
		if (req.session.username === "admin") {
			res.set('Content-Type', 'text/html');
			res.send(fs.readFileSync('./web/index.html'));
			return;
		} else {
			res.set('Content-Type', 'text/html');
			await res.send(fs.readFileSync('./web/user.html'));
			io.emit("getUserInfo", info);
			return;
		}
	}
});

if (userApp.get('env') === 'production') {
	userApp.set('trust proxy', 1);
	sess.cookie.secure = true;
}
userApp.use(session(sess));
userApp.use(bodyParser.urlencoded({ extended: true }));
userApp.get('/icon', (req, res) => {
	res.send(fs.readFileSync("./icon.webp"));
});
userApp.get('/login', async (req, res) => {
	res.set('Content-Type', 'text/html');
	res.send(fs.readFileSync('./web/login.html'));
});
userApp.get('/', async (req, res) => {
	const params = req.query;
	const code = params.code;
	if (code) {
		try {
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: config.bot.clientId,
					client_secret: config.bot.clientSecret,
					code,
					grant_type: 'authorization_code',
					redirect_uri: `https://hacker-bot.ddns.net`,
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			const oauthData = await tokenResponseData.body.json();
			if (tokenResponseData.statusCode !== 200) {
				res.redirect("/login");
				return;
			}
		} catch (error) {
			console.error(error);
		}
		req.session.regenerate((err) => {
			req.session.username = 'user';
			req.session.token = code;
			res.redirect('/');
		});
		return;
	}
	if (!req.session.username) {
		res.redirect("/login");
	} else {
		if (req.session.username === "admin") {
			res.set('Content-Type', 'text/html');
			res.send(fs.readFileSync('./web/index.html'));
			return;
		} else {
			res.set('Content-Type', 'text/html');
			await res.send(fs.readFileSync('./web/user.html'));
			io.emit("getUserInfo", info);
			return;
		}
	}
});
userApp.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	if (username === config.config.dashboard.admin.username && password === config.config.dashboard.admin.password) {
		req.session.regenerate((err) => {
			req.session.username = 'admin';
			res.redirect('/');
		});
	} else {
		res.redirect('/login');
	}
});

server.listen(config.config.adminPort, () => {
	console.log(`👂 - Listening on http://localhost:${config.config.adminPort}, Please edit config.json if you want to change port number... (Step 4/4)`);
});
userServer.listen(config.config.port, () => {
	console.log(`👂 - Listening on http://localhost:${config.config.port}, Please edit config.json if you want to change port number... (Step 4/4)`);
});
io.on('connection', (socket) => {
	socket.on('msg', (content, id) => {
		id = id.toString();
		client.channels.cache.get(id).send(content);
		io.emit("sended");
	});
	socket.on('dm', async (msg, user) => {
		try {
			usr = await client.users.cache.get(user);
			usr.send(msg);
			await io.emit("dmsended");
		} catch (err) {
			await io.emit("warn", "Cannot send message to the User.")
		}
	});
	socket.on("server", async () => {
		io.emit("server", guildList, guildNameList);
	});
	socket.on("music", async (type, id) => {
		if (audio[id] === undefined) return;
		if (type === "pause") {
			audio[id]["player"].pause();
		}
		if (type === "unpause") {
			audio[id]["player"].unpause();
		}
	});
	socket.on('refresh', async (id) => {
		if (audio[id] === undefined) {
			return;
		}
		io.emit("refresher", audio[id]["title"], audio[id]["artist"], audio[id]["length"], audio[id]["volume"], audio[id]["resource"].playbackDuration, audio[id]["id"], audio[id]["queue"]);
	});
	socket.on('voice', async (result, id) => {
		console.log(result, id);
		if (result.match("を再生")) {
			const query = result.replace("を再生", "");
			const api = new YoutubeMusicApi();
			await api.initalize();
			const stat = await api.search(url, "song")
				.then(async (result) => {
					if (result["content"].length === 0) return;
					if (audio[guildId]["id"] === undefined || audio[guildId]["id"] === "") {
						audio[guildId]["queue"].push(`https://youtube.com/watch?v=${result["content"][0]["videoId"]}`);
						return "NO";
					} else {
						audio[guildId]["queue"].push(`https://youtube.com/watch?v=${result["content"][0]["videoId"]}`);
						return "PLAYING";
					}
				});
		}
		if (result.match("停止")) {
			audio[id.toString()]["player"].pause();
		}
		if (result.match("再開")) {
			audio[id.toString()]["player"].unpause();
		}
		var options = {
			url: 'https://api.a3rt.recruit.co.jp/talk/v1/smalltalk',
			method: 'POST',
			form: {
				"apikey": config.token.talk,
				"query": result,
			},
			json: true
		}
		requester(options, function (error, response, body) {
			jpGtts.save("./audio/tts.wav", body.results[0].reply, async function () {
				const resource = createAudioResource("./audio/tts.wav");
				audio[id].player.play(resource);
			});
		});
	});
	socket.on('sendTyping', async (id) => {
		try {
			await client.channels.cache.get(id.toString()).sendTyping();
		} catch (err) {
			io.emit('warn', "Could not send typing to the channel.");
		}
	});
	socket.on('getUserInfo', async () => {
		console.log(socket.session);
	});
});

userIo.on('connection', (socket) => {
});

client.login(config.bot.token);

function getThumbnails(id) {
	return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}
async function skip(guildId) {
	const index = audio[guildId]["index"] + 1;
	if (index < audio[guildId]["queue"].length) {
		const url = audio[guildId]["queue"][index];
		try {
			audio[guildId]['rawStream'] = await ytU.download(url);
			audio[guildId]["stream"] = createFFmpegStream(audio[guildId]["rawStream"]);
		} catch (err) {
			return false;
		}
		audio[guildId]['id'] = ytdl.getURLVideoID(url);
		audio[guildId]['volume'] = 1.0;
		audio[guildId]['index']++;
		audio[guildId]["seek"] = 0;
		await getVideoInfo(audio[guildId]["id"], audio[guildId]);
		audio[guildId]['resource'] = createAudioResource(audio[guildId]['stream'], {
			metadata: {
				title: audio[guildId]['title'],
				artist: audio[guildId]['artist'],
				length: audio[guildId]['length'],
				id: audio[guildId]['id'],
				user: audio[guildId]["previousUser"],
				autoreplay: audio[guildId]['autoReplay'],
				channel: audio[guildId]["previousChannel"],
			},
			inlineVolume: true,
		});

		try {
			audio[guildId]["player"].play(audio[guildId]['resource']);
			return true;
		} catch (err) {
			return false;
		}
	} else {
		return false;
	}
}
async function back(guildId) {
	const index = audio[guildId]["index"] - 1;
	if (index >= 0) {
		const url = audio[guildId]["queue"][index];
		try {
			audio[guildId]['rawStream'] = await ytU.download(url);
			audio[guildId]["stream"] = createFFmpegStream(audio[guildId]["rawStream"]);
		} catch (err) {
			return false;
		}
		audio[guildId]['id'] = ytdl.getURLVideoID(url);
		audio[guildId]['volume'] = 1.0;
		audio[guildId]['index']--;
		audio[guildId]["seek"] = 0;
		await getVideoInfo(audio[guildId]["id"], audio[guildId]);
		audio[guildId]['resource'] = createAudioResource(audio[guildId]['stream'], {
			metadata: {
				title: audio[guildId]['title'],
				artist: audio[guildId]['artist'],
				length: audio[guildId]['length'],
				id: audio[guildId]['id'],
				user: audio[guildId]["previousUser"],
				autoreplay: audio[guildId]['autoReplay'],
				channel: audio[guildId]["previousChannel"],
			},
			inlineVolume: true,
		});

		try {
			audio[guildId]["player"].play(audio[guildId]['resource']);
			return true;
		} catch (err) {
			return false;
		}
	} else {
		return false;
	}
}
function timeStringToSeconds(duration) {
	let totalSeconds = 0;

	const timeComponents = duration.split(/(\d+)([hms])/).filter(Boolean);

	for (let i = 0; i < timeComponents.length; i += 2) {
		const value = parseInt(timeComponents[i]);
		const unit = timeComponents[i + 1];

		if (isNaN(value)) {
			return NaN;
		}

		switch (unit) {
			case 'h':
				totalSeconds += value * 3600;
				break;
			case 'm':
				totalSeconds += value * 60;
				break;
			case 's':
				totalSeconds += value;
				break;
			default:
				return Number(duration);
		}
	}

	return totalSeconds;
}
const { default: axios } = require("axios");
const rpc = axios.create({ baseURL: "http://localhost:50021", proxy: false });
async function genAudio(text, filepath) {
	const audio_query = await rpc.post('audio_query?text=' + encodeURI(text) + '&speaker=1');
	const synthesis = await rpc.post("synthesis?speaker=1", JSON.stringify(audio_query.data), {
		responseType: 'arraybuffer',
		headers: {
			"accept": "audio/wav",
			"Content-Type": "application/json"
		}
	});
	fs.writeFileSync(filepath, new Buffer.from(synthesis.data), 'binary');
}
function orgFloor(value, base) {
	return Math.floor(value * base) / base;
}
function generateProgress(currentPosition, endPosition, size, c0, c1, c2) {
	const per = currentPosition / endPosition;
	const pos = Math.round((size - 1) * per);
	return `[${c1.repeat(pos)}${c0}${c2.repeat(size - pos - 1)}]`;
}
async function getVideoInfo(id, dic) {
	try {
		const list = await ytU.getVideoInfo(id);
		dic['title'] = list[0];
		dic['artist'] = list[1];
		dic['length'] = list[2];
		return true;
	} catch (err) {
		return false;
	}
}
function guildAudioListInit(id) {
	audio[id] = {
		"previousUser": "",
		"previousChannel": "",
		"stream": "",
		"connection": "",
		"title": "",
		"artist": "",
		"length": "",
		"id": "",
		"autoReplay": "false",
		"player": "",
		"musicPath": "",
		"channel": "",
		"queue": [],
		"resource": "",
		"volume": "",
		"index": 0,
		"previousPanel": "",
		"savedQueue": [],
		"status": "",
	}
}
function configChecker() {
	if (!config.config.color.info) {
		createWarn('Config: color.info is invalid.');
		return false;
	}
	if (!config.bot.token) {
		createWarn('Config: Token is invalid.');
		return false;
	}
	if (!config.bot.applicationId) {
		createWarn('Config: Application is invalid.');
		return false;
	}
	if (!config.config.port) {
		createWarn('Config: Port number is invalid.');
		return false;
	}
	return true;
}
function createFFmpegStream(stream, seek, str) {
	if (!str) str = 0;
	let transcoder = new prism.FFmpeg({
		args: [
			'-analyzeduration', '0',
			'-loglevel', '0',
			'-f', 's16le',
			'-ar', '48000',
			'-ac', '2',
			'-ss', seek || '0',
			'-ab', config.config.voice.maxQuality,
			//'-af', `bass=g=${str}`
		]
	});
	const s16le = stream.pipe(transcoder);
	const opus = s16le.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));
	return opus;
}