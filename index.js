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
const { Shoukaku, Connectors } = require('shoukaku');
const Nodes = [{
    name: 'Localhost',
    url: 'localhost:2333',
    auth: 'youshallnotpass'
}];
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
shoukaku.on('error', (_, error) => console.error(error));
process.on("uncaughtException", (err) => {
    console.log(`\x1b[41m[ERROR]\x1b[49m: ${err.stack} `);
    return;
});
client.login(config.bot.token);
client.shoukaku = shoukaku;
client.on('ready', () => {
    console.log("Ready")
});