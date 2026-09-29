import { useState, useRef, useEffect, useMemo } from 'react';
import type { AppData, Invoice } from '../../types';
import { Button, Modal, ConfirmModal, CopyModal } from '../ui';
import type { CopyMode } from '../ui/CopyModal';
import { InvoiceForm } from '../forms/InvoiceForm';
import { fmt, fmtDate, genId, today } from '../../utils/helpers';
import { printDocument, savePDFDocument, whatsappDocument } from '../../utils/document';
import { ICO, SvgIcon } from '../../utils/icons';

interface InvoicesProps {
  data: AppData;
  setData: (data: AppData | ((prev: AppData) => AppData)) => void;
  openFormOnMount?: boolean;
  onFormOpened?: () => void;
}

type SortColumn = 'number' | 'date' | 'client' | 'patient' | 'total' | 'status' | null;
type SortOrder = 'asc' | 'desc' | null;

export function Invoices({ data, setData, openFormOnMount, onFormOpened }: InvoicesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingInvoice, setCopyingInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
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

  const saveClient = (form: any) => {
    const newClient = {
      ...form,
      id: genId()
    };
    setData(prev => ({
      ...prev,
      clients: [...prev.clients, newClient]
    }));
    return newClient;
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

  // Toggle paid status
  const togglePaid = (inv: Invoice) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i =>
        i.id === inv.id
          ? { ...i, status: i.status === 'paid' ? 'unpaid' : 'paid', paidDate: i.status === 'paid' ? null : today() }
          : i
      )
    }));
  };

  // Claim invoice
  const claimInvoice = (inv: Invoice) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i =>
        i.id === inv.id ? { ...i, claimed: true, claimedDate: today() } : i
      )
    }));
  };

  // Unclaim invoice
  const unclaimInvoice = (inv: Invoice) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i =>
        i.id === inv.id ? { ...i, claimed: false, claimedDate: null } : i
      )
    }));
  };

  // Copy invoice with 3 modes
  const copyInvoice = (inv: Invoice, mode: CopyMode) => {
    setData(prev => {
      let clientId = '';
      let clientName = '';
      let patientTitle = '';
      let patientSurname = '';
      let patientName = '';
      let memberName = '';
      let medicalAidName = '';
      let medicalAidNumber = '';
      let lang = inv.lang;
      let refreshedItems: any[] = [];
      let notes = '';
      let discountEnabled = false;
      let discountPercent = 15;

      if (mode === 'all') {
        // Copy everything with current prices
        clientId = inv.clientId;
        clientName = inv.clientName;
        patientTitle = inv.patientTitle;
        patientSurname = inv.patientSurname;
        patientName = inv.patientName;
        memberName = inv.memberName;
        medicalAidName = inv.medicalAidName;
        medicalAidNumber = inv.medicalAidNumber;
        refreshedItems = inv.items.map(item => {
          const tr = prev.tariffs.find(t => t.code === item.code);
          return tr ? { ...item, tariffCode: tr.tariffCode || tr.code, price: tr.price } : item;
        });
        notes = inv.notes;
        discountEnabled = inv.discountEnabled || false;
        discountPercent = inv.discountPercent || 15;
      } else if (mode === 'patient') {
        // Copy patient info only
        clientId = inv.clientId;
        clientName = inv.clientName;
        patientTitle = inv.patientTitle;
        patientSurname = inv.patientSurname;
        patientName = inv.patientName;
        memberName = inv.memberName;
        medicalAidName = inv.medicalAidName;
        medicalAidNumber = inv.medicalAidNumber;
        lang = inv.lang;
        discountEnabled = inv.discountEnabled || false;
        discountPercent = inv.discountPercent || 15;
      } else if (mode === 'detail') {
        // Copy line items only
        refreshedItems = inv.items.map(item => {
          const tr = prev.tariffs.find(t => t.code === item.code);
          return tr ? { ...item, tariffCode: tr.tariffCode || tr.code, price: tr.price } : item;
        });
        notes = inv.notes;
        discountEnabled = inv.discountEnabled || false;
        discountPercent = inv.discountPercent || 15;
      }

      const newTotal = refreshedItems.reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);

      return {
        ...prev,
        invoices: [
          ...prev.invoices,
          {
            id: genId(),
            number: prev.nextInvoiceNo,
            clientId,
            clientName,
            date: today(),
            patientTitle,
            patientSurname,
            patientName,
            memberName,
            medicalAidName,
            medicalAidNumber,
            lang,
            items: refreshedItems,
            notes,
            total: newTotal,
            status: 'unpaid' as const,
            paidDate: null,
            claimed: false,
            claimedDate: null,
            estimateRef: null,
            discountEnabled,
            discountPercent
          }
        ],
        nextInvoiceNo: prev.nextInvoiceNo + 1
      };
    });
  };

  const openCopyModal = (inv: Invoice) => {
    setCopyingInvoice(inv);
    setShowCopyModal(true);
  };

  const handleCopy = (mode: CopyMode) => {
    if (copyingInvoice) {
      copyInvoice(copyingInvoice, mode);
      setShowCopyModal(false);
      setCopyingInvoice(null);
    }
  };

  // Save invoice as macro
  const saveAsMacro = (inv: Invoice) => {
    const macroName = prompt(`Enter a name for this macro:`, `Invoice #${inv.number} Macro`);
    if (!macroName || !macroName.trim()) return;

    const macroCodes = inv.items
      .filter(item => item.code && item.code.trim())
      .map(item => ({
        code: item.code,
        qty: item.qty || 1
      }));

    if (macroCodes.length === 0) {
      alert('This invoice has no line items to save as a macro.');
      return;
    }

    setData(prev => ({
      ...prev,
      macros: [
        ...prev.macros,
        {
          id: genId(),
          name: macroName.trim(),
          codes: macroCodes
        }
      ]
    }));

    alert(`Macro "${macroName.trim()}" created with ${macroCodes.length} codes!`);
  };

  // Delete invoice
  const handleDeleteClick = (inv: Invoice) => {
    setDeletingInvoice(inv);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deletingInvoice) {
      setData(prev => ({
        ...prev,
        invoices: prev.invoices.filter(i => i.id !== deletingInvoice.id)
      }));
    }
    setConfirmDelete(false);
    setDeletingInvoice(null);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setDeletingInvoice(null);
  };

  // Sorting
  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      // Cycle through: asc → desc → null
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortBy(null);
        setSortOrder(null);
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedInvoices = useMemo(() => {
    if (!sortBy || !sortOrder) return data.invoices;

    const sorted = [...data.invoices].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'number':
          aVal = a.number;
          bVal = b.number;
          break;
        case 'date':
          aVal = a.date;
          bVal = b.date;
          break;
        case 'client':
          aVal = (a.clientName || '').toLowerCase();
          bVal = (b.clientName || '').toLowerCase();
          break;
        case 'patient':
          aVal = `${a.patientSurname} ${a.patientName}`.toLowerCase();
          bVal = `${b.patientSurname} ${b.patientName}`.toLowerCase();
          break;
        case 'total':
          aVal = a.total || 0;
          bVal = b.total || 0;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data.invoices, sortBy, sortOrder]);

  const getSortIndicator = (column: SortColumn) => {
    if (sortBy !== column) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
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
              <th style={{ ...tableHeaderStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('number')}>
                No.{getSortIndicator('number')}
              </th>
              <th style={{ ...tableHeaderStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('date')}>
                Date{getSortIndicator('date')}
              </th>
              <th style={{ ...tableHeaderStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('client')}>
                Client{getSortIndicator('client')}
              </th>
              <th style={{ ...tableHeaderStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('patient')}>
                Patient{getSortIndicator('patient')}
              </th>
              <th style={{ ...tableHeaderStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('total')}>
                Total{getSortIndicator('total')}
              </th>
              <th style={{ ...tableHeaderStyle, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                Status{getSortIndicator('status')}
              </th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right', minWidth: 450 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No invoices yet. Click "New Invoice" to create one.
                </td>
              </tr>
            ) : (
              sortedInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                  <td style={tableCellStyle}>{inv.number}</td>
                  <td style={tableCellStyle}>{fmtDate(inv.date)}</td>
                  <td style={tableCellStyle}>{inv.clientName}</td>
                  <td style={tableCellStyle}>{inv.patientSurname} {inv.patientName}</td>
                  <td style={tableCellStyle}>{fmt(inv.total)}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
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
                      {inv.claimed && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          background: '#bfdbfe',
                          color: '#1e40af'
                        }}>
                          CLAIMED
                        </span>
                      )}
                      {inv.estimateRef && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          background: '#e9d5ff',
                          color: '#6b21a8'
                        }}>
                          Est #{inv.estimateRef}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      {!inv.claimed ? (
                        <button
                          title="Submit directly to medical aid — removes from dentist account statement"
                          onClick={() => claimInvoice(inv)}
                          style={{
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                        >
                          CLAIM
                        </button>
                      ) : (
                        <button
                          title="Remove direct claim status — invoice returns to dentist account"
                          onClick={() => unclaimInvoice(inv)}
                          style={{
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#dbeafe',
                            color: '#1e40af',
                            border: '1px solid #93c5fd',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                        >
                          UNCLAIM
                        </button>
                      )}
                      <button className="icon-btn" title="Print this invoice" onClick={() => printDocument(inv, data, 'invoice')}>
                        <SvgIcon path={ICO.printer} size={15} color="#6b7280" />
                      </button>
                      <button className="icon-btn" title="Save this invoice as PDF (downloads immediately)" onClick={() => savePDFDocument(inv, data, 'invoice')}>
                        <SvgIcon path={ICO.download} size={15} color="#2563eb" />
                      </button>
                      <button className="icon-btn" title="Send this invoice via WhatsApp to the client" onClick={() => whatsappDocument(inv, data, 'invoice')}>
                        <SvgIcon path={ICO.whatsapp} size={16} color="#25D366" />
                      </button>
                      <button className="icon-btn" title={inv.status === 'paid' ? "Mark this invoice as unpaid" : "Mark this invoice as paid"} onClick={() => togglePaid(inv)}>
                        <SvgIcon path={ICO.check} size={15} color={inv.status === 'paid' ? '#d97706' : '#059669'} />
                      </button>
                      <button className="icon-btn" title="Copy as new invoice — choose what to copy" onClick={() => openCopyModal(inv)}>
                        <SvgIcon path={ICO.copy} size={15} color="#6b7280" />
                      </button>
                      <button className="icon-btn" title="Save this invoice as a reusable macro (uses current tariff prices)" onClick={() => saveAsMacro(inv)}>
                        <SvgIcon path={ICO.sparkles} size={15} color="#8b5cf6" />
                      </button>
                      <button className="icon-btn" title="Edit this invoice" onClick={() => { setEditing(inv); setShowForm(true); }}>
                        <SvgIcon path={ICO.edit} size={15} color="#6b7280" />
                      </button>
                      <button className="icon-btn" title="Delete this invoice permanently" onClick={() => handleDeleteClick(inv)}>
                        <SvgIcon path={ICO.trash} size={15} color="#ef4444" />
                      </button>
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
          onSaveClient={saveClient}
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

      <CopyModal
        open={showCopyModal}
        onClose={() => {
          setShowCopyModal(false);
          setCopyingInvoice(null);
        }}
        onCopy={handleCopy}
        documentType="invoice"
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
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
