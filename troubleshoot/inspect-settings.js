const fs = require('fs');
const path = require('path');
const os = require('os');

// Settings file path
const settingsPath = path.join(os.homedir(), 'Library', 'Application Support', 'whatsapp-llm-assistant', 'settings.json');
console.log(`Settings file location: ${settingsPath}`);

// Read settings
if (fs.existsSync(settingsPath)) {
  const data = fs.readFileSync(settingsPath, 'utf8');
  const settings = JSON.parse(data);
  console.log('Current settings:');
  console.log(JSON.stringify(settings, null, 2));
  
  // Update settings
  settings.replyDelay = 'fixed';
  settings.fixedDelaySeconds = 5;
  settings.minDelaySeconds = 2;
  settings.maxDelaySeconds = 10;
  
  // Backup the original file
  const backupPath = `${settingsPath}.backup`;
  fs.writeFileSync(backupPath, data);
  console.log(`Backup created at: ${backupPath}`);
  
  // Write updated settings
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log('Settings updated successfully to use fixed delay mode (5 seconds)');
  console.log('Please restart the application and check if the delay settings are now visible');
} else {
  console.log('Settings file not found!');
}

// Create CSS override
const cssOverride = `
body::after {
  content: "REPLY DELAY SHOULD BE VISIBLE - CHECK SETTINGS";
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: red;
  color: white;
  padding: 10px;
  z-index: 9999;
  font-weight: bold;
}
`;

const cssPath = path.join(os.homedir(), 'Library', 'Application Support', 'whatsapp-llm-assistant', 'override.css');
fs.writeFileSync(cssPath, cssOverride);
console.log(`CSS override created at: ${cssPath}`);
console.log('Please add this CSS file to your application to make the debug message visible');