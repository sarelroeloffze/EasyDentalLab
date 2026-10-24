import { useState, useMemo } from 'react';
import type { AppData } from '../../types';
import { Button, Input } from '../ui';
import { fmt, genId } from '../../utils/helpers';

interface MedicalAidRatesProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
}

export function MedicalAidRates({ data, setData }: MedicalAidRatesProps) {
  const [selectedMedicalAid, setSelectedMedicalAid] = useState<string>('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

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
