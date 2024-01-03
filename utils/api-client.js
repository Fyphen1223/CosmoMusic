const { request } = require('undici');

class spotifyApiClient {
	constructor(config) {
		this.clientId = config.clientId;
		this.clientSecret = config.clientSecret;
		this.credential = null;
	}

	async generateCredential() {
		const res = await request(`https://accounts.spotify.com/api/token?grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			method: 'POST'
		});

		const body = await res.body.json();

		this.credential = body.access_token;

		return this;
	};

	async getRecommendations(seed) {
		const res = await request(`https://api.spotify.com/v1/recommendations?limit=10&market=ES&seed_tracks=${seed}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.credential}`,
			},
			method: 'GET'
		});

		const body = await res.body.json();

		return body.tracks[0].id;
	};
}

class palmLLMApiClient {
	constructor(config) {
		this.token = config.token;
	}

	async generateText(prompt) {
		const res = await request(`https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${this.token}`, {
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				prompt: {
					text: `You are a helpful assistant called 'Cosmo AI'. You must not start your answer with 'Cosmo AI' or something like that. Please be a professional of anythings. Reply to this conversation: ${prompt}`
				}
			},
			method: 'POST'
		});

		const body = await res.body.json();

		if (res.error) {
			throw new ApiClientError('The language was not supported.');
		} else {
			return body.candidates[0].output;
		}
	};
}

class discordUserInfoClient {
	constructor(config) {
		this.clientId = config.clientId;
		this.clientSecret = config.clientSecret;
		this.redirect_uri = config.url;
	}

	getAccessToken = async (code) => {
		const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: this.clientId,
				client_secret: this.clientSecret,
				code,
				grant_type: 'authorization_code',
				redirect_uri: this.redirect_uri,
				scope: 'email identify',
			}).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});
		const res = await tokenResponseData.body.json();
		if (tokenResponseData.statusCode !== 200) {
			throw new Error('The access token was not generated.');
		}
		return res;
	};

	getUserInfo = async (oauthData) => {
		try {
			const userResult = await request('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${oauthData.token_type} ${oauthData.access_token}`
				},
				method: 'GET'
			});

			if (userResult.statusCode !== 200)
				throw new Error('The user info was not generated.');

			return await userResult.body.json();
		} catch (err) {
			throw new Error('The user info was not generated.');
		}
	};
}

module.exports = {
	spotifyApiClient,
	palmLLMApiClient,
	discordUserInfoClient
};
