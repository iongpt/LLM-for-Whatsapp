// Apply all necessary settings to make delay settings work
const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to the settings file
const settingsPath = path.join(os.homedir(), '.config', 'whatsapp-llm-assistant', 'settings.json');

console.log(`Looking for settings file at: ${settingsPath}`);

try {
  // Read the current settings
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    const data = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(data);
    console.log('Existing settings found');
  } else {
    console.log('Settings file not found, creating new settings');
  }

  // Add missing properties
  settings.replyDelay = settings.replyDelay || 'fixed';
  settings.fixedDelaySeconds = settings.fixedDelaySeconds || 3;
  settings.minDelaySeconds = settings.minDelaySeconds || 2;
  settings.maxDelaySeconds = settings.maxDelaySeconds || 10;
  settings.startMinimized = settings.startMinimized \!== undefined ? settings.startMinimized : false;
  settings.enableNotifications = settings.enableNotifications \!== undefined ? settings.enableNotifications : true;
  settings.theme = settings.theme || 'system';
  settings.autoReplyToAll = settings.autoReplyToAll \!== undefined ? settings.autoReplyToAll : false;
  settings.debugMode = settings.debugMode \!== undefined ? settings.debugMode : false;
  settings.startupOnBoot = settings.startupOnBoot \!== undefined ? settings.startupOnBoot : false;

  // Make sure the directory exists
  const settingsDir = path.dirname(settingsPath);
  if (\!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
    console.log(`Created directory: ${settingsDir}`);
  }

  // Write the updated settings
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log('Settings updated successfully:');
  console.log(JSON.stringify(settings, null, 2));
} catch (error) {
  console.error('Error updating settings:', error);
}
