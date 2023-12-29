require('dotenv').config();
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require('path');


const { shell } = require('electron');

global.commons = require('./js/commons');


global._ = function (text) {
    return text;
}

const { app, BrowserWindow, Menu } = require('electron');
const menuTemplate = require('./menu.js');

const { Client } = require("whatsapp-web.js");
const client = new Client({ puppeteer: { headless: false,args: ['--no-sandbox', '--disable-setuid-sandbox']} });

const { Configuration, OpenAIApi } = require("openai");

global.mainWindow = null;
global.fullContacts = [];
global.llmContacts = [];


const { ipcMain } = require('electron');



function createWindow() {
    global.mainWindow = new BrowserWindow({
        width: 1800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            // preload: path.join(__dirname, 'js', 'preload.js') //hacked via global for now
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
    console.log("Client is ready! 1");
    var contacts = await client.getContacts();
    console.log("Client is ready! 2");




    for (const contact of contacts) {
        const fullcontact = await client.getContactById(contact.id._serialized);
        global.fullContacts.push({
            id: fullcontact.id._serialized,
            number: fullcontact.number,
            name: fullcontact.name,
            type: fullcontact.isGroup ? 'Group' : 'User',
            category: fullcontact.isBusiness || fullcontact.isEnterprise ? 'Business' : 'Private',
            messages: []
        });
    }

    console.log("Client is ready! 3");


    global.mainWindow.webContents.send('contacts-data', fullContacts);

    console.log("Client is ready! 4");


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

    const contactIndex = global.fullContacts.findIndex(c => c.number === number);
    const contact = global.fullContacts.find(c => c.number === number);

    if (contact && global.llmContacts.includes(contact.id)) {
        addMessageToContact(contact.id, "user", body);

    }

    if (contactIndex !== -1) {
        global.fullContacts[contactIndex].recent_messages.push(message.body);
        global.mainWindow.webContents.send('update-recent-messages', { contactId: global.fullContacts[contactIndex].id, messages: global.fullContacts[contactIndex].recent_messages });
    }


});




ipcMain.on('check-contacts-on-refresh', (event) => {
    if (global.fullContacts && global.fullContacts.length > 0) {
        global.mainWindow.webContents.send('contacts-data', fullContacts);
    }
});

