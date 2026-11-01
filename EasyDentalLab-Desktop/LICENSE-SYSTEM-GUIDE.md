# License System - Complete Guide

Complete step-by-step guide for managing the EasyDentalLab license system.

---

## Table of Contents

1. [How the System Works](#how-the-system-works)
2. [Generating Your Master Key Pair](#generating-your-master-key-pair)
3. [Activating the License Gate](#activating-the-license-gate)
4. [Creating Trial Licenses for Testers](#creating-trial-licenses-for-testers)
5. [Creating Full Licenses for Customers](#creating-full-licenses-for-customers)
6. [Testing the License System](#testing-the-license-system)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## How the System Works

### Overview

The license system uses **Ed25519 cryptographic signatures** to ensure licenses can't be forged:

1. You generate a **key pair** (public + private)
2. **Public key** goes in the app (everyone has it)
3. **Private key** stays with you (NEVER share it)
4. You sign license payloads with your private key
5. App verifies signatures using the public key

**Key Features:**
- ✅ Fully offline (no internet required)
- ✅ Cryptographically secure (Ed25519)
- ✅ Trial licenses with expiry dates
- ✅ Full licenses (no expiry)
- ✅ Hard lockout when trial expires

### License Key Format

```
PAYLOAD_B64URL.SIGNATURE_B64URL
```

**Payload Example:**
```json
{
  "email": "customer@example.com",
  "type": "trial",           // or "full"
  "expires": "2027-02-28",   // ISO date (trials only)
  "app": "EasyDentalLab",
  "version": "3.0"           // optional
}
```

**What Users See:**
```
eyJlbWFpbCI6ImN1c3RvbWVyQGV4YW1wbGUuY29tIiwidHlwZSI6InRyaWFsIiwiZXhwaXJlcyI6IjIwMjctMDItMjgiLCJhcHAiOiJFYXN5RGVudGFsTGFiIn0.xJ3kR9mP5vQ8wL2nB7cA4dF6gH1jI0kL3mN5oP8qR9sT0uV1wX2yZ3aB4cC5dD6eE7fF8gG9hH0iI1jJ2kK3lL4m
```

---

## Generating Your Master Key Pair

### Step 1: Open Key Generator

**Location:** `license/keyGenerator.html`

```bash
# Open in browser
open license/keyGenerator.html

# Or drag & drop into Chrome/Edge/Firefox
```

### Step 2: Generate Keys

1. Click **"Generate New Key Pair"** button
2. Two text boxes will fill with keys:

   **Public Key** (64 characters, base64url)
   ```
   MCowBQYDK2VwAyEAXyz123...abc (safe to share)
   ```

   **Private Key** (88 characters, base64url)
   ```
   MC4CAQAwBQYDK2VwBCIEIG...xyz (NEVER SHARE THIS)
   ```

### Step 3: Save Private Key Securely

⚠️ **CRITICAL:** Your private key is the master secret. If lost, you can't sign licenses. If stolen, anyone can create valid licenses.

**Save to encrypted location:**

**Option A: Password Manager**
```
1. Open 1Password / Bitwarden / LastPass
2. Create new Secure Note
3. Title: "EasyDentalLab Master Private Key"
4. Paste private key
5. Add tag: "NEVER_SHARE"
```

**Option B: Encrypted File**
```bash
# macOS (encrypted disk image)
hdiutil create -encryption AES-256 -size 1m -fs HFS+ -volname "EdlKeys" ~/Desktop/edl-keys.dmg
# Mount and save private key as text file inside

# Windows (BitLocker encrypted USB)
# Right-click USB drive → Turn on BitLocker
# Save private key to encrypted USB
```

**Option C: Paper Backup**
```
1. Print private key on paper
2. Store in fireproof safe or safety deposit box
3. Write date and "EasyDentalLab Master Private Key - NEVER SHARE"
```

### Step 4: Copy Public Key

Copy the **public key** (top box) — you'll need it in the next section.

---

## Activating the License Gate

Currently the license gate is **INACTIVE** (placeholder public key). Follow these steps to activate it.

### Step 1: Update Public Key in Code

**File:** `renderer-new/src/constants/license.ts`

**Find this line:**
```typescript
export const LICENSE_PUBLIC_KEY_B64 = 'REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR';
```

**Replace with your real public key:**
```typescript
export const LICENSE_PUBLIC_KEY_B64 = 'MCowBQYDK2VwAyEAXyz123abc...'; // Your actual public key
```

### Step 2: Update Support Email (Optional)

**Same file (`license.ts`):**
```typescript
export const SUPPORT_EMAIL = 'sarel@roeloffze.com'; // Change if needed
```

This email appears in:
- License entry screen ("Contact support")
- Trial expired screen ("Contact support")
- Trial banner ("Contact to purchase")

### Step 3: Build and Test

```bash
cd EasyDentalLab-Desktop

# Build renderer (TypeScript → JavaScript)
cd renderer-new
npm run build
cd ..

# Test locally
npm start
```

**Expected behavior:**
- App shows license entry screen (full-screen modal)
- No way to access app without valid key
- Placeholder key won't work anymore

### Step 4: Publish Release

```bash
# Automated multi-platform build + publish
./publish-release.sh
```

This creates:
- Windows installer (`EasyDentalLab.Setup.3.0.93.exe`)
- macOS installer (`EasyDentalLab-3.0.93-arm64.dmg`)
- Linux AppImage (`EasyDentalLab-3.0.93.AppImage`)
- GitHub Release with all installers

**Auto-update:** Existing users will get update notification on next app launch.

---

## Creating Trial Licenses for Testers

### Use Case: 30-day trial for new tester

### Step 1: Open Key Generator

```bash
open license/keyGenerator.html
```

### Step 2: Paste Private Key

**Bottom text box** (labeled "Private Key for Signing"):
```
Paste your saved private key here
```

### Step 3: Fill License Details

**Email:**
```
tester@dentallab.co.za
```

**License Type:**
```
Select: trial
```

**Expires (ISO date):**
```
2027-02-28
```

**How to calculate expiry date:**
```bash
# macOS/Linux - 30 days from today
date -v +30d +%Y-%m-%d

# Or use online calculator
# https://www.timeanddate.com/date/dateadd.html
```

**App Name:**
```
EasyDentalLab  (MUST match exactly)
```

**Version (optional):**
```
3.0  (leave blank for any version)
```

### Step 4: Sign Key

Click **"Sign Key"** button.

**Output appears in text box:**
```
eyJlbWFpbCI6InRlc3RlckBkZW50YWxsYWIuY28uemEiLCJ0eXBlIjoidHJpYWwiLCJleHBpcmVzIjoiMjAyNy0wMi0yOCIsImFwcCI6IkVhc3lEZW50YWxMYWIifQ.xJ3kR9mP5vQ8wL2nB7cA4dF6gH1jI0kL3mN5oP8qR9sT0uV1wX2yZ3aB4cC5dD6eE7fF8gG9hH0iI1jJ2kK3lL4m
```

### Step 5: Send to Tester

**Email template:**
```
Subject: EasyDentalLab - 30 Day Trial License

Hi [Name],

Thank you for testing EasyDentalLab!

Your 30-day trial license key:

eyJlbWFpbCI6InRlc3RlckBkZW50YWxsYWIuY28uemEiLCJ0eXBlIjoidHJpYWwiLCJleHBpcmVzIjoiMjAyNy0wMi0yOCIsImFwcCI6IkVhc3lEZW50YWxMYWIifQ.xJ3kR9mP5vQ8wL2nB7cA4dF6gH1jI0kL3mN5oP8qR9sT0uV1wX2yZ3aB4cC5dD6eE7fF8gG9hH0iI1jJ2kK3lL4m

Licensed to: tester@dentallab.co.za
Expires: 2027-02-28

Installation:
1. Download EasyDentalLab from [link]
2. Install and open the app
3. Copy-paste your license key when prompted
4. Click "Activate License"

Your trial includes:
- Full access to all features
- No limitations
- 30 days from today

After trial expires:
- App will lock (no data loss)
- Option to export your data
- Contact me to purchase full license

Questions? Reply to this email.

Best regards,
Sarel
sarel@roeloffze.com
```

### Trial Timeline

**Days 30-15:** Blue banner ("Trial: X days remaining")
**Days 14-8:** Orange banner ("⚠️ Trial expires in X days")
**Days 7-1:** Red banner ("🔴 Trial expires in X days!")
**Day 0:** Hard lockout screen (enter new license or uninstall)

---

## Creating Full Licenses for Customers

### Use Case: Permanent license after payment

### Step 1: Open Key Generator

```bash
open license/keyGenerator.html
```

### Step 2: Paste Private Key

Paste your saved private key in bottom text box.

### Step 3: Fill License Details

**Email:**
```
customer@dentallab.co.za
```

**License Type:**
```
Select: full  ← Important!
```

**Expires:**
```
Leave blank (full licenses never expire)
```

**App Name:**
```
EasyDentalLab
```

**Version (optional):**
```
Leave blank (works for all versions)
```

### Step 4: Sign Key

Click **"Sign Key"**.

**Output:**
```
eyJlbWFpbCI6ImN1c3RvbWVyQGRlbnRhbGxhYi5jby56YSIsInR5cGUiOiJmdWxsIiwiYXBwIjoiRWFzeURlbnRhbExhYiJ9.aB2cD3eF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4aA5bB6cC7dD8eE9fF0g
```

### Step 5: Send to Customer

**Email template:**
```
Subject: EasyDentalLab - Full License Key

Hi [Name],

Thank you for purchasing EasyDentalLab!

Your full license key:

eyJlbWFpbCI6ImN1c3RvbWVyQGRlbnRhbGxhYi5jby56YSIsInR5cGUiOiJmdWxsIiwiYXBwIjoiRWFzeURlbnRhbExhYiJ9.aB2cD3eF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4aA5bB6cC7dD8eE9fF0g

Licensed to: customer@dentallab.co.za
License Type: FULL (never expires)

Installation:
1. Download latest version: [GitHub releases link]
2. Install and open EasyDentalLab
3. Paste your license key when prompted
4. Click "Activate License"

This is a permanent license:
- ✓ No expiry date
- ✓ All future updates included
- ✓ All features unlocked
- ✓ Use on one computer

Important:
- Keep this email safe
- Don't share your license key
- Each license is for single-computer use

Support: sarel@roeloffze.com

Best regards,
Sarel
```

**Full license behavior:**
- No trial banner
- No expiry warnings
- Normal app experience
- Works forever

---

## Testing the License System

### Test 1: First-Time Entry (No License)

**Steps:**
1. Build fresh app: `npm run build` (in renderer-new)
2. Clear localStorage: Open DevTools → Application → Local Storage → Clear All
3. Start app: `npm start` (in EasyDentalLab-Desktop)

**Expected:**
- ✅ Full-screen license entry modal
- ✅ No sidebar visible
- ✅ No close/escape buttons
- ✅ "EasyDentalLab" title
- ✅ "Paste your license key here..." textarea
- ✅ "Activate License" button disabled until text entered

### Test 2: Invalid License Key Rejection

**Steps:**
1. Enter random text: `invalid-key-123`
2. Click "Activate License"

**Expected:**
- ❌ Red error box appears
- ❌ "Malformed license key. Expected format: PAYLOAD.SIGNATURE"
- ✅ Still on entry screen (not activated)

### Test 3: Valid Trial License (30 days)

**Steps:**
1. Generate trial key (expires 30 days from now)
2. Paste key and click "Activate License"

**Expected:**
- ✅ Entry screen disappears
- ✅ Normal app loads (sidebar, dashboard)
- ✅ Blue banner at top: "ℹ️ Trial: 30 days remaining"
- ✅ Banner shows expiry date
- ✅ "Dismiss" button hides banner
- ✅ App works normally

### Test 4: Trial Warning States

**Create 3 trial keys with different expiry dates:**

**14 days remaining:**
```
expires: [today + 14 days]
```
**Expected:** Orange banner ("⚠️ Trial expires in 14 days")

**7 days remaining:**
```
expires: [today + 7 days]
```
**Expected:** Red banner ("🔴 Trial expires in 7 days!")

**1 day remaining:**
```
expires: [today + 1 day]
```
**Expected:** Red banner ("🔴 Trial expires in 1 day!")

### Test 5: Expired Trial Lockout

**Steps:**
1. Generate trial key with past expiry: `"expires": "2020-01-01"`
2. Enter key and click "Activate License"

**Expected:**
- ❌ Red error box: "This license key has expired. Please contact support for a renewal."
- ✅ Still on entry screen

**Alternative test (expired key already stored):**
1. Manually edit localStorage: set expires to yesterday
2. Restart app

**Expected:**
- 🔒 Full-screen lockout screen
- 🔒 "Trial License Expired" title
- 🔒 Shows expiry date
- 🔒 Shows email from payload
- 🔒 "New License Key" textarea
- 🔒 "Export Data" button works
- 🔒 "Uninstall" button works (confirms first)
- 🔒 No close/escape

### Test 6: Full License (No Expiry)

**Steps:**
1. Generate full license (`"type": "full"`, no expires field)
2. Paste and activate

**Expected:**
- ✅ App loads normally
- ✅ NO banner visible
- ✅ No expiry warnings
- ✅ Full access to all features

### Test 7: License Persistence

**Steps:**
1. Activate valid license (trial or full)
2. Close app
3. Reopen app

**Expected:**
- ✅ App loads directly (no entry screen)
- ✅ License still valid
- ✅ Same behavior (banner if trial, no banner if full)

### Test 8: Data Export from Lockout

**Steps:**
1. Get to lockout screen (expired trial)
2. Click "📦 Export Data" button

**Expected:**
- ✅ File download starts
- ✅ Filename: `EasyDentalLab-backup-YYYY-MM-DD.json`
- ✅ File contains full app data (invoices, clients, settings)
- ✅ Valid JSON format

### Test 9: Uninstall from Lockout

**Steps:**
1. Get to lockout screen
2. Click "🗑️ Uninstall" button

**Expected:**
- ✅ Confirmation dialog: "This will uninstall EasyDentalLab..."
- ✅ Warning: "Export your data first"
- ✅ If confirmed: app quits
- ✅ Windows: Uninstaller runs automatically
- ✅ macOS: App moves to Trash
- ✅ Linux: App quits (manual AppImage delete)

---

## Troubleshooting

### Problem: "Invalid license signature" error

**Cause:** Public key in app doesn't match private key used for signing.

**Fix:**
1. Check `renderer-new/src/constants/license.ts`
2. Verify public key matches the one from your key pair
3. Rebuild app: `npm run build`
4. Re-sign license with matching private key

### Problem: "License key is not for EasyDentalLab"

**Cause:** Payload `app` field doesn't match `APP_NAME` constant.

**Fix:**
1. Check payload: `"app": "EasyDentalLab"` (case-sensitive!)
2. Check `renderer-new/src/constants/license.ts`: `APP_NAME = 'EasyDentalLab'`
3. Must match exactly (no spaces, correct capitalization)

### Problem: Trial shows as expired immediately

**Cause:** System clock wrong, or expires date in past, or timezone mismatch.

**Fix:**
1. Check computer date/time: System Preferences → Date & Time
2. Check expires field in payload (use ISO format: `YYYY-MM-DD`)
3. Use UTC dates (no timezone component)
4. Example: `"expires": "2027-12-31"`

### Problem: License key won't paste into textarea

**Cause:** Whitespace or line breaks in key.

**Fix:**
1. Copy key from key generator directly (single line)
2. Or manually remove line breaks: Replace `\n` with nothing
3. Key should be one continuous string (no spaces at start/end)

### Problem: "Malformed license key" error

**Cause:** Key doesn't have exactly one `.` separating payload and signature.

**Fix:**
1. Check format: `PAYLOAD.SIGNATURE`
2. No extra dots
3. No missing dots
4. Base64url encoded (no `+` `/` `=` characters, uses `-` `_` instead)

### Problem: DevTools show "SharedArrayBuffer" type error

**Cause:** WebCrypto API type mismatch in TypeScript.

**Status:** ✅ Already fixed in utils/license.ts with `.buffer as ArrayBuffer` casts

### Problem: App shows entry screen even with valid key in localStorage

**Cause:** License validation failing silently.

**Debug:**
1. Open DevTools (F12 or View → Toggle Developer Tools)
2. Check Console for errors
3. Check Application → Local Storage → `edl_license_key` value
4. Manually test key in key generator validator

### Problem: Uninstall button does nothing on Windows

**Cause:** Uninstaller path not found.

**Debug:**
1. Check main.js IPC handler logs
2. Verify uninstaller exists: `%LOCALAPPDATA%\Programs\easydentallab\Uninstall EasyDentalLab.exe`
3. If missing, reinstall app first

---

## Security Best Practices

### Protecting Your Private Key

**DO:**
- ✅ Store in password manager (1Password, Bitwarden)
- ✅ Keep encrypted backup (disk image, BitLocker USB)
- ✅ Print paper backup in fireproof safe
- ✅ Treat like a bank password

**DON'T:**
- ❌ Commit to Git
- ❌ Email to anyone
- ❌ Store in Dropbox/Google Drive unencrypted
- ❌ Keep in plain text file on Desktop
- ❌ Share with anyone (even testers/customers)

### If Private Key is Compromised

**Immediate actions:**
1. Generate NEW key pair
2. Update public key in app
3. Publish new release (v3.0.94)
4. Email all customers new license keys
5. Old keys still work on old app versions (no revocation system)

**Long-term fix:**
- Implement online revocation system (validate.php backend)
- Check license against server on startup
- Requires internet connection (breaks offline validation)

### One License Per Customer

**Current implementation:**
- ✅ License key works on any computer
- ❌ No hardware binding
- ❌ No multi-computer detection

**To enforce single-computer:**
- Add hardware ID to payload (MAC address, CPU ID)
- Check hardware ID on activation
- Reject if different computer
- Requires code changes

### License Renewal Strategy

**Trial Conversion:**
1. Tester's trial expires (lockout screen)
2. They contact you to purchase
3. You generate full license with same email
4. They enter new key (unlocks app)
5. All data preserved

**Annual Renewals (Optional):**
1. Generate full licenses with expires field: `"expires": "2028-12-31"`
2. App locks on expiry
3. Customer renews (payment)
4. You generate new key for next year
5. Recurring revenue model

**Current system default:** Full licenses never expire (perpetual).

---

## Quick Reference

### Common Commands

```bash
# Build renderer
cd renderer-new && npm run build && cd ..

# Test locally
npm start

# Publish release (automated)
./publish-release.sh

# Generate trial (30 days)
date -v +30d +%Y-%m-%d

# Clear localStorage for testing
# DevTools → Application → Local Storage → Right-click → Clear
```

### License States Cheat Sheet

| State | Screen | Banner | Access |
|-------|--------|--------|--------|
| No key | LicenseEntryScreen | None | 🔒 Blocked |
| Invalid key | LicenseEntryScreen | None | 🔒 Blocked |
| Expired trial | LicenseExpiredScreen | None | 🔒 Blocked |
| Trial (30-15 days) | Normal app | Blue | ✅ Full |
| Trial (14-8 days) | Normal app | Orange | ✅ Full |
| Trial (≤7 days) | Normal app | Red | ✅ Full |
| Full license | Normal app | None | ✅ Full |

### File Locations

```
EasyDentalLab-Desktop/
├── license/
│   └── keyGenerator.html          ← Generate keys here
├── renderer-new/src/
│   ├── constants/
│   │   └── license.ts             ← Update PUBLIC_KEY here
│   ├── components/license/
│   │   ├── LicenseEntryScreen.tsx
│   │   ├── LicenseExpiredScreen.tsx
│   │   └── TrialStatusBanner.tsx
│   ├── utils/
│   │   └── license.ts             ← Validation logic
│   └── types/
│       └── license.ts             ← Type definitions
└── main.js                        ← Uninstall IPC handler
```

---

## Support

**Questions about license system?**
- Read CLAUDE.md → "License System" section
- Check this guide's Troubleshooting section
- Email: sarel@roeloffze.com

**Key management emergencies:**
- Private key lost → Generate new pair, re-issue all licenses
- Private key stolen → Generate new pair, publish new release
- Public key wrong in app → Update license.ts, rebuild, publish

---

**Last Updated:** 2026-11-01
**System Version:** v3.0.93
**License System:** Ed25519 cryptographic signatures
**Status:** ✅ Fully implemented, ready for activation
