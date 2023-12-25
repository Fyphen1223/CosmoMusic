const { Collection } = require('@discordjs/collection');

class queue {
	add(guildId) {
		this[guildId] = new guildQueue(guildId);
	}
}

class guildQueue {
	constructor(id) {
		this.id = id;
		this.node = '';
		this.player = '';
		this.textChannel = '';
		this.voiceChannel = '';
		this.queue = [];
		this.index = 0;
		this.suppressEnd = false;
		this.autoReplay = true;
		this.autoPlay = false;
		this.volume = 100;
		this.previous = null;
    }

    add(data, user) {
		this.queue.push({
			user,
			data
		});
	}

	remove(index) {
		this.queue.splice(index, 1);
	}

	isEmpty() {
		return this.queue.length === 0;
	}

	getTitles() {
		let result = [];

		for (let i = 0; i < this.queue.length; i++) {
			result.push(this.queue[i].data.info.title);
		}

		return result;
	}
}

class logger {
	error(content) {
		console.log(`\x1b[33m[ERR]\x1b[39m : ${content}`);
	}

	warn(content) {
		console.log(`\x1b[41m[WRN]\x1b[39m : ${content}`);
	}

	ready(content) {
		console.log(`\x1b[32m[RDY]\x1b[39m : ${content}`);
	}

	info(content) {
		console.log(`\x1b[34m[INF]\x1b[39m : ${content}`);
	}
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

function timeStringToSeconds(duration) {
	const timeComponents = duration.split(/(\d+)([hms])/).filter(Boolean);
	let totalSeconds = 0;

	for (let i = 0; i < timeComponents.length; i += 2) {
		const value = parseInt(timeComponents[i]);
		const unit = timeComponents[i + 1];

		if (isNaN(value)) return NaN;

		switch (unit) {
			case 'h': {
				totalSeconds += value * 3600;

				break;
			}
			case 'm': {
				totalSeconds += value * 60;

				break;
			}
			case 's': {
				totalSeconds += value;

				break;
			}
			default: {
				return Number(duration);
			}
		}
	}

	return totalSeconds;
}

function formatTime(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const paddedHours = hours.toString().padStart(2, '0');
	const paddedMinutes = minutes.toString().padStart(2, '0');
	const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

	return `${paddedHours}h${paddedMinutes}m${paddedSeconds}s`;
}

function array2Collection(messages) {
	return new Collection(
		messages
			.slice()
			.sort((a, b) => {
				const a_id = BigInt(a.id);
				const b_id = BigInt(b.id);

				return a_id > b_id ? 1 : a_id === b_id ? 0 : -1;
			})
			.map((e) => [e.id, e])
    );
}

function cutString(str) {
	if (str.length > 2000) {
		return str.substring(0, 2000);
	}

	return str;
}

function formatString(str, int) {
	if (str.length > int)
		return `${str.substring(0, int - 20)}\n... and ${str.length - (int + 10)} left`;

	return str;
}

function tryRequire(str) {
	try {
		return require(`../${str}`);
	} catch (err) {
		console.log(err);

		return null;
	}
}

module.exports = {
	formatString,
	queue,
	logger,
	shuffleArray,
	timeStringToSeconds,
	formatTime,
	array2Collection,
	cutString,
	tryRequire
};
