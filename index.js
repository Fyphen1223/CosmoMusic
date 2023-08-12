const start = new Date();
const config = require("./config.json");
if (config.config.console.consoleClear) console.clear();
console.log("🏁 - \x1b[34mReady... Please wait, now loading packages... (Step 1/4)\x1b[39m");
const discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
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
        discord.GatewayIntentBits.MessageContent,
    ],
    partials: [discord.Partials.Channel, discord.Partials.GuildMember, discord.Partials.GuildScheduledEvent, discord.Partials.Message, discord.Partials.Reaction, discord.Partials.ThreadMember, discord.Partials.User],
});
const { Shoukaku, Connectors } = require('shoukaku');
const Nodes = [{
    name: config.lavalink.name,
    url: `${config.lavalink.host}:${config.lavalink.port}`,
    auth: config.lavalink.password
}];
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
const util = require("./utils/utils.js");
const queue = new util.queue();
const log = new util.logger();
var playlist = tryRequire("./db/playlist.json");
const fs = require("fs");
const Genius = require("genius-lyrics");
const lyricsSearcher = new Genius.Client(config.token.genius);

const https = require("https");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const socketio = require("socket.io");
const app = express();
const sess = {
    secret: "secretsecretsecret",
    cookie: {
        maxAge: 600000,
    },
    resave: false,
    saveUninitialized: false,
};
const server = https.createServer(
    {
        key: fs.readFileSync("./ssl/privatekey.pem"),
        cert: fs.readFileSync("./ssl/cert.pem"),
        ca: fs.readFileSync("./ssl/chain.pem"),
    },
    app
);
const io = new socketio.Server(server);

let guildList = [];
let guildNameList = [];

