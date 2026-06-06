# EasyDentalLab — Comprehensive Planning Document v3
**Date:** 2026-06-06  
**Scope:** Research findings + implementation plan for v2.2.0  
**Purpose:** Reference document for coding session in terminal. Covers 3 requested additions + general improvements found during audit.

---

## Current State Summary (Audit)

- **Web app:** `EasyDentalLab.html` (~351 KB, ~5800 lines) — React 18, Babel, Tailwind, jsPDF, all in one file
- **Desktop app:** Electron 28.3.3 in `EasyDentalLab-Desktop/` — v2.1.2 built and deployed
- **Primary data store:** `localStorage` (key: `easydentallab_data`) — this is the critical architectural issue for multi-PC sync
- **Backup:** Writes JSON + CSVs to a user-selected folder (can be Dropbox) — but this is one-way, not a sync
- **Auto-backup:** 2-second debounced writes on every state change — no flush-on-close
- **Version:** 2.1.2 — no auto-update mechanism installed
- **GitHub repo:** https://github.com/sarelroeloffze/EasyDentalLab (private)

---

## ADDITION 1: Keyboard Navigation — Down Arrow Confirms Code + Jumps to Next Line

### The Problem
Users who know their tariff codes want to enter them rapidly without touching the mouse:
- Type code → Down Arrow → type next code → Down Arrow → etc.

**Current behaviour (gap):**
- CodeInput `handleKeyDown`: if dropdown is **open**, ArrowDown navigates the dropdown list — it does NOT confirm the code and jump to a new line
- If dropdown is **closed**, ArrowDown adds a blank line and focuses it — but does NOT confirm/fill the typed code first
- Net result: power users must type code → Enter (to confirm) → then Down Arrow (to add line) — two keystrokes when one should do

### What Needs to Change

**In `CodeInput` component (~line 1527):**

Change the `ArrowDown` branch so it always does "confirm + new line":

```javascript
} else if (e.key === "ArrowDown") {
  e.preventDefault();
  setOpen(false);
  
  // Step 1: confirm whatever is typed (same logic as confirmAndMove but without moving to description)
  const q = (query || value || "").toLowerCase().trim();
  let match = filtered.length > 0 ? filtered[hlIdx] || filtered[0] : null;
  if (!match) match = tariffs.find(t => t.code?.toLowerCase() === q);
  if (match) { pick(match); }  // fills description, price, tariffCode
  
  // Step 2: add new blank line below, focus its code input
  if (onAddLine) {
    onAddLine();
    setTimeout(() => {
      const table = inputRef.current?.closest("table");
      if (table) {
        const allCodeInputs = table.querySelectorAll("input[data-field='code']");
        const last = allCodeInputs[allCodeInputs.length - 1];
        if (last) last.focus();
      }
    }, 50);
  }
}
```

**In the description, qty, and price `onKeyDown` handlers (~line 3753–3755):**

Description field: ArrowDown should jump to the NEXT ROW's description field (or next row's code if last row):
```javascript
onKeyDown={e => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const row = e.target.closest("tr");
    const nextRow = row?.nextElementSibling;
    if (nextRow) {
      const nextDesc = nextRow.querySelector("input[data-field='description']");
      if (nextDesc) nextDesc.focus();
    } else {
      // Last row — add new row, focus its code
      addBlank();
      setTimeout(() => {
        const table = e.target.closest("table");
        if (table) {
          const allCode = table.querySelectorAll("input[data-field='code']");
          allCode[allCode.length - 1]?.focus();
        }
      }, 50);
    }
  }
  // ... existing Enter handler stays
}}
```

Similarly for qty and price fields — ArrowDown moves to next row's same field, or adds new row if last.

