const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetch: (url, options) => fetch(url, options).then(res => res.json()),
  post: (url, data) => fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  getBasePath: () => __dirname,
  send: (channel, data) => {
    console.log(`Sending IPC message to channel: ${channel}, data: ${JSON.stringify(data)}`); // Debug
    ipcRenderer.send(channel, data);
  }
});