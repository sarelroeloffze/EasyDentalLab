# EasyDentalLab

Portable single-file dental laboratory invoicing application for South African dental labs.

## Standing Instructions (always follow)

- **After every code change**: update the relevant Help topic(s) in `HelpSection` to reflect the change.
- **After every code change**: update this CLAUDE.md file — add/update the feature in the appropriate section, fix any line numbers that shifted, and add a row to the Bug Fixes / Features table if applicable.
- These two rules apply automatically — the user does not need to ask each time.

## 🎯 PROJECT STATUS (Updated 2026-06-05)

### Current Version: Desktop App v2.1.2 + Web App v1.7 (Production-Ready)
**Status:** ✅ **PHASE 2 COMPLETE** — Desktop installers built, app is production-ready

### Completed Work
- ✅ **Phase 1: Critical Data Safety Fixes** (May 14-15, 2026)
  - Payments backup added (Payments.csv now written to backup folder)
  - Backup failure notifications (toast alerts on error)
  - Exit warning on pending backup (beforeunload handler)
  - Optional AES-256 backup encryption (Settings → Backup Security)
  - **Result:** Web version is now GDPR/POPIA compliant and production-ready

- ✅ **Phase 2: Desktop Compilation** (May 17, 2026 — completed in 1.5 hours)
  - Electron 28.3.3 project created in `EasyDentalLab-Desktop/`
  - File System Access API → Electron IPC + Node.js `fs` (complete rewrite)
  - CDN libraries → Local vendor files (React, Babel, jsPDF — 100% offline)
  - `main.js` (Node.js) + `preload.js` (IPC bridge) + `renderer/index.html` (React UI)
  - **Installers built:** Windows (76 MB), macOS ARM64 (90 MB), Linux ARM64 (100 MB)
  - **Result:** Standalone desktop app, no browser dependency, native file system access

- ✅ **v2.1.0 Update** (June 5, 2026)
  - Discount feature added (invoices + estimates, 0-100%, default 15%)
  - Fixed 16 tariff codes with malformed Afrikaans descriptions
  - Desktop installers rebuilt with latest features
  - **Result:** Feature parity between web v1.6 and desktop v2.1.0

- ✅ **v2.1.1 Update** (June 5, 2026)
  - Automatic version upgrade detection system
  - Yellow notification banner prompts users to update tariffs on app upgrade
  - Manual "Reload Default Tariffs" button in Settings
  - Eliminates localStorage cache issue when upgrading
  - **Result:** Users automatically get latest tariff data on upgrade

- ✅ **v2.1.2 Update** (June 5, 2026)
  - Fixed version display (sidebar now shows dynamic version, not hardcoded "v1.0")
  - Added Afrikaans description column to Tariffs table (makes Afrikaans descriptions visible/editable)
  - Fixed tariff code 9722 description split: English "Acrylic, per denture" / Afrikaans "Akriel, per gebit"
  - **Result:** UI polish fixes for better usability

### Available Installers (v2.1.2)
**Location:** `EasyDentalLab-Desktop/build/`

| Platform | File | Size | Architecture |
|----------|------|------|--------------|
| **Windows** | `EasyDentalLab Setup 2.1.2.exe` | 76 MB | ARM64 |
| **macOS** | `EasyDentalLab-2.1.2-arm64.dmg` | 90 MB | ARM64 (M1/M2/M3) |
| **Linux** | `EasyDentalLab-2.1.2-arm64.AppImage` | 100 MB | ARM64 |

**Notes:**
- macOS: Ad-hoc signed (no Apple Developer cert) — "unidentified developer" warning expected
- Windows: Unsigned (no code signing cert) — SmartScreen warning expected
- Icons: Electron defaults (placeholder — not dental-themed)
- Architecture: ARM64 only (built on Apple Silicon — x64 requires rebuild on Intel machine)

**See:** `EasyDentalLab-Desktop/INSTALLERS-README.md` for installation instructions & troubleshooting

### Next Phase: Production Deployment (Optional)
**Status:** 🎯 **READY FOR USERS** — App is fully functional

**Optional improvements:**
- [ ] Replace placeholder icons with branded dental icons
- [ ] Get Apple Developer certificate ($99/year) for macOS code signing
- [ ] Get Windows code signing certificate (~$200/year) for SmartScreen bypass
- [ ] Build x64 versions for Intel Macs and older Windows PCs
- [ ] Arm license gate (replace placeholder public key in `renderer/index.html`)
- [ ] Distribute via GitHub Releases or direct download

---

## Architecture

### Web Version (EasyDentalLab.html)
- **Single HTML file** (`EasyDentalLab.html`, ~3600 lines) — the entire app
- **React 18** via CDN with **Babel standalone** for JSX transpilation (no build tools)
- **Tailwind CSS** via CDN for utility classes
- **jsPDF + jspdf-autotable** via CDN for PDF generation (WhatsApp share + Direct Claiming)
- **localStorage** for all data persistence (auto-saved via `useEffect` on every state change); also stores `edl_dark` key for theme preference
- **CSS custom properties** (`--c-bg`, `--c-surface`, `--c-text1` … etc.) drive the colour theme; toggling `html.dark` class switches all tokens to dark values
- **File System Access API** for auto-backup of CSV/JSON files and Direct Claiming PDFs to a user-selected folder (Chrome/Edge only)
- **Ed25519 license system** (lines 13–75) — cryptographic key validation via WebCrypto API; currently bypassed (placeholder public key); arms when real key pair is generated

### Desktop Version (EasyDentalLab-Desktop/)
- **Electron 28.3.3** — three-process architecture (main + preload + renderer)
- **Main process** (`main.js`) — Node.js with native file system access (IPC handlers for folder selection, file read/write)
- **Preload script** (`preload.js`) — secure context bridge exposing `window.electronAPI` to renderer
- **Renderer process** (`renderer/index.html`) — React 18 UI (same code as web version, File System API calls replaced with IPC)
- **Vendor libraries** (local) — React, Babel, jsPDF bundled in `renderer/vendor/` for offline operation
- **Persistent folder selection** — Config file in `app.getPath('userData')` stores backup folder path across restarts
- **localStorage** for data (same as web version) — localStorage works natively in Electron
- **All features identical** to web version except file system access (native vs. browser API)

