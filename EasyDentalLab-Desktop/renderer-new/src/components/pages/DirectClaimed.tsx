import React from 'react';
import type { AppData } from '../../types';
import { Button } from '../ui';
import { fmt, fmtDate } from '../../utils/formatters';

interface DirectClaimedProps {
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
  data: AppData;
}

export function DirectClaimed({ data }: DirectClaimedProps) {
  const claimedInvoices = data.invoices.filter(inv => inv.claimed);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 700,
        color: 'var(--c-text1)',
        marginBottom: 24
      }}>
        Direct Claimed
      </h1>

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
              <th style={tableHeaderStyle}>Claimed Date</th>
              <th style={tableHeaderStyle}>Client</th>
              <th style={tableHeaderStyle}>Patient</th>
              <th style={tableHeaderStyle}>Total</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claimedInvoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                <td style={tableCellStyle}>{inv.number}</td>
                <td style={tableCellStyle}>{inv.claimedDate ? fmtDate(inv.claimedDate) : '-'}</td>
                <td style={tableCellStyle}>{inv.clientName}</td>
                <td style={tableCellStyle}>{inv.patientSurname} {inv.patientName}</td>
                <td style={tableCellStyle}>{fmt(inv.total)}</td>
                <td style={tableCellStyle}>
                  <Button variant="secondary">Unclaim</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {claimedInvoices.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--c-text3)' }}>
            No claimed invoices
          </div>
        )}
      </div>
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
