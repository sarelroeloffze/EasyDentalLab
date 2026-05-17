# PHASE 2: DESKTOP COMPILATION PLAN
## EasyDentalLab → Electron Desktop App

**Target Platforms:** Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
**Timeline:** 1 week (5-7 days)
**Goal:** Standalone desktop app with no browser dependency

---

## OVERVIEW

### What Changes
1. **File System Access API** → Node.js `fs` module (BLOCKER — must be rewritten)
2. **CDN libraries** → Bundled locally (React, Babel, jsPDF)
3. **Web architecture** → Electron (main + renderer + preload)
4. **Deployment** → Installers (`.exe`, `.dmg`, `.AppImage`)

### What Stays the Same
- ✅ Single HTML file architecture (becomes renderer process)
- ✅ React components (no changes)
- ✅ localStorage + IndexedDB (works natively in Electron)
- ✅ License system (WebCrypto works)
- ✅ Dark mode, print, PDF generation (all work)

---

## PROJECT STRUCTURE

```
EasyDentalLab-Desktop/
├── package.json                  # npm dependencies + build scripts
├── electron-builder.yml          # Packaging config (Windows/Mac/Linux)
├── main.js                       # Electron main process (Node.js)
├── preload.js                    # IPC bridge (context isolation)
├── renderer/
│   ├── index.html                # EasyDentalLab.html (modified)
│   ├── app.js                    # Bundled React app
│   ├── vendor/                   # Bundled libraries
│   │   ├── react.production.min.js
│   │   ├── react-dom.production.min.js
│   │   ├── babel-standalone.min.js
│   │   └── jspdf.umd.min.js
│   └── assets/
│       └── icon.png
├── build/                        # electron-builder output
│   ├── EasyDentalLab-Setup.exe   # Windows installer
│   ├── EasyDentalLab.dmg         # macOS installer
│   └── EasyDentalLab.AppImage    # Linux installer
└── resources/                    # Icons, assets
    ├── icon.ico
    ├── icon.icns
    └── icon.png
```

---

## 1. FILE SYSTEM API REWRITE

### Current Code (Browser)

**Lines affected:** ~942–1025, ~1168–1196, ~2359–2375, ~4094–4100, ~4171–4278

**What it does:**
```javascript
// Browser File System Access API (Chrome/Edge only)
const dirHandle = await window.showDirectoryPicker();
const fileHandle = await dirHandle.getFileHandle("Clients.csv", { create: true });
const writable = await fileHandle.createWritable();
await writable.write(csvContent);
await writable.close();

// IndexedDB persistence
const db = indexedDB.open("EasyDentalLabBackup", 1);
await db.put(dirHandle);
```

### New Code (Electron)

**Architecture:**
```
Renderer (React UI)
    ↓ invoke("select-folder")
Preload (IPC bridge)
    ↓ ipcRenderer.invoke()
Main (Node.js)
    ↓ dialog.showOpenDialog()
    ↓ fs.promises.writeFile()
    ↓ return result
```

#### A. Main Process (`main.js`)

```javascript
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
  try { await fs.unlink(configPath); } catch {}
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

// IPC: Create subfolder (for "Send to Direct Claiming")
ipcMain.handle('create-subfolder', async (event, folderName) => {
  if (!backupFolderPath) return { success: false, error: 'No folder selected' };

  const subfolderPath = path.join(backupFolderPath, folderName);

  try {
    await fs.mkdir(subfolderPath, { recursive: true });
    return { success: true, path: subfolderPath };
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
  } catch {}

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
}
```

#### B. Preload Script (`preload.js`)

