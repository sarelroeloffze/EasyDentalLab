import React from 'react';
import type { AppData } from '../../types';
import { Button } from '../ui';
import { fmt, fmtDate } from '../../utils/formatters';

interface EstimatesProps {
  data: AppData;
}

export function Estimates({ data }: EstimatesProps) {
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
        <Button icon="➕">New Estimate</Button>
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
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.estimates.map((est) => (
              <tr key={est.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                <td style={tableCellStyle}>{est.number}</td>
                <td style={tableCellStyle}>{fmtDate(est.date)}</td>
                <td style={tableCellStyle}>{est.clientName}</td>
                <td style={tableCellStyle}>{est.patientSurname} {est.patientName}</td>
                <td style={tableCellStyle}>{fmt(est.total)}</td>
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