## Version Control

- **Git**: v2.50.1, global config: Sarel Roeloffze / sarel@roeloffze.com, default branch `main`
- **GitHub repo**: https://github.com/sarelroeloffze/EasyDentalLab (private)
- **GitHub CLI**: `gh` v2.90.0 installed via Homebrew (`/opt/homebrew`), authenticated as `sarelroeloffze`
- **First commit**: `3cbb0d4` — "Initial commit — EasyDentalLab v1.0"
- **Tracked files**: `EasyDentalLab.html`, `CLAUDE.md`, `PHASE2-DESKTOP-PLAN.md`, `PROJECT-STATUS.md`, `Tariffs.csv`, `claude_server.py`, `license/`, `EasyDentalLab-Desktop/` (desktop source code)
- **Excluded** (`.gitignore`): `Clients.csv`, `Macros.csv`, `Payments.csv`, `MedicalAids.csv`, `EasyDentalLab-backup.json`, `EasyDentalLab-backup.encrypted`, `Send to Direct Claiming/`, `EasyDentalLab-Desktop/node_modules/`, `EasyDentalLab-Desktop/build/`, `.claude/`, `Team/`, `Team Inbox/`, `Owner's Inbox/`
- **Purpose**: Track every app change; versioned releases; desktop installers built from source

## File Structure

### Web Version (Working Directory)
```
EasyDentalLab/
├── EasyDentalLab.html               # Web app (single file, self-contained)
├── Clients.csv                       # Auto-backed-up client/dentist data
├── Tariffs.csv                       # Auto-backed-up tariff codes with Afrikaans translations
├── Macros.csv                        # Auto-backed-up macro definitions
├── Payments.csv                      # Auto-backed-up payment allocations & receipts (CRITICAL: prevents data loss)
├── MedicalAids.csv                   # Medical aid names for dropdown — edit in Excel to customise list
├── EasyDentalLab-backup.json         # Full auto-backup (invoices, estimates, settings, everything) — plain text if no password set
├── EasyDentalLab-backup.encrypted    # Encrypted backup (replaces .json file when password is set in Settings)
├── Send to Direct Claiming/          # Auto-created subfolder — PDF copies of claimed invoices
│   └── Invoice_XXX.pdf
├── license/                          # Developer-only license tools (DO NOT ship to end users)
│   ├── keyGenerator.html             # Generate key pairs + sign license keys
│   ├── licenseValidator.js           # Validator logic (also inlined in EasyDentalLab.html)
│   └── validate.php                  # Optional backend revocation endpoint (reference only)
├── CLAUDE.md                         # This file
├── PHASE2-DESKTOP-PLAN.md            # Phase 2 technical specification
├── PROJECT-STATUS.md                 # Project status tracking
└── EasyDentalLab-Desktop/            # Desktop app (Electron) — see below
```

### Desktop Version (EasyDentalLab-Desktop/)
```
EasyDentalLab-Desktop/
├── package.json                      # npm project config + electron-builder settings
├── electron-builder.yml              # Build configuration (Windows/Mac/Linux targets)
├── main.js                           # Electron main process (Node.js + IPC handlers)
├── preload.js                        # Context bridge (secure IPC exposure to renderer)
├── renderer/
│   ├── index.html                    # React UI (modified from EasyDentalLab.html)
│   └── vendor/                       # Bundled libraries (offline operation)
│       ├── react.production.min.js
│       ├── react-dom.production.min.js
│       ├── babel-standalone.min.js
│       ├── jspdf.umd.min.js
│       └── jspdf-autotable.min.js
├── resources/                        # App icons (placeholder)
│   └── ICON-PLACEHOLDER.txt
├── build/                            # electron-builder output
│   ├── EasyDentalLab Setup 2.0.0.exe         # Windows installer (76 MB)
│   ├── EasyDentalLab-2.0.0-arm64.dmg         # macOS installer (90 MB)
│   ├── EasyDentalLab-2.0.0-arm64.AppImage    # Linux installer (100 MB)
│   └── easydentallab_2.0.0_arm64.deb         # Linux .deb (broken, use AppImage)
├── INSTALLERS-README.md              # Installation instructions & troubleshooting
└── node_modules/                     # npm dependencies (Electron 28, electron-builder 24)
```

## Key Data Structures

All data stored under localStorage key `"easydentallab_data"`:

- **profile** — Business name, address, phone, email, VAT number/%, laboratory number, PCNS, bank details, logo (base64), layout settings
- **clients[]** — Dentists/practices with name, practice, contact info, PCNS, address
- **tariffs[]** — Tariff codes with English + Afrikaans descriptions, prices, categories; each tariff has `code` (User Code — internal/invoice) and `tariffCode` (medical aid billing code — defaults to `code` if blank; 8xxx codes default to `"9736"`)
- **macros[]** — Named groups of tariff codes for quick invoice creation
- **invoices[]** — Invoices with client ref, patient/member details, line items, status (paid/unpaid), claimed flag
- **estimates[]** — Same structure as invoices, can be converted to invoice
- **categories[]** — Tariff categories
- **nextInvoiceNo** / **nextEstimateNo** — auto-incrementing counters

### Invoice Object Shape

```javascript
{
  id: string,
  number: number,
  clientId: string,
  clientName: string,
  date: "YYYY-MM-DD",
  patientTitle: string,
  patientSurname: string,
  patientName: string,
  memberName: string,
  medicalAidName: string,
  medicalAidNumber: string,
  lang: "en" | "af",
  items: [{ id, code, tariffCode, description, qty, price }],
                               // code = User Code (internal); tariffCode = billing code printed on invoice/PDF
                               // tariffCode || code is always used for print output; code used internally
  notes: string,
  total: number,               // VAT-inclusive sum of all line items — always stored
  status: "unpaid" | "paid",
  paidDate: "YYYY-MM-DD" | null,
  claimed: boolean,            // true = Direct Claim to medical aid
  claimedDate: "YYYY-MM-DD" | null,
  estimateRef: number | null   // set when converted from an estimate
}
```

### Total / Aging Fallback

