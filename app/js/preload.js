// preload.js
const { contextBridge } = require('electron');
const commons = require('./commons');

contextBridge.exposeInMainWorld('commons', commons);
