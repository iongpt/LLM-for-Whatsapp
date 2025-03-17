// Fix settings script
const { app } = require('electron');
const Store = require('electron-store');

// Run this after app is ready
app.whenReady().then(() => {
  console.log('Updating settings properties...');
  
  const settingsStore = new Store({ name: 'settings' });
  const currentSettings = settingsStore.store;
  
  // Force debug mode to be off
  console.log('Setting debugMode to false');
  currentSettings.debugMode = false;
  
  // Add delay settings if they don't exist
  if (currentSettings.replyDelay === undefined) {
    console.log('Adding replyDelay setting');
    currentSettings.replyDelay = 'instant';
  }
  
  if (currentSettings.fixedDelaySeconds === undefined) {
    console.log('Adding fixedDelaySeconds setting');
    currentSettings.fixedDelaySeconds = 3;
  }
  
  if (currentSettings.minDelaySeconds === undefined) {
    console.log('Adding minDelaySeconds setting');
    currentSettings.minDelaySeconds = 2;
  }
  
  if (currentSettings.maxDelaySeconds === undefined) {
    console.log('Adding maxDelaySeconds setting');
    currentSettings.maxDelaySeconds = 10;
  }
  
  // Save updated settings
  settingsStore.store = currentSettings;
  
  console.log('Settings updated successfully');
  console.log(JSON.stringify(currentSettings, null, 2));
  
  // Exit the app
  app.quit();
});