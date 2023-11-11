var start = new Date();
const { REST, SlashCommandBuilder, Routes, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const config = require("./config.json");
const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with ping'),
	new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing music')
		.setDMPermission(false),
	new SlashCommandBuilder()
		.setName('lyric')
		.setDescription('Get song lyric'),
	new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music')
		.setDMPermission(false)
		.addStringOption(option =>
			option.setName('query')
				.setAutocomplete(true)
				.setDescription('Keyword or URL of YouTube'))
		.addBooleanOption(option =>
			option.setName('autoreplay')
				.setDescription('Auto Replay')),
	new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause playing music')
		.setDMPermission(false),
	new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause playing music')
		.setDMPermission(false),
	new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Configure queue playlist')
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand.setName('display')
				.setDescription("Display your guild's queue"))
		.addSubcommand(subcommand =>
			subcommand.setName('shuffle')
				.setDescription("Shuffle your queue"))
		.addSubcommand(subcommand =>
			subcommand.setName('delete')
				.setDescription('Delete music from the queue')
				.addStringOption(option =>
					option.setName('query')
						.setDescription('Query')
						.setRequired(true)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('clear')
				.setDescription('Remove all music from the playlist'))
		.addSubcommand(subcommand =>
			subcommand.setName("save")
				.setDescription("Save current queue"))
		.addSubcommand(subcommand =>
			subcommand.setName("load")
				.setDescription("Load queue ID")
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('Queue ID')
						.setRequired(true))),
	new SlashCommandBuilder()
		.setName('playlist')
		.setDescription('Public queue')
		.addSubcommand(subcommand =>
			subcommand.setName("save")
				.setDescription("Save current queue"))
		.addSubcommand(subcommand =>
			subcommand.setName("load")
				.setDescription("Load queue from ID")
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('Queue ID')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Remove online queue that you created')
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('Queue ID')
						.setRequired(true))),
	new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip playing music'),
	new SlashCommandBuilder()
		.setName('back')
		.setDescription('Back playing music'),
	new SlashCommandBuilder()
		.setName('config')
		.setDescription('General Config')
		.addSubcommand(subcommand =>
			subcommand.setName('autoreplay')
				.setDescription(`Enable or disable your guild's auto-replay`)
				.addBooleanOption(option =>
					option.setName('autoreplay')
						.setDescription(`Enable or disable your guild's auto-replay`)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('autoplay')
				.setDescription(`Enable or disable your guild's auto-play`)
				.addBooleanOption(option =>
					option.setName('autoplay')
						.setDescription(`Enable or disable your guild's auto-play`)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('searchengine')
				.setDescription(`Change your guild's default search enginge.`)
				.addBooleanOption(option =>
					option.setName('bool')
						.setDescription(`Enable or disable your guild's use ytm`)
						.setRequired(true))),
	new SlashCommandBuilder()
		.setName('radio')
		.setDescription('Play Radio')
		.addSubcommand(subcommand =>
			subcommand.setName('play')
				.setDescription('Play Radio')
				.addStringOption(option =>
					option.setName('query')
						.setDescription('Radio Query')
						.setRequired(true)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('stop')
				.setDescription('Stop Radio')),
	new SlashCommandBuilder()
		.setName('seek')
		.setDescription('Seek currently playing audio resource')
		.addStringOption(option =>
			option.setName('seek')
				.setDescription('Seek position ex. 2h11s')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get help about this bot'),
	new SlashCommandBuilder()
		.setName('skipto')
		.setDescription('Skip to the any point in the queue.')
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('Target position 1 ~ queue size')
				.setRequired(true)),
	new SlashCommandBuilder()
		.setName('filter')
		.setDescription('Set filter'),
	new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Configure GPT')
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Set GPTs on this channel')
		)
].map(command => command.toJSON());
const rest = new REST({ version: '10' }).setToken(config.bot.token);
const reset = [];
rest.put(Routes.applicationCommands(config.bot.applicationId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands with ${(new Date() - start) / 1000}s`))
	.catch(console.error);