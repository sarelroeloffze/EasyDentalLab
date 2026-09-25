import React from 'react';
import type { AppData } from '../../types';
import { Button } from '../ui';
import { fmt, fmtDate } from '../../utils/formatters';

interface InvoicesProps {
  data: AppData;
}

export function Invoices({ data }: InvoicesProps) {
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
        <Button icon="➕">New Invoice</Button>
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
            {data.invoices.map((inv) => (
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
                  <Button variant="secondary">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
