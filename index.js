const fs = require("fs");
const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES] });
const args = process.argv.slice(2);

function loadLogins(filename) {
    var buffer = fs.readFileSync(filename, {encoding: 'utf-8'});
    var entries = buffer.split('\n').map(i => parseLogin(i)).filter(j => j != null);
    return entries;
}

function parseLogin(str) {
    str = str.split(":");
    if(str.length < 5) return null;

    var account = {
        id: str[0],
        address: str[1],
        username: str[2],
        password: str[3],
        key: str[4]
    }
    return account;
}

function reserveAccount() {
    var account = available.shift();
    reserved.push(account);
    return account;
}

function releaseAccount(accountID) {
    var index = -1;
    for(var i = 0; i < reserved.length; i++) {
        if(reserved[i].id == accountID) {
            index = i;
            break;
        }
    }

    if(index != -1) {
        var freed = reserved.splice(index, 1);
        available.push(...freed);
        return;
    }

    console.log(`[WARN] Account with ID ${accountID} is not reserved`);
}

client.on('ready', () => {
    console.log(`[INIT] Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'vm') {
        const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('release')
					.setLabel('I\'m done using the VM')
					.setStyle('DANGER'),
			);

        if(users[interaction.user.id] == undefined) {
            var details = reserveAccount();
            users[interaction.user.id] = details.id;
            var str = `I reserved you a VM on https://vm.pwn.osucyber.club/\n`
                        + `Username: \`${details.username}\`\n`
                        + `Password: \`${details.password}\`\n`
                        + `Let me know when you're done with it!`;
            var message = {
                content: str,
                components: [row]
            };
            console.log(`[INFO] Assigned VM ${details.id} to client ${interaction.user.id} (${interaction.user.tag})`);
        } else {
            var message = "You already have a VM!";
        }
        

        if(interaction.member == null) {
            // in DMs already
            interaction.reply(message);
        } else {
            // in server
            interaction.member.createDM()
                .then(channel => channel.send(message));
                interaction.reply("Check your DMs!");
        }
	}
});

var loc = args[0] != undefined ? args[0] : "logins.txt";
var available = [];
var reserved = [];
var users = {};

available = loadLogins(loc);
console.log(`[INIT] Loaded ${available.length} accounts`);
client.login(token);
