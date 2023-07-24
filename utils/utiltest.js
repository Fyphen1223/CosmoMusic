const util = require("./utils.js");

const queue = new util.voiceQueue(32);
queue.createGuildQueue("12891289938728");

console.log(queue);
