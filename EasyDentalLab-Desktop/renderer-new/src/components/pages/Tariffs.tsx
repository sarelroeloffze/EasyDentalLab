import { useState, useRef } from 'react';
import type { AppData, Tariff } from '../../types';
import { Button, Modal, ConfirmModal } from '../ui';
import { TariffForm } from '../forms/TariffForm';
import { fmt } from '../../utils/helpers';
import { genId } from '../../utils/helpers';

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
              data.tariffs.slice(0, 50).map((tariff) => (
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
        {data.tariffs.length > 50 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--c-text3)' }}>
            Showing 50 of {data.tariffs.length} tariffs
          </div>
        )}
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
