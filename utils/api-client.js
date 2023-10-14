const axios = require('axios'); // "Request" library

class spotifyApiClient {
    constructor(config) {
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.credential = null;
    }
    generateCredential = async function () {
        const res = await axios({
            method: 'post',
            url: `https://accounts.spotify.com/api/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: {
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret
            }
        });
        this.credential = res.data.access_token;
        return this;
    }
    getRecommendations = async function (seed) {
        const res = await axios({
            method: 'GET',
            url: `https://api.spotify.com/v1/recommendations`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer  ${this.credential}`
            },
            params: {
                limit: 10,
                market: 'ES',
                seed_tracks: seed
            }
        });
        return res.data.tracks[0].id;
    }
}

class palmLLMApiClient {
    constructor(config) {
        this.token = config.token;
    }
    generateText = async function (prompt) {
        const res = await axios({
            method: 'POST',
            url: `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${this.token}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                "prompt": {
                    "text": `You are a helpful assistant called "Cosmo AI". You must not start your answer with "Cosmo AI" or something like that. Please be a professional of anythings. Reply to this conversation: ${prompt}`
                }
            }
        });
        if (res.error) {
            throw new ApiClientError("The language was not supported.");
        } else {
            return res.data.candidates[0].output;
        }
    }
}

module.exports = { spotifyApiClient, palmLLMApiClient };