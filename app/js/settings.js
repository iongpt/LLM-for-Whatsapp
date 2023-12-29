const fs = require('fs');
const path = require('path');
const settingsFilePath = path.join(__dirname, '..', 'settings.json');

const settingsForm = document.getElementById('settings-form');
const saveButton = document.getElementById('save-settings');

const { shell } = require('electron');

function readSettings() {
    if (fs.existsSync(settingsFilePath)) {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath));
        console.log("settings", settings);
        return settings;
    } else {
        throw new Error('Settings file not found.');
    }
}



// Load settings when the page loads
window.onload = () => {
    console.log("window.onload");
    var settings = readSettings();
    console.log("settings", "settings")
    document.getElementById('system-prompt').value = settings.systemPrompt || '';
    document.getElementById('openai-key').value = settings.openaiKey || '';
    document.getElementById('openai-model').value = settings.openaiModel || '';
    document.getElementById('openai-api-endpoint').value = settings.openaiApiEndpoint || '';
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

