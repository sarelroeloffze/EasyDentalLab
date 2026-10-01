import { useState } from 'react';

export function HelpSection() {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen(prev => prev === id ? null : id);

  const H = ({ children }: { children: React.ReactNode }) => (
    <p style={{ fontWeight: 600, margin: '12px 0 5px', color: 'var(--c-text1)' }}>{children}</p>
  );

  const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <p style={{ margin: '0 0 8px', ...(style || {}) }}>{children}</p>
  );

  const UL = ({ children }: { children: React.ReactNode }) => (
    <ul style={{ paddingLeft: 20, margin: '0 0 10px', lineHeight: 1.85 }}>{children}</ul>
  );

  const OL = ({ children }: { children: React.ReactNode }) => (
    <ol style={{ paddingLeft: 20, margin: '0 0 10px', lineHeight: 1.85 }}>{children}</ol>
  );

  const topics = [
    { id: 'start', icon: '🚀', title: 'Getting Started — First Time Setup', content: (
      <div>
        <P>Follow these steps when opening EasyDentalLab for the first time:</P>
        <OL>
          <li><strong>Fill in your Business Profile</strong> — go to Settings and enter your laboratory name, address, phone, email, VAT number, Laboratory Number and PCNS number. Click <em>Save Settings</em>.</li>
          <li><strong>Add your bank details</strong> — scroll to <em>Banking Details</em> and enter your bank name, account number and branch code. These print on every invoice.</li>
          <li><strong>Select a Working Folder</strong> — scroll to <em>Auto-Backup &amp; Working Folder</em> and click <em>Select Backup Folder</em>. Pick the folder where the app lives (e.g. the <em>EasyDentalLab</em> folder on your PC). This keeps CSV files and a full backup up to date automatically. It is also used for saving Direct Claiming PDFs.</li>
          <li><strong>Check your Tariff codes</strong> — go to <em>Tariffs</em>. A full set of South African dental lab codes is already loaded. Edit prices to match your current rate card.</li>
          <li><strong>Add your Dentists</strong> — go to <em>Dentist/Practice</em> and add each dental practice you work for.</li>
          <li><strong>Create Macros (optional)</strong> — go to <em>Macros</em> and group common tariff codes into device templates (e.g. "PFM Crown") for one-click invoice line item entry.</li>
          <li><strong>Create your first Invoice</strong> — go to <em>Invoices</em> and click <em>New Invoice</em>.</li>
        </OL>
      </div>
    )},

    { id: 'dashboard', icon: '📊', title: 'Dashboard', content: (
      <div>
        <P>The Dashboard gives you a live overview of your practice at a glance.</P>
        <UL>
          <li><strong>Active Dentists</strong> — number of dentist/practice records (not archived).</li>
          <li><strong>Tariffs / Macros</strong> — how many tariff codes and macro templates are loaded.</li>
          <li><strong>Invoices (month)</strong> — invoices created in the current calendar month.</li>
          <li><strong>Outstanding</strong> — total rand value of all unpaid invoices, excluding Direct Claimed invoices.</li>
        </UL>
        <P>The two panels at the bottom show your 5 most recent estimates and invoices.</P>
      </div>
    )},

    { id: 'invoices', icon: '🧾', title: 'Invoices — Creating, Editing & Managing', content: (
      <div>
        <H>Creating an Invoice</H>
        <OL>
          <li>Go to <em>Invoices</em> and click <em>New Invoice</em>.</li>
          <li>Select a <strong>Dentist</strong> from the dropdown (type to search).</li>
          <li>Enter <strong>Patient Surname</strong> and <strong>Patient Name</strong> — required for medical aid claims.</li>
          <li>Optionally fill in <strong>Medical Aid Name</strong> — click the field and scroll to select from the built-in list, or type to filter, or type a custom name and press <strong>Enter</strong> if it's not in the list. Also fill in Member Name and Membership number if applicable.</li>
          <li>Add line items — type a tariff code in the Code column; as you type, the closest match is highlighted. Press <strong>Enter</strong> to confirm the selection and move to Qty field. Press <strong>Ctrl+Enter</strong> (Windows) or <strong>Cmd+Enter</strong> (Mac) to confirm the code and add a new line. Or click <em>From Macro</em> to add a full device template in one click. If you add a code that already exists in the line items, the quantity will automatically increase instead of creating a duplicate row — a notification will confirm this.</li>
          <li>Choose <strong>English or Afrikaans</strong> — all descriptions switch language automatically.</li>
          <li>Click <em>Save Invoice</em>.</li>
        </OL>
        <H>Invoice Buttons (on each row)</H>
        <UL>
          <li><strong>🖨 Print</strong> — opens a print-ready A4 invoice in a new tab. Click <em>Print / Save as PDF</em> or press Ctrl+P / Cmd+P.</li>
          <li><strong>📄 Download PDF</strong> — generates and downloads the invoice as a PDF file directly.</li>
          <li><strong>💬 WhatsApp</strong> — generates a PDF, downloads it, then opens WhatsApp Web with a pre-filled message. Attach the downloaded PDF before sending.</li>
          <li><strong>✓ Check mark</strong> — toggles the invoice between Paid (green) and Unpaid (yellow).</li>
          <li><strong>⧉ Copy</strong> — opens a modal with 3 copy options: <em>Copy All</em> (patient + line items with current prices), <em>Patient Only</em> (patient &amp; dentist info, blank line items), or <em>Detail Only</em> (line items with current prices, blank patient info). You can also <strong>right-click</strong> any invoice row to open this copy menu.</li>
          <li><strong>✨ Save as Macro</strong> — convert the invoice's line items into a reusable macro with one click.</li>
          <li><strong>✏ Edit</strong> — reopens the form to change any detail.</li>
          <li><strong>🗑 Delete</strong> — permanently removes the invoice.</li>
          <li><strong style={{ color: '#2563eb' }}>CLAIM</strong> — marks the invoice as a Direct Claim to medical aid. See the Direct Claiming section below.</li>
        </UL>
        <H>Invoice Status Badges</H>
        <UL>
          <li><strong style={{ background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: 9999 }}>paid</strong> — fully settled.</li>
          <li><strong style={{ background: '#ffedd5', color: '#9a3412', padding: '1px 6px', borderRadius: 9999 }}>partial</strong> — a payment has been received but does not cover the full invoice. The remaining balance still appears in the dentist's age analysis.</li>
          <li><strong style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 9999 }}>unpaid</strong> — no payment received yet.</li>
        </UL>
        <H>Discount Feature</H>
        <P>Apply a percentage discount to the invoice total before VAT calculation. Tick the <strong>Discount</strong> checkbox at the bottom of the form, then enter a percentage (default 15%, maximum 100%). The discount is deducted from the subtotal before VAT is calculated. The discount line appears on both the form and the printed invoice/PDF. <strong>Since v2.3.47:</strong> When you convert an estimate to an invoice or copy an invoice, the discount settings are preserved automatically.</P>
        <H>Searching &amp; Filtering</H>
        <P>Type in the search box to filter by client name or invoice number. Use the status dropdown to show only Unpaid or Paid invoices.</P>
        <H>Sorting</H>
        <P>Click any column header (No., Date, Client, Patient, Total, Status) to sort the table. First click sorts ascending (↑), second click sorts descending (↓), third click returns to ascending. The sort indicator appears next to the column name.</P>
      </div>
    )},

    { id: 'estimates', icon: '📋', title: 'Estimates — Creating & Converting to Invoice', content: (
      <div>
        <P>Estimates are quotations sent to dentists before work begins. They work exactly like invoices but are clearly marked as estimates and are not tax invoices.</P>
        <H>Creating an Estimate</H>
        <OL>
          <li>Go to <em>Estimates</em> and click <em>New Estimate</em>.</li>
          <li>Fill in Dentist, patient details and line items — same as an invoice.</li>
          <li>Optionally set a <strong>Valid Until</strong> date.</li>
          <li>Click <em>Save Estimate</em>. It is saved with status <em>Draft</em>.</li>
        </OL>
        <H>Converting to an Invoice</H>
        <P>Once the work is approved and completed, click the <strong>→ arrow button</strong> on the estimate. A new invoice is instantly created with all the same details (patient, items, medical aid, language, discount settings). Prices are automatically updated to the <strong>current tariff rates</strong> at the time of conversion — not the prices when the estimate was originally created. The estimate is marked as <em>Invoiced</em>, and the invoice shows a clickable reference back to the estimate number.</P>
        <H>Copying an Estimate</H>
        <P>Click the <strong>⧉ Copy button</strong> (or <strong>right-click</strong> the estimate row) to create a duplicate estimate. You'll see 3 options: <em>Copy All</em> (patient + line items with current prices), <em>Patient Only</em> (patient &amp; dentist info, blank line items), or <em>Detail Only</em> (line items with current prices, blank patient info). Discount settings are preserved when copying. Useful for creating similar estimates for different patients or reusing tariff lists.</P>
        <H>Discount Feature</H>
        <P>Apply a percentage discount to the estimate total before VAT calculation. Tick the <strong>Discount</strong> checkbox at the bottom of the form, then enter a percentage (default 15%, maximum 100%). The discount is deducted from the subtotal before VAT is calculated. The discount line appears on both the form and the printed estimate/PDF. <strong>Since v2.3.47:</strong> When you convert an estimate to an invoice or copy an estimate, the discount settings are preserved automatically.</P>
        <H>Sorting</H>
        <P>Click any column header (No., Date, Client, Patient, Total, Status) to sort the table. First click sorts ascending (↑), second click sorts descending (↓), third click returns to ascending. The sort indicator appears next to the column name.</P>
      </div>
    )},

    { id: 'directclaim', icon: '🏥', title: 'Direct Claiming — Submitting Directly to Medical Aid', content: (
      <div>
        <P>Direct Claiming is for invoices you submit <strong>directly to the medical aid</strong>, bypassing the dentist. When claimed:</P>
        <UL>
          <li>The invoice is <strong>removed from the dentist's account statement</strong> and age analysis — it no longer shows as money owed by the dentist.</li>
          <li>It stays in the <strong>Invoices list</strong> for your records, marked with a light-blue <em>CLAIMED</em> badge.</li>
          <li>It appears in the <strong>Direct Claimed</strong> page (sidebar), sorted by claim date.</li>
          <li>A PDF copy is <strong>automatically saved</strong> to a <em>"Send to Direct Claiming"</em> subfolder inside your working folder.</li>
        </UL>
        <H>How to Claim an Invoice</H>
        <OL>
          <li>First make sure you have a <strong>Working Folder</strong> set in Settings → <em>Auto-Backup &amp; Working Folder</em>.</li>
          <li>Go to <em>Invoices</em> and find the invoice to submit.</li>
          <li>Click the blue <strong>CLAIM</strong> button on that row.</li>
          <li>The invoice is immediately marked <em>CLAIMED</em> and removed from the dentist's statement. A PDF is saved to your folder.</li>
        </OL>
        <H>Reversing a Claim</H>
        <P>Click <strong>UNCLAIM</strong> on the invoice (in Invoices or on the Direct Claimed page) to restore it to the dentist's account.</P>
      </div>
    )},

    { id: 'clients', icon: '👨‍⚕️', title: 'Dentist/Practice — Managing Clients', content: (
      <div>
        <P>Each record represents a dental practice or dentist you work for.</P>
        <H>Key Fields</H>
        <UL>
          <li><strong>Dentist / Practice Name</strong> — required. Shown on invoices, statements and the age analysis.</li>
          <li><strong>Referring PCNS</strong> — the dentist's practice number. Printed on invoices — required for medical aid claims.</li>
          <li><strong>WhatsApp</strong> — if filled in, this number is used for WhatsApp invoice sending (instead of Phone).</li>
        </UL>
        <H>Receiving a Payment</H>
        <P>Click the <strong>+ Payment</strong> button on any dentist row to record a payment received.</P>
        <OL>
          <li>Enter the <strong>date</strong>, <strong>amount received</strong>, <strong>reference</strong> (e.g. EFT ref), and <strong>method</strong>.</li>
          <li>Outstanding invoices are listed oldest-first. The amount is <strong>auto-allocated</strong> to the oldest invoices first — you can adjust any allocation manually.</li>
          <li>Any amount not allocated to an invoice is saved as <strong>credit</strong> on the dentist's account and applied automatically next time.</li>
          <li>Choose the receipt method: <strong>Print</strong>, <strong>WhatsApp</strong>, or <strong>Both</strong> — a payment receipt is issued immediately.</li>
          <li>Click <em>Save &amp; Issue Receipt</em>.</li>
        </OL>
        <H>Editing a Payment</H>
        <P>Click the <strong>✏</strong> icon in the payment history panel to edit an existing payment. All invoice balances update automatically when you save.</P>
        <H>Payment History</H>
        <P>Click <strong>▼ Payment history</strong> under a dentist row to see all payments received. From there you can re-print or re-send any receipt via WhatsApp.</P>
        <H>Credit Balance</H>
        <P>If a dentist has paid more than their outstanding invoices, the excess is shown as a <strong style={{ color: '#059669' }}>Credit</strong> badge in green. It is applied automatically in the next payment modal.</P>
        <H>Age Analysis (per dentist)</H>
        <P>Below each dentist you see their outstanding balance split into: <strong>Current</strong> (0–30 days), <strong>30 Days</strong> (31–60 days), and <strong>60+ Days</strong>. Amounts reflect the <em>remaining balance</em> after any payments — partial payments reduce the outstanding amount. Direct Claimed invoices are excluded.</P>
        <H>Printing a Statement</H>
        <P>If a dentist has an outstanding balance a <em>Statement</em> button appears. Click it to open a print-ready A4 account statement with all unpaid/partial invoices and an age analysis summary. Print with Ctrl+P / Cmd+P.</P>
        <H>CSV Import/Export</H>
        <P>Export all dentists to CSV, edit in Excel, and re-import to update the list. Columns: Name, Practice, Email, Phone, WhatsApp, Address, Webpage, Notes, ReferringPCNS.</P>
      </div>
    )},

    { id: 'tariffs', icon: '🏷️', title: 'Tariffs — Codes & Prices', content: (
      <div>
        <P>Tariffs are the billing codes used on invoices. A full set of South African dental lab codes is pre-loaded with English and Afrikaans descriptions.</P>
        <H>Editing Prices</H>
        <P>Click <strong>✏ Edit</strong> on any tariff to update its price. Prices are <strong>VAT-inclusive</strong>. Update prices at the start of each year when your rate card changes.</P>
        <H>Adding a Custom Code</H>
        <P>Click <em>Add Tariff</em> and fill in the code, description, Afrikaans description, category and price.</P>
        <H>Bulk Price Increase</H>
        <P>Use the <strong>Price Increase</strong> panel (just below the search bar) to raise prices across codes in one step at the start of each tariff year:</P>
        <OL>
          <li>Choose the <strong>scope</strong> from the first dropdown: <em>All Tariffs</em> to increase every tariff, or <em>'97' Codes Only</em> to increase only tariffs whose <strong>Tariff Code</strong> starts with <strong>97</strong>.</li>
          <li>Set the <strong>percentage</strong> — type it directly or click the chevron (▾) to pick a preset (1 %, 2 %, 5 %, 10 %, …).</li>
          <li>Click <em>Apply Increase</em> and confirm the prompt. Prices are updated immediately and rounded to 2 decimal places.</li>
          <li>If a backup folder is connected, <em>Tariffs.csv</em> is updated automatically within 2 seconds. Otherwise use <em>Export to CSV</em> after applying.</li>
        </OL>
        <H>User Code vs Tariff Code</H>
        <P>Each tariff has two separate codes:</P>
        <UL>
          <li><strong>User Code</strong> — your internal lab code, shown on printed invoices (e.g. <em>8201</em>). This is what you use day-to-day.</li>
          <li><strong>Tariff Code</strong> — the medical aid billing code submitted for direct claims (e.g. <em>9736</em>). If left blank it defaults to the User Code.</li>
        </UL>
        <P>In the tariff table, the Tariff Code is shown in <span style={{ color: '#7c3aed', fontFamily: 'monospace' }}>purple</span> when it differs from the User Code, and in grey when they are the same.</P>
        <P><strong>8000-series codes</strong> (User Codes starting with 8) are automatically assigned Tariff Code <strong>9736</strong> on first load — this is the standard South African dental lab billing rule for those procedures.</P>
        <P>On printed invoices and estimates, and in PDF output, the <strong>Tariff Code</strong> is always printed — never the User Code. The User Code is only used internally within EasyDentalLab for easy searching and identification.</P>
        <H>CSV Import/Export</H>
        <P>Export all tariffs to CSV, edit prices in bulk in Excel, and re-import. Columns: <strong>UserCode</strong>, TariffCode, Description, DescriptionAFR, Price, PrevYearPrice, Category, Measure.</P>
        <H>Afrikaans Descriptions</H>
        <P>When an invoice or estimate is set to Afrikaans, all descriptions switch automatically using the <em>DescriptionAFR</em> field. You can edit or add Afrikaans descriptions for any tariff.</P>
      </div>
    )},

    { id: 'macros', icon: '⚡', title: 'Macros — Device Templates for Quick Invoicing', content: (
      <div>
        <P>A Macro is a named group of tariff codes you can add to an invoice with one click — e.g. "PFM Crown" might include crown, try-in and shade codes.</P>
        <H>Creating a Macro</H>
        <OL>
          <li>Go to <em>Macros</em> and click <em>New Macro</em>.</li>
          <li>Give it a clear name (e.g. "Full Denture Upper &amp; Lower").</li>
          <li>Add codes one by one, adjusting quantities where needed.</li>
          <li>Click <em>Save Macro</em>. Macros display in alphabetical order.</li>
        </OL>
        <H>Using a Macro on an Invoice or Estimate</H>
        <OL>
          <li>Open a new or existing invoice/estimate.</li>
          <li>In the line items section, click the purple <em>From Macro</em> button.</li>
          <li>Search or scroll to find your macro and click it.</li>
          <li>All codes and quantities are added instantly. You can still adjust quantities or remove lines.</li>
        </OL>
        <H>Save as Macro (from Invoice/Estimate)</H>
        <P>When viewing an invoice or estimate with line items you want to reuse, click the <strong>✨ Save as Macro</strong> button. Enter a name and the entire line item list becomes a reusable macro instantly.</P>
        <H>Multiple Macros &amp; Duplicate Code Consolidation</H>
        <P>If you add multiple macros that contain the same tariff codes, EasyDentalLab automatically <strong>consolidates duplicate codes</strong> — instead of creating separate rows, the quantities are added together on a single line. A subtle notification shows how many codes were added and how many were consolidated. This also works when manually adding tariff codes that already exist in the line items.</P>
        <P style={{ fontSize: 12, color: 'var(--c-text3)', fontStyle: 'italic' }}>Example: Macro A has "0001 (PFM Crown) x2", Macro B has "0001 x1". After adding both, you'll see "0001 x3" on one row, not two separate rows.</P>
      </div>
    )},

    { id: 'backup', icon: '💾', title: 'Data, Backup & Restore', content: (
      <div>
        <P>All data is automatically saved in your browser's local storage on every change. It persists between sessions on the same computer and browser.</P>
        <H>Auto-Backup to Folder (Recommended)</H>
        <OL>
          <li>Go to Settings → <em>Auto-Backup &amp; Working Folder</em>.</li>
          <li>Click <em>Select Backup Folder</em> and choose the <em>EasyDentalLab</em> folder on your PC.</li>
          <li>The app automatically saves <em>Clients.csv</em>, <em>Tariffs.csv</em>, <em>Macros.csv</em>, <em>Payments.csv</em>, <em>MedicalAids.csv</em> and <em>EasyDentalLab-backup.json</em> every 2 seconds after any change.</li>
          <li>Click <em>Save Now</em> to trigger an immediate backup at any time.</li>
        </OL>
        <H>Manual JSON Backup &amp; Restore</H>
        <UL>
          <li>Click <em>Export Backup</em> to download a full JSON file with all data.</li>
          <li>To restore: click <em>Import Backup</em>, select the JSON file and confirm. <strong>This replaces all current data.</strong></li>
        </UL>
        <H>Moving to a New Computer</H>
        <OL>
          <li>On the old computer: click <em>Export Backup</em> in Settings to download the JSON.</li>
          <li>Copy the JSON file to the new computer (e.g. via email or USB).</li>
          <li>Open the app in a browser on the new computer.</li>
          <li>Go to Settings → <em>Import Backup</em> and select the JSON file.</li>
        </OL>
      </div>
    )},

    { id: 'printing', icon: '🖨️', title: 'Printing, PDF & WhatsApp', content: (
      <div>
        <H>Printing an Invoice or Estimate</H>
        <OL>
          <li>Click the <strong>printer icon</strong> on any invoice, estimate or statement.</li>
          <li>A print-ready A4 document opens in a new browser tab.</li>
          <li>Click <em>Print / Save as PDF</em>, or press <strong>Ctrl+P</strong> (Windows) / <strong>Cmd+P</strong> (Mac).</li>
          <li>To save as PDF: set the destination to <em>Save as PDF</em> in the print dialog.</li>
          <li>Set margins to <em>None</em> in the print dialog for best results.</li>
        </OL>
        <H>Downloading as PDF</H>
        <P>Click the <strong>📄 Download PDF</strong> button on any invoice or estimate to generate and download the PDF directly without opening the print dialog.</P>
        <H>Printing or Sending a Statement</H>
        <P>On the <em>Dentist/Practice</em> page, each dentist with an outstanding balance shows statement buttons next to their name. Which buttons appear depends on your settings (see Settings → <em>Statements &amp; Month-End</em>):</P>
        <UL>
          <li><strong>Print Statement</strong> — downloads the statement as a PDF (default) or opens the browser print dialog, depending on your Statement Format setting.</li>
          <li><strong>WhatsApp Statement</strong> (green button) — generates a PDF, downloads it, and opens WhatsApp Web pre-filled with the dentist's number. Attach the downloaded PDF before sending.</li>
        </UL>
        <H>Sending via WhatsApp</H>
        <OL>
          <li>Click the green <strong>💬 WhatsApp icon</strong> on any invoice or estimate.</li>
          <li>A PDF is generated and <strong>automatically downloaded</strong> to your computer.</li>
          <li>WhatsApp Web opens in a new tab with a pre-filled message to the dentist's number.</li>
          <li>In WhatsApp, click the <strong>paperclip / attachment</strong> icon and select the downloaded PDF before sending.</li>
        </OL>
        <H>Medical Aid Name Dropdown</H>
        <P>The <strong>Medical Aid Name</strong> field on invoices and estimates is a searchable dropdown. Click the <strong>▼ arrow</strong> on the right of the field to open the list, or start typing to filter. To edit the list:</P>
        <OL>
          <li>Go to Settings → <em>Auto-Backup &amp; Working Folder</em> and click <strong>MedicalAids.csv</strong> to download the file.</li>
          <li>Open it in Excel — one name per row under the <em>Name</em> header. Add or remove names and save.</li>
          <li>Place the saved file in your working folder, then click <em>Select Backup Folder</em> (same folder) to reload — the new list loads instantly.</li>
        </OL>
        <P>You can also type a name not in the list and press <strong>Enter</strong> to use it as a custom entry.</P>
        <H>Number of Copies</H>
        <P>By default, clicking the print button opens a document with <strong>2 copies</strong> ready to print on one go. To change this, go to Settings → <em>Print Layout</em> → <strong>Invoice Print Copies</strong>. Set to <em>1</em> for a single copy, or any higher number you need.</P>
        <H>Customising Print Layout</H>
        <P>Go to Settings → <em>Print Layout</em> to: upload your logo; set logo position (left/centre/right) and max height; adjust font sizes; set invoice print copies; and edit footer and confirmation messages printed on every document.</P>
      </div>
    )},

    { id: 'monthend', icon: '📅', title: 'Month-End Statements & Batch Sending', content: (
      <div>
        <P>The <strong>Month-End</strong> feature lets you send statements to all dentists with outstanding balances in one go — by print or WhatsApp. Configure it in Settings → <em>Statements &amp; Month-End</em>.</P>
        <H>Settings</H>
        <UL>
          <li><strong>Statement Send Method</strong> — <em>Print only</em>, <em>WhatsApp only</em>, or <em>Both</em>. Controls which buttons appear on the Dentist/Practice page.</li>
          <li><strong>Statement Format (Print)</strong> — <em>PDF (download file)</em> saves a PDF to your Downloads folder. <em>Browser Print</em> opens the browser print dialog. PDF is recommended as it matches the invoice PDF quality.</li>
          <li><strong>Month-End Mode</strong> — <em>Per Dentist only</em> shows buttons per dentist but no batch button. <em>Batch only</em> shows a Month-End batch button in the header. <em>Both</em> shows everything.</li>
        </UL>
        <H>Using the Month-End Batch Button</H>
        <OL>
          <li>Go to <em>Dentist/Practice</em> and click the blue <strong>Month-End</strong> button in the top-right.</li>
          <li>A list of all dentists with outstanding balances appears, all pre-selected.</li>
          <li>Tick or untick dentists as needed. The count updates live.</li>
          <li>Click <strong>Download PDFs</strong> (or <em>Print All</em>) to generate statements for all selected dentists. PDFs download one by one.</li>
          <li>Click <strong>Send via WhatsApp</strong> to send a statement to each selected dentist — the app opens one WhatsApp tab per dentist in sequence.</li>
        </OL>
        <H>Per-Dentist Statements</H>
        <P>You can also send a statement to a single dentist directly from their row on the Dentist/Practice page — click <em>Print Statement</em> or the green <em>Statement</em> (WhatsApp) button next to their name.</P>
        <H>Notes</H>
        <UL>
          <li>Statements only include <strong>unpaid, non-claimed</strong> invoices. Paid and Direct Claimed invoices are excluded.</li>
          <li>When sending via WhatsApp, your browser may block pop-ups. Allow pop-ups for this page in your browser settings if WhatsApp does not open.</li>
          <li>The dentist's phone/WhatsApp number must be saved on their profile for the WhatsApp link to be pre-filled.</li>
        </UL>
      </div>
    )},

    { id: 'vat', icon: '🧮', title: 'VAT & How Calculations Work', content: (
      <div>
        <P>EasyDentalLab uses <strong>VAT-inclusive pricing</strong> — all tariff prices already include VAT. The amount the dentist pays is always the VAT-inclusive total.</P>
        <H>How Invoices and Estimates Show VAT</H>
        <P>The totals block on every printed invoice or estimate shows two lines:</P>
        <UL>
          <li><strong>Invoice/Estimate total (incl. VAT at X%)</strong> — the full VAT-inclusive amount the client pays (bold).</li>
          <li><strong>VAT at X% included</strong> — the VAT component extracted from the total, shown separately for reference.</li>
        </UL>
        <P>Example at 15%: line items totalling R115.00 → Invoice total R115.00, VAT included R15.00.</P>
        <H>Setting Your VAT Rate</H>
        <P>Go to Settings → Business Profile → <strong>VAT %</strong>. Set to <em>15</em> for South Africa's current rate. If not VAT-registered, set to <em>0</em> — the invoice will show the total with "(no VAT)" and no VAT line.</P>
      </div>
    )},

    { id: 'numbering', icon: '🔢', title: 'Document Numbering', content: (
      <div>
        <P>Invoice and estimate numbers are assigned automatically and count up by 1. You can set the starting number in Settings → <em>Document Numbering</em>.</P>
        <UL>
          <li>To start from a specific number (e.g. 1001), set <em>Next Invoice Number</em> to 1001 before creating the first invoice.</li>
          <li>To continue a sequence from a previous system, set the next number accordingly.</li>
          <li>Changing the number only affects new documents — existing invoices are unchanged.</li>
        </UL>
      </div>
    )},

    { id: 'accounting', icon: '📒', title: 'Accounting Export — Pastel & QuickBooks', content: (
      <div>
        <P>Export invoices for import into your accounting software from Settings → <em>Accounting Export</em>.</P>
        <H>Pastel (CSV)</H>
        <OL>
          <li>Select <em>Pastel (CSV)</em> in the Format dropdown.</li>
          <li>Optionally filter by date range or status.</li>
          <li>Click <em>Export</em>. Import the CSV into Pastel Evolution or Partner using its standard CSV import function.</li>
        </OL>
        <H>QuickBooks (IIF)</H>
        <OL>
          <li>Select <em>QuickBooks (IIF)</em> in the Format dropdown.</li>
          <li>Apply any filters and click <em>Export</em>.</li>
          <li>Import the IIF file via QuickBooks <em>File → Utilities → Import → IIF Files</em>.</li>
        </OL>
      </div>
    )},

    { id: 'tips', icon: '💡', title: 'Tips & Keyboard Shortcuts', content: (
      <div>
        <H>Line Item Entry Shortcuts</H>
        <UL>
          <li><strong>Type</strong> to search — code dropdown shows sequential codes; as you type, the closest match is highlighted.</li>
          <li><strong>↑ Up Arrow</strong> — navigate up in the dropdown when it's open.</li>
          <li><strong>↓ Down Arrow</strong> when dropdown is <strong>open</strong> — navigate down to the next code in the list.</li>
          <li><strong>↓ Down Arrow</strong> when dropdown is <strong>closed</strong> — confirms the highlighted code and adds a new blank line below (fast workflow for sequential entry).</li>
          <li><strong>Enter</strong> — confirms the highlighted code, fills in description and price, moves to Qty field.</li>
          <li><strong>Ctrl+Enter</strong> (Windows) or <strong>Cmd+Enter</strong> (Mac) — confirms code and adds a new blank line below (alternative fast workflow).</li>
          <li><strong>Tab</strong> — confirms the highlighted code and moves to next field naturally.</li>
          <li><strong>Escape</strong> — closes dropdown without selecting.</li>
        </UL>
        <H>General Tips</H>
        <UL>
          <li>The sidebar can be <strong>collapsed</strong> by clicking the logo/E icon at the top — useful on smaller screens.</li>
          <li>Data saves automatically — there is no Save button for most actions (only for Settings profile).</li>
          <li>If you ever lose browser data, use <em>Import Backup</em> in Settings with the JSON file from your backup folder to restore everything.</li>
          <li>To reset tariff prices to defaults, go to Tariffs → <em>Load from CSV</em> and import the <em>Tariffs.csv</em> from your backup folder.</li>
          <li>Only edit data in <strong>one browser tab at a time</strong> — multiple tabs share the same storage, and the last save wins.</li>
          <li>The app works <strong>fully offline</strong> after the page first loads — no internet connection is needed.</li>
          <li>To change your logo on printed documents, go to Settings → Print Layout → <em>Upload Logo</em>.</li>
        </UL>
      </div>
    )},

    { id: 'darkmode', icon: '🌙', title: 'Dark Mode / Light Mode', content: (
      <div>
        <P>EasyDentalLab supports a dark colour scheme that is easier on the eyes in low-light environments.</P>
        <H>Switching modes</H>
        <UL>
          <li>Click the <strong>moon icon</strong> (🌙) in the top-right corner of any page to switch to dark mode.</li>
          <li>Click the <strong>sun icon</strong> (☀) to switch back to light mode.</li>
          <li>Your preference is saved automatically and remembered the next time you open the app.</li>
        </UL>
        <H>What changes</H>
        <UL>
          <li>The sidebar, page background, cards, modals, and all form inputs adapt to the chosen theme.</li>
          <li>Printed invoices and PDFs are always printed in light mode — dark mode only affects the screen display.</li>
        </UL>
      </div>
    )},
  ];

  return (
    <div style={{
      background: 'var(--c-surface)',
      borderRadius: 12,
      padding: 24,
      border: '1px solid var(--c-border)',
      marginTop: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 22 }}>❓</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--c-text1)' }}>Help &amp; User Guide</h2>
      </div>
      <p style={{ fontSize: 13, color: 'var(--c-text3)', margin: '0 0 16px' }}>Click any topic to expand it.</p>

      {topics.map(topic => (
        <div key={topic.id} style={{
          borderRadius: 8,
          border: '1px solid var(--c-border)',
          marginBottom: 8,
          overflow: 'hidden'
        }}>
          <button
            onClick={() => toggle(topic.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: open === topic.id ? 'var(--c-sel)' : 'var(--c-surface2)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{topic.icon}</span>
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: open === topic.id ? '#2563eb' : 'var(--c-text1)'
              }}>{topic.title}</span>
            </div>
            <span style={{
              fontSize: 13,
              color: 'var(--c-text3)',
              flexShrink: 0,
              transform: open === topic.id ? 'rotate(180deg)' : 'none',
              display: 'inline-block',
              transition: 'transform 0.2s'
            }}>▾</span>
          </button>
          {open === topic.id && (
            <div style={{
              padding: '16px 20px',
              fontSize: 13,
              color: 'var(--c-text2)',
              lineHeight: 1.7,
              borderTop: '1px solid var(--c-border)',
              background: 'var(--c-surface)'
            }}>
              {topic.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
