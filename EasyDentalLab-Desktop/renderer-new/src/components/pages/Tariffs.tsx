import React from 'react';
import type { AppData } from '../../types';
import { Button } from '../ui';
import { fmt } from '../../utils/formatters';

interface TariffsProps {
  data: AppData;
}

export function Tariffs({ data }: TariffsProps) {
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
          Tariffs
        </h1>
        <Button icon="➕">New Tariff</Button>
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
              <th style={tableHeaderStyle}>Code</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Price</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.tariffs.slice(0, 50).map((tariff) => (
              <tr key={tariff.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                <td style={tableCellStyle}>
                  <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                    {tariff.code}
                  </span>
                </td>
                <td style={tableCellStyle}>{tariff.description}</td>
                <td style={tableCellStyle}>{fmt(tariff.price)}</td>
                <td style={tableCellStyle}>{tariff.category}</td>
                <td style={tableCellStyle}>
                  <Button variant="secondary">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.tariffs.length > 50 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--c-text3)' }}>
            Showing 50 of {data.tariffs.length} tariffs
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
