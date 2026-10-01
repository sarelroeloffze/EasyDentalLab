import { useState, useMemo } from 'react';
import type { AppData, Client, Payment } from '../../types';
import { Input, Modal } from './';
import { genId, today, fmtDate } from '../../utils/helpers';
import { getClientCredit, formatCurrency } from '../../utils/payments';

interface PaymentModalProps {
  open: boolean;
  client: Client;
  data: AppData;
  payment?: Payment;
  onSave: (payment: Payment, receiptMethod: string) => void;
  onCancel: () => void;
}

export function PaymentModal({ open, client, data, payment, onSave, onCancel }: PaymentModalProps) {
  const isEdit = !!payment;
  const otherPayments = isEdit
    ? (data.payments || []).filter(p => p.id !== payment.id)
    : (data.payments || []);

  const outstandingInvoices = useMemo(() => {
    return [...(data.invoices || [])]
      .filter(inv => inv.clientId === client.id && !inv.claimed)
      .map(inv => {
        const paidElsewhere = otherPayments.reduce((s, p) => {
          const alloc = (p.allocations || []).find(a => a.invoiceId === inv.id);
          return s + (alloc?.amount || 0);
        }, 0);
        const legacyPaid = paidElsewhere === 0 && inv.status === 'paid';
        const bal = legacyPaid ? 0 : Math.max(0, (inv.total || 0) - paidElsewhere);
        return { ...inv, balance: bal };
      })
      .filter(inv => inv.balance > 0)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [data.invoices, otherPayments, client.id]);

  const credit = getClientCredit(client.id, otherPayments);

  const [form, setForm] = useState({
    date: payment?.date || today(),
    amount: payment?.amount ? String(payment.amount) : '',
    reference: payment?.reference || '',
    method: payment?.method || 'eft',
    receiptMethod: 'print'
  });

  const [allocations, setAllocations] = useState(() => {
    return outstandingInvoices.map(inv => {
      const prevAllocated = isEdit
        ? ((payment.allocations || []).find(a => a.invoiceId === inv.id)?.amount || 0)
        : 0;
      return {
        invoiceId: inv.id,
        invoiceNumber: inv.number,
        invoiceDate: inv.date,
        patient: [inv.patientSurname, inv.patientName].filter(Boolean).join(', '),
        balance: isEdit ? inv.balance + prevAllocated : inv.balance,
        allocated: prevAllocated
      };
    });
  });

  const sf = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const totalAmount = parseFloat(form.amount) || 0;
  const totalAllocated = allocations.reduce((s, a) => s + (parseFloat(String(a.allocated)) || 0), 0);
  const unallocated = Math.max(0, Math.round((totalAmount - totalAllocated) * 100) / 100);
  const overAllocated = totalAllocated > totalAmount + 0.005;

  const autoAllocate = (amount: string) => {
    let rem = parseFloat(amount) || 0;
    setAllocations(prev =>
      prev.map(a => {
        const apply = Math.min(rem, a.balance);
        rem = Math.max(0, rem - apply);
        return { ...a, allocated: apply > 0 ? Math.round(apply * 100) / 100 : 0 };
      })
    );
  };

  const handleSave = () => {
    if (!totalAmount || totalAmount <= 0) {
      alert('Please enter a payment amount.');
      return;
    }
    if (overAllocated) {
      alert('Total allocated exceeds payment amount.');
      return;
    }

    const activeAllocs = allocations
      .filter(a => (a.allocated || 0) > 0)
      .map(a => ({
        invoiceId: a.invoiceId,
        amount: Math.round((a.allocated || 0) * 100) / 100
      }));

    onSave(
      {
        id: payment?.id || genId(),
        date: form.date,
        clientId: client.id,
        clientName: client.name + (client.practice ? ' — ' + client.practice : ''),
        amount: Math.round(totalAmount * 100) / 100,
        reference: form.reference,
        method: form.method,
        allocations: activeAllocs
      },
      form.receiptMethod
    );
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isEdit ? 'Edit Payment' : 'Record Payment'}
      wide
    >
      <div>
        {credit > 0 && (
          <div
            style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 12,
              fontSize: 12,
              color: '#166534'
            }}
          >
            <strong>Credit available: {formatCurrency(credit)}</strong> — unallocated balance from a
            previous payment.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <Input label="Date" type="date" value={form.date} onChange={v => sf('date', v)} />
          <Input
            label="Amount Received (R)"
            value={form.amount}
            onChange={v => {
              sf('amount', v);
              autoAllocate(v);
            }}
            placeholder="0.00"
            type="number"
          />
          <Input
            label="Reference / Note"
            value={form.reference}
            onChange={v => sf('reference', v)}
            placeholder="e.g. EFT ref 12345"
          />
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--c-text2)',
                display: 'block',
                marginBottom: 4
              }}
            >
              Method
            </label>
            <select
              value={form.method}
              onChange={e => sf('method', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--c-text1)'
              }}
            >
              <option value="eft">EFT</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text2)' }}>
              Allocate to Invoices (oldest first)
            </label>
            <button
              onClick={() => autoAllocate(form.amount)}
              style={{
                padding: '4px 12px',
                background: 'var(--c-surface2)',
                border: '1px solid var(--c-border)',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--c-text1)'
              }}
            >
              Auto-fill
            </button>
          </div>

          {outstandingInvoices.length === 0 ? (
            <div
              style={{
                padding: 12,
                textAlign: 'center',
                color: 'var(--c-text4)',
                fontSize: 12,
                border: '1px solid var(--c-border)',
                borderRadius: 6
              }}
            >
              No outstanding invoices — full amount will be saved as credit.
            </div>
          ) : (
            <div style={{ border: '1px solid var(--c-border)', borderRadius: 6, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--c-surface2)',
                      borderBottom: '1px solid var(--c-border)'
                    }}
                  >
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Invoice</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Patient</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>Balance Due</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>Allocate (R)</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((a, i) => (
                    <tr
                      key={a.invoiceId}
                      style={{
                        borderBottom:
                          i < allocations.length - 1 ? '1px solid var(--c-border2)' : 'none'
                      }}
                    >
                      <td style={{ padding: '5px 10px', fontWeight: 600, color: '#2563eb' }}>
                        #{a.invoiceNumber}
                      </td>
                      <td style={{ padding: '5px 10px', color: 'var(--c-text3)' }}>
                        {fmtDate(a.invoiceDate)}
                      </td>
                      <td style={{ padding: '5px 10px' }}>{a.patient || '—'}</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatCurrency(a.balance)}
                      </td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                        <input
                          type="number"
                          min="0"
                          max={a.balance}
                          step="0.01"
                          value={a.allocated || ''}
                          onChange={e =>
                            setAllocations(prev =>
                              prev.map(x =>
                                x.invoiceId === a.invoiceId
                                  ? { ...x, allocated: parseFloat(e.target.value) || 0 }
                                  : x
                              )
                            )
                          }
                          style={{
                            width: 90,
                            textAlign: 'right',
                            padding: '3px 6px',
                            fontSize: 12,
                            background: 'var(--c-surface)',
                            border: '1px solid var(--c-border)',
                            borderRadius: 4,
                            color: 'var(--c-text1)'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: '8px 12px',
            background: 'var(--c-surface2)',
            borderRadius: 6,
            marginBottom: 14,
            fontSize: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <span>
            Total received: <strong>{formatCurrency(totalAmount)}</strong>
          </span>
          <span>
            Allocated: <strong>{formatCurrency(totalAllocated)}</strong>
          </span>
          <span style={{ color: unallocated > 0 ? '#059669' : 'var(--c-text2)' }}>
            Credit: <strong>{formatCurrency(unallocated)}</strong>
          </span>
          {overAllocated && (
            <span style={{ color: '#dc2626', fontWeight: 600 }}>
              ⚠ Over-allocated by {formatCurrency(totalAllocated - totalAmount)}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 14,
            padding: '8px 12px',
            border: '1px solid var(--c-border)',
            borderRadius: 6
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text2)' }}>
            Issue Receipt:
          </label>
          {[
            ['print', 'Print'],
            ['whatsapp', 'WhatsApp'],
            ['both', 'Both']
          ].map(([v, label]) => (
            <label
              key={v}
              style={{
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <input
                type="radio"
                name="rcptMethod"
                value={v}
                checked={form.receiptMethod === v}
                onChange={() => sf('receiptMethod', v)}
              />{' '}
              {label}
            </label>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            borderTop: '1px solid var(--c-border)',
            paddingTop: 12
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: 'var(--c-surface2)',
              border: '1px solid var(--c-border)',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--c-text1)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!totalAmount || totalAmount <= 0 || overAllocated}
            style={{
              padding: '8px 16px',
              background: !totalAmount || totalAmount <= 0 || overAllocated ? '#9ca3af' : '#2563eb',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: !totalAmount || totalAmount <= 0 || overAllocated ? 'not-allowed' : 'pointer',
              color: 'white'
            }}
          >
            {isEdit ? 'Update Payment' : 'Save & Issue Receipt'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
