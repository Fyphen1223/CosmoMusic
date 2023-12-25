const config = require('../config.json');

const { createClient } = require('redis');

(async () => {
	const redisClient = await createClient({
		password: config.db.password,
		socket: {
			host: config.db.host,
			port: config.db.port
		}
	})
	.on('error', (err) => console.log('Redis Client Error', err))
	.connect();

	await redisClient.set('test', JSON.stringify({ premium: false, ilegal: false, expires: false }));

	console.log(JSON.parse(await redisClient.get('test')));
})();
