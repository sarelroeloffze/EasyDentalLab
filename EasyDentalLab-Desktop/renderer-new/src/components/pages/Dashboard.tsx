import { useMemo } from 'react';
import type { AppData } from '../../types';
import { fmt } from '../../utils/formatters';
import { getInvoiceBalance } from '../../utils/calculations';

interface DashboardProps {
  data: AppData;
}

export function Dashboard({ data }: DashboardProps) {
  const stats = useMemo(() => {
    const totalClients = data.clients.length;
    const totalInvoices = data.invoices.length;
    const totalEstimates = data.estimates.length;
    
    const outstanding = data.invoices
      .filter(inv => inv.status !== 'paid' && !inv.claimed)
      .reduce((sum, inv) => sum + getInvoiceBalance(inv, data.payments), 0);
    
    const paidThisMonth = data.invoices
      .filter(inv => {
        if (!inv.paidDate) return false;
        const paidMonth = inv.paidDate.substring(0, 7);
        const thisMonth = new Date().toISOString().substring(0, 7);
        return paidMonth === thisMonth;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    return {
      totalClients,
      totalInvoices,
      totalEstimates,
      outstanding,
      paidThisMonth
    };
  }, [data]);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 700, 
        marginBottom: 32,
        color: 'var(--c-text1)'
      }}>
        Dashboard
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        <StatCard 
          icon="👨‍⚕️"
          label="Total Clients"
          value={stats.totalClients.toString()}
        />
        <StatCard 
          icon="📄"
          label="Total Invoices"
          value={stats.totalInvoices.toString()}
        />
        <StatCard 
          icon="📝"
          label="Total Estimates"
          value={stats.totalEstimates.toString()}
        />
        <StatCard 
          icon="💰"
          label="Outstanding"
          value={fmt(stats.outstanding)}
          highlight
        />
        <StatCard 
          icon="✅"
          label="Paid This Month"
          value={fmt(stats.paidThisMonth)}
          highlight
        />
      </div>

      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        padding: 24,
        border: '1px solid var(--c-border)'
      }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: 600, 
          marginBottom: 16,
          color: 'var(--c-text1)'
        }}>
          Quick Actions
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          flexWrap: 'wrap' 
        }}>
          <QuickAction icon="📄" label="New Invoice" />
          <QuickAction icon="📝" label="New Estimate" />
          <QuickAction icon="👨‍⚕️" label="New Client" />
          <QuickAction icon="💰" label="New Payment" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--c-surface)',
      borderRadius: 12,
      padding: 24,
      border: '1px solid var(--c-border)',
      ...(highlight ? { borderColor: '#2563eb', borderWidth: 2 } : {})
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ 
        fontSize: 13, 
        color: 'var(--c-text3)',
        marginBottom: 4
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 28, 
        fontWeight: 700,
        color: highlight ? '#2563eb' : 'var(--c-text1)'
      }}>
        {value}
      </div>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: string; label: string }) {
  return (
    <button style={{
      background: 'var(--c-surface2)',
      border: '1px solid var(--c-border)',
      borderRadius: 8,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--c-text1)',
      transition: 'all 0.2s'
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
