const fs = require('fs');
const path = require('path');

const settingsForm = document.getElementById('settings-form');
const saveButton = document.getElementById('save-settings');
const settingsFilePath = path.join(__dirname, 'settings.json');

// Load settings when the page loads
window.onload = () => {
    if (fs.existsSync(settingsFilePath)) {
        let settings = JSON.parse(fs.readFileSync(settingsFilePath));
        document.getElementById('system-prompt').value = settings.systemPrompt || '';
        document.getElementById('openai-key').value = settings.openaiKey || '';
        document.getElementById('openai-api-endpoint').value = settings.openaiApiEndpoint || '';
    }
};

// Save settings
saveButton.addEventListener('click', () => {
    let settings = {
        systemPrompt: document.getElementById('system-prompt').value,
        openaiKey: document.getElementById('openai-key').value,
        openaiApiEndpoint: document.getElementById('openai-api-endpoint').value
    };

    fs.writeFileSync(settingsFilePath, JSON.stringify(settings));
    alert('Settings saved!');
});
