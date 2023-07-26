const start = new Date();
const config = require("./config.json");
if (config.config.console.consoleClear) console.clear();
console.log("🏁 - \x1b[34mReady... Please wait, now loading packages... (Step 1/4)\x1b[39m");
const discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageAttachment, AttachmentBuilder, codeBlock } = require("discord.js");
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
const { ytUtil } = require("ytutil");
const ytU = new ytUtil();
const { Shoukaku, Connectors } = require('shoukaku');
const Nodes = [{
    name: config.lavalink.name,
    url: `${config.lavalink.host}:${config.lavalink.port}`,
    auth: config.lavalink.password
}];
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
const util = require("./utils/utils.js");
var queue = new util.queue();

shoukaku.on('error', (_, error) => console.error(error));
process.on("uncaughtException", (err) => {
    console.log(`\x1b[41m[ERROR]\x1b[49m: ${err.stack} `);
    return;
});
client.login(config.bot.token);
client.shoukaku = shoukaku;
client.on('ready', (u) => {
    console.log(`Ready: Logged in as ${u.user.tag}`);
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    if (interaction.commandName === "queue" && interaction.options.getSubcommand() === "delete") {
        const focusedValue = interaction.options.getFocused();
        const filtered = audio[interaction.guild.id.toString()]["queue"].filter((choice) => choice.startsWith(focusedValue));
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
        const res = await ytU.search(focusedValue);
        const list = [];
        let i = 0;
        while (i < 5) {
            try {
                list.push(`${res[i].title}`);
            } catch (err) { }
            i++;
        }
        const filtered = list.filter((choice) => choice);
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
        if ((queue[guildId].queue.length !== 0) && queue[guildId].player.status === "finished") {
            await startPlay(guildId);
            await interaction.editReply("Started playing queue");
            return;
        }
        if (interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            await interaction.editReply("Please join my VC!");
            return;
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
        if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== queue[guildId].voiceChannel) {
            const noValidVCEmbed = new EmbedBuilder().setColor(config.config.color.info).setAuthor({
                name: ` | 🚫 - Please join a valid voice channel first!`,
                iconURL: `${interaction.user.avatarURL({})}`,
            });
            await interaction.editReply({ embeds: [noValidVCEmbed] });
            return;
        }
        const seek = interaction.options.getString("seek");
        const position = util.timeStringToSeconds(seek);
        await queue[guildId].player.seekTo(position * 1000);
        await interaction.editReply(`Seeked to ${seek}`);
        return;
    }
    if (command || customId === "pause") {
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
    if (command || customId === "unpause") {
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
    if (command || customId === "skip") {
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
    if (command || customId === "back") {
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
    if ((commandName === "queue" || customId === "queue" && !interaction.isAutocomplete()) || customId === "addR") {
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
        const current = queue[guildId].queue[queue[guildId].index].data.info;
        if (interaction.customId === "queue") {
            let content = "";
            if (queue[guildId]["queue"].length === 0) {
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription("No music added to the queue.");
                await interaction.editReply({ embeds: [embed] });
            } else {
                content = "";
                let i = 1;
                while (i <= queue[guildId]["queue"].length) {
                    content = content + `\n${i}: ${queue[guildId]["queue"][i - 1]}`;
                    i++;
                }
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription(content);
                await interaction.editReply({ embeds: [embed] });
            }
            return;
        }
        if (interaction.customId === "addR") {
            if (!queue[guildId].player.status === "started") {
                await interaction.editReply("Nothing to search here.");
                return;
            } else {
                const res = await ytU.search(`${current.author}`);
                current[guildId]["queue"].push(res[0]["link"], interaction.user);
                current[guildId]["queue"].push(res[1]["link"], interaction.user);
                await interaction.editReply(`Added ${res[0]["title"]} and ${res[1]["title"]} to the queue.`);
            }
            return;
        }
        if (interaction.options.getSubcommand() === "display") {
            let content = "";
            if (queue[guildId]["queue"].length === 0) {
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription("No music added to the queue.");
                await interaction.editReply({ embeds: [embed] });
            } else {
                content = "";
                let i = 1;
                while (i <= queue[guildId]["queue"].length) {
                    content = content + `\n${i}: ${queeu[guildId]["queue"][i - 1].info.title}`;
                    i++;
                }
                const embed = new EmbedBuilder().setColor(config.config.color.info).setTitle("Queue").setDescription(content);
                await interaction.editReply({ embeds: [embed] });
            }
        } else if (interaction.options.getSubcommand() === "clear") {
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
        } else if (interaction.options.getSubcommand() === "shuffle") {
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
    }
    if (cuatomId === "volumeUp" || "volumeDown") {
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
        const current = queue[guildId].player.volume;
        if (customid === "volumeUp") {
            const before = current + 10;
            if (before < 200) {
                queue[guildId].player.setVolume(before);
                await interaction.editReply(`Set volume to ${before}%`);
                return;
            } else {
                await interaction.editReply(`Volume is too high!`);
                return;
            }
        } else {
            if (before > 10) {
                queue[guildId].player.setVolume(before);
                await interaction.editReply(`Set volume to ${before}%`);
                return;
            } else {
                await interaction.editReply(`Volume is too low!`);
                return;
            }
        }
    }
    if (customid === "30p") {

    }
    if (customid === "30m") {

    }
});

async function startPlay(guildId) {
    queue[guildId].index = 0;
    const index = queue[guildId].index;
    await queue[guildId].player.playTrack({ track: queue[guildId].queue[index].data.encoded });
}

function addEventListenerToPlayer(guildId) {
    queue[guildId].player.on("start", async function (s) {
        queue[guildId].player.status = "playing";
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
                    value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(current.length / 1000)}`,
                    inline: true,
                },
                {
                    name: "Requested by",
                    value: `${queue[guildId].queue[queue[guildId].index].user}`,
                    inline: true,
                },
                {
                    name: "Volume",
                    value: `${queue[guildId].player.volume}%`,
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
                    value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(current.length / 1000)}`,
                    inline: true,
                },
                {
                    name: "Requested by",
                    value: `${queue[guildId].queue[queue[guildId].index].user}`,
                    inline: true,
                },
                {
                    name: "Volume",
                    value: `${queue[guildId].player.volume}%`,
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
                    value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(current.length / 1000)}`,
                    inline: true,
                },
                {
                    name: "Requested by",
                    value: `${queue[guildId].queue[queue[guildId].index].user}`,
                    inline: true,
                },
                {
                    name: "Volume",
                    value: `${queue[guildId].player.volume}%`,
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
        queue[guildId].player.status = "finished";
        const index = queue[guildId].index + 1;
        if (queue[guildId].suppressEnd) return;
        if (index === queue[guildId].queue.length) {
            if (queue[guildId].autoReplay) {
                await startPlay(guildId);
                return;
            } else {
                await queue[guildId].textChannel.send("Finished playing queue.");
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
                value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(current.length / 1000)}`,
                inline: true,
            },
            {
                name: "Requested by",
                value: `${queue[guildId].queue[queue[guildId].index].user}`,
                inline: true,
            },
            {
                name: "Volume",
                value: `${queue[guildId].player.volume}%`,
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
                value: `${util.formatTime(Math.floor(queue[guildId].player.position / 1000))}/${util.formatTime(current.length / 1000)}`,
                inline: true,
            },
            {
                name: "Requested by",
                value: `${queue[guildId].queue[queue[guildId].index].user}`,
                inline: true,
            },
            {
                name: "Volume",
                value: `${queue[guildId].player.volume}%`,
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

}