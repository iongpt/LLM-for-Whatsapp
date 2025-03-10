/**
 * Mock for Electron components
 * 
 * This mock simulates Electron's IPC, BrowserWindow, and app components
 * for testing without requiring actual Electron runtime.
 */

const EventEmitter = require('events');

// Mock for electron.app
const mockApp = {
  getPath: jest.fn((name) => {
    const paths = {
      userData: '/mock/user/data',
      home: '/mock/home',
      appData: '/mock/app/data',
      temp: '/mock/temp',
      desktop: '/mock/desktop',
      documents: '/mock/documents',
      downloads: '/mock/downloads',
      music: '/mock/music',
      pictures: '/mock/pictures',
      videos: '/mock/videos',
      logs: '/mock/logs'
    };
    return paths[name] || '/mock/unknown';
  }),
  on: jest.fn(),
  quit: jest.fn(),
  getName: jest.fn(() => 'MockApp'),
  getVersion: jest.fn(() => '1.0.0')
};

// Mock for electron.BrowserWindow
class MockBrowserWindow extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.id = Math.floor(Math.random() * 10000);
    this.isVisible = false;
    this.isDestroyed = false;
    this.isMinimized = false;
    this.isMaximized = false;
    this.isFullScreen = false;
    
    // Create mock webContents
    this.webContents = new MockWebContents(this);
  }
  
  loadURL(url) {
    this.currentURL = url;
    process.nextTick(() => this.webContents.emit('did-finish-load'));
    return Promise.resolve();
  }
  
  loadFile(filePath) {
    this.currentFile = filePath;
    process.nextTick(() => this.webContents.emit('did-finish-load'));
    return Promise.resolve();
  }
  
  show() {
    this.isVisible = true;
    this.emit('show');
  }
  
  hide() {
    this.isVisible = false;
    this.emit('hide');
  }
  
  close() {
    this.emit('close');
    this.isDestroyed = true;
  }
  
  destroy() {
    this.isDestroyed = true;
  }
  
  minimize() {
    this.isMinimized = true;
    this.emit('minimize');
  }
  
  maximize() {
    this.isMaximized = true;
    this.emit('maximize');
  }
  
  unmaximize() {
    this.isMaximized = false;
    this.emit('unmaximize');
  }
  
  setFullScreen(flag) {
    this.isFullScreen = flag;
    this.emit(flag ? 'enter-full-screen' : 'leave-full-screen');
  }
  
  getBounds() {
    return {
      x: 0,
      y: 0,
      width: this.options.width || 800,
      height: this.options.height || 600
    };
  }
  
  setBounds(bounds) {
    this.bounds = bounds;
    this.emit('resize');
  }
  
  setTitle(title) {
    this.title = title;
  }
  
  focus() {
    this.emit('focus');
  }
}

// Mock for webContents
class MockWebContents extends EventEmitter {
  constructor(browserWindow) {
    super();
    this.browserWindow = browserWindow;
    this.zoomFactor = 1;
    this.zoomLevel = 0;
    this.sentMessages = {};
  }
  
  send(channel, ...args) {
    if (!this.sentMessages[channel]) {
      this.sentMessages[channel] = [];
    }
    this.sentMessages[channel].push(args);
    
    // Emit event for the mock renderer process
    mockIpcRenderer.emit(channel, { sender: this }, ...args);
  }
  
  openDevTools() {}
  closeDevTools() {}
  isDevToolsOpened() { return false; }
  
  print() {}
  printToPDF() { return Promise.resolve(Buffer.from('mock-pdf-data')); }
  
  getZoomFactor() { return this.zoomFactor; }
  setZoomFactor(factor) { this.zoomFactor = factor; }
  
  getZoomLevel() { return this.zoomLevel; }
  setZoomLevel(level) { this.zoomLevel = level; }
  
  insertCSS(css) { return Promise.resolve('mock-key'); }
  
  executeJavaScript(code) { 
    return Promise.resolve('mock-result');
  }
}

// Mock for ipcMain
const mockIpcMain = new EventEmitter();
mockIpcMain.handle = jest.fn((channel, listener) => {
  mockIpcMain.on(channel, async (event, ...args) => {
    try {
      const result = await listener(event, ...args);
      event.returnValue = result;
    } catch (error) {
      event.returnValue = { error: error.message };
    }
  });
});

// Mock for ipcRenderer
const mockIpcRenderer = new EventEmitter();
mockIpcRenderer.send = jest.fn((channel, ...args) => {
  const event = { sender: mockIpcRenderer };
  mockIpcMain.emit(channel, event, ...args);
});

mockIpcRenderer.invoke = jest.fn((channel, ...args) => {
  return new Promise((resolve, reject) => {
    const event = { 
      sender: mockIpcRenderer,
      returnValue: undefined
    };
    
    mockIpcMain.emit(channel, event, ...args);
    
    if (event.returnValue && event.returnValue.error) {
      reject(new Error(event.returnValue.error));
    } else {
      resolve(event.returnValue);
    }
  });
});

mockIpcRenderer.on = jest.fn((channel, listener) => {
  mockIpcRenderer.addListener(channel, listener);
});

mockIpcRenderer.once = jest.fn((channel, listener) => {
  mockIpcRenderer.addListener(channel, (...args) => {
    mockIpcRenderer.removeListener(channel, listener);
    listener(...args);
  });
});

// Mock for Menu and Tray
const mockMenu = {
  buildFromTemplate: jest.fn((template) => ({
    template,
    popup: jest.fn(),
    closePopup: jest.fn(),
    append: jest.fn(),
    insert: jest.fn(),
    getMenuItemById: jest.fn()
  })),
  setApplicationMenu: jest.fn()
};

class MockTray extends EventEmitter {
  constructor(iconPath) {
    super();
    this.iconPath = iconPath;
  }
  
  setToolTip(tooltip) {
    this.tooltip = tooltip;
  }
  
  setContextMenu(menu) {
    this.contextMenu = menu;
  }
  
  popUpContextMenu() {}
  destroy() {}
}

// Export the mocks
module.exports = {
  app: mockApp,
  BrowserWindow: MockBrowserWindow,
  ipcMain: mockIpcMain,
  ipcRenderer: mockIpcRenderer,
  Menu: mockMenu,
  Tray: MockTray,
  
  // Helper methods for tests
  _reset: () => {
    // Clear all event listeners
    mockIpcMain.removeAllListeners();
    mockIpcRenderer.removeAllListeners();
    
    // Reset mock implementations
    mockApp.getPath.mockClear();
    mockApp.on.mockClear();
    mockApp.quit.mockClear();
    
    mockIpcRenderer.send.mockClear();
    mockIpcRenderer.invoke.mockClear();
    mockIpcRenderer.on.mockClear();
    mockIpcRenderer.once.mockClear();
    
    mockIpcMain.handle.mockClear();
  }
};