`inv.total` is always saved when an invoice is created or edited. For safety, `getClientAging()` and the Dashboard outstanding stat both fall back to computing the total from line items if `inv.total` is somehow undefined:
```javascript
const amount = inv.total != null
  ? inv.total
  : (inv.items||[]).reduce((s,i) => s + (parseFloat(i.qty)||0) * (parseFloat(i.price)||0), 0);
```

## Navigation (NAV array)

Order in sidebar:
1. Dashboard
2. Invoices
3. Estimates
4. **Direct Claimed** ← new
5. Dentist/Practice
6. Tariffs
7. Macros
8. Settings

## Key Code Sections (approximate line numbers)

- **CDN imports**: lines 7–12
- **CSS / styles + colour tokens**: lines 13–70 — CSS classes, then `:root` / `html.dark` CSS variable tokens, then per-class dark overrides
- **INITIAL_DATA / defaults**: ~line 55
- **Embedded tariff CSV**: ~line 89 (~800 tariff codes, English + Afrikaans)
- **Embedded medical aids CSV**: ~line 462 — `EMBEDDED_MEDICAL_AIDS_CSV` + `parseMedicalAidsCSV()` + `MEDICAL_AID_OPTIONS` (fallback defaults); `data.medicalAids[]` is the live list loaded from `MedicalAids.csv` in the working folder
- **CSV parsers**: ~line 530 (`parseClientCSV`, `parseTariffCSV`, `parseMacroCSV`)
- **loadData / saveData**: ~line 587 — `saveData` alerts user if localStorage quota exceeded
- **Auto-backup system**: ~line 640 (File System Access API, IndexedDB handle persistence, 2s debounce) — writes Clients, Tariffs, Macros, **MedicalAids**, JSON backup
- **`escHtml()` helper**: ~line 784 — escapes `&`, `<`, `>`, `"` for safe HTML injection
- **`genId`, `fmt`, `fmtDate`, `today`**: ~line 782
- **SVG icons (ICO)**: ~line 793
- **Modal, Input, Select, SearchSelect**: ~line 820
- **CopyModal**: ~line 1148 — modal with 3 copy options (Copy All / Patient Only / Detail Only); used by Invoices and Estimates pages
- **MedicalAidSelect**: ~line 975 — combobox with visible chevron arrow, dropdown + free-text entry; `downloadMedicalAids()` in AutoBackupCard lets user download the CSV at any time
- **CodeInput (tariff autocomplete)**: ~line 1000
- **`buildDocumentHTML`**: ~line 1025 — print-ready invoice/estimate HTML (uses `escHtml` on all user data)
- **`printDocument`**: ~line 1199 — multi-copy aware; reads `layout.printCopies`
- **`getClientAging`**: ~line 1207 — excludes `claimed` invoices
- **`buildStatementHTML` / `printStatement`**: ~line 1228 (uses `escHtml` on all user data)
- **`buildStatementPDFBlob`**: ~line 1730 — jsPDF statement generator, returns `Promise<Blob>`; used by `whatsappStatement` and per-dentist PDF download
- **`whatsappStatement`**: ~line 1810 — generates statement PDF blob, downloads it, opens WhatsApp
- **`buildPDFBlob`**: ~line 1348 — jsPDF direct-draw PDF generator, returns `Promise<Blob>` (shared by WhatsApp and Direct Claiming)
- **`saveClaimPDF`**: ~line 1607 — saves invoice PDF to `Send to Direct Claiming` subfolder
- **`whatsappDocument`**: ~line 1622 — calls `buildPDFBlob`, downloads PDF, opens WhatsApp
- **Dark mode toggle**: top-right bar of the main content area, in the `App` component — `darkMode` state (localStorage key `edl_dark`); `useEffect` toggles `html.dark` class; sun (☀) / moon (🌙) SVG icon button
- **Dashboard**: ~line 1650 — outstanding stat excludes `claimed` invoices
- **ClientForm / Clients page**: ~line 1705 (age analysis per client, Print Statement + WhatsApp Statement buttons, Month-End batch modal)
- **TariffForm / Tariffs page**: ~line 2958 — includes Price Increase panel with scope dropdown + percentage chevron dropdown; `applyIncrease()` filters by code prefix and updates prices in-place; TariffForm has 3-column grid: User Code | Tariff Code | Category; table shows both columns (Tariff Code in purple when ≠ User Code)
- **MacroForm / Macros page**: ~line 3238 — macros sorted alphabetically
- **LineItemEditor**: ~line 3437 (tariff autocomplete, macro picker — also sorted alphabetically; `consolidateItems()` helper for duplicate code consolidation; toast notification system)
- **EstimateForm / Estimates page**: ~line 3616 — `toInvoice()` copies all patient/member/lang fields; `copyEstimate(est, mode)` handles 3-mode copying; right-click context menu opens CopyModal; copy button (⧉) per row
- **InvoiceForm**: ~line 3832
- **Invoices page**: ~line 3880 — CLAIM/UNCLAIM buttons, CLAIMED badge, `claimInvoice` / `unclaimInvoice` / `copyInvoice(inv, mode)` handlers with 3-mode support; right-click context menu opens CopyModal; copy icon (⧉) button per row
- **AutoBackupCard**: ~line 3960 — renamed "Auto-Backup & Working Folder"
- **HelpSection**: ~line 4198 — 14 collapsible accordion topics, full user guide
- **Settings**: ~line 4710 — includes `<HelpSection />` at bottom
- **DirectClaimed page**: ~line 4770 — all claimed invoices sorted by claim date, UNCLAIM action
- **NAV array**: ~line 4865
- **App / routing**: ~line 4870 — `useEffect` saves data on every state change

## Important Patterns

### Auto-Save (fixed race condition)
`useEffect` triggers `saveData(data)` whenever the `data` state changes. The old `setTimeout` approach inside `setData` was removed.
```javascript
useEffect(() => { saveData(data); }, [data]);
const setDataAndSave = useCallback((updater) => {
  setData(prev => typeof updater === "function" ? updater(prev) : updater);
}, []);
```

### XSS Prevention in Print HTML
All user-supplied values in `buildDocumentHTML` and `buildStatementHTML` are passed through `escHtml()`:
```javascript
const escHtml = (s) => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
```