**Also add ArrowUp navigation** (move to previous row's same field) — symmetric and expected.

### Help Section Update Required
Update the Invoices and Estimates help topics to document:
- Down Arrow in any field moves to the same field in the next row
- Down Arrow on the last row adds a new row
- ArrowDown in the code field also auto-confirms the current code before moving

### Impact
- `CodeInput` component: ~10 lines changed
- `LineItemEditor` td `onKeyDown` handlers: ~4 inline handlers updated
- Help section: 2 topics updated
- No data structure changes
- Web AND desktop (same file used in renderer)

---

## ADDITION 2: Multi-PC Data Sync + Save-on-Close

### The Core Architectural Problem

**LocalStorage is machine-local.** The current architecture:
```
Machine A: localStorage ←→ React state → (debounced) → backup folder (Dropbox)
Machine B: localStorage ←→ React state → (debounced) → backup folder (Dropbox)
```
Machine B never reads from Dropbox automatically. Its localStorage starts empty or diverges.

**Additionally:** There is no explicit flush-on-close. If the user closes within the 2-second debounce window, the last changes may not be written to disk.

### Research Findings

**Option A — JSON file as primary data store (RECOMMENDED)**

Use the backup JSON file (`EasyDentalLab-backup.json` in the working folder) as the authoritative data source:
- On startup: read from file first; fall back to localStorage if file not found
- On every save: write to file immediately (keep debounce for performance) AND keep localStorage as fast cache
- On close: flush immediately (skip debounce)

This means that if the working folder is a Dropbox/OneDrive/Google Drive folder, data is automatically synced across all machines that share that folder.

**Option B — Keep localStorage + restore prompt (simpler, less safe)**

Keep current architecture but add:
- On startup: compare localStorage timestamp vs file timestamp; if file is newer, offer to restore
- Still requires manual action from user

**Verdict: Implement Option A.** The app already writes to a file — making it the primary source is the right move for a desktop app. localStorage becomes a cache.

### Implementation Plan

#### 2a. Desktop (`main.js`) — Save-on-Close Handler

Add a `before-quit` IPC flow:

```javascript
// main.js additions:

let isQuitting = false;

app.on('before-quit', async (event) => {
  if (isQuitting) return; // prevent re-entry
  event.preventDefault();
  isQuitting = true;
  
  // Tell renderer to flush data immediately
  try {
    await mainWindow.webContents.executeJavaScript('window._flushDataNow && window._flushDataNow()');
    // Wait up to 3 seconds for flush to complete
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (e) {
    console.error('Flush error:', e);
  }
  
  app.quit();
});
```

Or cleaner — use IPC:
```javascript
// main.js: listen for renderer to say "flush complete"
ipcMain.handle('flush-complete', () => {
  app.quit();
});

// renderer: expose window._flushDataNow that calls autoBackupCSVs(true) (force=true skips debounce) then calls electronAPI.flushComplete()
```

#### 2b. Renderer — Expose `window._flushDataNow`

In the app's `useEffect` / App component:
```javascript
// Register flush handler for before-quit
useEffect(() => {
  window._flushDataNow = async () => {
    await autoBackupCSVs(true); // force=true: skip debounce, write immediately
    if (window.electronAPI?.flushComplete) window.electronAPI.flushComplete();
  };
  return () => { delete window._flushDataNow; };
}, [data]);
```

In `autoBackupCSVs`, add a `force` parameter:
```javascript
const autoBackupCSVs = useCallback(async (force = false) => {
  if (!force) {
    // existing debounce logic
    clearTimeout(_backupTimer);
    _backupTimer = setTimeout(async () => { await _doBackup(); }, 2000);
  } else {
    // immediate write, no debounce
    await _doBackup();
  }
}, [data]);
```

#### 2c. Startup: Read from File First

In `initAutoBackup()` or on app startup:
```javascript
const initDataFromFile = async () => {
  if (!window.electronAPI) return; // web version — skip
  
  const result = await window.electronAPI.readBackupFile('EasyDentalLab-backup.json');
  if (!result.success) return; // no file yet
  
  try {
    const fileData = JSON.parse(result.content);
    const localData = loadData(); // current localStorage
    
    const fileTimestamp = fileData._savedAt || 0;
    const localTimestamp = localData._savedAt || 0;
    
    if (fileTimestamp > localTimestamp) {
      // File is newer — this means another machine saved after us
      const ok = confirm(
        `⚠️ Data on disk is newer than your local data.\n\n` +
        `File saved: ${new Date(fileTimestamp).toLocaleString()}\n` +
        `Local saved: ${new Date(localTimestamp).toLocaleString()}\n\n` +
        `Load the newer data from disk?`
      );
      if (ok) {
        saveData(fileData);
        window.location.reload(); // reload app with new data
      }
    }
  } catch (e) {
    console.warn('Could not parse backup file for sync check:', e);
  }
};
```

Add `_savedAt: Date.now()` to every `saveData()` call.

#### 2d. Conflict Copy Detection (Dropbox-specific)

When Dropbox detects a conflict (two machines edited the same file before sync), it renames one copy as:
`EasyDentalLab-backup (Sarel's conflicted copy 2026-06-06).json`

On startup, scan for these files:
```javascript
// IPC: scan backup folder for conflicted copies
ipcMain.handle('scan-for-conflicts', async () => {
  if (!backupFolderPath) return { conflicts: [] };
  try {
    const files = await fs.readdir(backupFolderPath);
    const conflicts = files.filter(f => 
      f.includes('conflicted copy') && f.includes('EasyDentalLab')
    );
    return { conflicts };
  } catch {
    return { conflicts: [] };
  }
});
```

If conflicts found, warn user:
```
⚠️ Sync Conflict Detected
Dropbox found a conflicted copy of your data:
"EasyDentalLab-backup (conflicted copy 2026-06-05).json"

This means two computers saved changes at the same time.
Please check both files and manually merge if needed.
The conflicted copy is in your backup folder.
```

#### 2e. User-Facing Documentation / Setup Guidance

In Settings → Auto-Backup section, add a "Multi-PC Sync Setup" panel:
```
💡 Using on Multiple Computers?

Point all computers to the same Dropbox (or OneDrive / Google Drive) folder.
1. On each PC: Settings → Auto-Backup → Select Backup Folder
2. Choose the same cloud-synced folder on each machine
3. Wait for Dropbox to fully sync before opening the app on the second machine
4. ⚠️ Never run the app on two computers at the same time — data may conflict

EasyDentalLab automatically detects when another machine has newer data and
will ask if you want to load it.
```

#### 2f. New IPC Handlers Required in `main.js`

| Handler | Purpose |
|---------|---------|
| `flush-complete` | Renderer signals it has written data; main process calls `app.quit()` |
| `scan-for-conflicts` | Main reads backup folder directory, returns list of conflicted copy filenames |
| `get-file-timestamp` | Returns `mtime` of the backup JSON file (for sync comparison without reading full file) |

#### 2g. Web Version (`EasyDentalLab.html`)

The web version cannot truly sync across PCs (it uses the browser's localStorage). However:
- Add `_savedAt: Date.now()` to `saveData()` — this enables future comparison
- The `beforeunload` handler already warns if backup is pending — keep it
- No `before-quit` mechanism in browser version — document this limitation

### Supported Cloud Providers

All work transparently (Dropbox, OneDrive, Google Drive, iCloud Drive):
- User just selects the cloud-synced folder as the "backup folder"
- No API integration needed — the cloud client handles sync
- Conflict detection is provider-agnostic (all use "conflicted copy" naming convention)

### Risk: Concurrent Access

If both machines are running simultaneously, each will overwrite the JSON file on every save. No file locking across machines is practical without a server. **Mitigation:** Warn users not to run the app simultaneously. The conflict detection on startup is the recovery mechanism.

---

## ADDITION 3: Auto-Update for Desktop App

### Research Findings

**`electron-updater`** (part of the electron-builder ecosystem, already installed as a devDependency) is the standard solution. It works with:
- GitHub Releases (simplest — already using GitHub)
- Amazon S3, DigitalOcean Spaces, generic HTTPS server

**Code signing requirements by platform:**

| Platform | Code Signing Required for Auto-Update? |
|----------|----------------------------------------|
| Windows | ❌ No — works without signing. SmartScreen warning on first install only. |
| macOS | ✅ Yes — unsigned apps CANNOT auto-install updates silently. Best approach: check for update, notify user, open download URL. |
| Linux (AppImage) | ❌ No — works without signing. |

**For EasyDentalLab (currently unsigned):**
- Windows + Linux: full auto-update works
- macOS: implement "notify + open download link" fallback

### Implementation Plan

#### 3a. Install `electron-updater`

```bash
cd EasyDentalLab-Desktop
npm install electron-updater --save
```

Note: `electron-updater` must be in `dependencies` (not `devDependencies`) because it runs at runtime.

#### 3b. Configure `electron-builder.yml`

Add publish configuration:
```yaml
publish:
  provider: github
  owner: sarelroeloffze
  repo: EasyDentalLab
  private: true
  token: ${GH_TOKEN}
```

The `GH_TOKEN` environment variable must be set to a GitHub Personal Access Token with `repo` scope (for private repos). This token is needed both to:
1. Upload releases during build
2. Check for updates at runtime (to access private repo releases)

For runtime access, the token needs to be embedded or provided via app config. For a private repo, store the token in app config on first run, or hardcode a read-only token (lower risk: it can only read releases, not push).

#### 3c. `main.js` — Auto-Update Logic

```javascript
const { autoUpdater } = require('electron-updater');
const log = require('electron-log'); // optional, for logging

// In createWindow() or after app.on('ready'):
function setupAutoUpdater() {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;     // Download silently in background
  autoUpdater.autoInstallOnAppQuit = true; // Install when user quits naturally
  
  // For private GitHub repo — set token
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'sarelroeloffze',
    repo: 'EasyDentalLab',
    private: true,
    token: process.env.GH_TOKEN || storedToken, // read from config
  });

  autoUpdater.on('update-available', (info) => {
    // Notify renderer: new version available
    mainWindow.webContents.send('update-available', info);
  });

  autoUpdater.on('update-downloaded', (info) => {
    // Notify renderer: update ready to install
    mainWindow.webContents.send('update-downloaded', info);
  });

  autoUpdater.on('error', (err) => {
    // Silent fail — don't interrupt user
    console.log('Auto-update error:', err);
  });

  // Check on startup (after a short delay so UI loads first)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => console.log('Update check failed:', err));
  }, 5000); // 5 second delay
}
```

**macOS fallback** (no code signing):
```javascript
// Detect if we can auto-install (requires signing)
autoUpdater.on('update-available', (info) => {
  if (process.platform === 'darwin') {
    // macOS unsigned — notify + open download URL
    mainWindow.webContents.send('update-available-manual', {
      version: info.version,
      downloadUrl: `https://github.com/sarelroeloffze/EasyDentalLab/releases/tag/v${info.version}`
    });
  } else {
    // Windows/Linux — proceed with auto-download
    mainWindow.webContents.send('update-available', info);
  }
});
```

#### 3d. Renderer — Update UI Notifications

In the React app (App component), listen for update IPC events:

```javascript
// In App component useEffect:
useEffect(() => {
  if (!window.electronAPI) return;
  
  // New version available — downloading
  window.electronAPI.onUpdateAvailable((info) => {
    setUpdateBanner({ type: 'downloading', version: info.version });
  });
  
  // Download complete — ready to install
  window.electronAPI.onUpdateDownloaded((info) => {
    setUpdateBanner({ type: 'ready', version: info.version });
  });
  
  // macOS manual update
  window.electronAPI.onUpdateAvailableManual((info) => {
    setUpdateBanner({ type: 'manual', version: info.version, url: info.downloadUrl });
  });
}, []);
```

Banner UI (similar to existing tariff upgrade banner):
```
🔄 Version 2.2.0 is available — downloading in background...
[Install & Restart]  [Later]

