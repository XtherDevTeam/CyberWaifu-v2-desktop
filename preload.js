const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('api', {
  invoke: (ipcChannel, data) => ipcRenderer.send(ipcChannel, data)
})