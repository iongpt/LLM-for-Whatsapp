require('dotenv').config();
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require('path');


const { shell } = require('electron');

global.commons = require('./js/commons');


global._ = function (text) {
    return text;
}

const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
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
    console.log("Adding message to contact: ", contactId, " with role: ", role, " and content: ", content);
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
    if (!contact || !Array.isArray(contact.messages)) {
        // Check if contact or contact.messages is not defined
        throw new Error("Invalid contact or contact.messages");
    }

    console.log("Trimming messages for contact: ", contact.id, " with messages: ", contact.messages);

    let totalChars = contact.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    let systemMessageIndex = contact.messages.findIndex(m => m.role === 'system');

    while (totalChars > 4000 && contact.messages.length > 1) {
        if (systemMessageIndex === 0) {
            // Skip the first message if it's the system message
            contact.messages.splice(1, 1);
        } else {
            contact.messages.shift();
            // Update systemMessageIndex if the first message is removed
            if (systemMessageIndex !== -1) {
                systemMessageIndex--;
            }
        }
        totalChars = contact.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    }

    // If the system message exists and is not at the first position, move it to the start
    if (systemMessageIndex > 0) {
        let systemMessage = contact.messages[systemMessageIndex];
        contact.messages.splice(systemMessageIndex, 1); // Remove the system message from its current position
        contact.messages.unshift(systemMessage); // Add the system message to the beginning
    }
}

function keepWithingContextLength(messages) {
    if (!Array.isArray(messages)) {
        // Check if messages is an array
        throw new Error("Invalid messages array");
    }

    // Initialize totalChars and ensure each message has a 'content' property
    let totalChars = messages.reduce((sum, msg) => {
        if (!msg || typeof msg.content !== 'string') {
            // Check if msg is defined and msg.content is a string
            throw new Error("Invalid message or message content");
        }
        return sum + msg.content.length;
    }, 0);

    let systemMessageIndex = messages.findIndex(m => m && m.role === 'system');

    while (totalChars > 4000 && messages.length > 1) {
        if (systemMessageIndex === 0) {
            // Skip the first message if it's the system message
            messages.splice(1, 1);
        } else {
            messages.shift();
            // Update systemMessageIndex if the first message is removed
            if (systemMessageIndex !== -1) {
                systemMessageIndex--;
            }
        }
        // Recalculate totalChars with the same checks
        totalChars = messages.reduce((sum, msg) => {
            if (!msg || typeof msg.content !== 'string') {
                throw new Error("Invalid message or message content");
            }
            return sum + msg.content.length;
        }, 0);
    }

    // If the system message exists and is not at the first position, move it to the start
    if (systemMessageIndex > 0) {
        let systemMessage = messages[systemMessageIndex];
        messages.splice(systemMessageIndex, 1); // Remove the system message from its current position
        messages.unshift(systemMessage); // Add the system message to the beginning
    }

    return messages;
}





app.on('ready', () => {
    globalShortcut.register('CommandOrControl+V', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            focusedWindow.webContents.paste();
        }
    });
    createWindow();
});

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
    // console.log("message: ", message)
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
        // console.log("We are going to send message: ", response, " to contact: ", contact);
        contact.messages = keepWithingContextLength(contact.messages);
        // console.log("Contact message history is: ", contact.messages);
        sendWhatsAppMessage(contact.id, response);
        sendUpdatedContactsToRenderer();
    }
});

ipcMain.on('start-conversation', async (event, data) => {
    const { contactId, initialMessage } = data;
    const contact = fullContacts.find(c => c.id === contactId);

    let response = null
    if (contact.messages.length === 0 || contact.messages[contact.messages.length - 1].role !== 'user') {
        response = initialMessage || 'Hello';
    } else {
        console.log("Conversation already started with:", contact);
        response = await getLLMMessage(contact.messages);
    }
    addMessageToContact(contactId, 'assistant', response);
    console.log("Sending message:", response, "to contact:", contact.id);
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



