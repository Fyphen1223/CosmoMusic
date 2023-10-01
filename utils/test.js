const config = require('../config.json');

const { spotifyApiClient } = require('./api-client.js');

const client = new spotifyApiClient({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret
});

async function main() {
    const res = await client.generateCredential();
    console.log(await client.getRecommendations("2DGa7iaidT5s0qnINlwMjJ"))
}

main();