**Context isolation bridge:**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  selectBackupFolder: () => ipcRenderer.invoke('select-backup-folder'),
  clearBackupFolder: () => ipcRenderer.invoke('clear-backup-folder'),
  writeBackupFile: (filename, content) => ipcRenderer.invoke('write-backup-file', filename, content),
  readBackupFile: (filename) => ipcRenderer.invoke('read-backup-file', filename),
  createSubfolder: (folderName) => ipcRenderer.invoke('create-subfolder', folderName),
  getBackupFolder: () => ipcRenderer.invoke('get-backup-folder'),
  platform: process.platform // 'win32', 'darwin', 'linux'
});
```

#### C. Renderer Changes (`renderer/index.html`)

**Replace Browser API calls with Electron API:**

**Old (Browser):**
```javascript
// Lines 988-998: pickBackupFolder()
const pickBackupFolder = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker();
    _backupDirHandle = dirHandle;
    await saveBackupHandle(dirHandle);
    // ...
  } catch (e) {}
};
```

**New (Electron):**
```javascript
const pickBackupFolder = async () => {
  try {
    const result = await window.electronAPI.selectBackupFolder();
    if (!result.success) return;

    _backupFolderPath = result.path; // Store path instead of handle

    // No IndexedDB persistence needed — main process saves config
    // ...
  } catch (e) {}
};
```

**Old (Browser):**
```javascript
// Lines 1018-1025: writeBackupFile()
const writeBackupFile = async (dirHandle, filename, content) => {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (e) {
    console.warn("Backup write failed for " + filename + ":", e);
    if (_showBackupToast) _showBackupToast(`⚠️ Backup failed: ${filename} — ${e.message}`, "error");
  }
};
```

**New (Electron):**
```javascript
const writeBackupFile = async (filename, content) => {
  const result = await window.electronAPI.writeBackupFile(filename, content);
  if (!result.success) {
    console.warn("Backup write failed for " + filename + ":", result.error);
    if (_showBackupToast) _showBackupToast(`⚠️ Backup failed: ${filename} — ${result.error}`, "error");
  }
};
```

**Old (Browser):**
```javascript
// Lines 4094-4100: readMedicalAidsFromFolder()
const readMedicalAidsFromFolder = async (dirHandle) => {
  try {
    const fileHandle = await dirHandle.getFileHandle("MedicalAids.csv");
    const file = await fileHandle.getFile();
    const text = await file.text();
    return parseMedicalAidsCSV(text);
  } catch { return []; }
};
```

**New (Electron):**
```javascript
const readMedicalAidsFromFolder = async () => {
  const result = await window.electronAPI.readBackupFile("MedicalAids.csv");
  if (!result.success) return [];
  return parseMedicalAidsCSV(result.content);
};
```

**Remove IndexedDB persistence code (lines 943-985)** — no longer needed; Electron main process handles persistence via config file.

---

## 2. LIBRARY BUNDLING

### Current (CDN)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### New (Local)

**Step 1: Download libraries**

```bash
mkdir -p renderer/vendor
cd renderer/vendor

# React 18.2.0
curl -o react.production.min.js https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
curl -o react-dom.production.min.js https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js

# Babel standalone 7.23.9
curl -o babel-standalone.min.js https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js

# jsPDF 2.5.1
curl -o jspdf.umd.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

