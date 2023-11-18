const gpt = require("./gpt-api-client.js");
const config = require("../config.json");

class gpts {
    add(channelId, model) {
        this[channelId] = new channelGpt(channelId, model);
        return;
    }
}

class channelGpt {
    constructor(channelId, model) {
        this.channelId = channelId;
        this.model = model;
    }
    history = null;
    generate = async function (message) {
        this.history = `${this.history || "System: From now on, you have to answer questions from users. You are not allowed to create users' messages."} User: ${message.content} You: `;
        const text = await gpt.generate(this.history, this.model);
        this.history = `${this.history}${text}`;
        return text;
    };
}

module.exports = { gpts, channelGpt };
