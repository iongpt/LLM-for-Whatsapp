const fs = require('fs');
const path = require('path');

const settingsForm = document.getElementById('settings-form');
const saveButton = document.getElementById('save-settings');
const settingsFilePath = path.join(__dirname, 'settings.json');

const { shell } = require('electron');


// Load settings when the page loads
window.onload = () => {
    if (fs.existsSync(settingsFilePath)) {
        let settings = JSON.parse(fs.readFileSync(settingsFilePath));
        document.getElementById('system-prompt').value = settings.systemPrompt || '';
        document.getElementById('openai-key').value = settings.openaiKey || '';
        document.getElementById('openai-model').value = settings.openaiModel || '';
        document.getElementById('openai-api-endpoint').value = settings.openaiApiEndpoint || '';
    }
};

// Save settings
saveButton.addEventListener('click', () => {
    let settings = {
        systemPrompt: document.getElementById('system-prompt').value,
        openaiKey: document.getElementById('openai-key').value,
        openaiModel: document.getElementById('openai-model').value,
        openaiApiEndpoint: document.getElementById('openai-api-endpoint').value
    };

    fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
    alert('Settings saved!');
});

document.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault();
        shell.openExternal(event.target.href);
    }
});

