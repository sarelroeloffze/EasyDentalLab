import { useState, useRef, useEffect } from 'react';
import type { AppData, Client } from '../../types';
import { Button, Modal, ConfirmModal } from '../ui';
import { ClientForm } from '../forms/ClientForm';
import { genId } from '../../utils/helpers';

interface ClientsProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
  openFormOnMount?: boolean;
  onFormOpened?: () => void;
}

export function Clients({ data, setData, openFormOnMount, onFormOpened }: ClientsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const pendingClose = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (openFormOnMount) {
      setEditing(null);
      setShowForm(true);
      onFormOpened?.();
    }
  }, [openFormOnMount, onFormOpened]);

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  const save = (form: any) => {
    setData(prev => {
      if (editing) {
        return {
          ...prev,
          clients: prev.clients.map(c =>
            c.id === editing.id ? { ...editing, ...form } : c
          )
        };
      }
      return {
        ...prev,
        clients: [
          ...prev.clients,
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

  const handleDeleteClick = (client: Client) => {
    setDeleteTarget(client);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== deleteTarget.id)
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
          Dentist/Practice
        </h1>
        <Button
          icon="➕"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          New Client
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
              <th style={tableHeaderStyle}>Practice</th>
              <th style={tableHeaderStyle}>Phone</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No clients yet. Click "New Client" to add one.
                </td>
              </tr>
            ) : (
              data.clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                  <td style={tableCellStyle}>{client.name}</td>
                  <td style={tableCellStyle}>{client.practice}</td>
                  <td style={tableCellStyle}>{client.phone}</td>
                  <td style={tableCellStyle}>{client.email}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(client);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(client)}
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
        title={editing ? "Edit Client" : "New Client"}
      >
        <ClientForm
          client={editing}
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
        title="Delete Client"
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
