import { useState, useRef, useEffect } from 'react';
import type { AppData, Invoice } from '../../types';
import { Button, Modal, ConfirmModal } from '../ui';
import { InvoiceForm } from '../forms/InvoiceForm';
import { fmt, fmtDate, genId } from '../../utils/helpers';

interface InvoicesProps {
  data: AppData;
  setData: (data: AppData | ((prev: AppData) => AppData)) => void;
  openFormOnMount?: boolean;
  onFormOpened?: () => void;
}

export function Invoices({ data, setData, openFormOnMount, onFormOpened }: InvoicesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const pendingClose = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (openFormOnMount) {
      setEditing(null);
      setShowForm(true);
      onFormOpened?.();
    }
  }, [openFormOnMount, onFormOpened]);

  const save = (form: any) => {
    const client = data.clients.find(c => c.id === form.clientId);
    const clientName = client ? client.name : "";

    setData(prev => {
      if (editing) {
        return {
          ...prev,
          invoices: prev.invoices.map(i =>
            i.id === editing.id ? { ...editing, ...form, clientName } : i
          )
        };
      }
      return {
        ...prev,
        invoices: [
          ...prev.invoices,
          {
            ...form,
            id: genId(),
            number: prev.nextInvoiceNo,
            clientName,
            status: "unpaid" as const,
            paidDate: null,
            claimed: false,
            claimedDate: null,
            estimateRef: null
          }
        ],
        nextInvoiceNo: prev.nextInvoiceNo + 1
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
          Invoices
        </h1>
        <Button
          icon="➕"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          New Invoice
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
              <th style={tableHeaderStyle}>No.</th>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Client</th>
              <th style={tableHeaderStyle}>Patient</th>
              <th style={tableHeaderStyle}>Total</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No invoices yet. Click "New Invoice" to create one.
                </td>
              </tr>
            ) : (
              data.invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                  <td style={tableCellStyle}>{inv.number}</td>
                  <td style={tableCellStyle}>{fmtDate(inv.date)}</td>
                  <td style={tableCellStyle}>{inv.clientName}</td>
                  <td style={tableCellStyle}>{inv.patientSurname} {inv.patientName}</td>
                  <td style={tableCellStyle}>{fmt(inv.total)}</td>
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      background: inv.status === 'paid' ? '#dcfce7' : '#fee2e2',
                      color: inv.status === 'paid' ? '#166534' : '#991b1b'
                    }}>
                      {inv.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(inv);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
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
        title={editing ? "Edit Invoice" : "New Invoice"}
        wide
      >
        <InvoiceForm
          invoice={editing}
          data={data}
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
