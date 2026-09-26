import { useState, useRef } from 'react';
import type { AppData, Macro } from '../../types';
import { Button, Modal, ConfirmModal } from '../ui';
import { MacroForm } from '../forms/MacroForm';
import { genId } from '../../utils/helpers';

interface MacrosProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
}

export function Macros({ data, setData }: MacrosProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Macro | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Macro | null>(null);
  const pendingClose = useRef<(() => void) | null>(null);

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  const save = (form: any) => {
    setData(prev => {
      if (editing) {
        return {
          ...prev,
          macros: prev.macros.map(m =>
            m.id === editing.id ? { ...editing, ...form } : m
          )
        };
      }
      return {
        ...prev,
        macros: [
          ...prev.macros,
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

  const handleDeleteClick = (macro: Macro) => {
    setDeleteTarget(macro);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setData(prev => ({
        ...prev,
        macros: prev.macros.filter(m => m.id !== deleteTarget.id)
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
          Macros
        </h1>
        <Button
          icon="➕"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          New Macro
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
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Codes</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.macros.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No macros yet. Click "New Macro" to create one.
                </td>
              </tr>
            ) : (
              data.macros.map((macro) => (
                <tr key={macro.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                  <td style={tableCellStyle}>{macro.name}</td>
                  <td style={tableCellStyle}>
                    {macro.codes.map(c => c.code).join(', ')}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(macro);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(macro)}
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
        title={editing ? "Edit Macro" : "New Macro"}
      >
        <MacroForm
          macro={editing}
          onSave={save}
          onCancel={() => {
            handleCloseAttempt(() => {
              setShowForm(false);
              setEditing(null);
              setFormIsDirty(false);
            });
          }}
          onDirtyChange={setFormIsDirty}
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
        title="Delete Macro"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
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