client.shoukaku = shoukaku;
client.on('ready', (u) => {
    log.ready(`Logged in as ${u.user.tag}`);
    for (const [key, value] of client.guilds.cache) {
        guildList.push(key);
    }
    for (const [key, value] of client.guilds.cache) {
        guildNameList.push(value["name"]);
    }
    return;
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    const guildId = interaction.guild.id;
    if (interaction.commandName === "queue" && interaction.options.getSubcommand() === "delete") {
        const focusedValue = interaction.options.getFocused();
        let list = [];
        let i = 0;
        while (i !== queue[guildId].queue.length) {
            list.push(queue[guildId].queue[i].data.info.title);
            i++;
        }
        const filtered = list.filter((choice) => choice.startsWith(focusedValue));
        try {
            interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
        } catch (err) {
            const rated = audio[interaction.guild.id.toString()]["queue"].slice(0, 24);
            const rateFilt = rated.filter((choice) => choice.startsWith(focusedValue));
            interaction.respond(rateFilt.map((choice) => ({ name: choice, value: choice })));
        }
    }
    if (interaction.commandName === "radio" && interaction.options.getSubcommand() === "play") {
        const focusedValue = interaction.options.getFocused();
        const filtered = radioList.filter((choice) => choice.startsWith(focusedValue));
        try {
            interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
        } catch (err) {
            const rated = radioList.slice(0, 24);
            const rateFilt = rated.filter((choice) => choice.startsWith(focusedValue));
            interaction.respond(rateFilt.map((choice) => ({ name: choice, value: choice })));
        }
    }
    if (interaction.commandName === "play") {
        const focusedValue = interaction.options.getFocused();
        const node = await shoukaku.getIdealNode();
        const res = await node.rest.resolve(`ytsearch:${focusedValue}`);
        const list = [];
        let i = 0;
        while (i < 5) {
            try {
                list.push(`${res.data[i].info.title}`);
            } catch (err) { }
            i++;
        }
        await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
    }
});
client.on("interactionCreate", async (interaction) => {
    const command = interaction.commandName;
    const customId = interaction.customId;
    const guildId = interaction.guild.id.toString();
    if (interaction.isAutocomplete()) return;
    if (command === "play") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (!interaction.member.voice.channelId) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (!queue[guildId].node) queue[guildId].node = await shoukaku.getIdealNode();
        const query = interaction.options.getString("query");
        const replay = interaction.options.getBoolean("autoreplay");
        const node = queue[guildId].node;
        if (!queue[guildId].voiceChannel && !query && queue[guildId].queue.length === 0) {
            queue[guildId].player = await shoukaku.joinVoiceChannel({
                guildId: guildId,
                channelId: interaction.member.voice.channelId,
                shardId: 0
            });
            const joinedEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 👋 - I joined your voice channel.`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [joinedEmbed] });
            queue[guildId].voiceChannel = interaction.member.voice.channelId;
            queue[guildId].textChannel = interaction.channel;
            addEventListenerToPlayer(guildId);
            return;
        }
        if (!queue[guildId].voiceChannel && query) {
            queue[guildId].player = await shoukaku.joinVoiceChannel({
                guildId: guildId,
                channelId: interaction.member.voice.channelId,
                shardId: 0
            });
            queue[guildId].player.status = "finished";
            queue[guildId].voiceChannel = interaction.member.voice.channelId;
            queue[guildId].textChannel = interaction.channel;
            addEventListenerToPlayer(guildId);
        }
        if ((queue[guildId].queue.length !== 0) && queue[guildId].player.status === "finished" && !query) {
            if (!queue[guildId].voiceChannel) {
                queue[guildId].player = await shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: interaction.member.voice.channelId,
                    shardId: 0
                });
                queue[guildId].voiceChannel = interaction.member.voice.channelId;
                queue[guildId].textChannel = interaction.channel;
                console.log("Hi1");
            }
            await startPlay(guildId);
            await interaction.editReply("Started playing queue");
            return;
        }
        if ((queue[guildId].queue.length !== 0) && queue[guildId].player.status === "finished" && query) {
            if (!queue[guildId].voiceChannel) {
                queue[guildId].player = await shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: interaction.member.voice.channelId,
                    shardId: 0
                });
                queue[guildId].voiceChannel = interaction.member.voice.channelId;
                queue[guildId].textChannel = interaction.channel;
            }
        }
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            await interaction.editReply("Please join my VC!");
            return;
        }
        if (!interaction.options.getBoolean("autoreplay")) {
            queue[guildId].autoReplay = false;
        } else {
            queue[guildId].autoReplay = true;
        }
        const result = await node.rest.resolve(`${query}`);
        let res = "";
        if (result.loadType === "track") {
            res = result.data;
        } else if (result.loadType === "empty") {
            const searchResult = await node.rest.resolve(`ytsearch:${query}`);
            if (!searchResult?.data.length) {
                await interaction.editReply("Sorry, I could not find any data.");
                return;
            }
            res = searchResult.data.shift();
        } else if (result.loadType === "playlist") {
            let i = 0;
            while (i !== result.data.tracks.length) {
                queue[guildId].add(result.data.tracks[i], interaction.user);
                i++;
            }
            const resultEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🔍 Added ${result.data.info.name} to the queue.`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [resultEmbed] });
            if (queue[guildId].player.status === "playing") return;
            await startPlay(guildId);
            return;
        } else if (result.loadType === "search") {
            if (!result?.data.length) {
                await interaction.editReply("Sorry, I could not find any data.");
                return;
            }
            res = result.data.shift();
        } else if (result.loadType === "error") {
            await interaction.editReply("Sorry, but the URL is not supported.");
            return;
        }
        queue[guildId].add(res, interaction.user);
        const resultEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
            name: ` | 🔍 Added ${res.info.title} to the queue.`,
            iconURL: `${interaction.user.avatarURL({})}`,
        });
        await interaction.editReply({ embeds: [resultEmbed] });
        if (queue[guildId].player.track) {
            return;
        }
        await startPlay(guildId);
        return;
    }
    if (command === "seek") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry, the player is not playing any audio.");
            return;
        }
        if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
            await interaction.editReply("Sorry, the resource is not seekable.");
            return;
        }
        const seek = interaction.options.getString("seek");
        const position = util.timeStringToSeconds(seek);
        await queue[guildId].player.seekTo(position * 1000);
        await interaction.editReply(`Seeked to ${seek}`);
        return;
    }
    if ((command || customId) === "pause") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry, the player is not playing any audio.");
            return;
        }
        try {
            queue[guildId].player.setPaused(true);
            await interaction.editReply(`Paused by ${interaction.user}`);
            eventOnPaused(guildId);
            return;
        } catch (err) {
            console.log(err.stack);
            return;
        }
    }
    if ((command || customId) === "unpause") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry, the player is not playing any audio.");
            return;
        }
        try {
            queue[guildId].player.setPaused(false);
            await interaction.editReply(`Resumed by ${interaction.user}`);
            await eventOnResumed(guildId);
            return;
        } catch (err) {
            console.log(err.stack);
            return;
        }
    }
    if ((command || customId) === "skip") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry,the player is not playing any audio.");
            return;
        }
        const index = queue[guildId].index + 1;
        if (index === queue[guildId].queue.length) {
            await interaction.editReply("Sorry, you cannot do that due to lack of music.");
            return;
        }
        queue[guildId].suppressEnd = true;
        queue[guildId].player.position = 0;
        queue[guildId].index++;
        await queue[guildId].player.playTrack({ track: queue[guildId].queue[index].data.encoded });
        await interaction.editReply("Skip");
        return;
    }
    if ((command || customId) === "back") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry,the player is not playing any audio.");
            return;
        }
        const index = queue[guildId].index - 1;
        if (index === -1) {
            await interaction.editReply("Sorry, you cannot do that due to lack of music.");
            return;
        }
        queue[guildId].suppressEnd = true;
        queue[guildId].player.position = 0;
        queue[guildId].index = queue[guildId].index - 1;
        await queue[guildId].player.playTrack({ track: queue[guildId].queue[index].data.encoded });
        await interaction.editReply("Back");
        return;
    }
    if ((command || customId) === "queue" && !interaction.isAutocomplete() || customId === "addR") {
        await interaction.deferReply();
        const current = queue[guildId].queue[queue[guildId].index].data.info;
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (customId === "queue") {
            let content = "";
            if (queue[guildId]["queue"].length === 0) {
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription("No music added to the queue.");
                await interaction.editReply({ embeds: [embed] });
            } else {
                content = content + `📀 ${queue[guildId].queue[queue[guildId].index].data.info.title}`;
                let i = 1;
                while (i <= queue[guildId]["queue"].length) {
                    content = content + `\n${i}: ${queue[guildId]["queue"][i - 1].data.info.title}`;
                    i++;
                }
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription(discord.codeBlock(util.formatString(content, 2000)));
                await interaction.editReply({ embeds: [embed] });
            }
            return;
        }
        if (customId === "addR") {
            const node = queue[guildId].node;
            if (queue[guildId].player.status !== "playing") {
                await interaction.editReply("Nothing to search here.");
                return;
            } else {
                const res = await node.rest.resolve(`ytsearch:${current.author}`);
                console.log(res);
                queue[guildId].add(res.data[0], interaction.user);
                queue[guildId].add(res.data[1], interaction.user);
                await interaction.editReply(`Added ${res.data[0].info.title} and ${res.data[1].info.title} to the queue.`);
            }
            return;
        }
        if (interaction.options.getSubcommand() === "display") {
            let content = "";
            if (queue[guildId]["queue"].length === 0) {
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription("No music added to the queue.");
                await interaction.editReply({ embeds: [embed] });
            } else {
                content = content + `📀 ${queue[guildId].queue[queue[guildId].index].data.info.title}`;
                let i = 1;
                while (i <= queue[guildId]["queue"].length) {
                    content = content + `\n${i}: ${queue[guildId]["queue"][i - 1].data.info.title}`;
                    i++;
                }
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription(discord.codeBlock(util.formatString(content, 2000)));
                await interaction.editReply({ embeds: [embed] });
            }
            return;
        }
        if (interaction.options.getSubcommand() === "clear") {
            if (!queue[guildId]) queue.add(guildId);
            if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
                const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                    name: ` | 🚫 - Please join a valid voice channel first!`,
                    iconURL: `${interaction.user.avatarURL({})}`,
                });
                await interaction.editReply({ embeds: [noValidVCEmbed] });
                return;
            }
            try {
                queue[guildId]["queue"] = [];
                await interaction.editReply("Deleted all music");
            } catch (err) {
                await interaction.editReply("Cannot delete music");
            }
            return;
        }
        if (interaction.options.getSubcommand() === "shuffle") {
            if (!queue[guildId]) queue.add(guildId);
            if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
                const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                    name: ` | 🚫 - Please join a valid voice channel first!`,
                    iconURL: `${interaction.user.avatarURL({})}`,
                });
                await interaction.editReply({ embeds: [noValidVCEmbed] });
                return;
            }
            const arrayTemp = util.shuffleArray(queue[guildId]["queue"]);
            queue[guildId]["queue"] = arrayTemp;
            await interaction.editReply(`Shuffled ${queue[guildId]["queue"].length} musics.`);
            return;
        }
        if (interaction.options.getSubcommand() === "delete") {
            let list = [];
            let i = 0;
            while (i !== queue[guildId].queue.length) {
                list.push(queue[guildId].queue[i].data.info.title);
                i++;
            }
            const query = interaction.options.getString("query");
            const index = list.indexOf(query);
            if (index === -1) {
                await interaction.editReply("Sorry, such music is not found.");
                return;
            } else {
                if (queue[guildId].index === index) {
                    await interaction.editReply("Sorry, the song is currently playing.");
                    return;
                }
                queue[guildId].remove(index);
                await interaction.editReply(`Deleted ${query} from the queue.`);
                return;
            }
        }
    }
    if (customId === ("volumeDown" || "volumeUp")) {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        const current = queue[guildId].volume;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry,the player is not playing any audio.");
            return;
        }
        if (customId === "volumeUp") {
            const before = current + 10;
            if (before < 200) {
                queue[guildId].player.setFilterVolume(before / 100);
                queue[guildId].volume = before;
                await interaction.editReply(`Set volume to ${before}%`);
                return;
            } else {
                await interaction.editReply(`Volume is too high!`);
                return;
            }
        } else if (customId === "volumeDown") {
            const before = current - 10;
            if (before > 10) {
                queue[guildId].player.setFilterVolume(before / 100);
                queue[guildId].volume = before;
                await interaction.editReply(`Set volume to ${before}%`);
                return;
            } else {
                await interaction.editReply(`Volume is too low!`);
                return;
            }
        }
    }
    if (customId === "30p") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry, the player is not playing any audio.");
            return;
        }
        if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
            await interaction.editReply("Sorry, the resource is not seekable.");
            return;
        }
        const current = queue[guildId].player.position;
        const after = current + 30000;
        if (after <= queue[guildId].queue[queue[guildId].index].data.length) {
            await interaction.editReply("Sorry, you cannnot seek tover the duration of the resource.");
            return;
        }
        queue[guildId].player.seekTo(after);
        await interaction.editReply("Skip 30s");
        return;
    }
    if (customId === "30m") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry,the player is not playing any audio.");
            return;
        }
        if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
            await interaction.editReply("Sorry, the resource is not seekable.");
            return;
        }
        const current = queue[guildId].player.position;
        const after = current - 30000;
        if (after <= 1) {
            await interaction.editReply("Sorry, you cannnot seek tover the duration of the resource.");
            return;
        }
        queue[guildId].player.seekTo(after);
        await interaction.editReply("Back 30s");
        return;
    }
    if ((customId || command) === "lyric") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry,the player is not playing any audio.");
            return;
        }
        const index = queue[guildId].index;
        let artist = queue[guildId].queue[index].data.info.author;
        let song = queue[guildId].queue[index].data.info.title;
        let songs = await lyricsSearcher.songs.search(`${song}`);
        try {
            const target = await songs[0].lyrics();
            const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Lyrics").setDescription(util.cutString(target));
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply("Sorry, but the lyric was not found.");
        }
        return;
    }
    if ((customId || command) === "stop") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            console.log(queue[guildId].voiceChannel);
            return;
        }
        queue[guildId].voiceChannel = "";
        queue[guildId].textChannel = "";
        queue[guildId].player.status = "finished";
        await shoukaku.leaveVoiceChannel(guildId);
        await interaction.editReply("Stopped playing");
        return;
    }
    if (command === "playlist") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry, the player is not playing any audio.");
            return;
        }
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "save") {
            const index = playlist.playlist.length + 1;
            let data = {
                [index]: {
                    queue: queue[guildId].queue,
                    author: interaction.user
                }
            }
            playlist.playlist.push(data);
            fs.writeFileSync("./db/playlist.json", JSON.stringify(playlist));
            await interaction.editReply(`Added the queue to public playlist. Your playlist's ID is ${index}`);
            return;
        }
        if (subcommand === "load") {
            const id = interaction.options.getInteger("id");
            if (!playlist.playlist[id]) {
                await interaction.editReply("Sorry, the playlist does not exist.");
                return;
            }
            await interaction.editReply(`Added the public playlist to the queue.`);
            return;
        }
    }
    if (command === "skipto") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry, the player is not playing any audio.");
            return;
        }
        const position = interaction.options.getInteger("position");
        if (queue[guildId].queue.length < position || position <= 0) {
            await interaction.editReply("The position is invalid.");
            return;
        }
        queue[guildId].index = position - 1;
        const index = queue[guildId].index;
        queue[guildId].suppressEnd = true;
        await queue[guildId].player.playTrack({ track: queue[guildId].queue[index].data.encoded });
        await interaction.editReply(`Skip to ${position}`);
        return;
    }
    if (command === "config") {

    }
});

