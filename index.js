const start = new Date();
const config = require("./config.json");
if (config.config.console.consoleClear) console.clear();
const discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require("discord.js");
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
    partials: [
        discord.Partials.Channel,
        discord.Partials.GuildMember,
        discord.Partials.GuildScheduledEvent,
        discord.Partials.Message,
        discord.Partials.Reaction,
        discord.Partials.ThreadMember,
        discord.Partials.User,
    ],
});
const { Shoukaku, Connectors } = require("shoukaku");
const shoukakuOptions = {
    resume: true,
    resumeTimeout: 0,
    resumeByLibrary: true,
    reconnectTries: 3,
    reconnectInterval: 100,
    restTimeout: 5,
    moveOnDisconnect: true,
    userAgent: "Cosmo Music/v0.0.1",
    voiceConnectionTimeout: 3,
};
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.lavalink, shoukakuOptions);
const util = require("./utils/utils.js");
const queue = new util.queue();
const log = new util.logger();
const embeds = require("./utils/embeds.js");
const playlist = tryRequire("./db/playlist.json");
const fs = require("fs");
const server = require("./server.js");
if (config.config.dashboard.boot) server.startServer(true);
const Genius = require("genius-lyrics");
const lyricsSearcher = new Genius.Client(config.token.genius);
const { spotifyApiClient } = require("./utils/api-client.js");
const spotifyClient = new spotifyApiClient({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
});
const { gpts } = require("./utils/gpt-client.js");
const gptQueue = new gpts();
const guildList = [];
const guildNameList = [];
client.shoukaku = shoukaku;
client.on("ready", async (u) => {
    log.ready(`Logged in as ${u.user.tag}`);
    for (const [key, value] of client.guilds.cache) {
        guildList.push(key);
    }
    for (const [key, value] of client.guilds.cache) {
        guildNameList.push(value["name"]);
    }
    await spotifyClient.generateCredential();
    return;
});
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!gptQueue[message.guild.id]) return;
    await message.channel.sendTyping();
    const res = await gptQueue[message.guild.id].generate(message);
    await message.reply(res);
    return;
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    const guildId = interaction.guild.id;
    if (interaction.commandName === "queue" && interaction.options.getSubcommand() === "delete") {
        const focusedValue = interaction.options.getFocused();
        const list = queue[guildId].getTitles();
        let filtered = list.filter((choice) => choice.startsWith(focusedValue));
        filtered = filtered.splice(0, 24);
        try {
            interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
        } catch (err) {
            return;
        }
        return;
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
        const result = await node.rest.resolve(`${focusedValue}`);
        if (result.loadType == "empty") {
            try {
                const searchResult = await node.rest.resolve(`ytsearch:${focusedValue}`);
                if (!searchResult?.data.length) return;
                const list = [];
                let i = 0;
                while (i < 20) {
                    try {
                        list.push(`${searchResult.data[i].info.title}`);
                    } catch (err) {
                        return;
                    }
                    i++;
                }
                await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
            } catch (err) {
                return;
            }
        }
        if (result.loadType == "track") {
            const list = [result.data.info.title];
            await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
            return;
        }
        if (result.loadType == "playlist") {
            let i = 0;
            const list = [];
            while (i !== result.data.tracks.length && i <= 24) {
                list.push(result.data.tracks[i].info.title);
                i++;
            }
            await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
            return;
        }
        if (result.loadType === "search") {
            if (!result?.data.length) return;
            const list = [];
            let i = 0;
            while (i < 5) {
                try {
                    list.push(`${result.data[i].info.title}`);
                } catch (err) {
                    return;
                }
                i++;
            }
            await interaction.respond(list.map((choice) => ({ name: choice, value: choice })));
            return;
        }
        if (result.loadType === "error") {
            console.log("An expected error has occured.");
            return;
        }
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
        if (replay) {
            queue[guildId].autoReplay = true;
        } else {
            queue[guildId].autoReplay = false;
        }
        const me = await interaction.guild.members.me;
        const voiceChannel = interaction.member.voice.channel;
        const permission = voiceChannel.permissionsFor(me);
        if (!permission.has(PermissionsBitField.Flags.Connect)) {
            await interaction.editReply("I do not have enough permission!");
            return;
        }
        if (!permission.has(PermissionsBitField.Flags.Speak)) {
            await interaction.editReply("I do not have enough permission!");
            return;
        }

        const node = queue[guildId].node;
        if (!queue[guildId].voiceChannel && !query && queue[guildId].isEmpty()) {
            queue[guildId].player = await shoukaku.joinVoiceChannel({
                guildId: guildId,
                channelId: interaction.member.voice.channelId,
                shardId: 0,
            });
            queue[guildId].player.status = "finished";
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
        // Join channel first or after stop command

        if (!queue[guildId].voiceChannel && query) {
            try {
                queue[guildId].player = await shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: interaction.member.voice.channelId,
                    shardId: 0,
                });
            } catch (err) {
                queue[guildId].player = null;
                await interaction.editReply("Sorry, I cannot join your channel. Check my permissions.");
                return;
            }
            queue[guildId].player.status = "finished";
            queue[guildId].voiceChannel = interaction.member.voice.channelId;
            queue[guildId].textChannel = interaction.channel;
            addEventListenerToPlayer(guildId);
        }
        // Join and there is valid query

        if (queue[guildId].voiceChannel && !query && queue[guildId].player.status === "finished") {
            await startPlay(guildId);
            await interaction.editReply("Started playing queue");
            return;
        }
        if (queue[guildId].voiceChannel && !query) {
            await interaction.editReply("Please input keywords");
            return;
        }
        // Already joined and no query

        if (queue[guildId].queue.length !== 0 && queue[guildId].player.status === "finished" && !query) {
            if (!queue[guildId].voiceChannel) {
                try {
                    queue[guildId].player = await shoukaku.joinVoiceChannel({
                        guildId: guildId,
                        channelId: interaction.member.voice.channelId,
                        shardId: 0,
                    });
                } catch (err) {
                    queue[guildId].player = null;
                    await interaction.editReply("Sorry, I cannot join the voice channel. Please check my permissions.");
                    return;
                }
                queue[guildId].voiceChannel = interaction.member.voice.channelId;
                queue[guildId].textChannel = interaction.channel;
            }
            await startPlay(guildId);
            await interaction.editReply("Started playing queue");
            return;
        }
        // Valid queue and player has been finished and there is no query

        if (queue[guildId].queue.length !== 0 && queue[guildId].player.status === "finished" && query) {
            if (!queue[guildId].voiceChannel) {
                try {
                    queue[guildId].player = await shoukaku.joinVoiceChannel({
                        guildId: guildId,
                        channelId: interaction.member.voice.channelId,
                        shardId: 0,
                    });
                } catch (err) {
                    queue[guildId].player = null;
                    await interaction.editReply("Sorry, I cannot join the voice channel. Please check my permissions.");
                    return;
                }
                queue[guildId].voiceChannel = interaction.member.voice.channelId;
                queue[guildId].textChannel = interaction.channel;
            }
        }
        // Valid queue and player has been finished and there is query

        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            await interaction.editReply("Please join my VC!");
            return;
        }
        // User did not join same voice channel as bot

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
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)],
            });
            return;
        }
        if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
            await interaction.editReply("Sorry, the resource is not seekable.");
            return;
        }
        const seek = interaction.options.getString("seek");
        const position = util.timeStringToSeconds(seek);
        const length = queue[guildId].queue[queue[guildId].index].data.info.length;
        if (length < position * 1000 || position < 1) {
            await interaction.editReply("Sorry, the input was invalid.");
            return;
        }
        await queue[guildId].player.seekTo(position * 1000);
        await interaction.editReply(`Seeked to ${seek}`);
        return;
    }
    if ((command || customId) === "pause") {
        await interaction.deferReply();
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)],
            });
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
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)],
            });
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
        if (!(await hasValidVC(interaction))) return;
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
        await queue[guildId].player.playTrack({
            track: queue[guildId].queue[index].data.encoded,
        });
        await interaction.editReply("Skip");
        return;
    }
    if ((command || customId) === "back") {
        await interaction.deferReply();
        if (!queue[guildId]) queue.add(guildId);
        if (!(await hasValidVC(interaction))) return;
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
        await queue[guildId].player.playTrack({
            track: queue[guildId].queue[index].data.encoded,
        });
        await interaction.editReply("Back");
        return;
    }
    if (((command || customId) === "queue" && !interaction.isAutocomplete()) || customId === "addR") {
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
        if (customId === "queue") {
            let content = "";
            if (queue[guildId]["queue"].length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(config.config.color.info)
                    .setTitle("Queue")
                    .setDescription("No music added to the queue.");
                await interaction.editReply({ embeds: [embed] });
            } else {
                content = content + `📀 ${queue[guildId].queue[queue[guildId].index].data.info.title}`;
                let i = 1;
                while (i <= queue[guildId]["queue"].length) {
                    content = content + `\n${i}: ${queue[guildId]["queue"][i - 1].data.info.title}`;
                    i++;
                }
                const embed = new EmbedBuilder()
                    .setColor(config.config.color.info)
                    .setTitle("Queue")
                    .setDescription(discord.codeBlock(util.formatString(content, 2000)));
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
                const current = queue[guildId].queue[queue[guildId].index].data.info;
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
                const embed = new EmbedBuilder()
                    .setColor(config.config.color.info)
                    .setTitle("Queue")
                    .setDescription("No music added to the queue.");
                await interaction.editReply({ embeds: [embed] });
            } else {
                content = content + `📀 ${queue[guildId].queue[queue[guildId].index].data.info.title}`;
                let i = 1;
                while (i <= queue[guildId]["queue"].length) {
                    content = content + `\n${i}: ${queue[guildId]["queue"][i - 1].data.info.title}`;
                    i++;
                }
                const embed = new EmbedBuilder()
                    .setColor(config.config.color.info)
                    .setTitle("Queue")
                    .setDescription(discord.codeBlock(util.formatString(content, 2000)));
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
                queue[guildId].index = 0;
                queue[guildId].suppressEnd = true;
                queue[guildId].player.stopTrack();
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
            const list = queue[guildId].getTitles();
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
                if (queue[guildId].isEmpty()) {
                    queue[guildId].index = 0;
                    queue[guildId].suppressEnd = true;
                    queue[guildId].player.stopTrack();
                }
                return;
            }
        }
    }
    if (customId === ("volumeDown" || "volumeUp")) {
        await interaction.deferReply();
        if (!(await hasValidVC(interaction))) return;
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
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)],
            });
            return;
        }
        if (!queue[guildId].queue[queue[guildId].index].data.info.isSeekable) {
            await interaction.editReply("Sorry, the resource is not seekable.");
            return;
        }
        const current = queue[guildId].player.position;
        const after = current + 30000;
        if (after <= queue[guildId].queue[queue[guildId].index].data.length) {
            await interaction.editReply("Sorry, you cannnot seek to out of the range of duration of the resource.");
            return;
        }
        queue[guildId].player.seekTo(after);
        await interaction.editReply("Skip 30s");
        return;
    }
    if (customId === "30m") {
        await interaction.deferReply();
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)],
            });
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
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Sorry,the player is not playing any audio.");
            return;
        }
        const index = queue[guildId].index;
        const artist = queue[guildId].queue[index].data.info.author;
        const song = queue[guildId].queue[index].data.info.title;
        const songs = await lyricsSearcher.songs.search(`${song}`);
        try {
            const target = await songs[0].lyrics();
            const embed = new EmbedBuilder()
                .setColor(config.config.color.info)
                .setTitle("Lyrics")
                .setDescription(util.cutString(target));
            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply("Sorry, but the lyric was not found.");
        }
        return;
    }
    if ((customId || command) === "stop") {
        await interaction.deferReply();
        if (!(await hasValidVC(interaction))) return;
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
            const data = {
                [index]: {
                    queue: queue[guildId].queue,
                    author: interaction.user,
                },
            };
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
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `Sorry, I am not playing any song in your server.`)],
            });
            return;
        }
        const position = interaction.options.getInteger("position");
        if (queue[guildId].queue.length < position || position <= 0) {
            await interaction.editReply({
                embeds: [embeds.generateMessageEmbed(interaction, `The position is invalid.`)],
            });
            return;
        }
        queue[guildId].index = position - 1;
        const index = queue[guildId].index;
        queue[guildId].suppressEnd = true;
        await queue[guildId].player.playTrack({
            track: queue[guildId].queue[index].data.encoded,
        });
        await interaction.editReply({
            embeds: [embeds.generateMessageEmbed(interaction, `Skip to ${position}`)],
        });
        return;
    }
    if (command === "config") {
        await interaction.deferReply();
        if (!(await hasValidVC(interaction))) return;
        if (interaction.options.getSubcommand() === "autoreplay") {
            if (interaction.options.getBoolean("autoreplay")) {
                queue[guildId].autoReplay = true;
                queue[guildId].autoPlay = false;
                await interaction.editReply("From now on, the queue will be automatically replayed when it has finished.");
            } else {
                queue[guildId].autoReplay = false;
                await interaction.editReply("From now on, the queue will not be automatically replayed when it has finished.");
            }
        }
        if (interaction.options.getSubcommand() === "autoplay") {
            if (interaction.options.getBoolean("autoplay")) {
                queue[guildId].autoPlay = true;
                queue[guildId].autoRelay = false;
                await interaction.editReply("From now on, a song or something will be played when the queue has finished.");
            } else {
                queue[guildId].autoPlay = false;
                await interaction.editReply("From now on, a song or something will be played when the queue has finished.");
            }
        }
        return;
    }
    if (command === "filter") {
        await interaction.deferReply();
        if (!(await hasValidVC(interaction))) return;
        if (queue[guildId].player.status !== "playing") {
            await interaction.editReply("Player is not playing any song.");
            return;
        }
        const filter = {
            tremolo: {
                frequency: 5.0,
                depth: 0.5,
            },
        };
        queue[guildId].player.setFilters(filter);
        await interaction.editReply("Set vibrato filter");
    }
    if (command === "gpt") {
        await interaction.deferReply();
        const option = interaction.options.getString("gpt");
        if (option === "reset") {
            try {
                delete gptQueue[guildId];
                await interaction.editReply("Reset GPT. The GPT will no longer answer messages in this channel.");
                return;
            } catch (err) {}
        }
        if (!gptQueue[guildId]) {
            gptQueue.add(guildId, Number(option));
            await interaction.editReply(`Set ${option} on this channel.`);
            return;
        } else {
            try {
                delete gptQueue[guildId];
            } catch (err) {}
            gptQueue.add(guildId, option);
            await interaction.editReply(`Set ${option} on this channel.`);
            return;
        }
    }
});

