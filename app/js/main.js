var DataTable = require( 'datatables.net' );
require( 'datatables.net-responsive' );
const path = require('path');


const { ipcRenderer } = require('electron');
const fs = require("fs");

let fullContacts = [];

ipcRenderer.send('check-contacts-on-refresh');

ipcRenderer.on('whatsapp-ready', () => {
    console.log('whatsapp-ready');
    document.getElementById('waiting-message').style.display = 'none';
    document.getElementById('start-conversation').style.display = 'block';
});

ipcRenderer.on('contacts-data', (event, contacts) => {
    console.log('contacts-data');
    document.getElementById('start-conversation').style.display = 'none';
    document.getElementById('waiting-message').style.display = 'none';

    fullContacts = contacts;

    var tableHTML = '<thead>' +
        '<tr><th>ID</th><th>Number</th><th>Name</th><th>Type</th><th>Category</th><th>Recent Messages</th><th>Action</th></tr>' +
        '</thead>' +
        '<tbody>';

    contacts.forEach(contact => {
        tableHTML += `<tr>
            <td>${contact.id}</td>
            <td>${contact.number}</td>
            <td>${contact.name}</td>
            <td>${contact.type}</td>
            <td>${contact.category}</td>
            <td></td>
            <td id="button_${contact.id}"><button onclick="addToLLMList('${contact.id}')">Start LLM Chat</button></td>
        </tr>`;
    });

    tableHTML += '</tbody>';

    const table = document.getElementById('contacts-table');
    table.innerHTML = tableHTML;

    new DataTable('#contacts-table', {
        responsive: true
    });

});


ipcRenderer.on('update-recent-messages', (event, data) => {
    console.log('update-recent-messages', data);
});

function readSettings() {
    const settingsFilePath = path.join(__dirname, '..', 'settings.json');
    if (fs.existsSync(settingsFilePath)) {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath));
        if (!settings.openaiKey && !settings.openaiApiEndpoint) {
            throw new Error('OpenAI key or API endpoint are required.');
        }
        console.log("settings", settings);
        return settings;
    } else {
        throw new Error('Settings file not found.');
    }
}

function addToLLMList(contactId) {
    try {
        readSettings();
    } catch (e) {
        console.log(e);
        alert('Please configure LLM using LLM Settings menu first.');
        return;
    }
    const contact = fullContacts.find(c => c.id === contactId);
    if (contact && !global.llmContacts.includes(contactId)) {
        global.llmContacts.push(contactId);
        console.log(`Contact ${contactId} added to LLM list.`);
        global.commons.addSystemMessageToContact(contact.id);
        var el = "<button onClick=\"removeFromLLLMList('${contact.id}')\">Stop LLM Chat</button>"
        document.getElementById(`button_${contactId}`).innerHTML = el;
        // saveLLMContacts(); // This is dangerous, I played this with some real contacts and I do not want to forget to disable it, so no persistence for now.
    }
}


function removeFromLLLMList(contactId) {
    const index = global.llmContacts.indexOf(contactId);
    if (index > -1) {
        global.llmContacts.splice(index, 1);
        console.log(`Contact ${contactId} removed from LLM list.`);
        var el = "<button onclick=\"addToLLMList('${contact.id}')\">Start LLM Chat</button>"
        document.getElementById(`button_${contactId}`).innerHTML = el;
        // saveLLMContacts(); // No persistence for now. Maybe later add this as an option.
    }
}