### Duplicate Code Consolidation
When adding tariff codes to invoices/estimates (via "From Tariff" or "From Macro"), the `consolidateItems()` helper automatically merges duplicate codes:
```javascript
const consolidateItems = (currentItems, newItems) => {
  const consolidated = [...currentItems];
  let addedCount = 0, mergedCount = 0;
  newItems.forEach(newItem => {
    const existingIndex = consolidated.findIndex(existing => existing.code === newItem.code);
    if (existingIndex >= 0) {
      // Duplicate found - add quantities, update price/description to latest
      consolidated[existingIndex] = {
        ...consolidated[existingIndex],
        qty: (parseFloat(consolidated[existingIndex].qty)||0) + (parseFloat(newItem.qty)||0),
        price: newItem.price,
        description: newItem.description,
        tariffCode: newItem.tariffCode
      };
      mergedCount++;
    } else {
      consolidated.push(newItem);
      addedCount++;
    }
  });
  return { consolidated, addedCount, mergedCount };
};
```
- **Matching key**: `item.code` (the tariff code)
- **Behaviour**: Quantities add together, price/description/tariffCode update to current tariff data
- **Toast notifications**: 3-second auto-dismiss overlay shows consolidation stats; slide-in animation via `@keyframes slideIn`
- Applies to `addTariff()` and `addMacro()` in `LineItemEditor`

### Automatic Line Item Sorting
All line items display in **ascending code order** (natural sort: 0001, 0002, 8205, 9705, 9736…) across invoices, estimates, macros, and print outputs:
```javascript
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => {
    const codeA = String(a.code || "").toLowerCase();
    const codeB = String(b.code || "").toLowerCase();
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });
}, [items]);
```
- **LineItemEditor** (line 3517): `useMemo` creates `sortedItems` for display; `items` state remains in insertion order
- **MacroForm** (line 3249): `sortedCodesWithIndex` preserves `originalIndex` for editing while displaying sorted
- **Print/PDF** (lines 1453, 2103): `buildDocumentHTML` and `buildPDFBlob` sort items inline before rendering
- **Sorting is visual only** — the stored array order is unchanged; sorting happens on-the-fly during render

### PDF Generation Architecture
`buildPDFBlob(doc, data, type)` contains all jsPDF drawing logic and returns a `Promise<Blob>`.
- `whatsappDocument()` calls it → downloads the blob + opens WhatsApp
- `saveClaimPDF()` calls it → writes the blob to the `Send to Direct Claiming` subfolder

### Direct Claiming
- `inv.claimed = true` + `inv.claimedDate` marks an invoice as a direct medical aid submission
- Claimed invoices are excluded from `getClientAging()` and the Dashboard outstanding total
- `saveClaimPDF` uses `_backupDirHandle.getDirectoryHandle("Send to Direct Claiming", { create: true })` to auto-create the subfolder
- UNCLAIM sets `claimed = false` and `claimedDate = null`, restoring the invoice to the dentist's account

### Macros Sort Order
Both the Macros page list and the LineItemEditor macro picker sort alphabetically using `.sort((a,b) => (a.name||"").localeCompare(b.name||""))`.

### Language Support
- English and Afrikaans (toggle per invoice/estimate)
- `descForLang(tariff, lang)` returns description in selected language
- `switchLang()` in forms re-maps all line item descriptions when language changes
- `toInvoice()` preserves the `lang` field when converting estimate → invoice

### Print Layout
- `@page { margin: 0 }` removes browser headers/footers
- Layout configurable in Settings: logo position/size, font sizes, invoice print copies, footer/confirmation messages
- `buildDocumentHTML()` for browser print, `buildPDFBlob()` for jsPDF PDF (WhatsApp + Direct Claiming)
- These are independent — changes to one do not affect the other

### Dark / Light Mode
- `darkMode` state in `App`; initialiser sets `html.dark` synchronously (no flash on load)
- `useEffect` keeps the class + `localStorage` in sync whenever `darkMode` changes
- All colours defined as CSS custom properties on `:root` (light) and `html.dark` (dark):
  - `--c-bg` page background, `--c-surface` card/modal bg, `--c-surface2` input/hover bg
  - `--c-border` / `--c-border2` divider lines
  - `--c-text1` primary, `--c-text2` labels, `--c-text3` muted, `--c-text4` very muted
  - `--c-sidebar` sidebar background, `--c-sel` selected-item highlight
- CSS classes (`.card`, `.input-field`, `.btn-secondary`, `.modal-content`, etc.) override their colours with these vars in `html.dark` blocks
- All JSX inline styles in shared components (Input, Select, SearchSelect, MedicalAidSelect, Modal, App shell) use `var(--c-*)` instead of hardcoded hex values
- Print HTML (`buildDocumentHTML`, `buildPDFBlob`) keeps hardcoded hex values — always prints light

### Multi-Copy Printing
- `INITIAL_DATA.profile.layout.printCopies = 2` — default is 2 copies per print
- Configurable in Settings → Print Layout → **Invoice Print Copies** (min 1)
- `printDocument()` reads `data.profile.layout.printCopies`: if > 1, it extracts the single-page HTML, repeats it N times in one document with `page-break-after: always` CSS between copies, and labels the print button "Print N Copies"
- Applies to all invoice and estimate print buttons throughout the app

### VAT Calculation
- All prices are VAT-inclusive (entered and stored that way)
- `exclusive = subtotal / (1 + vatRate/100)` — computed only for extracting the VAT component
- `vatAmount = subtotal - exclusive`
- Invoice/estimate totals block shows 2 rows:
  1. "Invoice/Estimate total (incl. VAT at X%)" → `subtotal` (bold) — this is the amount due
  2. "VAT at X% included" → `vatAmount` — VAT component shown separately for reference
- Set VAT % to 0 in Settings for non-VAT-registered labs — totals show "(no VAT)", no VAT line printed

### localStorage Quota Guard
`saveData()` catches `QuotaExceededError` and alerts the user to export a backup immediately:
```javascript
} catch (e) {
  if (e && (e.name === "QuotaExceededError" || ...)) {
    alert("WARNING: Storage is full! Export a backup immediately.");
  }
}
```

