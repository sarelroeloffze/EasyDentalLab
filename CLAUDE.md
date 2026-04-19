# EasyDentalLab

Portable single-file dental laboratory invoicing application for South African dental labs.

## Standing Instructions (always follow)

- **After every code change**: update the relevant Help topic(s) in `HelpSection` to reflect the change.
- **After every code change**: update this CLAUDE.md file — add/update the feature in the appropriate section, fix any line numbers that shifted, and add a row to the Bug Fixes / Features table if applicable.
- These two rules apply automatically — the user does not need to ask each time.

## Architecture

- **Single HTML file** (`EasyDentalLab.html`, ~3600 lines) — the entire app
- **React 18** via CDN with **Babel standalone** for JSX transpilation (no build tools)
- **Tailwind CSS** via CDN for utility classes
- **jsPDF + jspdf-autotable** via CDN for PDF generation (WhatsApp share + Direct Claiming)
- **localStorage** for all data persistence (auto-saved via `useEffect` on every state change); also stores `edl_dark` key for theme preference
- **CSS custom properties** (`--c-bg`, `--c-surface`, `--c-text1` … etc.) drive the colour theme; toggling `html.dark` class switches all tokens to dark values
- **File System Access API** for auto-backup of CSV/JSON files and Direct Claiming PDFs to a user-selected folder
- **Ed25519 license system** (lines 13–75) — cryptographic key validation via WebCrypto API; currently bypassed (placeholder public key); arms when real key pair is generated

## Version Control

- **Git**: v2.50.1, global config: Sarel Roeloffze / sarel@roeloffze.com, default branch `main`
- **GitHub repo**: https://github.com/sarelroeloffze/EasyDentalLab (private)
- **GitHub CLI**: `gh` v2.90.0 installed via Homebrew (`/opt/homebrew`), authenticated as `sarelroeloffze`
- **First commit**: `3cbb0d4` — "Initial commit — EasyDentalLab v1.0"
- **Tracked files**: `EasyDentalLab.html`, `CLAUDE.md`, `Tariffs.csv`, `claude_server.py`, `license/`
- **Excluded** (`.gitignore`): `Clients.csv`, `Macros.csv`, `EasyDentalLab-backup.json`, `Send to Direct Claiming/`, `.claude/`, `Team/`, `Team Inbox/`, `Owner's Inbox/`
- **Purpose**: Track every app change; foundation for future desktop compilation (Electron/Tauri) and versioned releases

## File Structure

```
EasyDentalLab/
├── EasyDentalLab.html               # The app (single file, self-contained)
├── Clients.csv                       # Auto-backed-up client/dentist data
├── Tariffs.csv                       # Auto-backed-up tariff codes with Afrikaans translations
├── Macros.csv                        # Auto-backed-up macro definitions
├── MedicalAids.csv                   # Medical aid names for dropdown — edit in Excel to customise list
├── EasyDentalLab-backup.json         # Full auto-backup (invoices, estimates, settings, everything)
├── Send to Direct Claiming/          # Auto-created subfolder — PDF copies of claimed invoices
│   └── Invoice_XXX.pdf
├── license/                          # Developer-only license tools (DO NOT ship to end users)
│   ├── keyGenerator.html             # Generate key pairs + sign license keys
│   ├── licenseValidator.js           # Validator logic (also inlined in EasyDentalLab.html)
│   └── validate.php                  # Optional backend revocation endpoint (reference only)
└── CLAUDE.md                         # This file
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
- **TariffForm / Tariffs page**: ~line 1900 — includes Price Increase panel with scope dropdown + percentage chevron dropdown; `applyIncrease()` filters by code prefix and updates prices in-place; TariffForm has 3-column grid: User Code | Tariff Code | Category; table shows both columns (Tariff Code in purple when ≠ User Code)
- **MacroForm / Macros page**: ~line 2010 — macros sorted alphabetically
- **LineItemEditor**: ~line 2230 (tariff autocomplete, macro picker — also sorted alphabetically)
- **EstimateForm / Estimates page**: ~line 2335 — `toInvoice()` copies all patient/member/lang fields
- **InvoiceForm**: ~line 2470
- **Invoices page**: ~line 2515 — CLAIM/UNCLAIM buttons, CLAIMED badge, `claimInvoice` / `unclaimInvoice` / `copyInvoice` handlers; copy icon (⧉) button per row
- **AutoBackupCard**: ~line 2655 — renamed "Auto-Backup & Working Folder"
- **HelpSection**: ~line 2737 — 14 collapsible accordion topics, full user guide
- **Settings**: ~line 2980 — includes `<HelpSection />` at bottom
- **DirectClaimed page**: ~line 3060 — all claimed invoices sorted by claim date, UNCLAIM action
- **NAV array**: ~line 3155
- **App / routing**: ~line 3160 — `useEffect` saves data on every state change

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
- Writes `Clients.csv`, `Tariffs.csv`, `Macros.csv`, `EasyDentalLab-backup.json`
- Debounced (2-second delay) on every data change
- `Send to Direct Claiming/` subfolder created automatically on first CLAIM action

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

## Desktop Compilation (Electron / Tauri / NW.js)

### Readiness Summary
The app **can** be packaged as a Windows/Mac desktop app. One section of code needs to be rewritten before compiling.

| Aspect | Status | Notes |
|--------|--------|-------|
| Single HTML file, no build tools | ✓ Ready | No webpack/npm build step needed |
| React/Babel/jsPDF via CDN | ⚠ Needs bundling | CDN calls require internet; bundle locally for offline desktop use |
| localStorage + IndexedDB | ✓ Ready | Both work natively in Electron/Tauri/NW.js |
| License system | ✓ Ready | WebCrypto (`crypto.subtle`) works in all three packagers |
| AI Assistant (`localhost:5765`) | ⚠ Document | Users need to run `python3 claude_server.py` separately, or bundle it as a subprocess |
| **File System Access API** | ✗ **Blocker** | Must be rewritten before compiling — see below |

### The One Blocker: File System Access API
The auto-backup system and Direct Claiming PDF save use the **browser File System Access API** (`showDirectoryPicker`, `fileHandle.createWritable`) — a Chrome/Edge-only browser API that does not exist in packaged desktop apps.

**Affected code**: `~lines 933–1022` (AutoBackupCard + `_backupDirHandle` logic + `saveClaimPDF`)

**Fix required before compiling**:
- **Electron**: Replace with `dialog.showOpenDialog` (main process) + Node.js `fs` via `ipcRenderer` preload bridge
- **Tauri**: Replace with Tauri's `dialog.open` + `fs.writeFile` Rust commands via `invoke`
- **NW.js**: Replace with Node.js `fs` directly (NW.js exposes Node in the renderer)

Everything else in the app works without changes.

### Recommended Packager
| Packager | Bundle size | Notes |
|----------|------------|-------|
| **Electron** | ~150 MB | Most mature; largest ecosystem; easiest File System API replacement |
| **Tauri** | ~5–10 MB | Smallest output; uses OS webview; File System API needs Rust commands |
| **NW.js** | ~100 MB | Simple Node.js file access; less actively maintained |

**Recommendation**: Electron for ease of development; Tauri for smallest installer size.

### When Ready to Compile
Assign WREN to:
1. Rewrite the File System Access API section for the target packager
2. Bundle React/Babel/jsPDF locally (remove CDN calls)
3. Set up Electron/Tauri project wrapping `EasyDentalLab.html`
4. Arm the license gate (replace public key placeholder)

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
