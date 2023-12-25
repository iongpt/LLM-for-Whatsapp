var DataTable = require( 'datatables.net' );
require( 'datatables.net-responsive' );

const { ipcRenderer } = require('electron');

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
            <td><button onclick="startLLMChat('${contact.id}')">Start LLM Chat</button></td>
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


ipcRenderer.on('receive-contacts-data', (event, contacts) => {
    if (contacts && contacts.length > 0) {
        // Call the function to draw the table with contacts
        drawContactsTable(contacts);
    } else {
        // Show the waiting message
        document.getElementById('waiting-message').style.display = 'block';
        document.getElementById('start-conversation').style.display = 'none';
    }
});


function startLLMChat(contactId) {
    console.log('Start LLM chat for contact ID:', contactId);
    // Implement the function logic here.
}


