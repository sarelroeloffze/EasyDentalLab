const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
  clearBackupFolder: () => ipcRenderer.invoke('clear-backup-folder'),
  writeBackupFile: (filename, content) => ipcRenderer.invoke('write-backup-file', filename, content),
  readBackupFile: (filename) => ipcRenderer.invoke('read-backup-file', filename),
  writeSubfolderFile: (subfolderName, filename, content) => ipcRenderer.invoke('write-subfolder-file', subfolderName, filename, content),
  getBackupFolder: () => ipcRenderer.invoke('get-backup-folder'),
  platform: process.platform // 'win32', 'darwin', 'linux'
});
