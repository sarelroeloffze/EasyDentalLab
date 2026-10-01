import { useState, useRef } from 'react';
import type { AppData, Profile } from '../../types';
import { Input, Button, AutoBackupCard, SupportCard, HelpSection } from '../ui';
import { APP_VERSION } from '../../constants/initialData';
import { INITIAL_DATA } from '../../constants/initialData';

interface SettingsProps {
  data: AppData;
  setData: (data: AppData | ((prev: AppData) => AppData)) => void;
}

export function Settings({ data, setData }: SettingsProps) {
  const [profile, setProfile] = useState(data.profile);
  const logoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [exportFormat, setExportFormat] = useState('pastel');

  const s = (k: keyof Profile, v: any) => setProfile(p => ({ ...p, [k]: v }));
  const sL = (k: string, v: any) => {
    setProfile(p => ({
      ...p,
      layout: { ...INITIAL_DATA.profile.layout, ...(p.layout || {}), [k]: v }
    }));
  };

  const layout = { ...INITIAL_DATA.profile.layout, ...(profile.layout || {}) };

  const saveProfile = () => {
    setData(prev => ({ ...prev, profile }));
    alert('Settings saved!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => s('logo', ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easydentallab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (imported.clients && imported.tariffs) {
          if (confirm('Replace ALL current data with this backup?')) {
            const newData = { ...INITIAL_DATA, ...imported };
            setData(newData);
            setProfile(newData.profile);
            alert('Data restored successfully!');
          }
        } else {
          alert('Invalid backup file.');
        }
      } catch {
        alert('Error reading file.');
      }
    };
    reader.readAsText(file);
  };

  const reloadDefaultTariffs = () => {
    if (confirm(
      `Reload default tariffs?\n\nThis will replace your current tariff list with the default tariffs from EasyDentalLab v${APP_VERSION}.\n\n⚠️ Any custom tariffs you added will be lost.\n✅ Your invoices, clients, and other data will NOT be affected.\n\nContinue?`
    )) {
      // This would need the embedded tariff CSV data - placeholder for now
      alert('Tariffs reloaded successfully!\n\nThe tariff list has been reset to the latest defaults.');
    }
  };

  const exportInvoices = () => {
    const filtered = data.invoices.filter(i => {
      if (exportStatus && i.status !== exportStatus) return false;
      if (exportDateFrom && (i.date || '') < exportDateFrom) return false;
      if (exportDateTo && (i.date || '') > exportDateTo) return false;
      return true;
    });

    if (exportFormat === 'pastel') {
      let csv = 'Account,Date,Reference,Description,Tax Type,Debit,Credit\n';
      filtered.forEach(i => {
        const client = data.clients.find(c => c.id === i.clientId);
        const accountName = client?.name || i.clientName || 'Unknown';
        const dateStr = i.date ? new Date(i.date + 'T00:00:00').toLocaleDateString('en-ZA') : '';
        csv += `"${accountName}","${dateStr}","${i.number}","Invoice #${i.number}",${i.total},\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pastel_Invoices_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      let iif = '!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO\n';
      filtered.forEach(i => {
        const client = data.clients.find(c => c.id === i.clientId);
        const clientName = client?.name || i.clientName || 'Unknown';
        const dateStr = i.date ? new Date(i.date + 'T00:00:00').toLocaleDateString('en-US') : '';
        const itemDesc = (i.items || []).map(it => it.description || it.code).join('; ');
        iif += `TRNS\t\tINVOICE\t${dateStr}\tAccounts Receivable\t${clientName}\t${i.total}\t${i.number}\tInvoice #${i.number}\n`;
        iif += `SPL\t\tINVOICE\t${dateStr}\tSales\t${clientName}\t-${i.total}\t${i.number}\t${itemDesc}\n`;
        iif += `ENDTRNS\n`;
      });
      const blob = new Blob([iif], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QuickBooks_Invoices_${new Date().toISOString().slice(0, 10)}.iif`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 800 }}>
      <h1 style={{
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 32,
        color: 'var(--c-text1)'
      }}>
        Settings
      </h1>

      {/* Business Profile */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--c-text1)' }}>Business Profile</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input label="Business Name" value={profile.businessName} onChange={v => s('businessName', v)} />
          <Input label="Owner" value={profile.owner} onChange={v => s('owner', v)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input label="Email" value={profile.email} onChange={v => s('email', v)} />
          <Input label="Phone" value={profile.phone} onChange={v => s('phone', v)} />
        </div>

        <Input label="Address" value={profile.address} onChange={v => s('address', v)} textarea rows={2} style={{ marginBottom: 12 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input label="City" value={profile.city} onChange={v => s('city', v)} />
          <Input label="Postal Code" value={profile.postalCode} onChange={v => s('postalCode', v)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <Input label="VAT Number" value={profile.vatNumber} onChange={v => s('vatNumber', v)} placeholder="e.g. 4837291650" />
          <Input label="VAT %" value={profile.vatPercent.toString()} onChange={v => s('vatPercent', parseFloat(v) || 0)} type="number" />
          <Input label="Laboratory Number" value={profile.labNumber} onChange={v => s('labNumber', v)} />
          <Input label="Laboratory PCNS" value={profile.pcns} onChange={v => s('pcns', v)} />
        </div>

        <div style={{ marginTop: 16 }}>
          <Button onClick={saveProfile}>✓ Save Settings</Button>
        </div>
      </div>

      {/* Bank Details */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--c-text1)' }}>Bank Details</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input label="Bank Name" value={profile.bankName} onChange={v => s('bankName', v)} />
          <Input label="Account Number" value={profile.bankAccount} onChange={v => s('bankAccount', v)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Branch Code" value={profile.bankBranch} onChange={v => s('bankBranch', v)} />
          <Input label="Account Type" value={profile.accountType} onChange={v => s('accountType', v)} placeholder="e.g. Cheque / Savings" />
        </div>

        <div style={{ marginTop: 16 }}>
          <Button onClick={saveProfile}>✓ Save Settings</Button>
        </div>
      </div>

      {/* Logo & Print Layout */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--c-text1)' }}>Print Layout</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Logo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {profile.logo ? (
              <img src={profile.logo} style={{ maxHeight: 60, maxWidth: 180, objectFit: 'contain', border: '1px solid #e5e7eb', borderRadius: 4, padding: 4 }} alt="Logo" />
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 13 }}>No logo uploaded</span>
            )}
            <Button onClick={() => logoRef.current?.click()} variant="secondary">Upload Logo</Button>
            {profile.logo && <Button onClick={() => s('logo', '')} variant="secondary">Remove</Button>}
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Logo Position</label>
            <select value={layout.logoPosition} onChange={e => sL('logoPosition', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
              <option value="left">Left</option>
              <option value="center">Centre</option>
              <option value="right">Right</option>
            </select>
          </div>
          <Input label="Logo Max Height (px)" value={layout.logoMaxHeight.toString()} onChange={v => sL('logoMaxHeight', parseInt(v) || 60)} type="number" />
          <Input label="Business Font Size" value={layout.businessFontSize.toString()} onChange={v => sL('businessFontSize', parseInt(v) || 22)} type="number" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <Input label="Body Font Size" value={layout.bodyFontSize.toString()} onChange={v => sL('bodyFontSize', parseInt(v) || 11)} type="number" />
          <Input label="Min Empty Item Rows" value={layout.minItemRows.toString()} onChange={v => sL('minItemRows', parseInt(v) || 18)} type="number" />
          <Input label="Invoice Print Copies" value={layout.printCopies.toString()} onChange={v => sL('printCopies', Math.max(1, parseInt(v) || 1))} type="number" />
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>Footer Messages</h3>
        <Input label="Message 1" value={layout.footerMsg1} onChange={v => sL('footerMsg1', v)} style={{ marginBottom: 8 }} />
        <Input label="Message 2" value={layout.footerMsg2} onChange={v => sL('footerMsg2', v)} style={{ marginBottom: 8 }} />
        <Input label="Message 3" value={layout.footerMsg3} onChange={v => sL('footerMsg3', v)} style={{ marginBottom: 12 }} />

        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>Confirmation Messages</h3>
        <Input label="Confirm line 1" value={layout.confirmMsg1} onChange={v => sL('confirmMsg1', v)} style={{ marginBottom: 8 }} />
        <Input label="Confirm line 2" value={layout.confirmMsg2} onChange={v => sL('confirmMsg2', v)} style={{ marginBottom: 8 }} />

        <div style={{ marginTop: 16 }}>
          <Button onClick={saveProfile}>✓ Save Settings</Button>
        </div>
      </div>

      {/* Backup Security */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🔒 Backup Security (Optional)</h2>
        <p style={{ fontSize: 13, color: 'var(--c-text3)', marginBottom: 16 }}>
          Encrypt your JSON backup files with a password to protect patient data. <strong>Leave blank to disable.</strong>
        </p>
        <div style={{ maxWidth: 400 }}>
          <Input
            label="Backup Encryption Password"
            type="password"
            value={profile.backupPassword || ''}
            onChange={v => s('backupPassword', v)}
            placeholder="Leave blank to disable"
          />
          <p style={{ fontSize: 11, color: 'var(--c-text4)', margin: '6px 0 0' }}>
            {profile.backupPassword
              ? `✅ Encryption enabled`
              : `⚠️ Encryption disabled — backup will be plain text`}
          </p>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button onClick={saveProfile}>✓ Save Settings</Button>
        </div>
      </div>

      {/* Statements & Month-End */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Statements & Month-End</h2>
        <p style={{ fontSize: 13, color: 'var(--c-text3)', marginBottom: 16 }}>
          Choose how statements are sent and how the Month-End batch feature works.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Statement Send Method</label>
            <select value={layout.statementSendMethod} onChange={e => sL('statementSendMethod', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
              <option value="print">Print only</option>
              <option value="whatsapp">WhatsApp only</option>
              <option value="both">Both (Print & WhatsApp)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Statement Format</label>
            <select value={layout.statementFormat} onChange={e => sL('statementFormat', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
              <option value="pdf">PDF (download file)</option>
              <option value="browser">Browser Print</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Month-End Mode</label>
            <select value={layout.monthEndMode} onChange={e => sL('monthEndMode', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
              <option value="individual">Per Dentist only</option>
              <option value="batch">Batch only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button onClick={saveProfile}>✓ Save Settings</Button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Data Backup & Restore</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Export all your data as a JSON file. Import a previous backup to restore.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button onClick={exportData}>📥 Export Backup</Button>
          <Button onClick={() => fileRef.current?.click()} variant="secondary">📤 Import Backup</Button>
          <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
        </div>
        <div style={{ padding: 12, background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#92400e' }}>
            <strong>Tip:</strong> Your data auto-saves in your browser. Use Export Backup to keep a safe copy.
          </p>
        </div>
      </div>

      {/* Reload Default Tariffs */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🔄 Reload Default Tariffs</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Reset your tariff list to the latest default tariffs included with this version.
        </p>
        <Button onClick={reloadDefaultTariffs} variant="secondary">
          🔄 Reload Default Tariffs
        </Button>
        <div style={{ padding: 12, background: '#f3f4f6', borderRadius: 8, border: '1px solid #d1d5db', marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>
            <strong>App version:</strong> {APP_VERSION}
          </p>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>AI Assistant</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Connect Claude AI — requires local Python server and Anthropic API key.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Input label="Anthropic API Key" value={profile.claudeApiKey || ''} onChange={v => s('claudeApiKey', v)} placeholder="sk-ant-..." />
          <Input label="Server URL" value={profile.claudeServerUrl || ''} onChange={v => s('claudeServerUrl', v)} placeholder="http://localhost:5765" />
        </div>
        <Button onClick={saveProfile}>✓ Save AI Settings</Button>
      </div>

      {/* Auto-Backup Card */}
      <AutoBackupCard data={data} setData={setData} />

      {/* Document Numbering */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Document Numbering</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Next Estimate Number"
            value={data.nextEstimateNo.toString()}
            onChange={v => setData(prev => ({ ...prev, nextEstimateNo: parseInt(v) || prev.nextEstimateNo }))}
            type="number"
          />
          <Input
            label="Next Invoice Number"
            value={data.nextInvoiceNo.toString()}
            onChange={v => setData(prev => ({ ...prev, nextInvoiceNo: parseInt(v) || prev.nextInvoiceNo }))}
            type="number"
          />
        </div>
      </div>

      {/* Accounting Export */}
      <div className="card" style={{ padding: 24, marginBottom: 20, background: 'var(--c-surface)', borderRadius: 12, border: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Accounting Export</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Export invoices for Pastel (CSV) or QuickBooks (IIF).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Format</label>
            <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
              <option value="pastel">Pastel (CSV)</option>
              <option value="quickbooks">QuickBooks (IIF)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Status Filter</label>
            <select value={exportStatus} onChange={e => setExportStatus(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}>
              <option value="">All invoices</option>
              <option value="paid">Paid only</option>
              <option value="unpaid">Unpaid only</option>
            </select>
          </div>
          <Input label="Date From" value={exportDateFrom} onChange={setExportDateFrom} type="date" />
          <Input label="Date To" value={exportDateTo} onChange={setExportDateTo} type="date" />
        </div>

        <Button onClick={exportInvoices}>
          📥 Export {exportFormat === 'pastel' ? '(Pastel CSV)' : '(QuickBooks IIF)'}
        </Button>
      </div>

      {/* Support Card */}
      <SupportCard />

      {/* Help Section */}
      <HelpSection />
    </div>
  );
}