### Phone Number Formatting (WhatsApp)
- SA numbers starting with `0` (but not `00`): `0xx` → `27xx`
- Strips `+` prefix from international numbers

### Auto-Backup
- Uses File System Access API (`showDirectoryPicker`) — Chrome/Edge only
- Directory handle persisted in IndexedDB for session persistence
- Writes `Clients.csv`, `Tariffs.csv`, `Macros.csv`, `Payments.csv`, `MedicalAids.csv`, and JSON backup
- JSON backup: plain text (`EasyDentalLab-backup.json`) if no password, or encrypted (`EasyDentalLab-backup.encrypted`) if `profile.backupPassword` is set
- Debounced (2-second delay) on every data change; `_backupPending` flag tracks in-progress backups
- `beforeunload` event warns user if backup pending when closing browser
- Backup failures show red toast notification (not silent)
- `Send to Direct Claiming/` subfolder created automatically on first CLAIM action

### Backup Encryption (AES-256-GCM)
**Optional feature** — disabled by default for backward compatibility. Protects patient data, medical aid numbers, and bank details.

**How to enable:**
1. Go to Settings → "🔒 Backup Security (Optional)"
2. Enter a master password in "Backup Encryption Password" field
3. Click Save Settings
4. Next backup will create `EasyDentalLab-backup.encrypted` instead of `.json`

**Encryption details:**
- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Salt & IV**: 16-byte salt + 12-byte IV, randomly generated per encryption
- **Format**: Base64-encoded `salt + iv + ciphertext`
- **Scope**: Only the JSON backup is encrypted; CSVs remain plain text for Excel compatibility

**Implementation:**
```javascript
const deriveKey = async (password, salt) => { /* PBKDF2 → AES-256 key */ }
const encryptBackup = async (jsonString, password) => { /* Returns base64 */ }
const decryptBackup = async (base64String, password) => { /* Returns JSON */ }
```

**Functions:**
- `getBackupPassword(data)` — retrieves `data.profile.backupPassword`
- `autoBackupCSVs()` and `handleManualBackup()` conditionally call `encryptBackup()` if password set

**Security notes:**
- Password stored in plain text in `profile.backupPassword` (localStorage + JSON backup)
- For production: consider deriving key from user-entered password at app start (not stored)
- Encrypted backup cannot be restored in browser without password
- Desktop version (Phase 2) should use OS keyring to store encryption key

## Bug Fixes Applied (session log)