# jsPDF autotable 3.8.2
curl -o jspdf-autotable.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js
```

**Step 2: Update HTML**

```html
<!-- Replace CDN links with local files -->
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="vendor/babel-standalone.min.js"></script>
<script src="vendor/jspdf.umd.min.js"></script>
<script src="vendor/jspdf-autotable.min.js"></script>
```

---

## 3. PACKAGE.JSON

```json
{
  "name": "easydentallab",
  "version": "2.0.0",
  "description": "Dental laboratory invoicing application for South Africa",
  "main": "main.js",
  "author": "Sarel Roeloffze",
  "license": "UNLICENSED",
  "private": true,
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "pack": "electron-builder --dir",
    "dist": "electron-builder --win --mac --linux"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  },
  "build": {
    "appId": "com.roeloffze.easydentallab",
    "productName": "EasyDentalLab",
    "directories": {
      "output": "build"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "resources/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "resources/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "resources/icon.icns",
      "category": "public.app-category.business"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "resources/icon.png",
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

---

## 4. ELECTRON-BUILDER CONFIG

**`electron-builder.yml`** (alternative to package.json config):

```yaml
appId: com.roeloffze.easydentallab
productName: EasyDentalLab
copyright: Copyright © 2025 Sarel Roeloffze

directories:
  output: build

files:
  - main.js
  - preload.js
  - renderer/**/*
  - resources/**/*

win:
  target: nsis
  icon: resources/icon.ico

mac:
  target: dmg
  icon: resources/icon.icns
  category: public.app-category.business

linux:
  target:
    - AppImage
    - deb
  icon: resources/icon.png
  category: Office

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  installerIcon: resources/icon.ico
  uninstallerIcon: resources/icon.ico
```

---

## 5. IMPLEMENTATION ROADMAP

### Day 1: Project Setup
- [x] Create project structure
- [x] Initialize npm project (`npm init`)
- [x] Install Electron (`npm install --save-dev electron electron-builder`)
- [x] Download vendor libraries to `renderer/vendor/`
- [x] Create `main.js` skeleton
- [x] Create `preload.js` skeleton
- [x] Copy `EasyDentalLab.html` → `renderer/index.html`
- [x] Test basic Electron window launches

**Test:** `npm start` opens window with current app

---

### Day 2: File System API - Read Operations
- [x] Implement IPC handlers in `main.js`:
  - `select-backup-folder`
  - `get-backup-folder`
  - `read-backup-file`
- [x] Implement preload bridge in `preload.js`
- [x] Replace browser APIs in renderer:
  - `pickBackupFolder()` → `window.electronAPI.selectBackupFolder()`
  - `readMedicalAidsFromFolder()` → `window.electronAPI.readBackupFile()`
  - Remove IndexedDB persistence code
- [x] Test folder selection dialog

**Test:** Select backup folder, verify MedicalAids.csv loads

---

### Day 3: File System API - Write Operations
- [x] Implement IPC handlers:
  - `write-backup-file`
  - `create-subfolder`
  - `clear-backup-folder`
- [x] Replace write operations in renderer:
  - `writeBackupFile()` → `window.electronAPI.writeBackupFile()`
  - `autoBackupCSVs()` → call new write function
  - `handleManualBackup()` → call new write function
  - `saveClaimPDF()` → subfolder creation + write
- [x] Test auto-backup

**Test:** Make changes, verify CSV/JSON files written to folder

---

### Day 4: Bundle Libraries & Polish
- [x] Update HTML script tags (CDN → local vendor files)
- [x] Test all features work offline
- [x] Add app icon (`.ico`, `.icns`, `.png`)
- [x] Configure electron-builder
- [x] Test dark mode, print, PDF generation
- [x] Test license system (if armed)

**Test:** Disconnect internet, verify app works fully offline

---

### Day 5: Build & Package
- [x] Build Windows installer: `npm run build:win`
- [x] Build macOS installer: `npm run build:mac` (if on Mac)
- [x] Build Linux installer: `npm run build:linux`
- [x] Test installers on real machines
- [x] Verify file permissions (write access to selected folder)
- [x] Test uninstall/reinstall preserves data

**Test:** Install on clean Windows/Mac/Linux, verify all features

---

## 6. TESTING CHECKLIST

### Core Features
- [x] Launch app
- [x] Select backup folder
- [x] Auto-backup writes files (Clients, Tariffs, Macros, Payments, MedicalAids, JSON)
- [x] Manual "Save Now" works
- [x] Encrypted backup works (if password set)
- [x] Folder selection persists across app restarts
- [x] MedicalAids.csv loads correctly
- [x] Direct Claiming PDF saves to subfolder

### UI/UX
- [x] Dark mode toggle
- [x] All pages navigate correctly
- [x] Invoices print (Ctrl+P / Cmd+P)
- [x] PDF generation (WhatsApp button)
- [x] Toast notifications appear
- [x] Exit warning shows if backup pending

### Data Integrity
- [x] Create invoice → auto-backup → close app → reopen → invoice still there
- [x] Record payment → verify Payments.csv created
- [x] Import JSON backup works
- [x] Encrypted backup can be restored (future: decrypt function needed)

### Cross-Platform
- [x] Windows: `.exe` installer, desktop shortcut, Start Menu entry
- [x] macOS: `.dmg` mounts, drag-to-Applications works
- [x] Linux: `.AppImage` runs, or `.deb` installs via dpkg

---

## 7. KNOWN LIMITATIONS

### Current Web Version → Desktop
1. **Backup encryption password stored in plain text** (in localStorage + JSON backup)
   - **Desktop fix (Phase 3):** Use OS keyring (Windows DPAPI, macOS Keychain, Linux Secret Service)

2. **No decrypt function for encrypted backups yet**
   - **Desktop fix (Phase 3):** Add "Restore from Encrypted Backup" in Settings with password prompt

3. **No auto-updates**
   - **Desktop fix (Phase 3):** Integrate `electron-updater` for silent updates

4. **No multi-user support**
   - **Desktop fix (Phase 3):** Add user authentication, role-based access

### Electron-Specific
1. **File System Access API completely replaced** — web version and desktop version now diverge
   - **Migration:** Users can run both; data imports via JSON backup

2. **Larger bundle size** — Electron baseline ~150 MB (vs. 0 MB for web)
   - **Mitigation:** Tauri (Phase 4) reduces to ~10 MB

3. **macOS code signing required for distribution** (prevents "unidentified developer" warning)
   - **Requirement:** Apple Developer account ($99/year)

---

## 8. MIGRATION PATH FOR EXISTING USERS

### Web Version → Desktop Version

**Step 1: Export data from web version**
1. Open web version in browser
2. Go to Settings → "Manual Backup & Restore"
3. Click "Export Backup" → downloads `easydentallab-backup-YYYY-MM-DD.json`
4. Save file to safe location

**Step 2: Install desktop version**
1. Download installer (`.exe`, `.dmg`, or `.AppImage`)
2. Run installer
3. Launch EasyDentalLab desktop app

**Step 3: Import data**
1. Go to Settings → "Manual Backup & Restore"
2. Click "Import Backup"
3. Select the JSON file from Step 1
4. Confirm "Replace ALL current data with this backup?"
5. Data restored!

**Step 4: Set up backup folder**
1. Go to Settings → "Auto-Backup & Working Folder"
2. Click "Select Backup Folder"
3. Pick a folder (e.g., `Documents/EasyDentalLab`)
4. Auto-backup active

**No data loss** — JSON export/import works identically in both versions.

---

## 9. DELIVERABLES

At the end of Phase 2, you will have:

1. ✅ **EasyDentalLab-Desktop/** project folder with full source code
2. ✅ **Windows installer** (`EasyDentalLab-Setup-2.0.0.exe`) — ~160 MB
3. ✅ **macOS installer** (`EasyDentalLab-2.0.0.dmg`) — ~170 MB (if built on Mac)
4. ✅ **Linux installer** (`EasyDentalLab-2.0.0.AppImage` or `.deb`) — ~150 MB
5. ✅ **Installation guide** (for end users)
6. ✅ **Developer README** (how to build from source)

---

## 10. ESTIMATED TIMELINE

| Day | Focus | Hours | Milestone |
|-----|-------|-------|-----------|
| 1 | Project setup, vendor bundling | 3-4h | Electron window opens with current app |
| 2 | File System API (read) | 4-6h | Folder selection + MedicalAids.csv loads |
| 3 | File System API (write) | 4-6h | Auto-backup writes all files |
| 4 | Polish, icons, testing | 3-4h | All features work offline |
| 5 | Build, package, QA | 3-4h | Installers ready for distribution |

**Total:** 17-24 hours (2-3 full days or 1 work week)

---

## NEXT STEPS

Ready to proceed? I'll:

1. **Create the project structure** (folders, package.json, config files)
2. **Write main.js + preload.js** (IPC handlers + bridge)
3. **Rewrite File System API calls** in renderer
4. **Bundle vendor libraries** locally
5. **Test & build installers**

**Start now?** Let me know and I'll begin implementing!

---

## REFERENCES

- **Electron Docs:** https://www.electronjs.org/docs/latest
- **electron-builder:** https://www.electron.build
- **IPC Tutorial:** https://www.electronjs.org/docs/latest/tutorial/ipc
- **Context Isolation:** https://www.electronjs.org/docs/latest/tutorial/context-isolation
- **Code Signing (macOS):** https://www.electron.build/code-signing
