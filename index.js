const fs = require("fs");
const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES] });
const args = process.argv.slice(2);

function canRelease() {
    return args.includes('-r');
}

function loadLogins(filename) {
    var buffer = fs.readFileSync(filename, { encoding: 'utf-8' });
    var entries = buffer.split('\n').map(i => parseLogin(i)).filter(j => j != null);
    return entries;
}

function parseLogin(str) {
    str = str.split(":");
    if (str.length < 5) return null;

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
    if (available.length < 1) {
        console.log(`[WARN] No VMs available!`);
        return null;
    }
    var account = available.shift();
    reserved.push(account);
    return account;
}

function releaseAccount(accountID) {
    var index = -1;
    for (var i = 0; i < reserved.length; i++) {
        if (reserved[i].id == accountID) {
            index = i;
            break;
        }
    }

    if (index != -1) {
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
    if (interaction.isCommand()) handleCommand(interaction);
    if (interaction.isButton()) handleButton(interaction);
});

async function handleCommand(interaction) {
    const { commandName } = interaction;

    if (commandName === 'vm') {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('release')
                    .setLabel('I\'m done using the VM')
                    .setStyle('DANGER'),
            );

        if (users[interaction.user.id] == undefined) {
            var details = reserveAccount();
            if (details != null) {
                users[interaction.user.id] = details.id;
                var str = `I reserved you a VM on https://vm.pwn.osucyber.club/\n`
                    + `Username: \`${details.username}\`\n`
                    + `Password: \`${details.password}\`\n`
                    + (canRelease() ? `Let me know when you're done with it!` : ``);
                var message = {
                    content: str,
                    components: canRelease() ? [row] : []
                };
                console.log(`[INFO] Assigned VM ${details.id} to client ${interaction.user.id} (${interaction.user.tag})`);
            } else {
                var message = "Sorry, all VMs are currently in use.\n";
                    + (canRelease() ? "Please try again later!" : "");
            }

        } else {
            var message = "You already have a VM!";
        }


        if (interaction.member == null) {
            // in DMs already
            interaction.reply(message);
        } else {
            // in server
            interaction.member.createDM()
                .then(channel => channel.send(message));
            interaction.reply("Check your DMs!");
        }
    }
}

async function handleButton(interaction) {
    if(!canRelease()) {
        console.log(`[WARN] Received release request from client ${interaction.user.id} (${interaction.user.tag}), but VMs are non-releasable`);
        return;
    }

    const { customId } = interaction;
    if (customId === 'release') {
        var vmID = users[interaction.user.id];
        if (vmID != undefined) {
            delete users[interaction.user.id];
            releaseAccount(vmID);
            console.log(`[INFO] Released VM ${vmID} from client ${interaction.user.id} (${interaction.user.tag})`);
            interaction.update({ content: "Thank you!", components: [] });
        } else {
            console.log(`[WARN] No VM assigned to client ${interaction.user.id} (${interaction.user.tag}), can't release`);
        }
    }
}

var loc = args[0] != undefined ? args[0] : "logins.txt";
var available = [];
var reserved = [];
var users = {};

available = loadLogins(loc);
console.log(`[INIT] Loaded ${available.length} accounts`);
client.login(token);
