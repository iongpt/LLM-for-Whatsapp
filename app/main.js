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
global.mainWindow = null;

const { ipcMain } = require('electron');



function createWindow() {
    global.mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: __dirname + 'assets/icon/icon.png'
    });

    global.mainWindow.loadFile('html/main.html');

    const menu = Menu.buildFromTemplate(menuTemplate);

    Menu.setApplicationMenu(menu);

    client.initialize();

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


client.on("ready", async () => {
    console.log("Client is ready!");
    global.mainWindow.webContents.send('whatsapp-ready');
    var contacts = await client.getContacts();

    var fullContacts = [];

    for (const contact of contacts) {
        const fullcontact = await client.getContactById(contact.id._serialized);
        fullContacts.push({
            number: fullcontact.number,
            name: fullcontact.name,
            shortName: fullcontact.shortName,
            pushName: fullcontact.pushName,
            type: fullcontact.isGroup ? 'Group' : 'User',
            category: fullcontact.isBusiness || fullcontact.isEnterprise ? 'Business' : 'Private',
            recent_messages: []
        });
    }


    global.mainWindow.webContents.send('contacts-data', fullContacts);

});

client.on("message", async (message) => {
    var msg = message;
    console.log("message: ", message)
    var type = message.type
    if(type !== 'chat') {
        return true
    }
    var number = message.from.split('@')[0]
    var name = message._data.notifyName
    var body = message.body

});

