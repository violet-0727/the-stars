const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (data) => ipcRenderer.invoke('save-project', data),
  loadProject: () => ipcRenderer.invoke('load-project'),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  onBeforeClose: (callback) => ipcRenderer.on('before-close', callback),
  confirmClose: (shouldClose) => ipcRenderer.invoke('confirm-close', shouldClose),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveScreenshot: (dirPath, fileName, content) => ipcRenderer.invoke('save-screenshot', dirPath, fileName, content),
});
