import React from 'react';
import type { AppData } from '../../types';
import { Button } from '../ui';

interface ClientsProps {
  data: AppData;
}

export function Clients({ data }: ClientsProps) {
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
          Dentist/Practice
        </h1>
        <Button icon="➕">New Client</Button>
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
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Practice</th>
              <th style={tableHeaderStyle}>Phone</th>
              <th style={tableHeaderStyle}>Email</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((client) => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--c-border2)' }}>
                <td style={tableCellStyle}>{client.name}</td>
                <td style={tableCellStyle}>{client.practice}</td>
                <td style={tableCellStyle}>{client.phone}</td>
                <td style={tableCellStyle}>{client.email}</td>
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