async function startPlay(guildId) {
    queue[guildId].index = 0;
    const index = queue[guildId].index;
    await queue[guildId].player.playTrack({ track: queue[guildId].queue[index].data.encoded });
    return;
}

function addEventListenerToPlayer(guildId) {
    queue[guildId].player.on("start", async function (s) {
        queue[guildId].player.status = "playing";
        queue[guildId].player.setFilterVolume(queue[guildId].volume / 100);
        queue[guildId].suppressEnd = false;
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
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("pause").setLabel("Pause").setEmoji("1117306256781230191").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
        );
        const subBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("volumeDown").setLabel("Down").setEmoji("1117303628349313035").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("volumeUp").setLabel("Up").setEmoji("1117304554216767558").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
        );
        const seekBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("30m")
                .setLabel("-30s")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("30p")
                .setLabel("+30s")
                .setStyle(ButtonStyle.Secondary)
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
    queue[guildId].player.on("resumed", async function (s) {
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
                    value: `${queue[guildId].volume}% `,
                    inline: true,
                },
                {
                    name: "Position",
                    value: `${queue[guildId].index + 1} / ${queue[guildId].queue.length}`,
                    inline: true,
                }
            )
            .setImage(current.artworkUrl);
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("pause").setLabel("Pause").setEmoji("1117306256781230191").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
        );
        const subBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("volumeDown").setLabel("Down").setEmoji("1117303628349313035").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("volumeUp").setLabel("Up").setEmoji("1117304554216767558").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
        );
        const seekBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("30m")
                .setLabel("-30s")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("30p")
                .setLabel("+30s")
                .setStyle(ButtonStyle.Secondary)
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
    queue[guildId].player.on("paused", async function (s) {
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
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("unpause").setLabel("Resume").setEmoji("1117306258077257791").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
        );
        const subBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("volumeDown").setLabel("Down").setEmoji("1117303628349313035").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("volumeUp").setLabel("Up").setEmoji("1117304554216767558").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
        );
        const seekBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("30m")
                .setLabel("-30s")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("30p")
                .setLabel("+30s")
                .setStyle(ButtonStyle.Secondary)
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
    queue[guildId].player.on("end", async function (s) {
        const index = queue[guildId].index + 1;
        if (queue[guildId].suppressEnd) return;
        if (index === queue[guildId].queue.length) {
            if (queue[guildId].autoReplay) {
                await startPlay(guildId);
                return;
            } else {
                await queue[guildId].textChannel.send("Finished playing queue.");
                queue[guildId].player.status = "finished";
                return;
            }
        } else {
            queue[guildId].index++;
            await queue[guildId].player.playTrack({ track: queue[guildId].queue[index].data.encoded });
            return;
        }
    });
}

