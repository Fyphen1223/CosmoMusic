const axios = require("axios");

async function generate(prompt, model) {
    let res = await axios({
        method: "post",
        url: `https://gpti.projectsrpp.repl.co/api/gpti`,
        headers: {
            "Content-Type": "application/json",
        },
        data: {
            prompt: prompt,
            model: model,
            type: "json",
        },
    });
    if (res.data.code !== 200) {
        res = await axios({
            method: "post",
            url: `https://gpti.projectsrpp.repl.co/api/gpti`,
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                prompt: prompt.slice(-20000),
                model: model || "gpt-4-32k",
                type: "json",
            },
        });
    }
    return res.data.gpt;
}

module.exports = { generate };
