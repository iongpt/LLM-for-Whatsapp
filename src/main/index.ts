import { app, BrowserWindow, ipcMain, shell, Menu, Tray } from 'electron';
import * as path from 'path';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import { initWhatsApp } from './whatsapp';
import { configureLLM } from './llm';

// Define channel constants directly
const IPCChannels = {
  WHATSAPP_QR: 'whatsapp-qr',
  WHATSAPP_READY: 'whatsapp-ready',
  WHATSAPP_AUTH_FAILURE: 'whatsapp-auth-failure',
  WHATSAPP_DISCONNECTED: 'whatsapp-disconnected',
  WHATSAPP_MESSAGE: 'whatsapp-message',
  CHAT_LIST_UPDATE: 'chat-list-update',
  CHAT_HISTORY: 'chat-history',
  TOGGLE_AUTO_REPLY: 'toggle-auto-reply',
  SEND_MESSAGE: 'send-message',
  APP_SETTINGS_GET: 'app-settings-get',
  APP_SETTINGS_SET: 'app-settings-set',
  LLM_SETTINGS_GET: 'llm-settings-get',
  LLM_SETTINGS_SET: 'llm-settings-set',
  LLM_TEST: 'llm-test'
};

// Types definitions
interface AppSettings {
  startMinimized: boolean;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  autoReplyToAll: boolean;
  debugMode: boolean;
  mediaDownloadPath: string;
  startupOnBoot: boolean;
}

interface LLMSettings {
  provider: 'openai' | 'local' | 'custom';
  model: string;
  temperature: number;
  systemPrompt: string;
  maxHistoryLength: number;
  apiKey?: string;
  apiEndpoint?: string;
}

// Default settings
const defaultAppSettings: AppSettings = {
  startMinimized: false,
  enableNotifications: true,
  theme: 'system',
  autoReplyToAll: false,
  debugMode: false,
  mediaDownloadPath: path.join(app.getPath('downloads'), 'WhatsAppMedia'),
  startupOnBoot: false
};

const defaultLLMSettings: LLMSettings = {
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  systemPrompt: 'You are a helpful WhatsApp assistant. Keep responses concise, friendly, and informative.',
  maxHistoryLength: 10
};

// Initialize stores
const settingsStore = new Store<AppSettings>({ 
  name: 'settings',
  defaults: defaultAppSettings
});

const llmStore = new Store<LLMSettings>({ 
  name: 'llm-settings',
  defaults: defaultLLMSettings
});

// Global references
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,  // Enable context isolation for preload to work
      preload: path.join(__dirname, 'preload.js'),
      devTools: false // Always enable DevTools
    },
    icon: path.join(__dirname, '../../assets/icon/icon.png'),
    show: !settingsStore.store.startMinimized
  });

  // Load the renderer
  // Always open DevTools to debug
  mainWindow.webContents.openDevTools();
  
  try {
    console.log('Loading renderer from file path:', path.join(__dirname, '../renderer/index.html'));
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    console.log('Renderer loaded successfully');
  } catch (error) {
    console.error('Error loading renderer:', error);
  }

  // Initialize WhatsApp client
  initWhatsApp(mainWindow);
  
  // Initialize LLM service
  configureLLM(llmStore.store);

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create tray icon - disabled for now
  // createTray();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Check for updates
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/icon/tray-icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow?.show() },
    { label: 'Toggle Auto-Reply', type: 'checkbox', checked: settingsStore.store.autoReplyToAll, 
      click: (menuItem) => {
        settingsStore.store = { ...settingsStore.store, autoReplyToAll: menuItem.checked };
        mainWindow?.webContents.send('settings-updated', settingsStore.store);
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  
  tray.setToolTip('WhatsApp LLM Assistant');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });
}

// App lifecycle events
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for settings
ipcMain.handle(IPCChannels.APP_SETTINGS_GET, () => {
  return settingsStore.store;
});

ipcMain.handle(IPCChannels.APP_SETTINGS_SET, (_, settings: Partial<AppSettings>) => {
  const updatedSettings = { ...settingsStore.store, ...settings };
  settingsStore.store = updatedSettings;
  return updatedSettings;
});

ipcMain.handle(IPCChannels.LLM_SETTINGS_GET, () => {
  return llmStore.store;
});

ipcMain.handle(IPCChannels.LLM_SETTINGS_SET, (_, settings: Partial<LLMSettings>) => {
  const currentSettings = llmStore.store;
  const newSettings = { ...currentSettings, ...settings };
  llmStore.store = newSettings;
  configureLLM(newSettings);
  return newSettings;
});

// Note: These handlers are now registered in whatsapp.ts

// Test LLM configuration
ipcMain.handle(IPCChannels.LLM_TEST, async (_, settings: LLMSettings) => {
  try {
    const { testLLMConfiguration } = require('./llm');
    return await testLLMConfiguration(settings);
  } catch (error: any) {
    return {
      success: false,
      message: `Error testing LLM configuration: ${error.message}`
    };
  }
});

// Auto updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded');
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});