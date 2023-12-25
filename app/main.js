require('dotenv').config();
const qrcode = require("qrcode-terminal");
const fs = require("fs");

global._ = function (text) {
    return text;
}

const { app, BrowserWindow, Menu } = require('electron');
const menuTemplate = require('./menu.js');

const { Client } = require("whatsapp-web.js");
const client = new Client({ puppeteer: { headless: false,args: ['--no-sandbox', '--disable-setuid-sandbox']} });

const { Configuration, OpenAIApi } = require("openai");

let CHAT_CONTEXT = "context/chat - " + new Date().getTime() + ".json";
let CONTACTS_FILE = "contacts.json";
let context = {};





client.on("ready", () => {
    console.log("Client is ready!");
});



function createWindow() {
    const mainWindow = new BrowserWindow({
        // Window settings...
    });

    mainWindow.loadFile('html/main.html');

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    client.on("message", async (message) => {
        var msg = message;
        // const contacts = await contactsToAutoRespond(CONTACTS_FILE);
        // const isContact = contacts.filter((contact) => {
        //     return contact === message.from.split('@')[0];
        // });
        console.log("message: ", message)
        var type = message.type
        if(type !== 'chat') {
            return true
        }
        console.log("type: ", type);
        var number = message.from.split('@')[0]
        var name = message._data.notifyName
        var body = message.body
        console.log("number: ", number);
        console.log("name: ", name);
        console.log("body: ", body);

        if (!recentContacts[number]) {
            recentContacts[number] = { name, number, messages: [] };
        }

        recentContacts[number].messages.push(body);
        if (recentContacts[number].messages.length > 5) {
            recentContacts[number].messages.shift(); // Keep only last 5 messages
        }
    });

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

client.initialize();