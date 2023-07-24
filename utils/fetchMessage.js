const config = require('./fetchMessage.json');
const discord = require('discord.js');
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
client.on('ready', async () => {
    const guild = await client.guilds.cache.get(config.guild);
    const channels = guild.channels.cache.map(channel => `${channel.name}:${channel.id}`);
    console.log(channels);
    const channel = await client.channels.cache.get(config.channel);
    channel.messages.fetch({ limit: 100 })
        .then(messages => {
            messages.forEach(message =>
                console.log(`${message.author.tag}: ${message.content}: ${message.createdAt}`));
        })
        .catch(console.error);
});
client.login(config.token)