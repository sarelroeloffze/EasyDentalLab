import { useState, useRef, useEffect, useMemo } from 'react';
import type { AppData, Estimate } from '../../types';
import { Button, Modal, ConfirmModal, CopyModal } from '../ui';
import type { CopyMode } from '../ui/CopyModal';
import { EstimateForm } from '../forms/EstimateForm';
import { fmt, fmtDate, genId, today } from '../../utils/helpers';
import { printDocument, savePDFDocument, whatsappDocument } from '../../utils/document';
import { ICO, SvgIcon } from '../../utils/icons';

interface EstimatesProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
  openFormOnMount?: boolean;
  onFormOpened?: () => void;
}

type SortColumn = 'number' | 'date' | 'client' | 'patient' | 'total' | null;
type SortOrder = 'asc' | 'desc' | null;

export function Estimates({ data, setData, openFormOnMount, onFormOpened }: EstimatesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Estimate | null>(null);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingEstimate, setCopyingEstimate] = useState<Estimate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingEstimate, setDeletingEstimate] = useState<Estimate | null>(null);
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

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  const save = (form: any) => {
    const client = data.clients.find(c => c.id === form.clientId);
    const clientName = client ? client.name : "";

    setData(prev => {
      if (editing) {
        return {
          ...prev,
          estimates: prev.estimates.map(e =>
            e.id === editing.id ? { ...editing, ...form, clientName } : e
          )
        };
      }
      return {
        ...prev,
        estimates: [
          ...prev.estimates,
          {
            ...form,
            id: genId(),
            number: prev.nextEstimateNo,
            clientName
          }
        ],
        nextEstimateNo: prev.nextEstimateNo + 1
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

  // Convert estimate to invoice
  const toInvoice = (est: Estimate) => {
    setData(prev => {
      // Refresh prices from current tariffs
      const refreshedItems = est.items.map(item => {
        const tariff = prev.tariffs.find(t => t.code === item.code);
        return tariff ? { ...item, tariffCode: tariff.tariffCode || tariff.code, price: tariff.price } : item;
      });

      const newTotal = refreshedItems.reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);

      return {
        ...prev,
        invoices: [
          ...prev.invoices,
          {
            id: genId(),
            number: prev.nextInvoiceNo,
            clientId: est.clientId,
            clientName: est.clientName,
            date: today(),
            patientTitle: est.patientTitle,
            patientSurname: est.patientSurname,
            patientName: est.patientName,
            memberName: est.memberName,
            medicalAidName: est.medicalAidName,
            medicalAidNumber: est.medicalAidNumber,
            lang: est.lang,
            items: refreshedItems,
            notes: est.notes,
            total: newTotal,
            status: 'unpaid' as const,
            paidDate: null,
            claimed: false,
            claimedDate: null,
            estimateRef: est.number,
            discountEnabled: est.discountEnabled || false,
            discountPercent: est.discountPercent || 15
          }
        ],
        nextInvoiceNo: prev.nextInvoiceNo + 1,
        estimates: prev.estimates.map(e =>
          e.id === est.id ? { ...e, status: 'invoiced' } as any : e
        )
      };
    });
  };

  // Copy estimate with 3 modes
  const copyEstimate = (est: Estimate, mode: CopyMode) => {
    setData(prev => {
      let clientId = '';
      let clientName = '';
      let patientTitle = '';
      let patientSurname = '';
      let patientName = '';
      let memberName = '';
      let medicalAidName = '';
      let medicalAidNumber = '';
      let lang = est.lang;
      let refreshedItems: any[] = [];
      let notes = '';
      let discountEnabled = false;
      let discountPercent = 15;

      if (mode === 'all') {
        // Copy everything with current prices
        clientId = est.clientId;
        clientName = est.clientName;
        patientTitle = est.patientTitle;
        patientSurname = est.patientSurname;
        patientName = est.patientName;
        memberName = est.memberName;
        medicalAidName = est.medicalAidName;
        medicalAidNumber = est.medicalAidNumber;
        refreshedItems = est.items.map(item => {
          const tr = prev.tariffs.find(t => t.code === item.code);
          return tr ? { ...item, tariffCode: tr.tariffCode || tr.code, price: tr.price } : item;
        });
        notes = est.notes;
        discountEnabled = est.discountEnabled || false;
        discountPercent = est.discountPercent || 15;
      } else if (mode === 'patient') {
        // Copy patient info only
        clientId = est.clientId;
        clientName = est.clientName;
        patientTitle = est.patientTitle;
        patientSurname = est.patientSurname;
        patientName = est.patientName;
        memberName = est.memberName;
        medicalAidName = est.medicalAidName;
        medicalAidNumber = est.medicalAidNumber;
        lang = est.lang;
        discountEnabled = est.discountEnabled || false;
        discountPercent = est.discountPercent || 15;
      } else if (mode === 'detail') {
        // Copy line items only
        refreshedItems = est.items.map(item => {
          const tr = prev.tariffs.find(t => t.code === item.code);
          return tr ? { ...item, tariffCode: tr.tariffCode || tr.code, price: tr.price } : item;
        });
        notes = est.notes;
        discountEnabled = est.discountEnabled || false;
        discountPercent = est.discountPercent || 15;
      }

      const newTotal = refreshedItems.reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);

      return {
        ...prev,
        estimates: [
          ...prev.estimates,
          {
            id: genId(),
            number: prev.nextEstimateNo,
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
            discountEnabled,
            discountPercent
          }
        ],
        nextEstimateNo: prev.nextEstimateNo + 1
      };
    });
  };

  const openCopyModal = (est: Estimate) => {
    setCopyingEstimate(est);
    setShowCopyModal(true);
  };

  const handleCopy = (mode: CopyMode) => {
    if (copyingEstimate) {
      copyEstimate(copyingEstimate, mode);
      setShowCopyModal(false);
      setCopyingEstimate(null);
    }
  };

  // Save estimate as macro
  const saveAsMacro = (est: Estimate) => {
    const macroName = prompt(`Enter a name for this macro:`, `Estimate #${est.number} Macro`);
    if (!macroName || !macroName.trim()) return;

    const macroCodes = est.items
      .filter(item => item.code && item.code.trim())
      .map(item => ({
        code: item.code,
        qty: item.qty || 1
      }));

    if (macroCodes.length === 0) {
      alert('This estimate has no line items to save as a macro.');
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

  // Delete estimate
  const handleDeleteClick = (est: Estimate) => {
    setDeletingEstimate(est);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deletingEstimate) {
      setData(prev => ({
        ...prev,
        estimates: prev.estimates.filter(e => e.id !== deletingEstimate.id)
      }));
    }
    setConfirmDelete(false);
    setDeletingEstimate(null);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setDeletingEstimate(null);
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

  const sortedEstimates = useMemo(() => {
    if (!sortBy || !sortOrder) return data.estimates;

    const sorted = [...data.estimates].sort((a, b) => {
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
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data.estimates, sortBy, sortOrder]);

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
          Estimates
        </h1>
        <Button
          icon="➕"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          New Estimate
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
              <th style={{ ...tableHeaderStyle, textAlign: 'right', minWidth: 400 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEstimates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-text3)' }}>
                  No estimates yet. Click "New Estimate" to create one.
                </td>
              </tr>
            ) : (
              sortedEstimates.map((est) => (
                <tr key={est.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                  <td style={tableCellStyle}>{est.number}</td>
                  <td style={tableCellStyle}>{fmtDate(est.date)}</td>
                  <td style={tableCellStyle}>{est.clientName}</td>
                  <td style={tableCellStyle}>{est.patientSurname} {est.patientName}</td>
                  <td style={tableCellStyle}>{fmt(est.total)}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button className="icon-btn" title="Print this estimate" onClick={() => printDocument(est, data, 'estimate')}>
                        <SvgIcon path={ICO.printer} size={15} color="#6b7280" />
                      </button>
                      <button className="icon-btn" title="Save this estimate as PDF (downloads immediately)" onClick={() => savePDFDocument(est, data, 'estimate')}>
                        <SvgIcon path={ICO.download} size={15} color="#2563eb" />
                      </button>
                      <button className="icon-btn" title="Send this estimate via WhatsApp to the client" onClick={() => whatsappDocument(est, data, 'estimate')}>
                        <SvgIcon path={ICO.whatsapp} size={16} color="#25D366" />
                      </button>
                      <button className="icon-btn" title="Convert this estimate into an invoice" onClick={() => toInvoice(est)}>
                        <SvgIcon path={ICO.arrowRight} size={15} color="#059669" />
                      </button>
                      <button className="icon-btn" title="Copy as new estimate — choose what to copy" onClick={() => openCopyModal(est)}>
                        <SvgIcon path={ICO.copy} size={15} color="#6b7280" />
                      </button>
                      <button className="icon-btn" title="Save this estimate as a reusable macro (uses current tariff prices)" onClick={() => saveAsMacro(est)}>
                        <SvgIcon path={ICO.sparkles} size={15} color="#8b5cf6" />
                      </button>
                      <button className="icon-btn" title="Edit this estimate" onClick={() => { setEditing(est); setShowForm(true); }}>
                        <SvgIcon path={ICO.edit} size={15} color="#6b7280" />
                      </button>
                      <button className="icon-btn" title="Delete this estimate permanently" onClick={() => handleDeleteClick(est)}>
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
        title={editing ? "Edit Estimate" : "New Estimate"}
        wide
      >
        <EstimateForm
          estimate={editing}
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
          setCopyingEstimate(null);
        }}
        onCopy={handleCopy}
        documentType="estimate"
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete Estimate"
        message="Are you sure you want to delete this estimate?"
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
