// Simple script to force debugMode to false
// Run with: node update-debug-mode.js
const Store = require('electron-store');

// Initialize store
const settingsStore = new Store({ name: 'settings' });

// Get current settings
const currentSettings = settingsStore.store;
console.log('Current settings:', currentSettings);

// Force debugMode to false
console.log('Setting debugMode to false');
currentSettings.debugMode = false;

// Save updated settings
settingsStore.store = currentSettings;

// Verify update
console.log('Updated settings:', settingsStore.store);
console.log('Done! Please restart the application.');