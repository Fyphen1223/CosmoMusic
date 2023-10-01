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
            method: 'get',
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

module.exports = { spotifyApiClient };