async function eventOnPaused(guildId) {
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
    const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("unpause").setLabel("Resume").setEmoji("1117306258077257791").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
    );
    const subBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("volumeDown").setLabel("Down").setEmoji("1117303628349313035").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("volumeUp").setLabel("Up").setEmoji("1117304554216767558").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
    );
    const seekBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("30m")
            .setLabel("-30s")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("30p")
            .setLabel("+30s")
            .setStyle(ButtonStyle.Secondary)
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
    const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("pause").setLabel("Pause").setEmoji("1117306256781230191").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
    );
    const subBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("volumeDown").setLabel("Down").setEmoji("1117303628349313035").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("volumeUp").setLabel("Up").setEmoji("1117304554216767558").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
    );
    const seekBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("30m")
            .setLabel("-30s")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("30p")
            .setLabel("+30s")
            .setStyle(ButtonStyle.Secondary)
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

function tryRequire(str) {
    let res = null;
    try {
        res = require(`${str}`);
        return res;
    } catch (err) {
        console.log(err);
        return null;
    }
}

client.login(config.bot.token);
shoukaku.on('error', (_, error) => log.error(error));
shoukaku.on('ready', async (data) => {
    log.ready(`Ready to accept commands. Boot took ${(new Date() - start) / 1000}s`);
    console.log(await fs.readFileSync("./assets/logo.txt").toString());
    return;
});
process.on('uncaughtException', (err) => {
    log.error(err.stack);
    return;
});

