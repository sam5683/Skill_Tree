const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetch: (url, options = {}) => fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } }).then(res => res.json().catch(() => ({ success: false, message: 'Invalid response' }))),
  post: (url, data) => fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json().catch(() => ({ success: false, message: 'Invalid response' }))),
  send: (channel, data) => {
    console.log(`Sending IPC message to channel: ${channel}, data: ${JSON.stringify(data)}`);
    ipcRenderer.send(channel, data);
  }
});