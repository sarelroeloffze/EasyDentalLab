// ============================================================
// Help Content - Bilingual (English/Afrikaans)
// ============================================================

import React from 'react';

// Helper components for consistent formatting
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

export interface HelpTopic {
  id: string;
  icon: string;
  title: {
    en: string;
    af: string;
  };
  content: {
    en: React.ReactNode;
    af: React.ReactNode;
  };
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'start',
    icon: '🚀',
    title: {
      en: 'Getting Started — First Time Setup',
      af: 'Aan die Gang — Eerste Keer Opstelling'
    },
    content: {
      en: (
        <div>
          <P>Follow these steps when opening EasyDentalLab for the first time:</P>
          <OL>
            <li><strong>Fill in your Business Profile</strong> — go to Settings and enter your laboratory name, address, phone, email, VAT number, Laboratory Number and PCNS number. Click <em>Save Settings</em>.</li>
            <li><strong>Add your bank details</strong> — scroll to <em>Banking Details</em> and enter your bank name, account number and branch code. These print on every invoice.</li>
            <li><strong>Select a Working Folder</strong> — scroll to <em>Auto-Backup &amp; Working Folder</em> and click <em>Select Backup Folder</em>. Pick the folder where the app lives. This keeps CSV files and a full backup up to date automatically.</li>
            <li><strong>Check your Tariff codes</strong> — go to <em>Tariffs</em>. A full set of South African dental lab codes is already loaded. Edit prices to match your current rate card.</li>
            <li><strong>Add your Dentists</strong> — go to <em>Dentist/Practice</em> and add each dental practice you work for.</li>
            <li><strong>Create Macros (optional)</strong> — go to <em>Macros</em> and group common tariff codes into device templates for one-click invoice entry.</li>
            <li><strong>Create your first Invoice</strong> — go to <em>Invoices</em> and click <em>New Invoice</em>.</li>
          </OL>
        </div>
      ),
      af: (
        <div>
          <P>Volg hierdie stappe wanneer jy EasyDentalLab die eerste keer oopmaak:</P>
          <OL>
            <li><strong>Vul jou Besigheidsprofiel in</strong> — gaan na Instellings en voer jou laboratorium naam, adres, telefoon, e-pos, BTW-nommer, Laboratorium Nommer en PCNS-nommer in. Klik <em>Stoor Instellings</em>.</li>
            <li><strong>Voeg jou bankbesonderhede by</strong> — rol na <em>Bankbesonderhede</em> en voer jou banknaam, rekeningnommer en takkode in. Hierdie druk op elke faktuur.</li>
            <li><strong>Kies 'n Werkgids</strong> — rol na <em>Outo-Rugsteun &amp; Werkgids</em> en klik <em>Kies Rugsteun Gids</em>. Kies die gids waar die app leef. Dit hou CSV-lêers en 'n volledige rugsteun outomaties op datum.</li>
            <li><strong>Kyk jou Tariefkodes na</strong> — gaan na <em>Tariewe</em>. 'n Volledige stel Suid-Afrikaanse tandlaboratorium kodes is reeds gelaai. Wysig pryse om by jou huidige tariefkaart te pas.</li>
            <li><strong>Voeg jou Tandartse by</strong> — gaan na <em>Tandarts/Praktyk</em> en voeg elke tandartspraktyk waarvoor jy werk by.</li>
            <li><strong>Skep Makro's (opsioneel)</strong> — gaan na <em>Makro's</em> en groepeer algemene tariefkodes in toestelsjablone vir een-klik faktuur inskrywing.</li>
            <li><strong>Skep jou eerste Faktuur</strong> — gaan na <em>Fakture</em> en klik <em>Nuwe Faktuur</em>.</li>
          </OL>
        </div>
      )
    }
  },

  {
    id: 'dashboard',
    icon: '📊',
    title: {
      en: 'Dashboard',
      af: 'Dashboard'
    },
    content: {
      en: (
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
      ),
      af: (
        <div>
          <P>Die Dashboard gee jou 'n lewendige oorsig van jou praktyk op 'n oogopslag.</P>
          <UL>
            <li><strong>Aktiewe Tandartse</strong> — aantal tandarts/praktyk rekords (nie geargiveer nie).</li>
            <li><strong>Tariewe / Makro's</strong> — hoeveel tariefkodes en makro sjablone gelaai is.</li>
            <li><strong>Fakture (maand)</strong> — fakture geskep in die huidige kalendermaand.</li>
            <li><strong>Uitstaande</strong> — totale rand waarde van alle onbetaalde fakture, uitsluitend Direkte Geëis fakture.</li>
          </UL>
          <P>Die twee panele aan die onderkant wys jou 5 mees onlangse beramings en fakture.</P>
        </div>
      )
    }
  },

  {
    id: 'invoices',
    icon: '🧾',
    title: {
      en: 'Invoices — Creating, Editing & Managing',
      af: 'Fakture — Skep, Wysig & Bestuur'
    },
    content: {
      en: (
        <div>
          <H>Creating an Invoice</H>
          <OL>
            <li>Go to <em>Invoices</em> and click <em>New Invoice</em>.</li>
            <li>Select a <strong>Dentist</strong> from the dropdown (type to search).</li>
            <li>Enter <strong>Patient Surname</strong> and <strong>Patient Name</strong> — required for medical aid claims.</li>
            <li>Optionally fill in <strong>Medical Aid Name</strong> — select from the list or type a custom name and press Enter.</li>
            <li>Add line items — type a tariff code; press <strong>Enter</strong> to confirm and move to Qty field. Press <strong>Ctrl+Enter</strong> to confirm the code and add a new line. Or click <em>From Macro</em> to add a full device template.</li>
            <li>Choose <strong>English or Afrikaans</strong> — all descriptions switch language automatically.</li>
            <li>Click <em>Save Invoice</em>.</li>
          </OL>
          <H>Invoice Buttons</H>
          <UL>
            <li><strong>🖨 Print</strong> — opens print-ready invoice</li>
            <li><strong>📄 Download PDF</strong> — generates and downloads PDF</li>
            <li><strong>💬 WhatsApp</strong> — generates PDF and opens WhatsApp</li>
            <li><strong>✓ Check mark</strong> — toggles Paid/Unpaid status</li>
            <li><strong>⧉ Copy</strong> — duplicate with options (All/Patient/Detail)</li>
            <li><strong>✨ Save as Macro</strong> — convert to reusable macro</li>
            <li><strong>✏ Edit</strong> — modify invoice details</li>
            <li><strong>🗑 Delete</strong> — permanently remove</li>
            <li><strong style={{ color: '#2563eb' }}>CLAIM</strong> — mark as Direct Claim</li>
          </UL>
          <H>Status Badges</H>
          <UL>
            <li><strong style={{ background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: 9999 }}>paid</strong> — fully settled</li>
            <li><strong style={{ background: '#ffedd5', color: '#9a3412', padding: '1px 6px', borderRadius: 9999 }}>partial</strong> — partially paid</li>
            <li><strong style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 9999 }}>unpaid</strong> — no payment</li>
          </UL>
          <H>Discount Feature</H>
          <P>Apply a percentage discount to the invoice total before VAT. Tick the <strong>Discount</strong> checkbox, enter a percentage (default 15%). Discount settings are preserved when copying or converting.</P>
        </div>
      ),
      af: (
        <div>
          <H>Skep 'n Faktuur</H>
          <OL>
            <li>Gaan na <em>Fakture</em> en klik <em>Nuwe Faktuur</em>.</li>
            <li>Kies 'n <strong>Tandarts</strong> uit die aftreklys (tik om te soek).</li>
            <li>Voer <strong>Pasiënt Van</strong> en <strong>Pasiënt Naam</strong> in — vereis vir mediese fonds eise.</li>
            <li>Vul opsioneel <strong>Mediese Fonds Naam</strong> in — kies uit die lys of tik 'n pasgemaakte naam en druk Enter.</li>
            <li>Voeg lynitem by — tik 'n tariefkode; druk <strong>Enter</strong> om te bevestig en na Hoeveelheid veld te beweeg. Druk <strong>Ctrl+Enter</strong> om die kode te bevestig en 'n nuwe lyn by te voeg. Of klik <em>Van Makro</em> om 'n volledige toestelsjabloon by te voeg.</li>
            <li>Kies <strong>Engels of Afrikaans</strong> — alle beskrywings skakel outomaties taal.</li>
            <li>Klik <em>Stoor Faktuur</em>.</li>
          </OL>
          <H>Faktuur Knoppies</H>
          <UL>
            <li><strong>🖨 Druk</strong> — maak druk-gereed faktuur oop</li>
            <li><strong>📄 Laai PDF Af</strong> — genereer en laai PDF af</li>
            <li><strong>💬 WhatsApp</strong> — genereer PDF en maak WhatsApp oop</li>
            <li><strong>✓ Merkteken</strong> — wissel Betaal/Onbetaal status</li>
            <li><strong>⧉ Kopieer</strong> — dupliseer met opsies (Alles/Pasiënt/Detail)</li>
            <li><strong>✨ Stoor as Makro</strong> — omskep na herbruikbare makro</li>
            <li><strong>✏ Wysig</strong> — verander faktuur besonderhede</li>
            <li><strong>🗑 Verwyder</strong> — verwyder permanent</li>
            <li><strong style={{ color: '#2563eb' }}>EIS</strong> — merk as Direkte Eis</li>
          </UL>
          <H>Status Merkers</H>
          <UL>
            <li><strong style={{ background: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: 9999 }}>betaal</strong> — volledig vereffen</li>
            <li><strong style={{ background: '#ffedd5', color: '#9a3412', padding: '1px 6px', borderRadius: 9999 }}>gedeeltelik</strong> — gedeeltelik betaal</li>
            <li><strong style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 9999 }}>onbetaal</strong> — geen betaling</li>
          </UL>
          <H>Afslag Funksie</H>
          <P>Pas 'n persentasie afslag toe op die faktuur totaal voor BTW. Merk die <strong>Afslag</strong> merkblokkie, voer 'n persentasie in (verstek 15%). Afslag instellings word bewaar wanneer kopieer of omskakel.</P>
        </div>
      )
    }
  },

  {
    id: 'pricing',
    icon: '💵',
    title: {
      en: 'Medical Aid Rates — Per-Aid Pricing (Advanced)',
      af: 'Mediese Fonds Tariewe — Per-Fonds Pryse (Gevorderd)'
    },
    content: {
      en: (
        <div>
          <P>EasyDentalLab supports two pricing modes:</P>
          <UL>
            <li><strong>Single Price List</strong> (default) — one set of prices for all medical aids.</li>
            <li><strong>Per-Medical-Aid Pricing</strong> — different prices for each medical aid (e.g., Discovery rates ≠ Bonitas rates).</li>
          </UL>
          <H>Enabling Per-Aid Pricing</H>
          <OL>
            <li>Go to <em>Settings</em> → scroll to <em>Pricing Mode</em>.</li>
            <li>Select <strong>Per-Medical-Aid Pricing</strong>.</li>
            <li>A new page <strong>Medical Aid Rates</strong> (💵) appears in the sidebar.</li>
          </OL>
          <H>Setting Custom Rates</H>
          <OL>
            <li>Go to <em>Medical Aid Rates</em>.</li>
            <li>Select a medical aid from the dropdown.</li>
            <li>Click <strong>Copy All from Standard Rates</strong> to initialize pricing.</li>
            <li>Click <strong>Edit Price</strong> next to any tariff code to set a custom price.</li>
            <li>Custom prices are highlighted in <strong style={{ color: '#10b981' }}>green</strong>.</li>
            <li>Click <strong>Revert</strong> to restore a tariff to standard pricing.</li>
          </OL>
          <H>How It Works</H>
          <P>When creating invoices/estimates:</P>
          <UL>
            <li>Select a medical aid → tariff codes auto-fill with <strong>custom prices</strong> if defined.</li>
            <li>If no custom price exists, the <strong>standard price</strong> is used.</li>
            <li>Prices update automatically as you add codes from tariffs or macros.</li>
          </UL>
          <H>Backup &amp; Sync</H>
          <P>Custom rates are saved to <strong>MedicalAidTariffs.csv</strong> in your working folder. This syncs across PCs via Dropbox just like other data files.</P>
        </div>
      ),
      af: (
        <div>
          <P>EasyDentalLab ondersteun twee prysingsmodusse:</P>
          <UL>
            <li><strong>Enkele Pryslys</strong> (verstek) — een stel pryse vir alle mediese fondse.</li>
            <li><strong>Per-Mediese-Fonds Pryse</strong> — verskillende pryse vir elke mediese fonds (bv., Discovery tariewe ≠ Bonitas tariewe).</li>
          </UL>
          <H>Aktivering van Per-Fonds Pryse</H>
          <OL>
            <li>Gaan na <em>Instellings</em> → rol na <em>Prysingmodus</em>.</li>
            <li>Kies <strong>Per-Mediese-Fonds Pryse</strong>.</li>
            <li>'n Nuwe bladsy <strong>Mediese Fonds Tariewe</strong> (💵) verskyn in die sykant.</li>
          </OL>
          <H>Stel Pasgemaakte Tariewe</H>
          <OL>
            <li>Gaan na <em>Mediese Fonds Tariewe</em>.</li>
            <li>Kies 'n mediese fonds uit die aftreklys.</li>
            <li>Klik <strong>Kopieer Alles van Standaard Tariewe</strong> om pryse te initialiseer.</li>
            <li>Klik <strong>Wysig Prys</strong> langs enige tariefkode om 'n pasgemaakte prys te stel.</li>
            <li>Pasgemaakte pryse word in <strong style={{ color: '#10b981' }}>groen</strong> uitgelig.</li>
            <li>Klik <strong>Herstel</strong> om 'n tarief na standaard pryse te herstel.</li>
          </OL>
          <H>Hoe Dit Werk</H>
          <P>Wanneer jy fakture/beramings skep:</P>
          <UL>
            <li>Kies 'n mediese fonds → tariefkodes vul outomaties met <strong>pasgemaakte pryse</strong> indien gedefinieer.</li>
            <li>Indien geen pasgemaakte prys bestaan nie, word die <strong>standaard prys</strong> gebruik.</li>
            <li>Pryse werk outomaties op soos jy kodes byvoeg van tariewe of makro's.</li>
          </UL>
          <H>Rugsteun &amp; Sinkronisasie</H>
          <P>Pasgemaakte tariewe word gestoor na <strong>MedicalAidTariffs.csv</strong> in jou werkgids. Dit sinkroniseer oor PC's via Dropbox net soos ander data lêers.</P>
        </div>
      )
    }
  },

  {
    id: 'tariffs',
    icon: '🏷️',
    title: {
      en: 'Tariffs — Codes & Prices',
      af: 'Tariewe — Kodes & Pryse'
    },
    content: {
      en: (
        <div>
          <P>The Tariffs page manages all your tariff codes and prices. A full set of South African dental lab codes is pre-loaded.</P>
          <H>Editing Prices</H>
          <P>Click <strong>Edit</strong> on any tariff to change its price, description, or category. Changes apply immediately to new invoices/estimates (existing documents keep their original prices).</P>
          <H>Price Updates</H>
          <P>EasyDentalLab can automatically check for updated tariff prices from the cloud:</P>
          <UL>
            <li>Click <strong>Check for Updates</strong> to see if new rates are available.</li>
            <li>Review the changes (added/updated/removed codes) in the preview modal.</li>
            <li>Click <strong>Apply Update</strong> to update your tariff list.</li>
            <li>A backup is created automatically before any update.</li>
          </UL>
          <P>Alternatively, click <strong>Import from File</strong> to manually upload a Tariffs CSV file.</P>
        </div>
      ),
      af: (
        <div>
          <P>Die Tariewe bladsy bestuur al jou tariefkodes en pryse. 'n Volledige stel Suid-Afrikaanse tandlaboratorium kodes is vooraf gelaai.</P>
          <H>Wysig Pryse</H>
          <P>Klik <strong>Wysig</strong> op enige tarief om sy prys, beskrywing, of kategorie te verander. Veranderings geld onmiddellik vir nuwe fakture/beramings (bestaande dokumente hou hul oorspronklike pryse).</P>
          <H>Prys Opdaterings</H>
          <P>EasyDentalLab kan outomaties kontroleer vir opgedateerde tariefpryse van die wolk:</P>
          <UL>
            <li>Klik <strong>Kontroleer vir Opdaterings</strong> om te sien of nuwe tariewe beskikbaar is.</li>
            <li>Hersien die veranderinge (bygevoegde/opgedateerde/verwyderde kodes) in die voorskou venster.</li>
            <li>Klik <strong>Pas Opdatering Toe</strong> om jou tarieflys op te dateer.</li>
            <li>'n Rugsteun word outomaties geskep voor enige opdatering.</li>
          </UL>
          <P>Alternatiewelik, klik <strong>Voer in van Lêer</strong> om handmatig 'n Tariewe CSV-lêer op te laai.</P>
        </div>
      )
    }
  },

  {
    id: 'backup',
    icon: '💾',
    title: {
      en: 'Data, Backup & Restore',
      af: 'Data, Rugsteun & Herstel'
    },
    content: {
      en: (
        <div>
          <P>EasyDentalLab automatically backs up your data to keep it safe.</P>
          <H>Working Folder</H>
          <P>Go to Settings → <em>Auto-Backup &amp; Working Folder</em> → <strong>Select Backup Folder</strong>. Choose the folder where the app lives (e.g., your EasyDentalLab folder). The app will automatically save backup files there every time data changes (2-second delay).</P>
          <H>What Gets Backed Up</H>
          <UL>
            <li><strong>Clients.csv</strong> — all dentist/practice records</li>
            <li><strong>Tariffs.csv</strong> — all tariff codes and prices</li>
            <li><strong>Macros.csv</strong> — all macro templates</li>
            <li><strong>Payments.csv</strong> — all payment records</li>
            <li><strong>MedicalAids.csv</strong> — medical aid names and plans</li>
            <li><strong>MedicalAidTariffs.csv</strong> — custom per-aid pricing (if using per-aid mode)</li>
            <li><strong>EasyDentalLab-backup.json</strong> — complete backup of all data (invoices, estimates, settings, everything)</li>
          </UL>
          <H>Multi-PC Sync (Dropbox)</H>
          <P>If you use Dropbox, place your working folder inside Dropbox. All CSV files and the JSON backup will sync automatically across all your PCs. Any changes on PC1 appear on PC2 within seconds.</P>
        </div>
      ),
      af: (
        <div>
          <P>EasyDentalLab rugsteun jou data outomaties om dit veilig te hou.</P>
          <H>Werkgids</H>
          <P>Gaan na Instellings → <em>Outo-Rugsteun &amp; Werkgids</em> → <strong>Kies Rugsteun Gids</strong>. Kies die gids waar die app leef (bv., jou EasyDentalLab gids). Die app sal outomaties rugsteun lêers daar stoor elke keer as data verander (2-sekonde vertraging).</P>
          <H>Wat Word Gerugsteun</H>
          <UL>
            <li><strong>Clients.csv</strong> — alle tandarts/praktyk rekords</li>
            <li><strong>Tariffs.csv</strong> — alle tariefkodes en pryse</li>
            <li><strong>Macros.csv</strong> — alle makro sjablone</li>
            <li><strong>Payments.csv</strong> — alle betalingsrekords</li>
            <li><strong>MedicalAids.csv</strong> — mediese fonds name en planne</li>
            <li><strong>MedicalAidTariffs.csv</strong> — pasgemaakte per-fonds pryse (indien per-fonds modus gebruik)</li>
            <li><strong>EasyDentalLab-backup.json</strong> — volledige rugsteun van alle data (fakture, beramings, instellings, alles)</li>
          </UL>
          <H>Multi-PC Sinkronisasie (Dropbox)</H>
          <P>As jy Dropbox gebruik, plaas jou werkgids binne Dropbox. Alle CSV-lêers en die JSON rugsteun sal outomaties sinkroniseer oor al jou PC's. Enige veranderinge op PC1 verskyn op PC2 binne sekondes.</P>
        </div>
      )
    }
  },

  {
    id: 'tips',
    icon: '💡',
    title: {
      en: 'Tips & Keyboard Shortcuts',
      af: 'Wenke & Sleutelbordkortpaaie'
    },
    content: {
      en: (
        <div>
          <H>Line Item Entry Shortcuts</H>
          <UL>
            <li><strong>Type to search</strong> — Start typing a tariff code in the Code column. The dropdown shows matching codes automatically.</li>
            <li><strong>Enter</strong> — Confirm the highlighted code and move to Qty field.</li>
            <li><strong>Ctrl+Enter</strong> (Windows) or <strong>Cmd+Enter</strong> (Mac) — Confirm the code and add a new blank line below.</li>
            <li><strong>Arrow Up/Down</strong> — Navigate through the dropdown list when open.</li>
            <li><strong>Down Arrow from Qty/Description/Price</strong> — Move to the next line (creates a new line if on the last row).</li>
          </UL>
          <H>Duplicate Code Handling</H>
          <P>If you add a tariff code that already exists in the invoice, the quantity automatically increases instead of creating a duplicate row. A notification confirms this.</P>
          <H>Quick Copy</H>
          <P><strong>Right-click</strong> any invoice or estimate row to open the copy menu instantly (instead of clicking the ⧉ button).</P>
          <H>Sorting Tables</H>
          <P>Click any column header to sort. First click = ascending, second click = descending. Works on Invoices, Estimates, Clients, Tariffs, and Macros pages.</P>
        </div>
      ),
      af: (
        <div>
          <H>Lynitem Inskrywing Kortpaaie</H>
          <UL>
            <li><strong>Tik om te soek</strong> — Begin tik 'n tariefkode in die Kode kolom. Die aftreklys wys ooreenstemmende kodes outomaties.</li>
            <li><strong>Enter</strong> — Bevestig die uitgeligte kode en beweeg na Hoeveelheid veld.</li>
            <li><strong>Ctrl+Enter</strong> (Windows) of <strong>Cmd+Enter</strong> (Mac) — Bevestig die kode en voeg 'n nuwe leë lyn by onder.</li>
            <li><strong>Pyl Op/Af</strong> — Navigeer deur die aftreklys wanneer oop.</li>
            <li><strong>Pyl Af van Hoeveelheid/Beskrywing/Prys</strong> — Beweeg na die volgende lyn (skep 'n nuwe lyn indien op die laaste ry).</li>
          </UL>
          <H>Duplikaat Kode Hantering</H>
          <P>As jy 'n tariefkode byvoeg wat reeds in die faktuur bestaan, verhoog die hoeveelheid outomaties in plaas van om 'n duplikaat ry te skep. 'n Kennisgewing bevestig dit.</P>
          <H>Vinnige Kopieer</H>
          <P><strong>Regskliek</strong> enige faktuur of beraming ry om die kopieer kieslys onmiddellik oop te maak (in plaas van om die ⧉ knoppie te klik).</P>
          <H>Sorteer Tabelle</H>
          <P>Klik enige kolomkop om te sorteer. Eerste klik = stygende, tweede klik = dalende. Werk op Fakture, Beramings, Kliënte, Tariewe, en Makro's bladsye.</P>
        </div>
      )
    }
  },

  {
    id: 'estimates',
    icon: '📋',
    title: {
      en: 'Estimates — Creating & Converting to Invoice',
      af: 'Beramings — Skep & Omskakel na Faktuur'
    },
    content: {
      en: (
        <div>
          <P>Estimates are quotations sent to dentists before work begins. They work exactly like invoices but are clearly marked as estimates.</P>
          <H>Creating an Estimate</H>
          <OL>
            <li>Go to <em>Estimates</em> and click <em>New Estimate</em>.</li>
            <li>Fill in Dentist, patient details and line items — same as an invoice.</li>
            <li>Optionally set a <strong>Valid Until</strong> date.</li>
            <li>Click <em>Save Estimate</em>.</li>
          </OL>
          <H>Converting to an Invoice</H>
          <P>Once the work is approved and completed, click the <strong>→ arrow button</strong> on the estimate. A new invoice is instantly created with all the same details. Prices are automatically updated to the <strong>current tariff rates</strong> at the time of conversion. The estimate is marked as <em>Invoiced</em>, and the invoice shows a clickable reference back to the estimate number.</P>
          <H>Copying an Estimate</H>
          <P>Click the <strong>⧉ Copy button</strong> (or <strong>right-click</strong> the estimate row) to create a duplicate. You'll see 3 options: <em>Copy All</em>, <em>Patient Only</em>, or <em>Detail Only</em>. Discount settings are preserved when copying.</P>
        </div>
      ),
      af: (
        <div>
          <P>Beramings is kwotasies wat aan tandartse gestuur word voor werk begin. Hulle werk presies soos fakture maar is duidelik gemerk as beramings.</P>
          <H>Skep 'n Beraming</H>
          <OL>
            <li>Gaan na <em>Beramings</em> en klik <em>Nuwe Beraming</em>.</li>
            <li>Vul Tandarts, pasiënt besonderhede en lynitem in — dieselfde as 'n faktuur.</li>
            <li>Stel opsioneel 'n <strong>Geldig Tot</strong> datum.</li>
            <li>Klik <em>Stoor Beraming</em>.</li>
          </OL>
          <H>Omskakel na 'n Faktuur</H>
          <P>Sodra die werk goedgekeur en voltooi is, klik die <strong>→ pyltjie knoppie</strong> op die beraming. 'n Nuwe faktuur word onmiddellik geskep met al dieselfde besonderhede. Pryse word outomaties opgedateer na die <strong>huidige tarief tariewe</strong> ten tyde van omskakel. Die beraming word gemerk as <em>Gefaktureer</em>, en die faktuur wys 'n klikbare verwysing terug na die beraming nommer.</P>
          <H>Kopieer 'n Beraming</H>
          <P>Klik die <strong>⧉ Kopieer knoppie</strong> (of <strong>regskliek</strong> die beraming ry) om 'n duplikaat te skep. Jy sal 3 opsies sien: <em>Kopieer Alles</em>, <em>Slegs Pasiënt</em>, of <em>Slegs Detail</em>. Afslag instellings word bewaar wanneer kopieer.</P>
        </div>
      )
    }
  },

  {
    id: 'directclaim',
    icon: '🏥',
    title: {
      en: 'Direct Claiming — Submitting Directly to Medical Aid',
      af: 'Direkte Eis — Indien Direk by Mediese Fonds'
    },
    content: {
      en: (
        <div>
          <P>Direct Claiming is for invoices you submit <strong>directly to the medical aid</strong>, bypassing the dentist. When claimed:</P>
          <UL>
            <li>The invoice is <strong>removed from the dentist's account statement</strong> and age analysis.</li>
            <li>It stays in the <strong>Invoices list</strong> for your records, marked with a light-blue <em>CLAIMED</em> badge.</li>
            <li>It appears in the <strong>Direct Claimed</strong> page (sidebar), sorted by claim date.</li>
            <li>A PDF copy is <strong>automatically saved</strong> to a <em>"Send to Direct Claiming"</em> subfolder inside your working folder.</li>
          </UL>
          <H>How to Claim an Invoice</H>
          <OL>
            <li>First make sure you have a <strong>Working Folder</strong> set in Settings.</li>
            <li>Go to <em>Invoices</em> and find the invoice to submit.</li>
            <li>Click the blue <strong>CLAIM</strong> button on that row.</li>
            <li>The invoice is immediately marked <em>CLAIMED</em> and removed from the dentist's statement. A PDF is saved to your folder.</li>
          </OL>
          <H>Reversing a Claim</H>
          <P>Click <strong>UNCLAIM</strong> on the invoice to restore it to the dentist's account.</P>
        </div>
      ),
      af: (
        <div>
          <P>Direkte Eis is vir fakture wat jy <strong>direk by die mediese fonds</strong> indien, die tandarts omseil. Wanneer geëis:</P>
          <UL>
            <li>Die faktuur word <strong>verwyder van die tandarts se rekeningopgawe</strong> en ouderdomsanalise.</li>
            <li>Dit bly in die <strong>Fakture lys</strong> vir jou rekords, gemerk met 'n ligblou <em>GEËIS</em> merker.</li>
            <li>Dit verskyn in die <strong>Direkte Geëis</strong> bladsy (sykant), gesorteer volgens eis datum.</li>
            <li>'n PDF kopie word <strong>outomaties gestoor</strong> na 'n <em>"Send to Direct Claiming"</em> subgids binne jou werkgids.</li>
          </UL>
          <H>Hoe om 'n Faktuur te Eis</H>
          <OL>
            <li>Maak eers seker jy het 'n <strong>Werkgids</strong> gestel in Instellings.</li>
            <li>Gaan na <em>Fakture</em> en vind die faktuur om in te dien.</li>
            <li>Klik die blou <strong>EIS</strong> knoppie op daardie ry.</li>
            <li>Die faktuur word onmiddellik gemerk as <em>GEËIS</em> en verwyder van die tandarts se opgawe. 'n PDF word gestoor na jou gids.</li>
          </OL>
          <H>Keer 'n Eis Om</H>
          <P>Klik <strong>ONEIS</strong> op die faktuur om dit terug te herstel na die tandarts se rekening.</P>
        </div>
      )
    }
  },

  {
    id: 'clients',
    icon: '👨‍⚕️',
    title: {
      en: 'Dentist/Practice — Managing Clients',
      af: 'Tandarts/Praktyk — Bestuur Kliënte'
    },
    content: {
      en: (
        <div>
          <P>Each record represents a dental practice or dentist you work for.</P>
          <H>Key Fields</H>
          <UL>
            <li><strong>Dentist / Practice Name</strong> — required. Shown on invoices, statements and age analysis.</li>
            <li><strong>Referring PCNS</strong> — the dentist's practice number. Printed on invoices — required for medical aid claims.</li>
            <li><strong>WhatsApp</strong> — if filled in, this number is used for WhatsApp invoice sending (instead of Phone).</li>
          </UL>
          <H>Receiving a Payment</H>
          <P>Click the <strong>+ Payment</strong> button on any dentist row to record a payment received.</P>
          <OL>
            <li>Enter the <strong>date</strong>, <strong>amount received</strong>, <strong>reference</strong>, and <strong>method</strong>.</li>
            <li>Outstanding invoices are listed oldest-first. The amount is <strong>auto-allocated</strong> to the oldest invoices first.</li>
            <li>Any amount not allocated is saved as <strong>credit</strong> on the dentist's account.</li>
            <li>Choose the receipt method: <strong>Print</strong>, <strong>WhatsApp</strong>, or <strong>Both</strong>.</li>
          </OL>
          <H>Age Analysis (5 Columns)</H>
          <P>The Clients table shows detailed aging buckets:</P>
          <UL>
            <li><strong>Current</strong> (0-30 days) — recent invoices</li>
            <li><strong>30 Days</strong> (31-60 days) — slightly overdue</li>
            <li><strong>60 Days</strong> (61-90 days) — <span style={{ color: '#dc2626' }}>red warning</span></li>
            <li><strong>90 Days</strong> (91-120 days) — <span style={{ color: '#dc2626' }}>red urgent</span></li>
            <li><strong>120+ Days</strong> — <span style={{ color: '#dc2626' }}>red critical</span></li>
          </UL>
        </div>
      ),
      af: (
        <div>
          <P>Elke rekord verteenwoordig 'n tandartspraktyk of tandarts waarvoor jy werk.</P>
          <H>Sleutelvelde</H>
          <UL>
            <li><strong>Tandarts / Praktyk Naam</strong> — vereis. Gewys op fakture, opgawes en ouderdomsanalise.</li>
            <li><strong>Verwysende PCNS</strong> — die tandarts se praktyk nommer. Gedruk op fakture — vereis vir mediese fonds eise.</li>
            <li><strong>WhatsApp</strong> — indien ingevul, word hierdie nommer gebruik vir WhatsApp faktuur stuur (in plaas van Telefoon).</li>
          </UL>
          <H>Ontvang 'n Betaling</H>
          <P>Klik die <strong>+ Betaling</strong> knoppie op enige tandarts ry om 'n betaling ontvang te noteer.</P>
          <OL>
            <li>Voer die <strong>datum</strong>, <strong>bedrag ontvang</strong>, <strong>verwysing</strong>, en <strong>metode</strong> in.</li>
            <li>Uitstaande fakture word gelys oudste-eerste. Die bedrag word <strong>outo-toegeken</strong> aan die oudste fakture eerste.</li>
            <li>Enige bedrag nie toegeken nie word gestoor as <strong>krediet</strong> op die tandarts se rekening.</li>
            <li>Kies die kwitansie metode: <strong>Druk</strong>, <strong>WhatsApp</strong>, of <strong>Beide</strong>.</li>
          </OL>
          <H>Ouderdomsanalise (5 Kolomme)</H>
          <P>Die Kliënte tabel wys gedetailleerde ouderdomsgroepe:</P>
          <UL>
            <li><strong>Huidige</strong> (0-30 dae) — onlangse fakture</li>
            <li><strong>30 Dae</strong> (31-60 dae) — effens agterstallig</li>
            <li><strong>60 Dae</strong> (61-90 dae) — <span style={{ color: '#dc2626' }}>rooi waarskuwing</span></li>
            <li><strong>90 Dae</strong> (91-120 dae) — <span style={{ color: '#dc2626' }}>rooi dringend</span></li>
            <li><strong>120+ Dae</strong> — <span style={{ color: '#dc2626' }}>rooi kritiek</span></li>
          </UL>
        </div>
      )
    }
  },

  {
    id: 'macros',
    icon: '⚡',
    title: {
      en: 'Macros — Device Templates for Quick Invoicing',
      af: 'Makro\'s — Toestelsjablone vir Vinnige Fakturering'
    },
    content: {
      en: (
        <div>
          <P>Macros are pre-defined groups of tariff codes for common devices or procedures. They allow you to add multiple tariff codes to an invoice with one click.</P>
          <H>Creating a Macro</H>
          <OL>
            <li>Go to <em>Macros</em> and click <em>New Macro</em>.</li>
            <li>Enter a <strong>name</strong> (e.g., "PFM Crown", "Full Upper Denture").</li>
            <li>Click <strong>From Tariff</strong> to add codes one by one with their quantities.</li>
            <li>Click <em>Save Macro</em>.</li>
          </OL>
          <H>Using a Macro</H>
          <P>When creating an invoice or estimate, click <strong>From Macro</strong> instead of typing codes manually. Select the macro from the list — all its codes are added instantly with the correct quantities.</P>
          <H>Save as Macro Feature</H>
          <P>On any invoice or estimate, click the <strong>✨ Save as Macro</strong> button to convert its line items into a reusable macro. Perfect for turning one-off work into templates.</P>
        </div>
      ),
      af: (
        <div>
          <P>Makro's is vooraf gedefinieerde groepe van tariefkodes vir algemene toestelle of prosedures. Hulle laat jou toe om verskeie tariefkodes by 'n faktuur te voeg met een klik.</P>
          <H>Skep 'n Makro</H>
          <OL>
            <li>Gaan na <em>Makro's</em> en klik <em>Nuwe Makro</em>.</li>
            <li>Voer 'n <strong>naam</strong> in (bv., "PFM Kroon", "Volledige Boonste Gebit").</li>
            <li>Klik <strong>Van Tarief</strong> om kodes een-vir-een by te voeg met hul hoeveelhede.</li>
            <li>Klik <em>Stoor Makro</em>.</li>
          </OL>
          <H>Gebruik 'n Makro</H>
          <P>Wanneer jy 'n faktuur of beraming skep, klik <strong>Van Makro</strong> in plaas van om kodes handmatig te tik. Kies die makro uit die lys — al sy kodes word onmiddellik bygevoeg met die korrekte hoeveelhede.</P>
          <H>Stoor as Makro Funksie</H>
          <P>Op enige faktuur of beraming, klik die <strong>✨ Stoor as Makro</strong> knoppie om sy lynitem in 'n herbruikbare makro om te skakel. Perfek om eenmalige werk in sjablone te verander.</P>
        </div>
      )
    }
  },

  {
    id: 'printing',
    icon: '🖨️',
    title: {
      en: 'Printing, PDF & WhatsApp',
      af: 'Druk, PDF & WhatsApp'
    },
    content: {
      en: (
        <div>
          <H>Printing Invoices & Estimates</H>
          <P>Click the <strong>🖨 Print</strong> button on any invoice or estimate. A print-ready A4 document opens in a new tab. Use your browser's print function (Ctrl+P / Cmd+P) to print or save as PDF.</P>
          <H>Print Copies Setting</H>
          <P>Go to <em>Settings</em> → <em>Print Layout</em> → <strong>Invoice Print Copies</strong>. Set how many copies to print per invoice (default: 2). All copies appear in one document with page breaks between them.</P>
          <H>Download PDF Directly</H>
          <P>Click the <strong>📄 Download PDF</strong> button to generate and download a PDF file directly without opening the print dialog.</P>
          <H>WhatsApp Sharing</H>
          <P>Click the <strong>💬 WhatsApp</strong> button on any invoice or estimate. The app generates a PDF, downloads it, then opens WhatsApp Web with a pre-filled message to the dentist's number. Attach the downloaded PDF before sending.</P>
          <H>Customizing Print Layout</H>
          <P>Go to <em>Settings</em> → <em>Print Layout</em> to customize logo position, font sizes, footer messages, and confirmation text that appears on printed invoices.</P>
        </div>
      ),
      af: (
        <div>
          <H>Druk Fakture & Beramings</H>
          <P>Klik die <strong>🖨 Druk</strong> knoppie op enige faktuur of beraming. 'n Druk-gereed A4 dokument maak oop in 'n nuwe blad. Gebruik jou blaaier se druk funksie (Ctrl+P / Cmd+P) om te druk of as PDF te stoor.</P>
          <H>Druk Kopieë Instelling</H>
          <P>Gaan na <em>Instellings</em> → <em>Druk Uitleg</em> → <strong>Faktuur Druk Kopieë</strong>. Stel hoeveel kopieë om te druk per faktuur (verstek: 2). Alle kopieë verskyn in een dokument met bladsy breuke tussen hulle.</P>
          <H>Laai PDF Direk Af</H>
          <P>Klik die <strong>📄 Laai PDF Af</strong> knoppie om 'n PDF-lêer direk te genereer en af te laai sonder om die druk dialoog oop te maak.</P>
          <H>WhatsApp Deel</H>
          <P>Klik die <strong>💬 WhatsApp</strong> knoppie op enige faktuur of beraming. Die app genereer 'n PDF, laai dit af, dan maak WhatsApp Web oop met 'n vooraf ingevulde boodskap aan die tandarts se nommer. Heg die afgelaaide PDF aan voor stuur.</P>
          <H>Pas Druk Uitleg Aan</H>
          <P>Gaan na <em>Instellings</em> → <em>Druk Uitleg</em> om logo posisie, lettertipe groottes, voetnota boodskappe, en bevestiging teks wat op gedrukte fakture verskyn aan te pas.</P>
        </div>
      )
    }
  },

  {
    id: 'monthend',
    icon: '📅',
    title: {
      en: 'Month-End Statements & Batch Sending',
      af: 'Maand-Einde Opgawes & Groep Stuur'
    },
    content: {
      en: (
        <div>
          <P>At month-end, send statements to all dentists showing their outstanding invoices and age analysis.</P>
          <H>Individual Statements</H>
          <P>On the <em>Clients</em> page, each dentist row has buttons:</P>
          <UL>
            <li><strong>Print Statement</strong> — opens a print-ready statement</li>
            <li><strong>WhatsApp Statement</strong> — generates PDF and opens WhatsApp</li>
          </UL>
          <P>These buttons appear based on your <strong>Statement Send Method</strong> setting in Settings.</P>
          <H>Batch Month-End (All Dentists)</H>
          <P>Click the <strong>Month-End</strong> button at the top of the Clients page. Choose your preferred method:</P>
          <UL>
            <li><strong>Print All</strong> — opens all statements in one document for printing</li>
            <li><strong>WhatsApp All</strong> — sends statements to all dentists via WhatsApp</li>
            <li><strong>Both</strong> — print and WhatsApp</li>
          </UL>
          <H>Settings</H>
          <P>Go to <em>Settings</em> to configure:</P>
          <UL>
            <li><strong>Statement Send Method</strong> — print, WhatsApp, or both</li>
            <li><strong>Statement Format</strong> — PDF or browser print</li>
            <li><strong>Month-End Mode</strong> — individual, batch, or both options available</li>
          </UL>
        </div>
      ),
      af: (
        <div>
          <P>By maand-einde, stuur opgawes aan alle tandartse wat hul uitstaande fakture en ouderdomsanalise wys.</P>
          <H>Individuele Opgawes</H>
          <P>Op die <em>Kliënte</em> bladsy, elke tandarts ry het knoppies:</P>
          <UL>
            <li><strong>Druk Opgawe</strong> — maak 'n druk-gereed opgawe oop</li>
            <li><strong>WhatsApp Opgawe</strong> — genereer PDF en maak WhatsApp oop</li>
          </UL>
          <P>Hierdie knoppies verskyn gebaseer op jou <strong>Opgawe Stuur Metode</strong> instelling in Instellings.</P>
          <H>Groep Maand-Einde (Alle Tandartse)</H>
          <P>Klik die <strong>Maand-Einde</strong> knoppie aan die bokant van die Kliënte bladsy. Kies jou voorkeur metode:</P>
          <UL>
            <li><strong>Druk Alles</strong> — maak alle opgawes oop in een dokument vir druk</li>
            <li><strong>WhatsApp Alles</strong> — stuur opgawes aan alle tandartse via WhatsApp</li>
            <li><strong>Beide</strong> — druk en WhatsApp</li>
          </UL>
          <H>Instellings</H>
          <P>Gaan na <em>Instellings</em> om te konfigureer:</P>
          <UL>
            <li><strong>Opgawe Stuur Metode</strong> — druk, WhatsApp, of beide</li>
            <li><strong>Opgawe Formaat</strong> — PDF of blaaier druk</li>
            <li><strong>Maand-Einde Modus</strong> — individueel, groep, of beide opsies beskikbaar</li>
          </UL>
        </div>
      )
    }
  },

  {
    id: 'vat',
    icon: '🧮',
    title: {
      en: 'VAT & How Calculations Work',
      af: 'BTW & Hoe Berekeninge Werk'
    },
    content: {
      en: (
        <div>
          <P>All prices in EasyDentalLab are <strong>VAT-inclusive</strong>. This means the prices you enter already include VAT.</P>
          <H>How VAT is Calculated</H>
          <P>When creating an invoice:</P>
          <OL>
            <li>The <strong>subtotal</strong> (sum of all line items) is calculated first.</li>
            <li>The <strong>VAT-exclusive amount</strong> is calculated: subtotal ÷ (1 + VAT%/100)</li>
            <li>The <strong>VAT amount</strong> is: subtotal - VAT-exclusive amount</li>
          </OL>
          <P>The invoice shows both the total (VAT-inclusive) and the VAT component separately for transparency.</P>
          <H>Setting VAT Percentage</H>
          <P>Go to <em>Settings</em> → <strong>VAT %</strong>. Default is 15% (South African standard). Change this if your VAT rate is different.</P>
          <H>Non-VAT Registered Labs</H>
          <P>If you are not VAT registered, set <strong>VAT % to 0</strong> in Settings. Invoices will show "(no VAT)" and no VAT line will be printed.</P>
        </div>
      ),
      af: (
        <div>
          <P>Alle pryse in EasyDentalLab is <strong>BTW-inklusief</strong>. Dit beteken die pryse wat jy invoer sluit reeds BTW in.</P>
          <H>Hoe BTW Bereken Word</H>
          <P>Wanneer jy 'n faktuur skep:</P>
          <OL>
            <li>Die <strong>subtotaal</strong> (som van alle lynitem) word eerste bereken.</li>
            <li>Die <strong>BTW-eksklusiewe bedrag</strong> word bereken: subtotaal ÷ (1 + BTW%/100)</li>
            <li>Die <strong>BTW bedrag</strong> is: subtotaal - BTW-eksklusiewe bedrag</li>
          </OL>
          <P>Die faktuur wys beide die totaal (BTW-inklusief) en die BTW komponent afsonderlik vir deursigtigheid.</P>
          <H>Stel BTW Persentasie</H>
          <P>Gaan na <em>Instellings</em> → <strong>BTW %</strong>. Verstek is 15% (Suid-Afrikaanse standaard). Verander dit as jou BTW koers anders is.</P>
          <H>Nie-BTW Geregistreerde Laboratoriums</H>
          <P>As jy nie BTW geregistreer is nie, stel <strong>BTW % na 0</strong> in Instellings. Fakture sal wys "(geen BTW)" en geen BTW lyn sal gedruk word nie.</P>
        </div>
      )
    }
  },

  {
    id: 'numbering',
    icon: '🔢',
    title: {
      en: 'Document Numbering',
      af: 'Dokument Nommering'
    },
    content: {
      en: (
        <div>
          <P>EasyDentalLab automatically assigns sequential numbers to invoices and estimates.</P>
          <H>How It Works</H>
          <UL>
            <li>Invoices start at <strong>1</strong> and increment automatically: 1, 2, 3, 4...</li>
            <li>Estimates have their own separate sequence, also starting at <strong>1</strong>.</li>
            <li>When you delete an invoice or estimate, the number is <strong>not reused</strong> — this prevents accounting confusion.</li>
            <li>Numbers are assigned when you <strong>save</strong> the document, not when you open the form.</li>
          </UL>
          <H>Gaps in Numbering</H>
          <P>If you see gaps in your numbering (e.g., invoice 12, 13, 15, 17), it means invoices 14 and 16 were created but later deleted. This is normal and acceptable for tax purposes.</P>
          <H>Starting Over</H>
          <P>You cannot manually reset the numbering sequence. If you need to start from 1 again (e.g., new financial year), you would need to clear all data and start fresh — not recommended unless absolutely necessary.</P>
        </div>
      ),
      af: (
        <div>
          <P>EasyDentalLab ken outomaties sekwensiële nommers aan fakture en beramings toe.</P>
          <H>Hoe Dit Werk</H>
          <UL>
            <li>Fakture begin by <strong>1</strong> en verhoog outomaties: 1, 2, 3, 4...</li>
            <li>Beramings het hul eie afsonderlike volgorde, ook begin by <strong>1</strong>.</li>
            <li>Wanneer jy 'n faktuur of beraming verwyder, word die nommer <strong>nie hergebruik nie</strong> — dit voorkom rekeningkundige verwarring.</li>
            <li>Nommers word toegeken wanneer jy die dokument <strong>stoor</strong>, nie wanneer jy die vorm oopmaak nie.</li>
          </UL>
          <H>Gapings in Nommering</H>
          <P>As jy gapings in jou nommering sien (bv., faktuur 12, 13, 15, 17), beteken dit fakture 14 en 16 is geskep maar later verwyder. Dit is normaal en aanvaarbaar vir belastingdoeleindes.</P>
          <H>Herbegin</H>
          <P>Jy kan nie handmatig die nommering volgorde herstel nie. As jy van 1 weer moet begin (bv., nuwe finansiële jaar), sal jy alle data moet skoonmaak en vars begin — nie aanbeveel nie tensy absoluut noodsaaklik.</P>
        </div>
      )
    }
  },

  {
    id: 'darkmode',
    icon: '🌙',
    title: {
      en: 'Dark Mode / Light Mode',
      af: 'Donker Modus / Lig Modus'
    },
    content: {
      en: (
        <div>
          <P>EasyDentalLab supports both light and dark color themes to reduce eye strain and suit your preference.</P>
          <H>Switching Modes</H>
          <P>Click the <strong>🌙 / ☀</strong> icon in the top-right corner of the app (next to the sidebar) to toggle between dark and light mode.</P>
          <UL>
            <li><strong>Light Mode</strong> — white background, dark text (default)</li>
            <li><strong>Dark Mode</strong> — dark background, light text (easier on eyes in low light)</li>
          </UL>
          <H>Persistence</H>
          <P>Your choice is saved automatically and persists across app restarts. Each PC remembers its own preference.</P>
          <H>Print Output</H>
          <P>Printed invoices, estimates, and statements always use light mode (white background) regardless of your app theme setting.</P>
        </div>
      ),
      af: (
        <div>
          <P>EasyDentalLab ondersteun beide lig en donker kleur temas om oogstremming te verminder en by jou voorkeur te pas.</P>
          <H>Wissel Modusse</H>
          <P>Klik die <strong>🌙 / ☀</strong> ikoon in die bo-regter hoek van die app (langs die sykant) om tussen donker en lig modus te wissel.</P>
          <UL>
            <li><strong>Lig Modus</strong> — wit agtergrond, donker teks (verstek)</li>
            <li><strong>Donker Modus</strong> — donker agtergrond, ligte teks (makliker op oë in lae lig)</li>
          </UL>
          <H>Volharding</H>
          <P>Jou keuse word outomaties gestoor en bly oor app herbeginne. Elke PC onthou sy eie voorkeur.</P>
          <H>Druk Uitset</H>
          <P>Gedrukte fakture, beramings, en opgawes gebruik altyd lig modus (wit agtergrond) ongeag jou app tema instelling.</P>
        </div>
      )
    }
  },
];
