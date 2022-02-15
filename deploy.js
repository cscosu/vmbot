const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientID } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('vm').setDescription('Requests a Linux virutal machine')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