✅ Update ready — restart to install version 2.2.0
[Restart Now]  [Install on Next Launch]  

⬇️ Version 2.2.0 available (macOS)
[Download Now →]  [Later]
```

#### 3e. New IPC channels to add in `preload.js`

```javascript
// preload.js additions:
onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (e, info) => callback(info)),
onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (e, info) => callback(info)),
onUpdateAvailableManual: (callback) => ipcRenderer.on('update-available-manual', (e, info) => callback(info)),
installUpdate: () => ipcRenderer.send('install-update'),
```

#### 3f. Release Process (after implementation)

Every new release:
1. Update version in `EasyDentalLab-Desktop/package.json` (e.g., `2.2.0`)
2. Update `APP_VERSION` in `renderer/index.html` and `EasyDentalLab.html`
3. Run: `GH_TOKEN=xxx npm run build` — builds all platforms
4. Run: `gh release create v2.2.0 build/*.exe build/*.dmg build/*.AppImage --title "v2.2.0" --notes "Release notes"`
   - electron-builder automatically generates and uploads `latest.yml`, `latest-mac.yml`, `latest-linux.yml`
5. All running apps will detect the update within 5 seconds of next launch

#### 3g. `electron-log` (optional but recommended)

Add `electron-log` for debugging update issues:
```bash
npm install electron-log --save
```
Logs go to `~/Library/Logs/EasyDentalLab/main.log` (macOS) or `%APPDATA%\EasyDentalLab\logs\main.log` (Windows).

---

## ADDITION 4: In-App Support & Feedback Channel

### The Problem

Users who hit a bug or want a new feature currently have no way to reach the developer from inside the app. They must go find an email address or phone number separately — most won't bother.

### Why WhatsApp Is the Right Approach for This App

- WhatsApp is the dominant business communication channel in South Africa
- The app already has WhatsApp integration (statements + invoices) — the pattern is understood by users
- No backend server required
- Works identically in web and desktop versions
- Message arrives pre-filled with version + business name — Sarel gets context without asking for it

Email is offered as a secondary option for users who prefer it.

**Rejected alternatives:**
- GitHub Issues — too technical for dental lab users
- Embedded form with backend — adds hosting complexity, unnecessary for a small user base
- Third-party services (Formspree, Intercom, etc.) — external dependency, privacy concerns for SA POPIA compliance

### Two New Constants at Top of File

Add next to the other app constants (`APP_VERSION`, `LICENSE_PUBLIC_KEY_B64`, etc.):

```javascript
const SUPPORT_WHATSAPP = "27XXXXXXXXX";         // ← replace with Sarel's WA number (no + or spaces)
const SUPPORT_EMAIL    = "sarel@roeloffze.com";  // ← support email address
```

These two constants are the only place that needs to be updated if contact details change.

### Settings Card: "Support & Feedback"

Add a new card to the Settings page, between "About" (version info) and the Help section at the bottom.

**UI layout:**

```
📬 Support & Feedback
─────────────────────────────────────────────────────
Have a question, found a bug, or want a new feature?
Send a message directly to the developer.

[Text area — placeholder: "Describe your issue or request…"]

[💬 Send via WhatsApp]   [✉️ Send via Email]

Your message will include your app version and business
name so Sarel can assist you faster.
```

The text area is optional — users can leave it blank and both buttons still work (message will say "No details provided").

### Message Template (pre-filled)

Both WhatsApp and email are pre-filled so users don't have to type context manually:

```
Hi Sarel,

I need help with EasyDentalLab.

Business: [data.profile.name || "Not set"]
Version:  v[APP_VERSION]
Platform: [macOS / Windows / Linux / Web Browser]

Issue / Request:
[user textarea content, or "(No details provided)"]
```

### Implementation — WhatsApp Button

Reuses the exact same pattern as the existing `whatsappStatement` and `whatsappDocument` functions:

```javascript
const sendSupportWhatsapp = () => {
  const bizName = data.profile?.name || "Not set";
  const platform = window.electronAPI
    ? (navigator.platform.includes("Mac") ? "macOS" : "Windows/Linux")
    : "Web Browser";
  const message = [
    `Hi Sarel,`,
    ``,
    `I need help with EasyDentalLab.`,
    ``,
    `Business: ${bizName}`,
    `Version:  v${APP_VERSION}`,
    `Platform: ${platform}`,
    ``,
    `Issue / Request:`,
    supportText.trim() || "(No details provided)",
  ].join("\n");

  const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  openExternalUrl(url);
};
```

### Implementation — Email Button

```javascript
const sendSupportEmail = () => {
  const bizName = data.profile?.name || "Not set";
  const subject = encodeURIComponent(`EasyDentalLab Support — v${APP_VERSION}`);
  const body = encodeURIComponent([
    `Hi Sarel,`,
    ``,
    `Business: ${bizName}`,
    `Version:  v${APP_VERSION}`,
    ``,
    `Issue / Request:`,
    supportText.trim() || "(No details provided)",
  ].join("\n"));

  openExternalUrl(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
};
```

### `openExternalUrl` Helper (new shared utility)

Both buttons, the macOS auto-update download link (Addition 3), and any future external links should use one shared helper:

```javascript
const openExternalUrl = (url) => {
  if (window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url); // Electron: use shell.openExternal
  } else {
    window.open(url, "_blank");           // Web browser: normal tab
  }
};
```

This needs a new IPC handler in `main.js`:

```javascript
// main.js
const { shell } = require('electron');
ipcMain.handle('open-external', async (event, url) => {
  // Validate URL before opening (security: only allow https, mailto, and wa.me)
  if (/^(https?:\/\/|mailto:)/.test(url)) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Blocked: invalid URL scheme' };
});
```

And in `preload.js`:
```javascript
openExternal: (url) => ipcRenderer.invoke('open-external', url),
```

**Note:** This `openExternal` IPC channel also fixes the existing WhatsApp buttons in the desktop version. Currently `window.open()` in Electron with `contextIsolation: true` may open a new Electron window instead of the system browser. This helper routes all external URLs correctly.

### Platform Detection for "Platform" Field

```javascript
const getPlatform = () => {
  if (!window.electronAPI) return "Web Browser";
  if (process.platform === "darwin")  return "macOS";
  if (process.platform === "win32")   return "Windows";
  if (process.platform === "linux")   return "Linux";
  return "Desktop";
};
```

For the web version, `navigator.platform` gives a rough value but `"Web Browser"` is sufficient.

### State Required in SupportCard Component

```javascript
const SupportCard = ({ data }) => {
  const [supportText, setSupportText] = useState("");
  const [sent, setSent]               = useState(false);

  const handleSend = (channel) => {
    if (channel === "whatsapp") sendSupportWhatsapp();
    if (channel === "email")    sendSupportEmail();
    setSent(true);
    setSupportText("");
    setTimeout(() => setSent(false), 4000); // reset after 4s
  };

  return (
    <div className="card" style={{marginBottom: 24}}>
      <h3>📬 Support & Feedback</h3>
      <p style={{color:"var(--c-text2)", marginBottom:12}}>
        Have a question, found a bug, or want a new feature?
        Send a message directly to the developer.
      </p>
      <textarea
        className="input-field"
        rows={4}
        value={supportText}
        onChange={e => setSupportText(e.target.value)}
        placeholder="Describe your issue or request…"
        style={{width:"100%", marginBottom:12, resize:"vertical"}}
      />
      {sent ? (
        <p style={{color:"green"}}>✅ Opening — your message is ready to send!</p>
      ) : (
        <div style={{display:"flex", gap:8}}>
          <button className="btn-primary" onClick={() => handleSend("whatsapp")}>
            💬 Send via WhatsApp
          </button>
          <button className="btn-secondary" onClick={() => handleSend("email")}>
            ✉️ Send via Email
          </button>
        </div>
      )}
      <p style={{color:"var(--c-text3)", fontSize:12, marginTop:8}}>
        Your message includes your app version and business name automatically.
      </p>
    </div>
  );
};
```

### Help Section Update

Add a note to the Settings help topic:

> **Support & Feedback** — Use the Support card to send a message directly to the developer via WhatsApp or email. Your app version and business name are included automatically so the developer has context. Use this to report bugs, ask questions, or request new features.

### Files Modified

- `EasyDentalLab.html`:
  - Add `SUPPORT_WHATSAPP` + `SUPPORT_EMAIL` constants (top of file, near `APP_VERSION`)
  - Add `openExternalUrl()` helper function
  - Add `SupportCard` component
  - Add `<SupportCard data={data} />` in Settings page (before `<HelpSection />`)
  - Update existing `whatsappDocument`, `whatsappStatement`, `whatsappReceipt` to use `openExternalUrl()` instead of `window.open()`
  - Update HelpSection Settings topic

- `EasyDentalLab-Desktop/main.js`:
  - Add `const { shell } = require('electron')` import
  - Add `ipcMain.handle('open-external', ...)` handler

- `EasyDentalLab-Desktop/preload.js`:
  - Expose `openExternal: (url) => ipcRenderer.invoke('open-external', url)`

- `EasyDentalLab-Desktop/renderer/index.html`:
  - Apply all changes from `EasyDentalLab.html` above

---

## GENERAL IMPROVEMENTS FOUND DURING AUDIT

### G1. Desktop App Missing Payments.csv on Restore

**Issue:** On a new machine, when the app restores from the JSON backup, it loads all data. But `Payments.csv` is now also written. The restore flow doesn't explicitly load Payments back — however since payments are in the JSON backup, this is fine for JSON restore. But if only CSVs are present (e.g., user copied just the CSV files), payments are lost.

**Fix:** In the startup "restore from file" flow (Addition 2c), explicitly load from JSON (not just CSVs). Document that the JSON backup is the authoritative restore file.

### G2. No Guided First-Run "Restore" Flow

**Issue:** When a user installs on a new machine or reinstalls, there's no prompt to restore from an existing backup.

**Fix:** On first launch (detect: localStorage is empty + no backup folder set), show a "Welcome" dialog:
```
Welcome to EasyDentalLab!

Is this a new installation, or do you have existing data to restore?

[Start Fresh]   [Restore from Backup File]
```

If "Restore from Backup File": trigger a file picker for the JSON backup → parse → load.

### G3. Desktop Version Not Synced with Web Version

**Issue:** `EasyDentalLab-Desktop/renderer/index.html` is a copy of `EasyDentalLab.html` that was modified for Electron IPC. When the web version gets updates, the desktop renderer must be manually synced. This is error-prone.

**Fix options:**
- A. Maintain a patch script that applies the Electron-specific changes on top of the web version (diff-based)
- B. Refactor to use a shared source with conditional `if (window.electronAPI)` branches — which is already partially done
- C. Add a build step: `npm run sync-renderer` copies `../EasyDentalLab.html` and applies minimal patches

This is the most important architectural debt. Document it clearly.

### G4. `_savedAt` Timestamp Missing from Data

Currently `saveData()` writes the data object as-is. Adding `_savedAt: Date.now()` to every save enables:
- Multi-PC sync comparison (Addition 2c)
- Conflict detection
- Debugging data issues

**Fix:** One line in `saveData()`:
```javascript
const saveData = (d) => {
  try {
    const toSave = { ...d, _savedAt: Date.now() };
    localStorage.setItem("easydentallab_data", JSON.stringify(toSave));
  } catch (e) { ... }
};
```

### G5. Installer Versions in CLAUDE.md Are Stale

The CLAUDE.md build table still references v2.0.0 installers in some rows. After new builds, update the table to show v2.1.2 (and eventually v2.2.0).

### G6. `electron-builder.yml` Has No `publish` Config

Currently:
```yaml
# electron-builder.yml — no publish section
```

Without a `publish` section, `electron-builder` doesn't know where to upload artifacts and doesn't generate `latest.yml`. This is required for auto-update (Addition 3). Must be added before next build.

### G7. Code Signing Roadmap (Future)

Currently both Windows and macOS are unsigned:
- **Windows SmartScreen bypass:** ~R700/year for a code signing cert (EV cert from DigiCert/Sectigo). Optional.
- **macOS notarization:** Apple Developer Program at ~R1,800/year. Required for silent macOS auto-updates.
- **For now:** Both platforms work without signing; users just click through the warning once.

---

## Implementation Priority Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 High | G4: `_savedAt` timestamp | 5 min | Enables sync comparison |
| 🔴 High | Add 1: ArrowDown confirm+jump | 30 min | Daily UX improvement |
| 🔴 High | Add 2a/2b: Save-on-close flush | 45 min | Data safety |
| 🟡 Medium | Add 2c/2d: Startup sync check + conflict detection | 2 hrs | Multi-PC enablement |
| 🟡 Medium | Add 2e: Multi-PC setup UI | 30 min | User guidance |
| 🟡 Medium | G2: First-run restore flow | 1 hr | Onboarding UX |
| 🟡 Medium | Add 3a–3f: Auto-updater (Windows + Linux) | 2 hrs | Keeping users current |
| 🟢 Low | G3: Desktop/web sync build process | 1 hr | Dev productivity |
| 🟢 Low | G1: Payments restore documentation | 15 min | Data safety docs |
| 🟢 Low | G7: Code signing research | Ongoing | macOS auto-update |
| 🔴 High | Add 4: In-app support channel | 1 hr | User retention + bug reports |

---

## Files That Will Be Modified

### Web version (`EasyDentalLab.html`)
- `saveData()` (~line 587): add `_savedAt: Date.now()`
- `CodeInput.handleKeyDown` (~line 1527): ArrowDown logic rewrite
- `LineItemEditor` td handlers (~lines 3753–3755): ArrowDown/ArrowUp per-field navigation
- `App` component: `_flushDataNow` exposed on window, update banner state + IPC listeners
- `HelpSection` Invoices topic (~line 4524): document Down Arrow behavior
- `HelpSection` Estimates topic: document Down Arrow behavior
- `AutoBackupCard` (~line 3960): add "Multi-PC Sync" info panel
- Add `SUPPORT_WHATSAPP` + `SUPPORT_EMAIL` constants (top of file)
- Add `openExternalUrl()` helper; update existing WhatsApp functions to use it
- Add `SupportCard` component; render in Settings page before `<HelpSection />`
- Update HelpSection Settings topic

### Desktop (`EasyDentalLab-Desktop/`)
- `package.json`: add `electron-updater` + `electron-log` to dependencies; bump version
- `electron-builder.yml`: add `publish` section for GitHub Releases
- `main.js`: add `before-quit` flush handler; add `scan-for-conflicts` + `get-file-timestamp` IPC handlers; add `setupAutoUpdater()` function
- `preload.js`: expose new IPC channels (flushComplete, scanForConflicts, onUpdateAvailable, onUpdateDownloaded, installUpdate, openExternal)
- `renderer/index.html`: apply all changes from `EasyDentalLab.html` above; add startup file-vs-localStorage comparison; expose `window._flushDataNow`

### New/Updated Docs
- `CLAUDE.md`: update version, bug fixes table, key code sections
- `EasyDentalLab-Desktop/INSTALLERS-README.md`: add multi-PC setup guide section
- This planning document: check off items as completed

---

## Terminal Session Prompt (Ready to Use)

Copy the following as a prompt to start a coding session:

```
I need you to implement the following changes to EasyDentalLab v2.1.2.
The project is in: /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA Claud/EasyDentalLab/
The planning document is: EasyDentalLab-Planning-v3.md

Please implement in this order:

STEP 1 — Add _savedAt timestamp (G4)
- In EasyDentalLab.html, find saveData() (~line 587)
- Add _savedAt: Date.now() to the object before saving to localStorage
- Apply the same change in EasyDentalLab-Desktop/renderer/index.html

STEP 2 — Arrow key navigation in LineItemEditor (Addition 1)
- In EasyDentalLab.html, find CodeInput.handleKeyDown (~line 1527)
- Change the ArrowDown branch: instead of only adding a new line when dropdown is closed,
  ALWAYS confirm the current typed code (pick the top match or exact match from filtered)
  AND THEN add a new blank line and focus its code input.
  Remove the "if open / if closed" split — ArrowDown always = confirm + next line.
- In the description, qty, and price inline onKeyDown handlers in LineItemEditor (~lines 3753-3755):
  Change ArrowDown to navigate to the SAME field in the NEXT ROW (tr.nextElementSibling)
  instead of always adding a new row. Only add a new row if it's the last row.
  Add ArrowUp to navigate to the same field in the PREVIOUS ROW.
- Update the Help section Invoices topic (~line 4524) and Estimates topic to document
  the new keyboard navigation behavior.
- Apply the same changes in EasyDentalLab-Desktop/renderer/index.html

STEP 3 — Save-on-close flush (Addition 2a + 2b)
- In EasyDentalLab-Desktop/main.js:
  - Add a before-quit handler that calls mainWindow.webContents.executeJavaScript('window._flushDataNow && window._flushDataNow()')
  - Wait up to 2 seconds then call app.quit()
  - Add ipcMain.handle('flush-complete') that calls app.quit() immediately
- In EasyDentalLab-Desktop/preload.js:
  - Expose window.electronAPI.flushComplete = () => ipcRenderer.invoke('flush-complete')
- In EasyDentalLab-Desktop/renderer/index.html (App component useEffect):
  - Register window._flushDataNow = async () => { await autoBackupCSVs(true); window.electronAPI?.flushComplete(); }
- Modify autoBackupCSVs to accept a force=true parameter that skips the debounce timer

STEP 4 — Startup sync check + conflict detection (Addition 2c + 2d)
- In EasyDentalLab-Desktop/renderer/index.html (App startup, after initAutoBackup):
  - Call a new initDataFromFile() function
  - Read EasyDentalLab-backup.json from the backup folder
  - Compare _savedAt timestamps with localStorage _savedAt
  - If file is newer by more than 30 seconds, show a dialog offering to load from file
  - If user says yes: saveData(fileData) + window.location.reload()
- In EasyDentalLab-Desktop/main.js:
  - Add ipcMain.handle('scan-for-conflicts') that reads the backup folder directory
    and returns filenames containing 'conflicted copy' and 'EasyDentalLab'
  - Add ipcMain.handle('get-file-timestamp') that returns the mtime of EasyDentalLab-backup.json
- In EasyDentalLab-Desktop/preload.js:
  - Expose scanForConflicts and getFileTimestamp
- In renderer: on startup after folder is known, call scanForConflicts and if any found,
  show a warning banner (yellow, dismissible) naming the conflicted files

STEP 5 — Multi-PC setup guidance UI (Addition 2e)
- In EasyDentalLab.html and renderer/index.html, in AutoBackupCard component (~line 3960):
  - Add a collapsible "Multi-PC Sync Setup" info panel below the existing backup folder UI
  - Content: explain how to use the same Dropbox/OneDrive folder on multiple PCs
  - Warn: never run on two PCs simultaneously
  - This is a static UI panel, no new functionality

STEP 6 — First-run restore flow (G2)
- In EasyDentalLab-Desktop/renderer/index.html, in App startup:
  - Detect first-run: localStorage is empty (no easydentallab_data key) AND no backup folder configured
  - Show a modal: "Welcome! Start fresh or restore from backup?"
  - If restore: call window.electronAPI.pickRestoreFile() → new IPC handler in main.js
    that opens a file picker filtered to .json files → reads file → returns content
  - Parse the JSON → call saveData() → reload
- In main.js: add ipcMain.handle('pick-restore-file') using dialog.showOpenDialog with
  filters: [{ name: 'JSON Backup', extensions: ['json'] }]
- In preload.js: expose pickRestoreFile

STEP 7 — Auto-updater (Addition 3)
- In EasyDentalLab-Desktop/:
  - Run: npm install electron-updater --save
  - Update electron-builder.yml: add publish section with provider: github,
    owner: sarelroeloffze, repo: EasyDentalLab, private: true
  - In main.js: add setupAutoUpdater() function (see planning doc for full code)
    - autoDownload: true, autoInstallOnAppQuit: true
    - macOS: send 'update-available-manual' IPC event with download URL instead of auto-download
    - Check for updates 5 seconds after startup
    - Add ipcMain.on('install-update') handler that calls autoUpdater.quitAndInstall()
  - In preload.js: expose onUpdateAvailable, onUpdateDownloaded, onUpdateAvailableManual, installUpdate
  - In renderer/index.html (App component):
    - Add updateBanner state
    - In useEffect, register electronAPI.onUpdateAvailable/onUpdateDownloaded/onUpdateAvailableManual callbacks
    - Render update banner at top of app (similar to existing tariff upgrade banner)
    - Three banner variants: downloading, ready-to-install, manual-download (macOS)

STEP 8 — In-app support & feedback (Addition 4)
- In EasyDentalLab.html, add two constants near APP_VERSION at top of file:
    const SUPPORT_WHATSAPP = "27832591561";       // ← Sarel fills in his WA number
    const SUPPORT_EMAIL    = "sarel@roeloffze.com";
- Add openExternalUrl(url) helper function (uses window.electronAPI.openExternal if in Electron,
  otherwise window.open). Update existing whatsappDocument, whatsappStatement, whatsappReceipt
  functions to call openExternalUrl() instead of window.open().
- Add SupportCard component (textarea + WhatsApp button + Email button). Pre-fills message
  with business name, APP_VERSION, platform, and user-typed text. Shows "✅ Opening…" on send.
- In Settings page, render <SupportCard data={data} /> just before <HelpSection />.
- Update HelpSection Settings topic to document the Support & Feedback card.
- In EasyDentalLab-Desktop/main.js:
    - Add: const { shell } = require('electron')
    - Add: ipcMain.handle('open-external', async (e, url) => { if (/^(https?|mailto):/.test(url)) { await shell.openExternal(url); return {success:true}; } return {success:false}; })
- In EasyDentalLab-Desktop/preload.js:
    - Add: openExternal: (url) => ipcRenderer.invoke('open-external', url)
- Apply all EasyDentalLab.html changes to EasyDentalLab-Desktop/renderer/index.html

STEP 9 — Rebuild installers
- Bump version to 2.2.0 in package.json and APP_VERSION in renderer/index.html and EasyDentalLab.html
- Confirm SUPPORT_WHATSAPP has been updated from placeholder "27XXXXXXXXX" to Sarel's real number
- Run: npm run build (or build per platform)
- Test on macOS: verify save-on-close, startup sync check, update notification
- Create GitHub release v2.2.0 with new installers
- Update CLAUDE.md with all changes, new line numbers, and bug fixes table entries
- Update this planning document: mark all steps as DONE

After each step, confirm what was changed before proceeding to the next step.
```

---

## Version Target

These changes target **v2.2.0** with the following changelog:

- ✨ Down Arrow key in code entry confirms code + jumps to next line (power-user keyboard workflow)  
- ✨ Down/Up Arrow keys navigate between rows in all line item fields  
- 🔒 Save-on-close: data is flushed to disk before the app exits (no data loss on close)  
- 🔄 Multi-PC sync: app detects when backup file is newer and offers to load latest data  
- 🔄 Dropbox conflict detection: warns if a conflicted copy file is found on startup  
- 💡 Multi-PC setup guide in Settings  
- 🆕 First-run restore wizard for new installations / new machines  
- 🔄 Auto-update: Windows and Linux silently download and install updates; macOS notifies with download link  
- 🐛 `_savedAt` timestamp on all saves (enables sync comparison)  
- 📬 In-app support: WhatsApp + email buttons in Settings pre-fill a message with version + business name  
- 🔧 `openExternalUrl` helper fixes WhatsApp/external links in desktop version (shell.openExternal routing)
