const gpt = require('./gpt-api-client.js');
const config = require('../config.json');

class gpts {
    add(guildId) {
        this[guildId] = new channelGpt(guildId);
        return;
    }
}

class channelGpt {
    history = null;
    generate = async function(message) {
        this.history = `${this.history || "System: From now on, you have to answer questions from users."} User: ${message} You: `;
        const text = await gpt.generate(this.history, 1);
        this.history = `${this.history}${text}`;
        return text;
    }
}

module.exports = {gpts, channelGpt};