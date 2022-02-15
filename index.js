const fs = require("fs");
const { Client, Intents } = require('discord.js');

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
    console.log(`Logged in as ${client.user.tag}`);
});

var loc = args[0] != undefined ? args[0] : "logins.txt";
var available = [];
var reserved = [];

available = loadLogins(loc);
console.log(`Loaded ${available.length} accounts`);
client.login(process.env.TOKEN);
