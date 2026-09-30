import type { Estimate, AppData } from '../../types';
import { fmt, fmtDate } from '../../utils/helpers';
import { printDocument, savePDFDocument, whatsappDocument } from '../../utils/document';
import { ICO, SvgIcon } from '../../utils/icons';

interface EstimateViewerProps {
  estimate: Estimate;
  data: AppData;
  onClose: () => void;
}

export function EstimateViewer({ estimate, data, onClose }: EstimateViewerProps) {
  const client = data.clients.find(c => c.id === estimate.clientId);
  const vatRate = parseFloat(String(data.profile.vatPercent)) || 0;

  const subtotal = (estimate.items || []).reduce(
    (s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0),
    0
  );

  const discountAmount = estimate.discountEnabled
    ? subtotal * (Math.min(100, Math.max(0, parseFloat(String(estimate.discountPercent)) || 0)) / 100)
    : 0;

  const afterDiscount = subtotal - discountAmount;
  const vatAmount = vatRate > 0 ? afterDiscount * (vatRate / 100) / (1 + vatRate / 100) : 0;
  const total = afterDiscount;

  const fieldStyle: React.CSSProperties = {
    marginBottom: 12
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 4
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#374151'
  };

  return (
    <div>
      {/* Header Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Dentist / Practice</div>
            <div style={valueStyle}>
              {client?.name || 'Unknown'}
              {client?.practice && <span style={{ color: '#9ca3af' }}> — {client.practice}</span>}
            </div>
          </div>
        </div>
        <div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Estimate Number</div>
            <div style={{ ...valueStyle, fontWeight: 700, fontSize: 18, color: '#6b21a8' }}>
              #{estimate.number}
            </div>
          </div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Date</div>
            <div style={valueStyle}>{fmtDate(estimate.date)}</div>
          </div>
        </div>
      </div>

      {/* Patient Details */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Patient Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={fieldStyle}>
            <div style={labelStyle}>Name</div>
            <div style={valueStyle}>
              {estimate.patientTitle && <span>{estimate.patientTitle} </span>}
              {estimate.patientSurname} {estimate.patientName}
            </div>
          </div>
          {estimate.memberName && (
            <div style={fieldStyle}>
              <div style={labelStyle}>Member Name</div>
              <div style={valueStyle}>{estimate.memberName}</div>
            </div>
          )}
          {estimate.medicalAidName && (
            <div style={fieldStyle}>
              <div style={labelStyle}>Medical Aid</div>
              <div style={valueStyle}>{estimate.medicalAidName}</div>
            </div>
          )}
          {estimate.medicalAidNumber && (
            <div style={fieldStyle}>
              <div style={labelStyle}>Medical Aid Number</div>
              <div style={valueStyle}>{estimate.medicalAidNumber}</div>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Line Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Code</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Description</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Qty</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Price</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {estimate.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', fontSize: 13, fontFamily: 'monospace' }}>{item.code}</td>
                <td style={{ padding: '8px 12px', fontSize: 13 }}>{item.description}</td>
                <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right' }}>{item.qty}</td>
                <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right' }}>{fmt(item.price)}</td>
                <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>
                  {fmt((parseFloat(String(item.qty)) || 0) * (parseFloat(String(item.price)) || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {estimate.notes && (
        <div style={{ marginBottom: 24 }}>
          <div style={labelStyle}>Client Notes</div>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap', background: '#f9fafb', padding: 12, borderRadius: 6 }}>
            {estimate.notes}
          </div>
        </div>
      )}

      {/* Totals */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 250, fontSize: 14 }}>
            <span>Subtotal:</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {estimate.discountEnabled && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 250, fontSize: 14, color: '#dc2626' }}>
              <span>Discount ({Math.min(100, Math.max(0, parseFloat(String(estimate.discountPercent)) || 0)).toFixed(1)}%):</span>
              <span>- {fmt(discountAmount)}</span>
            </div>
          )}
          {vatRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 250, fontSize: 12, color: '#6b7280' }}>
              <span>VAT at {vatRate}% included:</span>
              <span>{fmt(vatAmount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: 250,
            fontSize: 18,
            fontWeight: 700,
            borderTop: '1px solid #e5e7eb',
            paddingTop: 8
          }}>
            <span>Estimate Total:</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={() => printDocument(estimate, data, 'estimate')}
            title="Print this estimate"
          >
            <SvgIcon path={ICO.printer} size={14} color="#6b7280" style={{ marginRight: 6 }} />
            Print
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => savePDFDocument(estimate, data, 'estimate')}
            title="Download as PDF"
          >
            <SvgIcon path={ICO.download} size={14} color="#2563eb" style={{ marginRight: 6 }} />
            Download PDF
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => whatsappDocument(estimate, data, 'estimate')}
            title="Send via WhatsApp"
          >
            <SvgIcon path={ICO.whatsapp} size={14} color="#25D366" style={{ marginRight: 6 }} />
            WhatsApp
          </button>
        </div>
        <button
          className="btn btn-primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