| Fix | Details |
|-----|---------|
| `toInvoice()` missing patient fields | Now copies `patientTitle`, `patientSurname`, `patientName`, `memberName`, `medicalAidName`, `medicalAidNumber`, `lang` from estimate to new invoice |
| `inv.total` fallback | Aging and dashboard compute total from line items if `inv.total` is undefined |
| localStorage quota silent failure | `saveData` now catches `QuotaExceededError` and shows alert |
| XSS in print HTML | `escHtml()` applied to all user data in `buildDocumentHTML` and `buildStatementHTML` |
| Auto-save race condition | Replaced `setTimeout(() => saveData(next), 0)` with `useEffect(() => saveData(data), [data])` |
| Macros not sorted | Both Macros page and LineItemEditor picker now sort alphabetically |
| Invoice print copies | `printCopies` setting (default 2) in layout; `printDocument` generates multi-copy HTML with page breaks |
| Medical Aid Name dropdown | `MedicalAids.csv` in working folder is the live source; `EMBEDDED_MEDICAL_AIDS_CSV` is the fallback; `AutoBackupCard` reads/creates the file on folder connect; `data.medicalAids[]` feeds `MedicalAidSelect` |
| MedicalAidSelect re-select bug | Fixed: dropdown now opens with empty query (full list visible) so user can always change to a different selection |
| Dark / Light mode | Toggle button (🌙/☀) in top-right bar on every page; CSS custom properties (`--c-bg`, `--c-surface`, `--c-text1` …) drive all colours; preference persisted in `localStorage` (`edl_dark`) |
| Tariff bulk price increase | Price Increase panel on Tariffs page (below search bar); scope dropdown: All Tariffs or '97' Codes Only (filters by `tariffCode` starting with "97"); percentage input with chevron presets (1–20 %); `applyIncrease()` updates `data.tariffs` → auto-backup writes `Tariffs.csv` within 2 s |
| User Code / Tariff Code split | Each tariff now has `code` (User Code — internal) and `tariffCode` (medical aid billing code). All 8xxx codes auto-migrated to `tariffCode = "9736"` on load. CSV header renamed from `Code` to `UserCode`. Tariff table shows Tariff Code column in purple when different from User Code. |
| Tariff Code on printed output | `buildDocumentHTML` and `buildPDFBlob` now print `item.tariffCode \|\| item.code` — the Tariff Code always appears on invoices/estimates/PDFs. User Code stays internal. Line items store `tariffCode` when a tariff is selected (via CodeInput, From Tariff, or From Macro). |
| Month-End Statements | `buildStatementPDFBlob(clientId, data)` generates jsPDF statement blobs. `whatsappStatement(client, data)` downloads PDF + opens WhatsApp. Per-dentist buttons (Print Statement / WhatsApp Statement) controlled by `layout.statementSendMethod`. Month-End batch modal on Clients page. 3 new Settings: `statementSendMethod` ("print"/"whatsapp"/"both"), `statementFormat` ("pdf"/"browser"), `monthEndMode` ("individual"/"batch"/"both"). Defaults in `INITIAL_DATA.profile.layout`. |
| Current prices on convert/copy | `toInvoice()` now refreshes item prices from `prev.tariffs` (current rates) instead of copying stored prices. New `copyInvoice()` function on Invoices page does the same — duplicates all patient/item/medical-aid fields as a new unpaid invoice but with today's tariff prices. Copy icon button (⧉) added to each invoice row. |
| Payment allocation system | New `payments[]` array in data. Helpers: `getInvoiceAmountPaid`, `getInvoiceBalance`, `getInvoiceDisplayStatus`, `getClientCredit`. `getClientAging` now takes `payments` param and uses balance not full total. Invoice status derived: paid/partial/unpaid. `partial` badge (orange) added. `PaymentModal` component: per-payment receipt (print/WhatsApp/both), auto-allocate oldest-first, partial support, credit carry-forward, edit mode. Receipt functions: `buildReceiptHTML`, `printReceipt`, `buildReceiptPDFBlob`, `whatsappReceipt`. Clients page: `+ Payment` button, credit badge, payment history panel with re-print/re-WhatsApp. |
| Copy invoice/estimate with 3 modes | New `CopyModal` component (after line 1148) with 3 options: "Copy All" (patient + line items with current prices), "Patient Only" (patient & dentist info, blank line items), "Detail Only" (line items only, blank patient info). `copyInvoice(inv, mode)` and `copyEstimate(est, mode)` updated to handle all three modes. Copy button on both Invoices and Estimates pages opens modal. Right-click any invoice or estimate row also opens copy modal. Help section updated for both Invoices and Estimates topics. |
| Duplicate code consolidation | `LineItemEditor` now consolidates duplicate tariff codes instead of creating multiple rows. New `consolidateItems()` helper function compares `item.code` fields; when a duplicate is found, quantities are added together on the existing row (price and description updated to latest from tariffs). Applies to both `addTariff()` (manual "From Tariff" additions) and `addMacro()` (macro additions). Toast notification system added (3-second auto-dismiss) — shows "Code XXXX already exists — quantity increased" for single codes or "N codes added, M consolidated" for macros. CSS `@keyframes slideIn` animation added at line 244. Help section updated in Invoices and Macros topics. |
| Automatic code sorting (ascending) | All line items now display in **ascending code order** (0001, 0002, 8205, 9705...) across the entire app. `LineItemEditor` uses `useMemo` to create `sortedItems` with `.localeCompare(..., { numeric: true })` for natural number sorting. `MacroForm` sorts codes with `sortedCodesWithIndex` (preserves original index for editing). Print outputs (`buildDocumentHTML`, `buildPDFBlob`) sort items array before rendering. Sorting is visual only — stored order unchanged. |
| **Phase 1 Critical Fixes (Data Safety)** | **4 production-critical fixes applied** |
| Payments backup added | `buildPaymentsCSV()` function created (line ~1063). Payments.csv now written to backup folder in both auto-backup (`autoBackupCSVs`, line ~1185) and manual backup (`handleManualBackup`, line ~4272). CSV format: PaymentID, PaymentDate, ClientID, ClientName, Amount, Reference, Method, Unallocated, InvoiceID, InvoiceNumber, InvoiceDate, Patient, Allocated. One row per allocation; unallocated payments have blank invoice fields. Fixes CRITICAL bug: payments were only in localStorage, lost on browser cache clear. |
| Backup failure notifications | Global toast system added to App component (`backupToast` state, `_showBackupToast` callback, line ~5401). `writeBackupFile()` and `autoBackupCSVs()` now call `_showBackupToast()` on error instead of silent `console.warn()`. Toast displays for 5 seconds at bottom-right with red background. Users now see "⚠️ Auto-backup failed — [error]" or "⚠️ Backup failed: Payments.csv — [error]" when folder disconnected or permissions revoked. |
| Exit warning on pending backup | `_backupPending` flag tracks when backup scheduled but not completed (line ~942). `autoBackupCSVs` sets flag on entry, clears on completion/error (line ~1171-1194). `beforeunload` event listener in App (line ~5426) shows browser warning if `_backupPending === true`. Prevents data loss if user closes browser within 2-second debounce window before auto-backup completes. |
| Optional backup encryption (AES-256) | WebCrypto-based encryption added: `deriveKey()` (PBKDF2, 100k iterations), `encryptBackup()`, `decryptBackup()`, `getBackupPassword()` (line ~1095-1160). `autoBackupCSVs` and `handleManualBackup` conditionally encrypt JSON backup if `data.profile.backupPassword` is set (line ~1180-1187, ~4266-4278). Encrypted file saved as `EasyDentalLab-backup.encrypted` (base64-encoded salt+iv+ciphertext). Unencrypted file remains `EasyDentalLab-backup.json`. CSVs always plain text for Excel compatibility. New Settings card "🔒 Backup Security (Optional)" with password input field (line ~4852-4867). `backupPassword` added to `INITIAL_DATA.profile` (line ~299). **Disabled by default** — leave password blank for backward compatibility. |
| **Phase 2: Desktop Compilation** | **Electron 28.3.3 desktop app built (May 17, 2026 — 1.5 hours)** |
| Desktop project created | `EasyDentalLab-Desktop/` folder with `package.json`, `main.js`, `preload.js`, `electron-builder.yml`. Electron + electron-builder installed via npm. Vendor libraries downloaded to `renderer/vendor/` (React 18.2.0, Babel 7.23.9, jsPDF 2.5.1, jspdf-autotable 3.8.2) — 100% offline operation. |
| File System Access API → Electron IPC | Complete rewrite of backup system. `window.showDirectoryPicker()` → `dialog.showOpenDialog()` via IPC. `FileSystemHandle` API → Node.js `fs.promises.writeFile()` via IPC. IndexedDB persistence → config file (`backup-config.json` in `app.getPath('userData')`). Modified functions: `initAutoBackup()`, `pickBackupFolder()`, `clearBackupFolder()`, `writeBackupFile()`, `readMedicalAidsFromFolder()`, `saveClaimPDF()`, `autoBackupCSVs()`, `AutoBackupCard`. All IPC calls exposed via `window.electronAPI` (contextBridge in `preload.js`). Folder path persists across app restarts. |
| Windows installer built | `EasyDentalLab Setup 2.0.0.exe` (76 MB, ARM64, NSIS installer). Unsigned (SmartScreen warning expected on first launch). Installs to `C:\Program Files\EasyDentalLab` with Desktop + Start Menu shortcuts. |
| macOS installer built | `EasyDentalLab-2.0.0-arm64.dmg` (90 MB, Apple Silicon M1/M2/M3). Ad-hoc signed (no Apple Developer certificate — "unidentified developer" warning expected). Drag-to-Applications installer. Requires macOS 10.15+ (Catalina). |
| Linux installer built | `EasyDentalLab-2.0.0-arm64.AppImage` (100 MB, ARM64). Self-contained, runs on all modern distros (Ubuntu 20.04+, Fedora, Debian) without installation. Executable via `chmod +x` + `./EasyDentalLab-2.0.0-arm64.AppImage`. .deb package broken (96 bytes packaging error) — use AppImage instead. |
| Installation guide created | `EasyDentalLab-Desktop/INSTALLERS-README.md` — complete installation instructions for Windows/macOS/Linux, system requirements, troubleshooting, SHA256 checksums, known issues, migration guide from web version. |
| Afrikaans description bug (16 codes) | Fixed embedded CSV format for codes 9314, 9383, 9419, 9431, 9433, 9461, 9463, 9525, 9537, 9541, 9553, 9557, 9561, 9720, 9722, 9788. These had combined English+Afrikaans in Description field causing parser to misalign columns — Afrikaans selection showed price number instead of description. Split descriptions properly: English in Description column, Afrikaans in DescriptionAFR column. Added proper categories (Models, Prosthetics, Chrome Cobalt, Crown & Bridge, Material, Implants) and "each" measure. Lines 370, 423, 446, 452, 454, 469, 470, 512, 520, 523, 533, 534, 537, 600, 601, 657. |
| Discount feature (invoices + estimates) | Added optional percentage discount (checkbox + input) to invoice and estimate forms. Default 15%, max 100%. Discount applies to subtotal BEFORE VAT calculation. Display shows: Subtotal → Discount (if enabled) → Total (incl. VAT) → VAT breakdown. Discount persisted in `discountEnabled` (boolean) and `discountPercent` (number) fields. Print/PDF output includes discount line when enabled. Convert estimate→invoice and copy functions do NOT carry over discount (fresh start). `EstimateForm` + `InvoiceForm` updated with discount UI (lines ~3765, ~3800, ~4019, ~4060). `buildDocumentHTML` (line ~1577) and `buildPDFBlob` (line ~2239) updated with discount calculation + totals table. Help sections updated for Invoices and Estimates (lines ~4510, ~4527). |
| Automatic version upgrade detection | Added `APP_VERSION` constant and version tracking in localStorage. On app load, `loadData()` detects version mismatch and sets `_tariffUpdateAvailable` flag. Yellow notification banner appears at top of app (dismissible) with "Update Now" button. New `reloadDefaultTariffs()` function replaces tariffs with embedded CSV. Settings page has manual "Reload Default Tariffs" button with version display. Solves localStorage cache issue when upgrading — users no longer see old tariff data after update. Lines ~288 (APP_VERSION), ~877 (loadData version check), ~945 (reloadDefaultTariffs), ~5745 (upgrade banner), ~5102 (Settings button). |
| UI fixes: version display + Afrikaans column | Fixed sidebar version display to show `APP_VERSION` instead of hardcoded "v1.0" (line ~5751). Added Afrikaans description column to Tariffs table (line ~3364) — was missing, making Afrikaans descriptions invisible/uneditable. Fixed 9722 tariff: English "Acrylic, per denture" / Afrikaans "Akriel, per gebit" (line ~601). |

