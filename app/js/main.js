const { ipcRenderer } = require('electron');

ipcRenderer.on('whatsapp-ready', () => {
    console.log('whatsapp-ready');
    document.getElementById('waiting-message').style.display = 'none';
    document.getElementById('start-conversation').style.display = 'block';
});

ipcRenderer.on('contacts-data', (event, contacts) => {
    console.log('contacts-data');
    let tableHTML = '<tr><th>Number</th><th>Name</th><th>Short Name</th><th>Push Name</th><th>Type</th><th>Category</th><th>Recent Messages</th></tr>';

    contacts.forEach(contact => {
        tableHTML += `<tr>
            <td>${contact.number}</td>
            <td>${contact.name}</td>
            <td>${contact.shortName}</td>
            <td>${contact.pushName}</td>
            <td>${contact.type}</td>
            <td>${contact.category}</td>
            <td></td>
        </tr>`;
    });
    document.getElementById('start-conversation').style.display = 'none';
    document.getElementById('contacts-table').innerHTML = tableHTML;
});

