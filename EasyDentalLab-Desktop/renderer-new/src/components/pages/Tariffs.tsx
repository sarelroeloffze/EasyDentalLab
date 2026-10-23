import { useState, useRef } from 'react';
import type { AppData, Tariff } from '../../types';
import { Button, Modal, ConfirmModal } from '../ui';
import { TariffForm } from '../forms/TariffForm';
import { fmt } from '../../utils/helpers';
import { genId } from '../../utils/helpers';
import {
  downloadTariffsCSV,
  importTariffsFromFile,
  previewTariffUpdate,
  applyTariffUpdate,
  type PriceUpdatePreview,
} from '../../utils/priceUpdates';
import { TARIFFS_VERSION } from '../../constants';

interface TariffsProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
}

export function Tariffs({ data, setData }: TariffsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tariff | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tariff | null>(null);
  const pendingClose = useRef<(() => void) | null>(null);

  // Price update states
  const [checking, setChecking] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<PriceUpdatePreview | null>(null);
  const [pendingCSV, setPendingCSV] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string>('');

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  const categories = Array.from(new Set(data.tariffs.map(t => t.category).filter(Boolean)));

  const save = (form: any) => {
    setData(prev => {
      if (editing) {
        return {
          ...prev,
          tariffs: prev.tariffs.map(t =>
            t.id === editing.id ? { ...editing, ...form } : t
          )
        };
      }
      return {
        ...prev,
        tariffs: [
          ...prev.tariffs,
          {
            ...form,
            id: genId()
          }
        ]
      };
    });
    setShowForm(false);
    setEditing(null);
    setFormIsDirty(false);
  };

  const handleCloseAttempt = (onClose: () => void) => {
    if (formIsDirty) {
      pendingClose.current = onClose;
      setConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingClose.current) {
      pendingClose.current();
      pendingClose.current = null;
    }
    setConfirmDiscard(false);
    setFormIsDirty(false);
  };

  const handleCancelDiscard = () => {
    pendingClose.current = null;
    setConfirmDiscard(false);
  };

  const handleDeleteClick = (tariff: Tariff) => {
    setDeleteTarget(tariff);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setData(prev => ({
        ...prev,
        tariffs: prev.tariffs.filter(t => t.id !== deleteTarget.id)
      }));
    }
    setDeleteTarget(null);
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setConfirmDelete(false);
  };

  // Price update handlers
  const handleCheckForUpdates = async () => {
    setChecking(true);
    setUpdateMessage('');
    try {
      const csv = await downloadTariffsCSV('Tariffs-2027.csv');
      const updatePreview = previewTariffUpdate(data.tariffs, csv);

      setPendingCSV(csv);
      setPreview(updatePreview);
      setShowPreview(true);
    } catch (error) {
      setUpdateMessage(`Failed to check for updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChecking(false);
    }
  };

  const handleImportFromFile = async () => {
    setUpdateMessage('');
    try {
      const csv = await importTariffsFromFile();
      const updatePreview = previewTariffUpdate(data.tariffs, csv);

      setPendingCSV(csv);
      setPreview(updatePreview);
      setShowPreview(true);
    } catch (error) {
      if (error instanceof Error && error.message !== 'No file selected') {
        setUpdateMessage(`Failed to import file: ${error.message}`);
      }
    }
  };

  const handleApplyUpdate = () => {
    if (!pendingCSV || !setData) return;

    try {
      const updated = applyTariffUpdate(data, pendingCSV, true);
      setData(updated);
      setUpdateMessage('✓ Tariff prices updated successfully!');
      setShowPreview(false);
      setPendingCSV(null);
      setPreview(null);
    } catch (error) {
      setUpdateMessage(`Failed to apply update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelUpdate = () => {
    setShowPreview(false);
    setPendingCSV(null);
    setPreview(null);
  };

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
          Tariffs
        </h1>
        <Button
          icon="➕"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          New Tariff
        </Button>
      </div>

      {/* Price Updates Section */}
      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        border: '1px solid var(--c-border)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--c-text1)',
          marginTop: 0,
          marginBottom: 16
        }}>
          Price Updates
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: updateMessage ? 16 : 0 }}>
          <div style={{ flex: 1, fontSize: 14, color: 'var(--c-text2)' }}>
            Current version: <strong>{TARIFFS_VERSION}</strong> • {data.tariffs.length} tariff codes
          </div>

          <Button
            icon="↓"
            onClick={handleCheckForUpdates}
            disabled={checking}
          >
            {checking ? 'Checking...' : 'Check for Updates'}
          </Button>

          <Button
            variant="secondary"
            icon="📁"
            onClick={handleImportFromFile}
          >
            Import from File
          </Button>
        </div>

        {updateMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: 14,
            backgroundColor: updateMessage.startsWith('✓') ? '#d1fae5' : '#fee2e2',
            color: updateMessage.startsWith('✓') ? '#065f46' : '#991b1b',
            border: `1px solid ${updateMessage.startsWith('✓') ? '#a7f3d0' : '#fecaca'}`
          }}>
            {updateMessage}
          </div>
        )}
      </div>

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
              <th style={tableHeaderStyle}>Price</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.tariffs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No tariffs yet. Click "New Tariff" to add one.
                </td>
              </tr>
            ) : (
              data.tariffs.map((tariff) => (
                <tr key={tariff.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                  <td style={tableCellStyle}>
                    <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                      {tariff.code}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{tariff.description}</td>
                  <td style={tableCellStyle}>{fmt(tariff.price)}</td>
                  <td style={tableCellStyle}>{tariff.category}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(tariff);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(tariff)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
          setFormIsDirty(false);
        }}
        onCloseAttempt={handleCloseAttempt}
        title={editing ? "Edit Tariff" : "New Tariff"}
      >
        <TariffForm
          tariff={editing}
          onSave={save}
          onCancel={() => {
            handleCloseAttempt(() => {
              setShowForm(false);
              setEditing(null);
              setFormIsDirty(false);
            });
          }}
          onDirtyChange={setFormIsDirty}
          categories={categories}
        />
      </Modal>

      <ConfirmModal
        open={confirmDiscard}
        title="Unsaved Changes"
        message="You have unsaved changes. Discard changes and close?"
        confirmText="Discard"
        cancelText="Keep Editing"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
        danger={true}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete Tariff"
        message={`Are you sure you want to delete tariff "${deleteTarget?.code}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger={true}
      />

      {/* Price Update Preview Modal */}
      <Modal
        open={showPreview}
        onClose={handleCancelUpdate}
        title="Preview Tariff Update"
      >
        {preview && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-text1)', marginBottom: 12 }}>
                Update Summary
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, background: '#d1fae5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: 13, color: '#065f46', marginBottom: 4 }}>Added</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#065f46' }}>{preview.added.length}</div>
                </div>
                <div style={{ padding: 12, background: '#dbeafe', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 13, color: '#1e40af', marginBottom: 4 }}>Updated</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1e40af' }}>{preview.updated.length}</div>
                </div>
                <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: 13, color: '#991b1b', marginBottom: 4 }}>Removed</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#991b1b' }}>{preview.removed.length}</div>
                </div>
                <div style={{ padding: 12, background: 'var(--c-surface2)', borderRadius: 8, border: '1px solid var(--c-border)' }}>
                  <div style={{ fontSize: 13, color: 'var(--c-text2)', marginBottom: 4 }}>Unchanged</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--c-text1)' }}>{preview.unchanged}</div>
                </div>
              </div>
            </div>

            {preview.added.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
                  ✓ {preview.added.length} New Codes
                </h4>
                <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: 13, color: 'var(--c-text2)' }}>
                  {preview.added.slice(0, 5).map(t => (
                    <div key={t.code} style={{ padding: '4px 0' }}>
                      {t.code} - {t.description} ({fmt(t.price)})
                    </div>
                  ))}
                  {preview.added.length > 5 && (
                    <div style={{ fontStyle: 'italic', paddingTop: 4 }}>
                      ...and {preview.added.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {preview.updated.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>
                  ↻ {preview.updated.length} Updated Codes
                </h4>
                <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: 13, color: 'var(--c-text2)' }}>
                  {preview.updated.slice(0, 5).map(t => (
                    <div key={t.code} style={{ padding: '4px 0' }}>
                      {t.code} - {t.description} ({fmt(t.price)})
                    </div>
                  ))}
                  {preview.updated.length > 5 && (
                    <div style={{ fontStyle: 'italic', paddingTop: 4 }}>
                      ...and {preview.updated.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <div style={{ flex: 1 }}>
                <Button onClick={handleApplyUpdate} fullWidth>
                  Apply Update
                </Button>
              </div>
              <div style={{ flex: 1 }}>
                <Button variant="secondary" onClick={handleCancelUpdate} fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
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
