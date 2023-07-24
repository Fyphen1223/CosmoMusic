const { Collection } = require("@discordjs/collection");

class voiceQueue {
    constructor(ram) {
        this.ram = ram;
        this.queue = {};
    }
    createGuildQueue(id) {
        const temp = {
            [id]: {
                "previousUser": "",
                "previousChannel": "",
                "stream": "",
                "connection": "",
                "title": "",
                "artist": "",
                "length": "",
                "id": "",
                "autoReplay": "false",
                "player": "",
                "channel": "",
                "queue": [],
                "resource": "",
                "volume": "",
                "index": 0,
                "previousPanel": "",
                "savedQueue": [],
                "status": "",
                "rawStream": "",
                "seek": 0,
                "seekStream": "",
                "subSeekStream": "",
                "seekStreamInt": 0,
                "useYTM": true,
                add(url) {
                    this.queue.push(url);
                },
            }
        };
        this.queue = { ...this.queue, ...temp };
    }
    destroyAllQueue() {
        this.queue = {};
    }
    add(guildId, url) {
        
    }
}

function reverseArray(array) {
    for (let i = 0; i < array.length / 2; i++) {
        const temp = array[i];
        array[i] = array[array.length - 1 - i];
        array[array.length - 1 - i] = temp;
    }
    return array;
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
    let totalSeconds = 0;

    const timeComponents = duration.split(/(\d+)([hms])/).filter(Boolean);

    for (let i = 0; i < timeComponents.length; i += 2) {
        const value = parseInt(timeComponents[i]);
        const unit = timeComponents[i + 1];

        if (isNaN(value)) {
            return NaN;
        }

        switch (unit) {
            case 'h':
                totalSeconds += value * 3600;
                break;
            case 'm':
                totalSeconds += value * 60;
                break;
            case 's':
                totalSeconds += value;
                break;
            default:
                return Number(duration);
        }
    }

    return totalSeconds;
}
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${paddedHours}h${paddedMinutes}m${paddedSeconds}s`;
}
function array2Collection(messages) {
    return new Collection(messages.slice().sort((a, b) => {
        const a_id = BigInt(a.id);
        const b_id = BigInt(b.id);
        return (a_id > b_id ? 1 : (a_id === b_id ? 0 : -1));
    }).map(e => [e.id, e]));
}
function cutString(str) {
    if (str.length > 2000) {
        return str.substring(0, 2000);
    }
    return str;
}
function convertToJapanTime(unixTime) {
    const date = new Date(unixTime * 1000);
    const japanTimeDifference = 9 * 60 * 60 * 1000;
    const japanTime = date.getTime() + japanTimeDifference;
    const japanDate = new Date(japanTime);
    return japanDate.toString();
}
module.exports = { voiceQueue, reverseArray, shuffleArray, timeStringToSeconds, formatTime, array2Collection, cutString, convertToJapanTime };