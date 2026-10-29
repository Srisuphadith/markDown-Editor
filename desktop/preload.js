// Bridge between the page and the main process. The page gets exactly these functions, never Node.js itself.
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  openDialog: () => ipcRenderer.invoke('open-dialog'),
  saveDialog: suggestedName => ipcRenderer.invoke('save-dialog', suggestedName),
  readFile: path => ipcRenderer.invoke('read-file', path),
  writeFile: (path, text) => ipcRenderer.invoke('write-file', path, text),
  pathForFile: file => webUtils.getPathForFile(file),

  // Registering this also tells the main process the page is ready for files opened from the OS
  onOpenPaths(callback) {
    ipcRenderer.on('open-paths', (_e, paths) => callback(paths));
    ipcRenderer.send('renderer-ready');
  },
  onMenu(callback) {
    ipcRenderer.on('menu', (_e, command) => callback(command));
  },
  onFlush(callback) {
    ipcRenderer.on('flush', async () => {
      try { await callback(); } finally { ipcRenderer.send('flushed'); }
    });
  },
});