server.listen(config.config.adminPort, () => {
    log.ready(`Server started on ${config.config.adminPort}`);
    log.info("If you want to change port number, please edit config.json");
});
if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sess.cookie.secure = true;
}
function addServer() {
    app.use(session(sess));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get("/login", async (req, res) => {
        res.set("Content-Type", "text/html");
        res.send(fs.readFileSync("./web/login.html"));
    });
    app.post("/login", (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        if (username === config.config.dashboard.admin.username && password === config.config.dashboard.admin.password) {
            req.session.regenerate((err) => {
                req.session.username = "admin";
                res.redirect("/");
            });
        } else {
            res.redirect("/login");
        }
    });
    app.get("/logout", (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/");
        });
    });
    app.get("/icon", (req, res) => {
        res.send(fs.readFileSync("./web/icon.webp"));
    });
    app.get("/", async (req, res) => {
        const params = req.query;
        const code = params.code;
        if (code) {
            try {
                const tokenResponseData = await request("https://discord.com/api/oauth2/token", {
                    method: "POST",
                    body: new URLSearchParams({
                        client_id: config.bot.clientId,
                        client_secret: config.bot.clientSecret,
                        code,
                        grant_type: "authorization_code",
                        redirect_uri: `https://hacker-bot.ddns.net`,
                        scope: "identify",
                    }).toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
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
                req.session.username = "user";
                req.session.token = code;
                res.redirect("/");
            });
            return;
        }
        if (!req.session.username) {
            res.redirect("/login");
        } else {
            if (req.session.username === "admin") {
                res.set("Content-Type", "text/html");
                res.send(fs.readFileSync("./web/index.html"));
                return;
            } else {
                res.set("Content-Type", "text/html");
                await res.send(fs.readFileSync("./web/user.html"));
                io.emit("getUserInfo", info);
                return;
            }
        }
    });
}
addServer();
io.on("connection", (socket) => {
    log.info("Socket connected");
    socket.on("msg", (content, id) => {
        id = id.toString();
        client.channels.cache.get(id).send(content);
        io.emit("sended");
    });
    socket.on("dm", async (msg, user) => {
        try {
            usr = await client.users.cache.get(user);
            usr.send(msg);
            await io.emit("dmsended");
        } catch (err) {
            await io.emit("warn", "Cannot send message to the User.");
        }
    });
    socket.on("server", async () => {
        io.emit("server", guildList, guildNameList);
    });
    socket.on("music", async (type, id) => {
        if (type === "pause") {
            queue[id].player.setPaused(true);
            eventOnPaused(id);
        }
        if (type === "unpause") {
            queue[id].player.setPaused(false);
            eventOnResumed(id);
        }
    });
    socket.on("refresh", async (id) => {
        if (!queue[id]) return;
        const index = queue[id].index;
        let list = [];
        let i = 0;
        while (i !== queue[id].queue.length) {
            list.push(queue[id].queue[i].data.info.title);
            i++;
        }
        io.emit("refresher", queue[id].queue[index].data.info.title, queue[id].queue[index].data.info.author, queue[id].queue[index].data.info.length, queue[id].volume, queue[id].player.position, queue[id].queue[index].data.info.identifier, list);
    });
    socket.on("voice", async (result, id) => {
        console.log(result, id);
        if (result.match("を再生")) {
            const query = result.replace("を再生", "");
            const api = new YoutubeMusicApi();
            await api.initalize();
            const stat = await api.search(url, "song").then(async (result) => {
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
            url: "https://api.a3rt.recruit.co.jp/talk/v1/smalltalk",
            method: "POST",
            form: {
                apikey: config.token.talk,
                query: result,
            },
            json: true,
        };
        requester(options, function (error, response, body) {
            jpGtts.save("./audio/tts.wav", body.results[0].reply, async function () {
                const resource = createAudioResource("./audio/tts.wav");
                audio[id].player.play(resource);
            });
        });
    });
    socket.on("sendTyping", async (id) => {
        try {
            await client.channels.cache.get(id.toString()).sendTyping();
        } catch (err) {
            io.emit("warn", "Could not send typing to the channel.");
        }
    });
    socket.on("getUserInfo", async () => {
        console.log(socket.session);
    });
});