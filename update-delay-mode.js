// Script to change delay mode
const fs = require('fs');
const path = require('path');
const os = require('os');

const settingsPath = path.join(os.homedir(), 'Library', 'Application Support', 'whatsapp-llm-assistant', 'settings.json');

console.log(`Updating settings file at: ${settingsPath}`);

try {
  // Read current settings
  const data = fs.readFileSync(settingsPath, 'utf8');
  const settings = JSON.parse(data);
  
  // Change reply delay mode
  settings.replyDelay = 'fixed';
  
  // Write updated settings
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log('Settings updated successfully. Reply delay mode changed to: fixed');
} catch (error) {
  console.error('Error updating settings:', error);
}
