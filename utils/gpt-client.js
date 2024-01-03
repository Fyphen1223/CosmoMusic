const gpt = require('./gpt-api-client.js');

class gpts {
	add(channelId, model) {
		this[channelId] = new channelGpt(channelId, model);
	}
}

class channelGpt {
	constructor(channelId, model) {
		this.channelId = channelId;
		this.model = model;
		this.history = null;
	}

    async generate(message) {
		this.history = `${this.history || 'System: From now on, you have to answer questions from users. You are not allowed to create user messages.'} User: ${message.content} You: `;

		const text = await gpt.generate(this.history, this.model);

		this.history = `${this.history}${text}`;

		return text;
    };
}

module.exports = {
	gpts,
	channelGpt
};