## License System

### Current State
A **complete Ed25519-based license system** is already coded into the app (lines 13–75 of `EasyDentalLab.html`). It is **built but not yet activated** — the gate is bypassed by a placeholder public key.

### How It Works
- **Key format**: `PAYLOAD_B64URL.SIGNATURE_B64URL` — base64url-encoded JSON payload + Ed25519 signature
- **Payload fields**: `email`, `type` ("trial" or "full"), `expires` (ISO date, optional), `app`
- **Validation**: `crypto.subtle.verify` (WebCrypto API) — fully offline, no internet required
- **Persistence**: Valid key stored in `localStorage` under `"edl_license_key"`
- **Online revocation** (optional): Can POST to `LICENSE_VALIDATION_URL`; disabled by default (`LICENSE_ONLINE_CHECK = false`)

### License States & UI
| State | UI behaviour |
|-------|-------------|
| No key stored | `LicenseEntryScreen` — blocks app, prompts for key |
| Valid full key | App runs normally, no banner |
| Valid trial key | App runs with countdown banner; red urgent banner when ≤ 7 days left |
| Expired key | `LockScreen` — blocks app, shows "Trial Expired"; user can clear and re-enter |
| Invalid signature | Error: "Invalid license signature." |
| Malformed key | Error: "Malformed license key." |

### Support Files
```
license/
├── keyGenerator.html   # Developer tool — generate key pairs + sign license keys
├── licenseValidator.js # Validator logic (also inlined in EasyDentalLab.html)
└── validate.php        # Optional backend for online revocation (incomplete reference)
```

### Activating the License Gate (when ready to ship)
1. Open `license/keyGenerator.html` in a browser
2. Click **Generate New Key Pair** — **keep the private key secret** (never ship it)
3. Copy the public key output
4. In `EasyDentalLab.html`, replace `LICENSE_PUBLIC_KEY_B64 = "REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR"` with the real public key
5. Gate is now live — anyone without a valid signed key hits the lock screen

### Generating a Tester Trial Key
1. Open `license/keyGenerator.html`
2. Paste your **private key**
3. Fill in: email = tester's email, type = `trial`, expires = test end date
4. Click **Sign Key** — copy the output and send to the tester
5. App shows countdown banner; locks when expired. Source code stays safe.

### Key Constants (top of EasyDentalLab.html)
```javascript
const LICENSE_PUBLIC_KEY_B64 = "REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR"; // ← replace to arm
const LICENSE_ONLINE_CHECK   = false;          // set true to enable revocation endpoint
const LICENSE_VALIDATION_URL = "https://your-endpoint.com/api/validate"; // ← set if using online check
const LICENSE_STORAGE_KEY    = "edl_license_key";
```

---

## Desktop Compilation (Electron)

### ✅ Phase 2 Status: COMPLETE (May 17, 2026)

**Implementation time:** 1.5 hours (automated via Claude Code)

**Packager chosen:** Electron 28.3.3

