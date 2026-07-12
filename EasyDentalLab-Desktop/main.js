const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { autoUpdater } = require('electron-updater');

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

// IPC: Flush complete (called by renderer after data is flushed)
ipcMain.handle('flush-complete', () => {
  // Renderer has completed the flush, safe to quit
  return { success: true };
});

// IPC: Scan for conflicted copies (Dropbox conflict detection)
ipcMain.handle('scan-for-conflicts', async () => {
  if (!backupFolderPath) return { conflicts: [] };
  try {
    const files = await fs.readdir(backupFolderPath);
    const conflicts = files.filter(f =>
      f.includes('conflicted copy') && f.includes('EasyDentalLab')
    );
    return { success: true, conflicts };
  } catch (error) {
    return { success: false, conflicts: [], error: error.message };
  }
});

// IPC: Get file timestamp (returns mtime of a file in backup folder)
ipcMain.handle('get-file-timestamp', async (event, filename) => {
  if (!backupFolderPath) return { success: false, error: 'No folder selected' };

  const filePath = path.join(backupFolderPath, filename);

  try {
    const stats = await fs.stat(filePath);
    return { success: true, timestamp: stats.mtimeMs };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: Pick restore file (for first-run restore wizard)
ipcMain.handle('pick-restore-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    title: 'Select Backup File to Restore',
    filters: [
      { name: 'JSON Backup', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) return { success: false };

  const filePath = result.filePaths[0];

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ── Auto-Updater Setup ──────────────────────────────────────────────────────

function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.autoDownload = true;     // Download silently in background
  autoUpdater.autoInstallOnAppQuit = true; // Install when user quits naturally

  // Enable logging
  autoUpdater.logger = console;
  autoUpdater.logger.transports.file.level = 'info';

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (process.platform === 'darwin') {
      // macOS unsigned — notify + open download URL (can't auto-install without code signing)
      mainWindow.webContents.send('update-available-manual', {
        version: info.version,
        downloadUrl: `https://github.com/sarelroeloffze/EasyDentalLab/releases/tag/v${info.version}`
      });
    } else {
      // Windows/Linux — proceed with auto-download
      mainWindow.webContents.send('update-available', info);
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available. Current version is the latest.');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download progress: ${Math.round(progressObj.percent)}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    // Notify renderer: update ready to install
    mainWindow.webContents.send('update-downloaded', info);
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-update error:', err);
    // Show error to user if update check fails
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', { message: err.message });
    }
  });

  // Check on startup (after a short delay so UI loads first)
  setTimeout(() => {
    try {
      const log = (msg, data) => {
        console.log(msg, data || '');
        if (global.sendLogToRenderer) global.sendLogToRenderer(msg, data);
      };

      log('🔔 setTimeout fired - starting update check...');

      // Notify renderer that update check is starting
      if (mainWindow && !mainWindow.isDestroyed()) {
        log('🔔 Sending update-check-started event to renderer');
        mainWindow.webContents.send('update-check-started');
      } else {
        log('🔔 ERROR: mainWindow is null or destroyed!');
        return;
      }

      log('🔔 Calling autoUpdater.checkForUpdates()...');
      autoUpdater.checkForUpdates()
        .then(result => {
          log('🔔 Update check result:', result);
          // Notify renderer of result
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-check-complete', {
              updateAvailable: result ? result.updateInfo !== null : false
            });
          }
        })
        .catch(err => {
          log('🔔 Update check failed:', err.message);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update-check-failed', { error: err.message });
          }
        });
    } catch (error) {
      console.error('🔔 FATAL ERROR in setTimeout callback:', error);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-check-failed', { error: error.message });
      }
    }
  }, 5000); // 5 second delay
}

// IPC: Install update (called by renderer when user clicks "Restart Now")
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

// IPC: Manual update check (for debugging)
ipcMain.handle('check-for-updates', async () => {
  try {
    console.log('Manual update check triggered from renderer');
    const result = await autoUpdater.checkForUpdates();
    console.log('Manual update check result:', result);
    // Extract only serializable data
    return {
      success: true,
      updateAvailable: result ? result.updateInfo !== null : false,
      version: result?.updateInfo?.version || 'unknown'
    };
  } catch (error) {
    console.error('Manual update check error:', error);
    return { success: false, error: error.message };
  }
});

// IPC: Open external URL (WhatsApp, email, download links)
ipcMain.handle('open-external', async (event, url) => {
  // Validate URL before opening (security: only allow https, mailto, and wa.me)
  if (/^(https?:\/\/|mailto:)/.test(url)) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Blocked: invalid URL scheme' };
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
  // setupAutoUpdater() now called from did-finish-load event
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

  // Send test IPC message when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded - sending test IPC message');
    mainWindow.webContents.send('main-process-ready', {
      message: 'Main process is alive and IPC is working!',
      pid: process.pid
    });

    // Helper function to relay main process logs to renderer
    global.sendLogToRenderer = (message, data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('main-process-log', { message, data });
      }
    };

    // Start auto-updater AFTER page loads (so log relay is ready)
    console.log('Starting auto-updater setup...');
    mainWindow.webContents.send('main-process-log', {
      message: '🔧 Starting setupAutoUpdater() now...',
      data: ''
    });
    setupAutoUpdater();
  });

  // Open DevTools in development (disabled for production)
  // mainWindow.webContents.openDevTools();
}

let isQuitting = false;

app.on('before-quit', async (event) => {
  if (isQuitting) return; // Prevent re-entry
  event.preventDefault();
  isQuitting = true;

  // Tell renderer to flush data immediately
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      await mainWindow.webContents.executeJavaScript('window._flushDataNow && window._flushDataNow()');
      // Wait up to 2 seconds for flush to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (e) {
    console.error('Flush error:', e);
  }

  app.quit();
});

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
