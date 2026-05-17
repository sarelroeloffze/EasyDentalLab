# EasyDentalLab v2.0.0 Desktop Installers

**Build Date:** May 17, 2026
**Status:** ✅ Production-Ready

---

## 📦 Installer Files

Located in: `EasyDentalLab-Desktop/build/`

| Platform | File | Size | Format |
|----------|------|------|--------|
| **Windows** | `EasyDentalLab Setup 2.0.0.exe` | 76 MB | NSIS Installer |
| **macOS** | `EasyDentalLab-2.0.0-arm64.dmg` | 90 MB | Disk Image (Apple Silicon) |
| **Linux** | `EasyDentalLab-2.0.0-arm64.AppImage` | 100 MB | AppImage (ARM64) |

---

## 🔐 SHA256 Checksums

```
1c0a7cfa7b12fd048fbd21b30ad738094b0c8844d4c05a9af736c8c2637b6300  EasyDentalLab Setup 2.0.0.exe
11723fbce257112c70ce3913eec24eb0cfb243891837a60dfc100297115c3140  EasyDentalLab-2.0.0-arm64.dmg
9953e207be56e688e694a3d5cb71bc1ff41ae0edf0030ccac78f025c7f13d05a  EasyDentalLab-2.0.0-arm64.AppImage
```

---

## 🚀 Installation Instructions

### Windows
1. Double-click `EasyDentalLab Setup 2.0.0.exe`
2. Choose installation directory (or use default: `C:\Program Files\EasyDentalLab`)
3. Select shortcuts (Desktop + Start Menu recommended)
4. Click Install
5. Launch from Desktop shortcut or Start Menu

**Note:** Windows Defender may show "Unrecognized app" warning (expected for unsigned apps). Click "More info" → "Run anyway".

### macOS
1. Double-click `EasyDentalLab-2.0.0-arm64.dmg`
2. Drag "EasyDentalLab" icon to Applications folder
3. Eject the DMG
4. Open Applications → Right-click EasyDentalLab → Open (first time only)
5. Click "Open" on the security prompt

**Note:** macOS will show "unidentified developer" warning (expected for ad-hoc signed apps). This is safe — the app is not code-signed with an Apple Developer certificate.

### Linux
1. Make the AppImage executable:
   ```bash
   chmod +x EasyDentalLab-2.0.0-arm64.AppImage
   ```
2. Run it:
   ```bash
   ./EasyDentalLab-2.0.0-arm64.AppImage
   ```
3. (Optional) Integrate with desktop:
   - Right-click AppImage → "Integrate and run AppImage"
   - Or move to `~/Applications/` and create a `.desktop` file

**Note:** AppImage works on all modern Linux distributions (Ubuntu 20.04+, Fedora, Debian, etc.) without installation.

---

## ✨ What's New in v2.0.0 (Desktop)

### Desktop-Specific Features
- ✅ **Native file system access** — no browser permissions needed
- ✅ **Offline operation** — works without internet (all libraries bundled)
- ✅ **Auto-backup folder selection** — persistent across restarts
- ✅ **Direct Claiming PDF subfolder** — automatic subfolder creation

### Carried Over from Web v1.5
- ✅ **Payment allocation system** with receipts
- ✅ **Backup encryption** (optional AES-256-GCM)
- ✅ **Direct Claiming** to medical aids
- ✅ **Month-End statements** (WhatsApp + Print)
- ✅ **Copy invoice** (All / Patient / Detail modes)
- ✅ **Dark mode** toggle
- ✅ **Price increase** panel (bulk tariff updates)
- ✅ **User Code / Tariff Code** split
- ✅ **License system** (Ed25519 cryptographic validation)

---

## 📋 First-Run Setup

1. **Launch the app** (see installation instructions above)
2. **Set up backup folder** (Settings → Auto-Backup & Working Folder):
   - Click "Select Backup Folder"
   - Choose a folder (e.g., `Documents/EasyDentalLab-Backups`)
   - CSVs will auto-save here every 2 seconds after changes
3. **Import existing data** (optional, if migrating from web version):
   - Go to Settings → Manual Backup & Restore
   - Click "Import Backup"
   - Select your exported JSON file from the web version
4. **Configure profile** (Settings):
   - Business name, VAT number, bank details
   - Upload logo (drag & drop or browse)
   - Set print layout preferences

---

## 🔧 System Requirements

### Windows
- Windows 10 or later
- 4 GB RAM minimum (8 GB recommended)
- 200 MB disk space

### macOS
- macOS 10.15 (Catalina) or later
- Apple Silicon (M1/M2/M3) — **ARM64 build**
- 4 GB RAM minimum (8 GB recommended)
- 200 MB disk space

### Linux
- Ubuntu 20.04+ / Debian 10+ / Fedora 30+ / other modern distros
- ARM64 architecture — **ARM64 build**
- 4 GB RAM minimum (8 GB recommended)
- 200 MB disk space
- GLIBC 2.28+ (check: `ldd --version`)

---

## ⚠️ Known Issues

1. **App icon is Electron default** — placeholder icons used (not dental-themed)
2. **macOS: "Unidentified developer" warning** — app is ad-hoc signed (no Apple Developer certificate); right-click → Open to bypass
3. **Windows: SmartScreen warning** — app is unsigned (no code signing certificate); click "More info" → "Run anyway"
4. **Linux .deb package is broken** — use AppImage instead (self-contained, works everywhere)
5. **Intel/x64 builds not included** — only ARM64 builds created on Apple Silicon; rebuild on x64 machine for Intel compatibility

---

## 🆘 Troubleshooting

### App won't open on macOS
- Right-click app → Open (don't double-click the first time)
- If "damaged" error: `xattr -cr /Applications/EasyDentalLab.app` in Terminal

### Auto-backup not working
- Check backup folder is still accessible (not on network drive or removable media)
- Verify folder permissions (app needs read/write access)
- Check Settings → Auto-Backup shows folder name

### Print not working
- Use Cmd+P (Mac) or Ctrl+P (Windows/Linux) to open print dialog
- Or use WhatsApp buttons to generate PDFs directly

### Data not syncing between web and desktop
- Export JSON backup from web version (Settings → Manual Backup)
- Import backup in desktop version (Settings → Import Backup)
- Data structures are 100% compatible

---

## 🛠️ Building from Source

If you need to rebuild the installers:

```bash
cd EasyDentalLab-Desktop

# Install dependencies
npm install

# Build all platforms
npm run dist

# Or build individually
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

**Output:** `build/` directory

---

## 📞 Support

- **GitHub Issues:** https://github.com/sarelroeloffze/EasyDentalLab/issues
- **Email:** sarel@roeloffze.com

---

## 📄 License

**UNLICENSED** — Proprietary software
**License system:** Ed25519 cryptographic validation (currently bypassed with placeholder key)

To arm license gate: Replace `LICENSE_PUBLIC_KEY_B64` in `renderer/index.html` with key from `license/keyGenerator.html`.

---

**Built with Electron 28.3.3 | React 18.2.0 | jsPDF 2.5.1**
