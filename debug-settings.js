// Debug script to check what settings are being loaded
const { app, BrowserWindow } = require('electron');
const Store = require('electron-store');
const path = require('path');

// Create a window to capture console logs
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  win.loadFile('debug.html');
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  
  // Create debug.html
  const fs = require('fs');
  fs.writeFileSync(path.join(__dirname, 'debug.html'), `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Settings Debug</title>
  </head>
  <body>
    <h1>Settings Debug</h1>
    <div id="output"></div>
    <script>
      document.getElementById('output').innerText = 'Loading settings...';
    </script>
  </body>
  </html>
  `);
  
  // Check settings
  const settingsStore = new Store({ name: 'settings' });
  const settings = settingsStore.store;
  
  win.webContents.executeJavaScript(`
    const output = document.getElementById('output');
    output.innerHTML = '<pre>' + JSON.stringify(${JSON.stringify(settings)}, null, 2) + '</pre>';
  `);
  
  console.log('Settings loaded:', settings);
});