const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');

let mainWindow;
let backupFolderPath = null; // Stores selected folder path

// IPC: Select backup folder
ipcMain.handle('select-backup-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Backup Folder'
  });

  if (result.canceled) return { success: false };

  backupFolderPath = result.filePaths[0];

  // Save folder path to config file for persistence
  const configPath = path.join(app.getPath('userData'), 'backup-config.json');
  await fs.writeFile(configPath, JSON.stringify({ backupFolderPath }));

  return { success: true, path: backupFolderPath };
});

// IPC: Clear backup folder
ipcMain.handle('clear-backup-folder', async () => {
  backupFolderPath = null;
  const configPath = path.join(app.getPath('userData'), 'backup-config.json');
  try {
    await fs.unlink(configPath);
  } catch {}
  return { success: true };
});

// IPC: Write backup file
ipcMain.handle('write-backup-file', async (event, filename, content) => {
  if (!backupFolderPath) return { success: false, error: 'No folder selected' };

  const filePath = path.join(backupFolderPath, filename);

  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: Read file (for MedicalAids.csv)
ipcMain.handle('read-backup-file', async (event, filename) => {
  if (!backupFolderPath) return { success: false, error: 'No folder selected' };

  const filePath = path.join(backupFolderPath, filename);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: Write subfolder file (for Direct Claiming PDFs - writes to subfolder)
ipcMain.handle('write-subfolder-file', async (event, subfolderName, filename, content) => {
  if (!backupFolderPath) return { success: false, error: 'No folder selected' };

  const subfolderPath = path.join(backupFolderPath, subfolderName);

  try {
    // Create subfolder if it doesn't exist
    await fs.mkdir(subfolderPath, { recursive: true });

    // Write file to subfolder
    const filePath = path.join(subfolderPath, filename);

    // Convert base64 to buffer if content is a data URL
    let fileContent = content;
    if (typeof content === 'string' && content.startsWith('data:')) {
      const base64Data = content.split(',')[1];
      fileContent = Buffer.from(base64Data, 'base64');
    }

    await fs.writeFile(filePath, fileContent);
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: Get backup folder path
ipcMain.handle('get-backup-folder', () => {
  return backupFolderPath ? { success: true, path: backupFolderPath } : { success: false };
});

// On app start: restore saved backup folder path
app.on('ready', async () => {
  const configPath = path.join(app.getPath('userData'), 'backup-config.json');
  try {
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    backupFolderPath = config.backupFolderPath;
  } catch {
    // No saved config or error reading - that's OK
  }

  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'resources/icon.png')
  });

  mainWindow.loadFile('renderer/index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