**Deliverables:**
- ✅ Windows installer: `EasyDentalLab Setup 2.0.0.exe` (76 MB, ARM64)
- ✅ macOS installer: `EasyDentalLab-2.0.0-arm64.dmg` (90 MB, ARM64/Apple Silicon)
- ✅ Linux installer: `EasyDentalLab-2.0.0-arm64.AppImage` (100 MB, ARM64)

**Location:** `EasyDentalLab-Desktop/build/`

**Installation guide:** See `EasyDentalLab-Desktop/INSTALLERS-README.md`

### Implementation Summary
**Completed changes:**
- ✅ Project structure created (`package.json`, `main.js`, `preload.js`, `electron-builder.yml`)
- ✅ File System Access API → Electron IPC (complete rewrite of `pickBackupFolder()`, `writeBackupFile()`, `readMedicalAidsFromFolder()`, `saveClaimPDF()`, `autoBackupCSVs()`)
- ✅ CDN libraries → Local vendor files (React 18.2.0, Babel 7.23.9, jsPDF 2.5.1 bundled in `renderer/vendor/`)
- ✅ IndexedDB persistence → Config file persistence (`app.getPath('userData')/backup-config.json`)
- ✅ Browser permissions → Native folder picker (`dialog.showOpenDialog`)
- ✅ Blob writes → Node.js `fs.promises.writeFile` via IPC
- ✅ Subfolder creation → `fs.mkdir` with `{ recursive: true }`

**Code signing:**
- macOS: Ad-hoc signed (no Apple Developer certificate) — "unidentified developer" warning on first launch
- Windows: Unsigned (no code signing certificate) — SmartScreen warning on first launch

### Implementation Details

**What was replaced:**
- Browser `window.showDirectoryPicker()` → Electron `dialog.showOpenDialog()` via IPC
- Browser `FileSystemHandle` API → Node.js `fs.promises` via IPC
- IndexedDB handle persistence → Config file (`backup-config.json` in `userData`)
- CDN script tags → Local vendor files (`renderer/vendor/`)
- Global `_backupDirHandle` → Global `_backupFolderPath` (stores path string instead of handle)

**IPC Architecture:**
```
Renderer Process (React UI)
    ↓ window.electronAPI.selectBackupFolder()
Preload Script (contextBridge)
    ↓ ipcRenderer.invoke('select-backup-folder')
Main Process (Node.js)
    ↓ dialog.showOpenDialog() → fs.writeFile()
    ↓ returns { success: true, path: "/folder/path" }
```

**Modified functions in `renderer/index.html`:**
- `initAutoBackup()` — calls `window.electronAPI.getBackupFolder()` on startup
- `pickBackupFolder()` — calls `window.electronAPI.selectBackupFolder()`
- `clearBackupFolder()` — calls `window.electronAPI.clearBackupFolder()`
- `writeBackupFile()` — calls `window.electronAPI.writeBackupFile(filename, content)`
- `readMedicalAidsFromFolder()` — calls `window.electronAPI.readBackupFile("MedicalAids.csv")`
- `saveClaimPDF()` — converts blob to data URL, calls `window.electronAPI.writeSubfolderFile("Send to Direct Claiming", filename, dataUrl)`
- `autoBackupCSVs()` — simplified (no permission checks, just writes)
- `AutoBackupCard` — `supported` check now `!!window.electronAPI` (true in Electron)

**All other code unchanged** — React components, data structures, localStorage, license system, print/PDF logic, dark mode, payment allocation, etc. work identically.

### Known Limitations

1. **Icons:** Electron defaults used (not dental-themed) — replace `resources/icon.ico`, `icon.icns`, `icon.png` and rebuild
2. **Architecture:** ARM64 only (built on Apple Silicon) — x64 requires rebuild on Intel machine
3. **Code signing:** None (warnings expected on first launch) — optional Apple/Windows certificates cost $99–$200/year
4. **Linux .deb:** Broken (96 bytes) — use AppImage instead (self-contained, works on all distros)

### Future Improvements (Optional)

- **Tauri v2.0** — Rebuild with Tauri for 5–10 MB installers (95% smaller than Electron)
- **x64 builds** — Build on Intel machines for wider compatibility
- **App icons** — Create dental-themed icons (tooth logo, "EDL" monogram, etc.)
- **Code signing** — Purchase Apple Developer + Windows code signing certificates
- **Auto-updater** — Integrate `electron-updater` for silent background updates
- **Backup encryption keyring** — Use OS keyring (Windows DPAPI, macOS Keychain) instead of storing password in localStorage

---

## Common Tasks

### Adding a new field to invoices
1. Add to the invoice object in `InvoiceForm` `onSave` call
2. Add input in `InvoiceForm` component
3. If it should print: add to `buildDocumentHTML` (wrap value in `escHtml()`)
4. If it should appear in PDF: add to `buildPDFBlob`
5. If converting from estimate: add to `toInvoice()` in the Estimates component

### Adding a new page/section
1. Add entry to `NAV` array (~line 3155)
2. Write the component
3. Add `case "id": return <Component .../>` in `renderPage()` (~line 3165)

### Modifying print layout
- Edit `buildDocumentHTML()` for browser print
- Edit `buildPDFBlob()` for PDF output (WhatsApp + Direct Claiming)
- Both must be updated for consistent output

### CSV format changes
- Update the embedded CSV template literal AND the parse function
- Update the `build___CSV()` function used by auto-backup
- Update the manual `exportCSV()` in the relevant component

### Adding/removing medical aids from the dropdown
- Edit `MedicalAids.csv` in the working folder in Excel — one name per row under `Name` header
- Reconnect the folder in Settings → Auto-Backup & Working Folder → Select Backup Folder to reload the list
- `AutoBackupCard.syncMedicalAids()` reads the file and calls `setData` to update `data.medicalAids`
- If no working folder is set, the embedded `EMBEDDED_MEDICAL_AIDS_CSV` constant is used as fallback
- Custom entry (not in list) is always allowed — type the name and press Enter

### Adding a new Help topic
- Add an entry to the `topics` array inside `HelpSection` (~line 2746)
- Each topic: `{ id, icon, title, content: <JSX/> }`
- Use the `H`, `P`, `UL`, `OL` shorthand components defined at the top of `HelpSection`
