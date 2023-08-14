const http = require('http');
const config = require('../config.json');

async function getSpotifyRecommends(id) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.spotify
        }
    };
}
