const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
  clearBackupFolder: () => ipcRenderer.invoke('clear-backup-folder'),
  writeBackupFile: (filename, content) => ipcRenderer.invoke('write-backup-file', filename, content),
  readBackupFile: (filename) => ipcRenderer.invoke('read-backup-file', filename),
  writeSubfolderFile: (subfolderName, filename, content) => ipcRenderer.invoke('write-subfolder-file', subfolderName, filename, content),
  getBackupFolder: () => ipcRenderer.invoke('get-backup-folder'),
  flushComplete: () => ipcRenderer.invoke('flush-complete'),
  scanForConflicts: () => ipcRenderer.invoke('scan-for-conflicts'),
  getFileTimestamp: (filename) => ipcRenderer.invoke('get-file-timestamp', filename),
  pickRestoreFile: () => ipcRenderer.invoke('pick-restore-file'),
  // Auto-updater
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (e, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (e, info) => callback(info)),
  onUpdateAvailableManual: (callback) => ipcRenderer.on('update-available-manual', (e, info) => callback(info)),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (e, error) => callback(error)),
  installUpdate: () => ipcRenderer.send('install-update'),
  // External URL opener
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  platform: process.platform // 'win32', 'darwin', 'linux'
});
