# EasyDentalLab Maintenance Guide

**Last Updated:** October 24, 2026  
**Current Version:** v3.0.63

This guide explains how to update prices, medical aids, and publish new app versions.

---

## 📋 Table of Contents

1. [Publishing App Updates (Code Changes)](#1-publishing-app-updates-code-changes)
2. [Updating Tariff Prices (Annual Price Increases)](#2-updating-tariff-prices-annual-price-increases)
3. [Updating Medical Aids List](#3-updating-medical-aids-list)
4. [Handling Received CSV Files](#4-handling-received-csv-files)
5. [Emergency Rollback](#5-emergency-rollback)

---

## 1. Publishing App Updates (Code Changes)

**When:** After fixing bugs or adding features  
**Frequency:** As needed (every bug fix, every new feature)

### Quick Steps (Automated)

```bash
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab/EasyDentalLab-Desktop

# 1. Increment version (auto-updates package.json)
npm version patch --no-git-tag-version

# 2. Update APP_VERSION constant manually
# Edit: renderer-new/src/constants/initialData.ts
# Change: export const APP_VERSION = '3.0.XX';

# 3. Run automated build and publish
./publish-release.sh
```

**The script does:**
- ✅ Builds TypeScript (renderer-new → dist)
- ✅ Builds Windows x64 installer
- ✅ Builds macOS ARM64 installer  
- ✅ Builds Linux x64 AppImage
- ✅ Commits to git
- ✅ Pushes to GitHub
- ✅ Publishes GitHub Release with all installers

**What happens next:**
- Windows users get blue "Downloading update" banner within 1 hour
- Click "Restart Now" → auto-installs → app relaunches with new version
- macOS/Linux users get notification to download manually

### Manual Steps (if script fails)

See CLAUDE.md → "Publishing a new release" → Option B

---

## 2. Updating Tariff Prices (Annual Price Increases)

**When:** January 1st (when medical aids publish new rates)  
**Frequency:** Once per year + ad-hoc corrections

### Method A: Update Cloud Price Lists (Recommended)

**Users get updates automatically without new app release.**

```bash
# 1. Navigate to PriceLists repo
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab-PriceLists

# 2. Edit Tariffs-2027.csv in Excel or Numbers
# Columns: UserCode, TariffCode, Description, DescriptionAFR, Category, Measure, Price
# 364 rows (one per tariff code)

# 3. Update version.json
nano version.json
# Change:
# - "version": "2027.2" (increment)
# - "releaseDate": "2027-01-01"
# - "tariffs.changes": "2027 annual price increase"

# 4. Commit and push
git add -A
git commit -m "v2027.2: 2027 annual price increase"
git push origin main
```

**What happens:**
- All users see yellow "New price updates available" banner on startup
- Click "View Changes" → see diff (Added/Updated/Removed codes)
- Click "Apply Update" → prices updated
- App creates automatic backup before applying

**No app reinstall needed!**

### Method B: Update Embedded Tariffs (Emergency Only)

**Requires new app release.**

```bash
# 1. Navigate to desktop app
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab/EasyDentalLab-Desktop

# 2. Replace embedded CSV
# Edit: renderer-new/src/constants/embeddedTariffs.ts
# Or: Place Tariffs.csv in backup folder (app loads on startup)

# 3. Increment version and publish
npm version patch --no-git-tag-version
# Update APP_VERSION in initialData.ts
./publish-release.sh
```

**Use this only if PriceLists repo is unavailable.**

---

## 3. Updating Medical Aids List

**When:** New medical aid launches, plan names change  
**Frequency:** As needed

### Method A: Update Cloud Medical Aids (Recommended)

```bash
# 1. Navigate to PriceLists repo
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab-PriceLists

# 2. Edit MedicalAids-2027.csv in Excel
# Format: Two columns (MedicalAid, Plan)
# Example:
#   Discovery Health,KeyCare Plus
#   Discovery Health,Classic Smart
#   Bonitas,BonCap
#   Bonitas,BonEssential

# 3. Update version.json
nano version.json
# Change "version": "2027.2" and add description

# 4. Commit and push
git add -A
git commit -m "v2027.2: Added new medical aid - XYZ Healthcare"
git push origin main
```

**Users get update notification same as tariffs.**

### Method B: Users Add via App UI

**No code change needed!**

Users can add medical aids directly:
1. Open app → Medical Aids page (💊 icon)
2. Click "+ Add Medical Aid"
3. Enter name (e.g., "Discovery Health")
4. Click "+ Add Plan" for each plan (e.g., "KeyCare Plus")
5. Click "Add"

**This is per-user, not global.** For global updates, use Method A.

---

## 4. Handling Received CSV Files

**Scenario:** Client sends you updated Tariffs.csv or MedicalAids.csv

### Option 1: Quick Update (Cloud Method)

```bash
# 1. Receive CSV file (e.g., Tariffs-2027-Updated.csv)

# 2. Copy to PriceLists repo
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab-PriceLists
cp ~/Downloads/Tariffs-2027-Updated.csv Tariffs-2027.csv

# 3. Verify format in Excel
# Required columns: UserCode, TariffCode, Description, DescriptionAFR, Category, Measure, Price

# 4. Update version.json
nano version.json
# Increment version + add change notes

# 5. Push to GitHub
git add -A
git commit -m "v2027.X: Updated tariffs from client"
git push origin main
```

**All users get update within 24 hours** (app checks daily on startup).

### Option 2: Embed in App (Offline Users)

```bash
# 1. Copy CSV to desktop app assets
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab/EasyDentalLab-Desktop
cp ~/Downloads/Tariffs-2027-Updated.csv renderer-new/src/assets/Tariffs.csv

# 2. Update embedded data (if using TypeScript constants)
# Edit: renderer-new/src/constants/embeddedTariffs.ts
# Paste CSV content

# 3. Publish new app version
npm version patch --no-git-tag-version
# Update APP_VERSION
./publish-release.sh
```

**Users get update via app auto-update** (blue download banner).

---

## 5. Emergency Rollback

**Scenario:** Bad update pushed, users reporting issues

### Rollback Cloud Prices

```bash
cd /Users/sarelroeloffze/Library/CloudStorage/Dropbox/AAA\ Claud/EasyDentalLab-PriceLists

# Find last good version
git log --oneline

# Revert to previous version
git revert HEAD
git push origin main

# Or hard reset (dangerous)
git reset --hard HEAD~1
git push --force origin main
```

### Rollback App Version

**Users on bad version:**
1. Delete GitHub Release (bad version)
2. Publish new fixed version
3. Users auto-update to fixed version

**Users not yet updated:**
- They won't see the bad version (deleted from releases)

---

## 📂 File Locations Reference

### Main App Files
```
EasyDentalLab/
├── EasyDentalLab-Desktop/              # Desktop app source
│   ├── renderer-new/                   # TypeScript source
│   │   ├── src/
│   │   │   ├── constants/
│   │   │   │   ├── initialData.ts      # APP_VERSION here
│   │   │   │   └── embeddedTariffs.ts  # Embedded CSV data
│   │   │   └── utils/
│   │   │       └── priceUpdates.ts     # Cloud update logic
│   │   └── package.json                # Version number
│   ├── build/                          # Installers output
│   └── publish-release.sh              # Automated publish script
└── CLAUDE.md                           # Full documentation
```

### Price Lists Repo
```
EasyDentalLab-PriceLists/
├── Tariffs-2027.csv         # 364 tariff codes
├── MedicalAids-2027.csv     # Medical aids with plans
└── version.json             # Update metadata
```

---

## ⚠️ Important Rules

### ALWAYS
- ✅ Test price updates locally before pushing to GitHub
- ✅ Increment version.json when updating CSVs
- ✅ Keep CSV format consistent (don't rename columns)
- ✅ Commit with clear messages (e.g., "v2027.2: Annual price increase")
- ✅ Update CLAUDE.md after app releases (automated by publish script)

### NEVER
- ❌ Push untested CSVs to PriceLists repo (users auto-download)
- ❌ Delete old GitHub Releases (breaks auto-update for users on old versions)
- ❌ Edit version.json without updating CSV files
- ❌ Force-push to main branch (breaks user update checks)
- ❌ Change CSV column order/names (breaks parsing)

---

## 🆘 Quick Troubleshooting

**Problem:** Users not seeing price updates  
**Solution:** Check GitHub PriceLists repo is public + version.json incremented

**Problem:** App update stuck on "Downloading..."  
**Solution:** Check GitHub Release has all 3 files (.exe, .exe.blockmap, latest.yml)

**Problem:** CSV import shows errors  
**Solution:** Verify CSV has UTF-8 encoding + correct column headers

**Problem:** Price update shows "No changes"  
**Solution:** version.json version must be > TARIFFS_VERSION in app code

---

## 📞 Support

**App crashes?** Check DevTools console (Help menu → Toggle Developer Tools)  
**Update not working?** Force check: Restart app (triggers update check in 5 sec)  
**Lost data?** Check backup folder → EasyDentalLab-backup.json  
**GitHub issues?** https://github.com/sarelroeloffze/EasyDentalLab/issues

---

**End of Guide**
