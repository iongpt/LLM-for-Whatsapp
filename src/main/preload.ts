const { contextBridge, ipcRenderer } = require('electron');

// Define channel constants directly here instead of importing
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

// Define the API to expose to the renderer process
contextBridge.exposeInMainWorld('api', {
  // WhatsApp related methods
  whatsapp: {
    onQRCode: (callback) => {
      ipcRenderer.on(IPCChannels.WHATSAPP_QR, (_, qrCode) => callback(qrCode));
      return () => ipcRenderer.removeAllListeners(IPCChannels.WHATSAPP_QR);
    },
    
    onReady: (callback) => {
      ipcRenderer.on(IPCChannels.WHATSAPP_READY, () => callback());
      return () => ipcRenderer.removeAllListeners(IPCChannels.WHATSAPP_READY);
    },
    
    onAuthFailure: (callback) => {
      ipcRenderer.on(IPCChannels.WHATSAPP_AUTH_FAILURE, (_, message) => callback(message));
      return () => ipcRenderer.removeAllListeners(IPCChannels.WHATSAPP_AUTH_FAILURE);
    },
    
    onDisconnected: (callback) => {
      ipcRenderer.on(IPCChannels.WHATSAPP_DISCONNECTED, (_, reason) => callback(reason));
      return () => ipcRenderer.removeAllListeners(IPCChannels.WHATSAPP_DISCONNECTED);
    },
    
    onMessage: (callback) => {
      ipcRenderer.on(IPCChannels.WHATSAPP_MESSAGE, (_, data) => callback(data));
      return () => ipcRenderer.removeAllListeners(IPCChannels.WHATSAPP_MESSAGE);
    }
  },
  
  // Chat related methods
  chats: {
    onListUpdate: (callback) => {
      ipcRenderer.on(IPCChannels.CHAT_LIST_UPDATE, (_, chats) => callback(chats));
      return () => ipcRenderer.removeAllListeners(IPCChannels.CHAT_LIST_UPDATE);
    },
    
    getHistory: async (chatId) => {
      return ipcRenderer.invoke(IPCChannels.CHAT_HISTORY, chatId);
    },
    
    toggleAutoReply: (chatId, enabled) => {
      ipcRenderer.send(IPCChannels.TOGGLE_AUTO_REPLY, chatId, enabled);
    },
    
    sendMessage: async (chatId, text) => {
      return ipcRenderer.invoke(IPCChannels.SEND_MESSAGE, chatId, text);
    },
    
    refreshChats: () => {
      ipcRenderer.send('refresh-chats');
    }
  },
  
  // Settings related methods
  settings: {
    getAppSettings: async () => {
      return ipcRenderer.invoke(IPCChannels.APP_SETTINGS_GET);
    },
    
    setAppSettings: async (settings) => {
      return ipcRenderer.invoke(IPCChannels.APP_SETTINGS_SET, settings);
    },
    
    getLLMSettings: async () => {
      return ipcRenderer.invoke(IPCChannels.LLM_SETTINGS_GET);
    },
    
    setLLMSettings: async (settings) => {
      return ipcRenderer.invoke(IPCChannels.LLM_SETTINGS_SET, settings);
    },
    
    testLLM: async (settings) => {
      return ipcRenderer.invoke(IPCChannels.LLM_TEST, settings);
    }
  },
  
  // Update related methods
  updates: {
    onUpdateAvailable: (callback) => {
      ipcRenderer.on('update-available', () => callback());
      return () => ipcRenderer.removeAllListeners('update-available');
    },
    
    onUpdateDownloaded: (callback) => {
      ipcRenderer.on('update-downloaded', () => callback());
      return () => ipcRenderer.removeAllListeners('update-downloaded');
    },
    
    installUpdate: () => {
      ipcRenderer.send('install-update');
    }
  }
});