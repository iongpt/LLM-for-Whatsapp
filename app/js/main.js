var DataTable = require('datatables.net');
require('datatables.net-responsive');
const path = require('path');


const {ipcRenderer} = require('electron');
const fs = require("fs");

let fullContacts = [];
let llmContacts = [];

ipcRenderer.send('check-contacts-on-refresh');

ipcRenderer.on('whatsapp-ready', () => {
    console.log('whatsapp-ready');
    document.getElementById('waiting-message').style.display = 'none';
    document.getElementById('start-conversation').style.display = 'block';
});


ipcRenderer.on('contacts-data', (event, contacts) => {
    console.log('contacts-data');
    fullContacts = contacts.fullContacts;
    llmContacts = contacts.llmContacts;
    document.getElementById('start-conversation').style.display = 'none';
    document.getElementById('waiting-message').style.display = 'none';


    var tableHTML = '<thead>' +
        '<tr><th>ID</th><th>Number</th><th>Name</th><th>Type</th><th>Category</th><th>Recent Messages</th><th>Action</th></tr>' +
        '</thead>' +
        '<tbody>';

    fullContacts.forEach(contact => {
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


function updateFullContactsInMain() {
    ipcRenderer.send('update-full-contacts', fullContacts);
}

function updateLLMContactsInMain() {
    ipcRenderer.send('update-llm-contacts', llmContacts);
}

function startConversation(contactId, initialMessage) {
    ipcRenderer.send('start-conversation', { contactId, initialMessage });
}



function addSystemMessageToContact(contactId) {
    const settingsFilePath = path.join(__dirname, '..', 'settings.json');
    if (!fs.existsSync(settingsFilePath)) {

        const settings = JSON.parse(fs.readFileSync(settingsFilePath));
        const systemMessage = settings.systemPrompt;

        const contact = fullContacts.find(c => c.id === contactId);
        if (contact) {
            contact.messages = [{role: "system", content: systemMessage}];
        }
    }
}

function addToLLMList(contactId) {
    console.log("Starting LLM chat with contact: ", contactId);
    let settings;
    try {
       settings =  readSettings();
    } catch (e) {
        console.log(e);
        alert('Please configure LLM using LLM Settings menu first.');
        return;
    }
    const contact = fullContacts.find(c => c.id === contactId);
    console.log("We have contact: ", contact.id, "Fixing system message");

    if (contact.messages.length === 0 || contact.messages[0].role !== "system") {
        contact.messages.unshift({ role: "system", content: settings.systemPrompt });
    }

    if (llmContacts.includes(contactId)) {
        const index = llmContacts.indexOf(contactId);
        if (index > -1) {
            llmContacts.splice(index, 1);
        }
    }
    console.log("Conditions: ", contact && !llmContacts.includes(contactId));
    if (contact && !llmContacts.includes(contactId)) {

        llmContacts.push(contactId);
        console.log(`Contact ${contactId} added to LLM list.`);

        addSystemMessageToContact(contact.id);
        var el = "<button onClick=\"removeFromLLLMList('" + contact.id + "')\">Stop LLM Chat</button>";
        document.getElementById(`button_${contactId}`).innerHTML = el;
        updateFullContactsInMain();
        updateLLMContactsInMain();


        // We are allowing to set the first message if this is the start of the conversation
        document.getElementById('customPrompt').style.display = 'block';

        document.getElementById('submitMessage').onclick = function() {
            const initialMessage = document.getElementById('initialMessage').value;
            startConversation(contactId, initialMessage);
            document.getElementById('customPrompt').style.display = 'none';
        };

        // saveLLMContacts(); // This is dangerous, I played this with some real contacts and I do not want to forget to disable it, so no persistence for now.
    }
}


function removeFromLLLMList(contactId) {
    const index = llmContacts.indexOf(contactId);
    if (index > -1) {
        llmContacts.splice(index, 1);
        console.log(`Contact ${contactId} removed from LLM list.`);
        var el = "<button onclick=\"addToLLMList('" + contactId + "')\">Start LLM Chat</button>";
        document.getElementById(`button_${contactId}`).innerHTML = el;

        updateLLMContactsInMain();
        // saveLLMContacts(); // No persistence for now. Maybe later add this as an option.
    }
}

ipcRenderer.on('contacts-update', (event, data) => {
    console.log('contacts-update');
    fullContacts = data.fullContacts;
    llmContacts = data.llmContacts;
});





