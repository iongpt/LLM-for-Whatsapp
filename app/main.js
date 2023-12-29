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

const { getLLMMessage } = require('./js/openai');

global.mainWindow = null;

let fullContacts = [];
let llmContacts = [];


const { ipcMain } = require('electron');



function createWindow() {
    global.mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
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

function addMessageToContact(contactId, role, content) {
    const contact = fullContacts.find(c => c.id === contactId);
    if (contact) {
        contact.messages.push({ role, content });
        trimMessages(contact);
    }
}

function sendWhatsAppMessage(contactId, message) {
    client.sendMessage(
        contactId,
        message
    );
}

function sendUpdatedContactsToRenderer() {
    if (global.mainWindow && global.mainWindow.webContents) {
        global.mainWindow.webContents.send('contacts-update', {
            fullContacts: fullContacts,
            llmContacts: llmContacts
        });
    }
}

function trimMessages(contact) {
    let totalChars = contact.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    // Always keep the system message
    let systemMessage = contact.messages.find(m => m.role === 'system');

    while (totalChars > 4000 && contact.messages.length > 1) {
        // Skip the first message if it's the system message
        if (contact.messages[0].role === 'system') {
            contact.messages.splice(1, 1);
        } else {
            contact.messages.shift();
        }
        totalChars = contact.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    }

    // Ensure the system message is always at the beginning
    if (systemMessage) {
        contact.messages = [systemMessage, ...contact.messages.filter(m => m.role !== 'system')];
    }
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

    for (const contact of contacts) {
        const fullcontact = await client.getContactById(contact.id._serialized);
        fullContacts.push({
            id: fullcontact.id._serialized,
            number: fullcontact.number,
            name: fullcontact.name,
            type: fullcontact.isGroup ? 'Group' : 'User',
            category: fullcontact.isBusiness || fullcontact.isEnterprise ? 'Business' : 'Private',
            messages: []
        });
    }
    global.mainWindow.webContents.send('contacts-data', { fullContacts, llmContacts });
});

client.on("message", async (message) => {
    console.log("message: ", message)
    var type = message.type
    if(type !== 'chat') {
        return true
    }
    var number = message.from.split('@')[0]
    var name = message._data.notifyName
    var body = message.body

    const contact = fullContacts.find(c => c.number === number);

    if (contact && llmContacts.includes(contact.id)) {
        addMessageToContact(contact.id, "user", body);
        const response = await getLLMMessage(contact.messages);
        addMessageToContact(contact.id, "assistant", response);
        console.log("We are going to send message: ", response, " to contact: ", contact);
        console.log("Contact message history is: ", contact.messages);
        sendWhatsAppMessage(contact.id, response);
        sendUpdatedContactsToRenderer();
    }
});

ipcMain.on('start-conversation', async (event, contactId) => {
    const contact = fullContacts.find(c => c.id === contactId);

    if (!contact) {
        console.log("Contact not found:", contactId);
        return;
    }

    var response = null
    if (contact.messages.length === 0 || contact.messages[contact.messages.length - 1].role !== 'user') {
        response = 'Hello';
    } else {
        console.log("Conversation already started with:", contact);
        response = await getLLMMessage(contact.messages);
    }
    addMessageToContact(contactId, 'assistant', response);
    console.log("Sending message:", response, "to contact:", contact);
    sendWhatsAppMessage(contact.id, response);
    sendUpdatedContactsToRenderer();
});



ipcMain.on('update-full-contacts', (event, updatedFullContacts) => {
    fullContacts = updatedFullContacts;
    event.reply('full-contacts-updated', fullContacts);
});

ipcMain.on('update-llm-contacts', (event, updatedLLMContacts) => {
    llmContacts = updatedLLMContacts;
    event.reply('llm-contacts-updated', llmContacts);
});


ipcMain.on('check-contacts-on-refresh', (event) => {
    if (fullContacts && fullContacts.length > 0) {
        global.mainWindow.webContents.send('contacts-data', { fullContacts, llmContacts });

    }
});



