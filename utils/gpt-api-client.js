const { request } = require('undici');

async function generate(prompt, model) {
	const res = await request('https://gpti.projectsrpp.repl.co/api/gpti', {
		headers: {
			'Content-Type': 'application/json'
		},
        body: {
			prompt,
			model,
			type: 'json'
		},
		method: 'POST'
	});

	const body = await res.body.json();

	if (body.code !== 200) {
		res = await request('https://gpti.projectsrpp.repl.co/api/gpti', {
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				prompt: prompt.slice(-20000),
				model: model || 'gpt-4-32k',
				type: 'json'
			},
			method: 'POST'
		});
	}

	return body.gpt;
}

module.exports = {
	generate
};
