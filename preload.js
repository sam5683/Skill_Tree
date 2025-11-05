// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Secure API bridge
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    const validSendChannels = ['redirect-to-tree', 'load-main-page'];
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, func) => {
    const validReceiveChannels = ['redirect-error'];
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});