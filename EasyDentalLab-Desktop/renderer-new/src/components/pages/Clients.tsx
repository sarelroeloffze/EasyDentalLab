import React, { useState, useRef, useEffect } from 'react';
import type { AppData, Client, Payment } from '../../types';
import { Button, Modal, ConfirmModal, PaymentModal } from '../ui';
import { ClientForm } from '../forms/ClientForm';
import { genId, fmtDate } from '../../utils/helpers';
import { getClientAging, getClientCredit, formatCurrency } from '../../utils/payments';
import { printStatement, whatsappStatement, printReceipt, whatsappReceipt } from '../../utils/documents';
import { INITIAL_DATA } from '../../constants/initialData';

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
  const [paymentClient, setPaymentClient] = useState<Client | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set());
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

  const layout = { ...INITIAL_DATA.profile.layout, ...(data.profile.layout || {}) };
  const stmtMethod = layout.statementSendMethod || 'both';
  const showPrint = stmtMethod === 'print' || stmtMethod === 'both';
  const showWA = stmtMethod === 'whatsapp' || stmtMethod === 'both';

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

  const savePayment = (payment: Payment, receiptMethod: string) => {
    setData(prev => {
      const payments = prev.payments || [];
      const isEdit = payments.some(p => p.id === payment.id);
      const newPayments = isEdit
        ? payments.map(p => (p.id === payment.id ? payment : p))
        : [...payments, payment];

      return { ...prev, payments: newPayments };
    });

    const client = data.clients.find(c => c.id === payment.clientId);
    if (client) {
      if (receiptMethod === 'print' || receiptMethod === 'both') {
        printReceipt(payment, client, data);
      }
      if (receiptMethod === 'whatsapp' || receiptMethod === 'both') {
        whatsappReceipt(payment, client, data);
      }
    }

    setPaymentClient(null);
    setEditingPayment(null);
  };

  const togglePaymentHistory = (clientId: string) => {
    setExpandedPayments(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const clientPayments = (clientId: string) => {
    return (data.payments || [])
      .filter(p => p.clientId === clientId)
      .sort((a, b) => b.date.localeCompare(a.date));
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--c-text1)',
            margin: 0
          }}
        >
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

      <div
        style={{
          background: 'var(--c-surface)',
          borderRadius: 12,
          border: '1px solid var(--c-border)',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                background: 'var(--c-surface2)',
                borderBottom: '1px solid var(--c-border)'
              }}
            >
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Practice</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Current</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>30 Days</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>60+</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Total</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No clients yet. Click "New Client" to add one.
                </td>
              </tr>
            ) : (
              data.clients.map(client => {
                const aging = getClientAging(client.id, data.invoices, data.payments || []);
                const credit = getClientCredit(client.id, data.payments || []);
                const payments = clientPayments(client.id);
                const expanded = expandedPayments.has(client.id);

                return (
                  <React.Fragment key={client.id}>
                    <tr style={{ borderBottom: '1px solid var(--c-border2)' }}>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {client.name}
                          {credit > 0 && (
                            <span
                              style={{
                                background: '#d1fae5',
                                color: '#059669',
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 600
                              }}
                            >
                              Credit: {formatCurrency(credit)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tableCellStyle}>{client.practice}</td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(aging.current)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(aging.thirtyDays)}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(aging.sixtyPlus)}
                      </td>
                      <td
                        style={{
                          ...tableCellStyle,
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: 700
                        }}
                      >
                        {formatCurrency(aging.total)}
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setPaymentClient(client)}
                            style={{
                              padding: '4px 10px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            + Payment
                          </button>

                          {aging.total > 0 && showPrint && (
                            <button
                              onClick={() => printStatement(client.id, data)}
                              style={{
                                padding: '4px 10px',
                                background: 'var(--c-surface2)',
                                color: 'var(--c-text1)',
                                border: '1px solid var(--c-border)',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Print Statement
                            </button>
                          )}

                          {aging.total > 0 && showWA && (
                            <button
                              onClick={() => whatsappStatement(client, data)}
                              style={{
                                padding: '4px 10px',
                                background: '#25D366',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              💬 Statement
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditing(client);
                              setShowForm(true);
                            }}
                            style={{
                              padding: '4px 10px',
                              background: 'var(--c-surface2)',
                              color: 'var(--c-text1)',
                              border: '1px solid var(--c-border)',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteClick(client)}
                            style={{
                              padding: '4px 10px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>

                          {payments.length > 0 && (
                            <button
                              onClick={() => togglePaymentHistory(client.id)}
                              style={{
                                padding: '4px 10px',
                                background: 'var(--c-surface2)',
                                color: 'var(--c-text2)',
                                border: '1px solid var(--c-border)',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {expanded ? '▲' : '▼'} Payment history ({payments.length})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expanded && payments.length > 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, background: '#f9fafb' }}>
                          <div style={{ padding: 16 }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600 }}>
                              Payment History
                            </h4>
                            <table style={{ width: '100%', fontSize: 12 }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--c-border2)' }}>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Reference</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Method</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {payments.map(payment => (
                                  <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '6px 8px' }}>{fmtDate(payment.date)}</td>
                                    <td style={{ padding: '6px 8px' }}>{payment.reference || '—'}</td>
                                    <td style={{ padding: '6px 8px' }}>
                                      {payment.method.toUpperCase()}
                                    </td>
                                    <td
                                      style={{
                                        padding: '6px 8px',
                                        textAlign: 'right',
                                        fontFamily: 'monospace'
                                      }}
                                    >
                                      {formatCurrency(payment.amount)}
                                    </td>
                                    <td style={{ padding: '6px 8px' }}>
                                      <div style={{ display: 'flex', gap: 4 }}>
                                        <button
                                          onClick={() => printReceipt(payment, client, data)}
                                          style={{
                                            padding: '2px 8px',
                                            background: 'var(--c-surface2)',
                                            border: '1px solid var(--c-border)',
                                            borderRadius: 4,
                                            fontSize: 11,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          Print
                                        </button>
                                        <button
                                          onClick={() => whatsappReceipt(payment, client, data)}
                                          style={{
                                            padding: '2px 8px',
                                            background: '#25D366',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            fontSize: 11,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          💬
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingPayment(payment);
                                            setPaymentClient(client);
                                          }}
                                          style={{
                                            padding: '2px 8px',
                                            background: 'var(--c-surface2)',
                                            border: '1px solid var(--c-border)',
                                            borderRadius: 4,
                                            fontSize: 11,
                                            cursor: 'pointer'
                                          }}
                                        >
                                          ✏
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
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
        title={editing ? 'Edit Client' : 'New Client'}
      >
        <ClientForm
          client={editing}
          clients={data.clients}
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

      {paymentClient && (
        <PaymentModal
          open={true}
          client={paymentClient}
          data={data}
          payment={editingPayment || undefined}
          onSave={savePayment}
          onCancel={() => {
            setPaymentClient(null);
            setEditingPayment(null);
          }}
        />
      )}

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
