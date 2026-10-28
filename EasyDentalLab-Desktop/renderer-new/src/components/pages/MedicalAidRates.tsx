import { useState, useMemo, useEffect } from 'react';
import type { AppData } from '../../types';
import { Button, Input } from '../ui';
import { fmt, genId } from '../../utils/helpers';
import {
  importMedicalAidTariffsFromFile,
  checkForPriceUpdates,
  downloadMedicalAidTariffsCSV,
  previewMedicalAidTariffsUpdate,
  applyMedicalAidTariffsUpdate,
  type MedicalAidTariffsUpdatePreview
} from '../../utils/priceUpdates';
import { parseMedicalAidTariffsCSV, buildMedicalAidTariffsCSV } from '../../utils/csv';

interface MedicalAidRatesProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
}

export function MedicalAidRates({ data, setData }: MedicalAidRatesProps) {
  const [selectedMedicalAid, setSelectedMedicalAid] = useState<string>('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [importMessage, setImportMessage] = useState('');

  // Cloud update state
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<MedicalAidTariffsUpdatePreview | null>(null);
  const [applying, setApplying] = useState(false);

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  // Get all medical aid options (including plans)
  const medicalAidOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    data.medicalAids.forEach(aid => {
      if (aid.plans && aid.plans.length > 0) {
        aid.plans.forEach(plan => {
          options.push({
            value: `${aid.name} - ${plan.name}`,
            label: `${aid.name} - ${plan.name}`
          });
        });
      } else {
        options.push({
          value: aid.name,
          label: aid.name
        });
      }
    });
    return options;
  }, [data.medicalAids]);

  // Get tariffs for selected medical aid
  const medicalAidTariffs = useMemo(() => {
    if (!selectedMedicalAid) return [];

    return data.tariffs.map(tariff => {
      // Find if there's a specific price for this medical aid
      const customRate = data.medicalAidTariffs.find(
        mat => mat.medicalAid === selectedMedicalAid && mat.code === tariff.code
      );

      return {
        ...tariff,
        medicalAidPrice: customRate?.price ?? tariff.price,
        hasCustomPrice: !!customRate,
        customRateId: customRate?.id
      };
    });
  }, [data.tariffs, data.medicalAidTariffs, selectedMedicalAid]);

  // Filter by search
  const filteredTariffs = useMemo(() => {
    if (!search) return medicalAidTariffs;
    const q = search.toLowerCase();
    return medicalAidTariffs.filter(t =>
      t.code.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.descriptionAFR && t.descriptionAFR.toLowerCase().includes(q))
    );
  }, [medicalAidTariffs, search]);

  const handleCopyFromStandard = () => {
    if (!selectedMedicalAid || !window.confirm(
      `Copy all standard tariff prices to ${selectedMedicalAid}?\n\nThis will create ${data.tariffs.length} new rate entries.`
    )) return;

    setData(prev => ({
      ...prev,
      medicalAidTariffs: [
        // Keep existing rates for other medical aids
        ...prev.medicalAidTariffs.filter(mat => mat.medicalAid !== selectedMedicalAid),
        // Add all standard rates for this medical aid
        ...prev.tariffs.map(tariff => ({
          id: genId(),
          medicalAid: selectedMedicalAid,
          code: tariff.code,
          price: tariff.price
        }))
      ]
    }));
  };

  const handleClearRates = () => {
    if (!selectedMedicalAid || !window.confirm(
      `Clear all custom rates for ${selectedMedicalAid}?\n\nThis will revert to standard pricing.`
    )) return;

    setData(prev => ({
      ...prev,
      medicalAidTariffs: prev.medicalAidTariffs.filter(mat => mat.medicalAid !== selectedMedicalAid)
    }));
  };

  const handleImportFromFile = async () => {
    setImportMessage('');
    try {
      const csv = await importMedicalAidTariffsFromFile();
      const imported = parseMedicalAidTariffsCSV(csv);

      if (imported.length === 0) {
        setImportMessage('❌ No valid rates found in CSV file');
        return;
      }

      const confirmed = window.confirm(
        `Import ${imported.length} medical aid rates from CSV?\n\n` +
        `This will REPLACE all existing custom rates.\n\n` +
        `Medical aids: ${[...new Set(imported.map(m => m.medicalAid))].length}\n` +
        `Unique codes: ${[...new Set(imported.map(m => m.code))].length}\n\n` +
        `Continue?`
      );

      if (!confirmed) return;

      setData(prev => ({
        ...prev,
        medicalAidTariffs: imported
      }));

      setImportMessage(`✓ Successfully imported ${imported.length} medical aid rates!`);
      setTimeout(() => setImportMessage(''), 5000);
    } catch (error) {
      if (error instanceof Error && error.message !== 'No file selected') {
        setImportMessage(`❌ Import failed: ${error.message}`);
      }
    }
  };

  const handleExportToCSV = () => {
    const csv = buildMedicalAidTariffsCSV(data.medicalAidTariffs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MedicalAidRates-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setImportMessage(`✓ Exported ${data.medicalAidTariffs.length} rates to CSV`);
    setTimeout(() => setImportMessage(''), 3000);
  };

  const handleDownloadTemplate = () => {
    // Create template with first 5 codes for each medical aid as examples
    const templateRows: string[] = ['MedicalAid,Code,Price'];

    medicalAidOptions.slice(0, 3).forEach(aid => {
      data.tariffs.slice(0, 5).forEach(tariff => {
        templateRows.push(`${aid.value},${tariff.code},${tariff.price}`);
      });
    });

    const csv = templateRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'MedicalAidRates-Template.csv';
    link.click();
    setImportMessage(`✓ Template downloaded - Edit in Excel and re-import`);
    setTimeout(() => setImportMessage(''), 3000);
  };

  // Cloud update handlers
  const handleCheckForUpdates = async () => {
    setChecking(true);
    setImportMessage('');
    try {
      const result = await checkForPriceUpdates();

      if (result.error) {
        setImportMessage(`❌ Update check failed: ${result.error}`);
        return;
      }

      if (result.medicalAidTariffsUpdateAvailable && result.latestVersion?.medicalAidTariffs) {
        setUpdateAvailable(true);
        setUpdateVersion(result.latestVersion.medicalAidTariffs.version);
        setImportMessage(`✓ New medical aid rates available (${result.latestVersion.medicalAidTariffs.version}) - Click "View Changes" to preview`);
      } else {
        setUpdateAvailable(false);
        setImportMessage('✓ No updates available - You have the latest medical aid rates');
      }

      setTimeout(() => setImportMessage(''), 5000);
    } catch (error) {
      setImportMessage(`❌ Update check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChecking(false);
    }
  };

  const handleViewChanges = async () => {
    if (!updateVersion) return;

    setChecking(true);
    try {
      const result = await checkForPriceUpdates();
      if (!result.latestVersion?.medicalAidTariffs) {
        throw new Error('Update version not found');
      }

      const csv = await downloadMedicalAidTariffsCSV(result.latestVersion.medicalAidTariffs.filename);
      const preview = previewMedicalAidTariffsUpdate(data.medicalAidTariffs, csv);

      setPreview(preview);
      setShowPreview(true);
    } catch (error) {
      setImportMessage(`❌ Failed to load preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChecking(false);
    }
  };

  const handleApplyUpdate = async () => {
    if (!updateVersion) return;

    setApplying(true);
    try {
      const result = await checkForPriceUpdates();
      if (!result.latestVersion?.medicalAidTariffs) {
        throw new Error('Update version not found');
      }

      const csv = await downloadMedicalAidTariffsCSV(result.latestVersion.medicalAidTariffs.filename);
      const updatedData = applyMedicalAidTariffsUpdate(data, csv);

      setData(updatedData);
      setShowPreview(false);
      setUpdateAvailable(false);
      setImportMessage(`✓ Successfully updated to medical aid rates version ${updateVersion}`);
      setTimeout(() => setImportMessage(''), 5000);
    } catch (error) {
      setImportMessage(`❌ Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setApplying(false);
    }
  };

  // Auto-check for updates on mount
  useEffect(() => {
    handleCheckForUpdates();
  }, []);

  const handleStartEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleSaveEdit = (code: string, customRateId?: string) => {
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice < 0) return;

    if (customRateId) {
      // Update existing rate
      setData(prev => ({
        ...prev,
        medicalAidTariffs: prev.medicalAidTariffs.map(mat =>
          mat.id === customRateId ? { ...mat, price: newPrice } : mat
        )
      }));
    } else {
      // Create new rate
      setData(prev => ({
        ...prev,
        medicalAidTariffs: [
          ...prev.medicalAidTariffs,
          {
            id: genId(),
            medicalAid: selectedMedicalAid,
            code,
            price: newPrice
          }
        ]
      }));
    }

    setEditingId(null);
    setEditPrice('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPrice('');
  };

  const handleRevertToStandard = (customRateId: string) => {
    if (!window.confirm('Revert this tariff to standard pricing?')) return;

    setData(prev => ({
      ...prev,
      medicalAidTariffs: prev.medicalAidTariffs.filter(mat => mat.id !== customRateId)
    }));
  };

  const customRatesCount = medicalAidTariffs.filter(t => t.hasCustomPrice).length;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--c-text1)',
          margin: 0
        }}>
          Medical Aid Rates
        </h1>
      </div>

      {/* Cloud Updates Section */}
      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        border: '1px solid var(--c-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--c-text1)' }}>
            📡 Cloud Updates
          </h3>
          <p style={{ fontSize: 13, color: 'var(--c-text2)', margin: '0 0 12px 0' }}>
            Check for updated medical aid rates from the cloud (perfect for annual January 1st price updates)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={handleCheckForUpdates}
            variant="secondary"
            icon="🔄"
            disabled={checking}
          >
            {checking ? 'Checking...' : 'Check for Updates'}
          </Button>

          {updateAvailable && (
            <Button
              onClick={handleViewChanges}
              variant="primary"
              icon="👁️"
              disabled={checking}
            >
              View Changes
            </Button>
          )}
        </div>
      </div>

      {/* Import Section */}
      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        border: '1px solid var(--c-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--c-text1)' }}>
            Bulk Import All Medical Aid Rates
          </h3>
          <p style={{ fontSize: 13, color: 'var(--c-text2)', margin: '0 0 12px 0' }}>
            Import a CSV file with all medical aid prices at once. Format: MedicalAid, Code, Price
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={handleImportFromFile}
            variant="secondary"
            icon="📁"
          >
            Import from CSV File
          </Button>

          <Button
            onClick={handleExportToCSV}
            variant="secondary"
            icon="💾"
            disabled={data.medicalAidTariffs.length === 0}
          >
            Export Current Rates
          </Button>

          <Button
            onClick={handleDownloadTemplate}
            variant="secondary"
            icon="📄"
          >
            Download Template
          </Button>

          {importMessage && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: 13,
              backgroundColor: importMessage.startsWith('✓') ? '#d1fae5' : '#fee2e2',
              color: importMessage.startsWith('✓') ? '#065f46' : '#991b1b',
              border: `1px solid ${importMessage.startsWith('✓') ? '#a7f3d0' : '#fecaca'}`
            }}>
              {importMessage}
            </div>
          )}
        </div>
      </div>

      {/* Medical Aid Selection */}
      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        border: '1px solid var(--c-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Select Medical Aid
          </label>
          <select
            value={selectedMedicalAid}
            onChange={e => setSelectedMedicalAid(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 14,
              backgroundColor: 'var(--c-surface)',
              color: 'var(--c-text1)'
            }}
          >
            <option value="">-- Select a medical aid --</option>
            {medicalAidOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {selectedMedicalAid && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={handleCopyFromStandard} variant="secondary">
              Copy All from Standard Rates
            </Button>
            <Button onClick={handleClearRates} variant="danger" disabled={customRatesCount === 0}>
              Clear All Custom Rates
            </Button>
            <div style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--c-text2)', display: 'flex', alignItems: 'center' }}>
              {customRatesCount} custom rate{customRatesCount !== 1 ? 's' : ''} / {data.tariffs.length} total
            </div>
          </div>
        )}
      </div>

      {!selectedMedicalAid && (
        <div style={{
          background: 'var(--c-surface2)',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          color: 'var(--c-text3)'
        }}>
          Select a medical aid above to view and edit custom rates
        </div>
      )}

      {selectedMedicalAid && (
        <>
          {/* Search Bar */}
          <div style={{ marginBottom: 16 }}>
            <Input
              label=""
              value={search}
              onChange={setSearch}
              placeholder="Search by code or description..."
            />
          </div>

          {/* Tariffs Table */}
          <div style={{
            background: 'var(--c-surface)',
            borderRadius: 12,
            border: '1px solid var(--c-border)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'var(--c-surface2)',
                  borderBottom: '1px solid var(--c-border)'
                }}>
                  <th style={tableHeaderStyle}>Code</th>
                  <th style={tableHeaderStyle}>Description</th>
                  <th style={tableHeaderStyle}>Standard Price</th>
                  <th style={tableHeaderStyle}>Medical Aid Price</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTariffs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                      {search ? 'No tariffs match your search.' : 'No tariffs available.'}
                    </td>
                  </tr>
                ) : (
                  filteredTariffs.map((tariff) => (
                    <tr key={tariff.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                      <td style={tableCellStyle}>
                        <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                          {tariff.code}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{tariff.description}</td>
                      <td style={tableCellStyle}>{fmt(tariff.price)}</td>
                      <td style={tableCellStyle}>
                        {editingId === tariff.id ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit(tariff.code, tariff.customRateId);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            style={{
                              width: '100px',
                              padding: '6px 8px',
                              border: '2px solid #3b82f6',
                              borderRadius: 4,
                              fontSize: 14
                            }}
                            autoFocus
                          />
                        ) : (
                          <span style={{
                            fontWeight: tariff.hasCustomPrice ? 600 : 400,
                            color: tariff.hasCustomPrice ? '#10b981' : 'inherit'
                          }}>
                            {fmt(tariff.medicalAidPrice)}
                          </span>
                        )}
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {editingId === tariff.id ? (
                            <>
                              <Button
                                onClick={() => handleSaveEdit(tariff.code, tariff.customRateId)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                onClick={() => handleStartEdit(tariff.id, tariff.medicalAidPrice)}
                              >
                                Edit Price
                              </Button>
                              {tariff.hasCustomPrice && (
                                <Button
                                  variant="danger"
                                  onClick={() => handleRevertToStandard(tariff.customRateId!)}
                                >
                                  Revert
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreview && preview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--c-surface)',
            borderRadius: 12,
            border: '1px solid var(--c-border)',
            maxWidth: '800px',
            maxHeight: '80vh',
            width: '90%',
            overflow: 'auto',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--c-text1)' }}>
              Medical Aid Rates Update Preview
            </h2>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: 'var(--c-text2)', marginBottom: 16 }}>
                Review the changes before applying:
              </p>

              {preview.added.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
                    ✅ Added ({preview.added.length} rates)
                  </h3>
                  <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: 13, color: 'var(--c-text2)' }}>
                    {preview.added.slice(0, 10).map((rate, i) => (
                      <div key={i} style={{ padding: '4px 0' }}>
                        {rate.medicalAid} - Code {rate.code}: {fmt(rate.price)}
                      </div>
                    ))}
                    {preview.added.length > 10 && (
                      <div style={{ padding: '4px 0', fontStyle: 'italic' }}>
                        ...and {preview.added.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview.updated.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>
                    🔄 Updated ({preview.updated.length} rates)
                  </h3>
                  <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: 13, color: 'var(--c-text2)' }}>
                    {preview.updated.slice(0, 10).map((rate, i) => (
                      <div key={i} style={{ padding: '4px 0' }}>
                        {rate.medicalAid} - Code {rate.code}: {fmt(rate.price)}
                      </div>
                    ))}
                    {preview.updated.length > 10 && (
                      <div style={{ padding: '4px 0', fontStyle: 'italic' }}>
                        ...and {preview.updated.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview.removed.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>
                    ❌ Removed ({preview.removed.length} rates)
                  </h3>
                  <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: 13, color: 'var(--c-text2)' }}>
                    {preview.removed.slice(0, 10).map((rate, i) => (
                      <div key={i} style={{ padding: '4px 0' }}>
                        {rate.medicalAid} - Code {rate.code}: {fmt(rate.price)}
                      </div>
                    ))}
                    {preview.removed.length > 10 && (
                      <div style={{ padding: '4px 0', fontStyle: 'italic' }}>
                        ...and {preview.removed.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview.unchanged > 0 && (
                <div style={{ fontSize: 13, color: 'var(--c-text3)' }}>
                  ✓ {preview.unchanged} rates unchanged
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setShowPreview(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyUpdate}
                variant="primary"
                disabled={applying}
              >
                {applying ? 'Applying...' : 'Apply Update'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--c-text2)'
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  color: 'var(--c-text1)'
};