async function startPlay(guildId) {
    queue[guildId].index = 0;
    const index = queue[guildId].index;
    await queue[guildId].player.playTrack({
        track: queue[guildId].queue[index].data.encoded,
    });
    return;
}
function addEventListenerToPlayer(guildId) {
    queue[guildId].player.on("start", async function (s) {
        queue[guildId].player.status = "playing";
        queue[guildId].player.setFilterVolume(queue[guildId].volume / 100);
        queue[guildId].suppressEnd = false;
        queue[guildId].player.position = 0;
        const embed = embeds.generateStartEmbed(queue, guildId, 0, config);
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("pause")
                .setLabel("Pause")
                .setEmoji("1117306256781230191")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel("Back")
                .setEmoji("1117303043743039599")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("skip")
                .setLabel("Skip")
                .setEmoji("1117303289365659648")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
        );
        const subBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("volumeDown")
                .setLabel("Down")
                .setEmoji("1117303628349313035")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("volumeUp")
                .setLabel("Up")
                .setEmoji("1117304554216767558")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("queue")
                .setLabel("Queue")
                .setEmoji("1117304805237465138")
                .setStyle(ButtonStyle.Secondary)
        );
        const seekBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("30m").setLabel("-30s").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("30p").setLabel("+30s").setStyle(ButtonStyle.Secondary)
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
        const embed = embeds.generateUnpauseEmbed(queue, guildId, 0, config);
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("pause")
                .setLabel("Pause")
                .setEmoji("1117306256781230191")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel("Back")
                .setEmoji("1117303043743039599")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("skip")
                .setLabel("Skip")
                .setEmoji("1117303289365659648")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
        );
        const subBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("volumeDown")
                .setLabel("Down")
                .setEmoji("1117303628349313035")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("volumeUp")
                .setLabel("Up")
                .setEmoji("1117304554216767558")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("queue")
                .setLabel("Queue")
                .setEmoji("1117304805237465138")
                .setStyle(ButtonStyle.Secondary)
        );
        const seekBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("30m").setLabel("-30s").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("30p").setLabel("+30s").setStyle(ButtonStyle.Secondary)
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
        const embed = embeds.generatePauseEmbed(queue, guildId, 0, config);
        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("unpause")
                .setLabel("Resume")
                .setEmoji("1117306258077257791")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel("Back")
                .setEmoji("1117303043743039599")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("skip")
                .setLabel("Skip")
                .setEmoji("1117303289365659648")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
        );
        const subBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("volumeDown")
                .setLabel("Down")
                .setEmoji("1117303628349313035")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("volumeUp")
                .setLabel("Up")
                .setEmoji("1117304554216767558")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("queue")
                .setLabel("Queue")
                .setEmoji("1117304805237465138")
                .setStyle(ButtonStyle.Secondary)
        );
        const seekBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("30m").setLabel("-30s").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("30p").setLabel("+30s").setStyle(ButtonStyle.Secondary)
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
        queue[guildId].previous = queue[guildId].queue[queue[guildId].index];
        queue[guildId].player.status = "finished";
        if (queue[guildId].suppressEnd) return;
        if (index === queue[guildId].queue.length) {
            if (queue[guildId].autoReplay) {
                await startPlay(guildId);
                return;
            }
            if (queue[guildId].autoPlay) {
                const previous = queue[guildId].previous;
                if (previous.data.info.sourceName === "spotify") {
                    const res = await spotifyClient.getRecommendations(previous.data.info.identifier);
                    const track = await queue[guildId].node.rest.resolve(`https://open.spotify.com/intl-ja/track/${res}`);
                    queue[guildId].add(track.data, "Auto Recommendation");
                    queue[guildId].index++;
                    await queue[guildId].player.playTrack({
                        track: queue[guildId].queue[index].data.encoded,
                    });
                } else {
                    const searchResult = await queue[guildId].node.rest.resolve(`ytsearch:${previous.data.info.author}`);
                    if (!searchResult?.data.length) {
                        await queue[guildId].textChannel.send(
                            "Finished playing queue. I was not able to find any recommendation for you."
                        );
                        return;
                    }
                    res = searchResult.data.shift();
                    queue[guildId].add(res, "Auto Recommendation");
                    queue[guildId].index++;
                    await queue[guildId].player.playTrack({
                        track: queue[guildId].queue[index].data.encoded,
                    });
                }
            } else {
                await queue[guildId].textChannel.send("Finished playing queue.");
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
        new ButtonBuilder()
            .setCustomId("unpause")
            .setLabel("Resume")
            .setEmoji("1117306258077257791")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
    );
    const subBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("volumeDown")
            .setLabel("Down")
            .setEmoji("1117303628349313035")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("volumeUp")
            .setLabel("Up")
            .setEmoji("1117304554216767558")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
    );
    const seekBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("30m").setLabel("-30s").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("30p").setLabel("+30s").setStyle(ButtonStyle.Secondary)
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
        new ButtonBuilder()
            .setCustomId("pause")
            .setLabel("Pause")
            .setEmoji("1117306256781230191")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("stop").setLabel("Stop").setEmoji("1100927733116186694").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("back").setLabel("Back").setEmoji("1117303043743039599").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("skip").setLabel("Skip").setEmoji("1117303289365659648").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("addR").setLabel("Add Relate").setStyle(ButtonStyle.Secondary)
    );
    const subBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("volumeDown")
            .setLabel("Down")
            .setEmoji("1117303628349313035")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("volumeUp")
            .setLabel("Up")
            .setEmoji("1117304554216767558")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("lyric").setLabel("Lyric").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("queue").setLabel("Queue").setEmoji("1117304805237465138").setStyle(ButtonStyle.Secondary)
    );
    const seekBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("30m").setLabel("-30s").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("30p").setLabel("+30s").setStyle(ButtonStyle.Secondary)
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
async function hasValidVC(interaction) {
    const guildId = interaction.guild.id;
    if (!queue[guildId]) queue.add(guildId);
    if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
        const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
            name: ` | 🚫 - Please join a valid voice channel first!`,
            iconURL: `${interaction.user.avatarURL({})}`,
        });
        await interaction.editReply({ embeds: [noValidVCEmbed] });
        return false;
    }
    return true;
}

client.login(config.bot.token);
shoukaku.on("error", (_, error) => log.error(error));
shoukaku.on("ready", async (data) => {
    log.ready(`Ready to accept commands. Boot took ${(new Date() - start) / 1000}s`);
    console.log(await fs.readFileSync("./assets/logo.txt").toString());
    return;
});
process.on("uncaughtException", (err) => {
    log.error(err.stack);
    return;
});
