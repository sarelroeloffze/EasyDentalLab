import type { Invoice, Payment } from '../types';

/**
 * Get total amount paid towards an invoice across all payments
 */
export function getInvoiceAmountPaid(invoiceId: string, payments: Payment[]): number {
  return payments.reduce((sum, payment) => {
    const allocation = payment.allocations.find(a => a.invoiceId === invoiceId);
    return sum + (allocation?.amount || 0);
  }, 0);
}

/**
 * Get remaining balance for an invoice after payments
 */
export function getInvoiceBalance(invoice: Invoice, payments: Payment[]): number {
  const total = invoice.total || 0;
  const paid = getInvoiceAmountPaid(invoice.id, payments);
  return Math.max(0, total - paid);
}

/**
 * Get display status for an invoice based on payments
 */
export function getInvoiceDisplayStatus(invoice: Invoice, payments: Payment[]): 'paid' | 'partial' | 'unpaid' {
  const balance = getInvoiceBalance(invoice, payments);
  const total = invoice.total || 0;

  if (balance === 0) return 'paid';
  if (balance < total) return 'partial';
  return 'unpaid';
}

/**
 * Get credit balance for a client (unallocated payment amounts)
 */
export function getClientCredit(clientId: string, payments: Payment[]): number {
  return payments
    .filter(p => p.clientId === clientId)
    .reduce((sum, payment) => {
      const allocated = payment.allocations.reduce((s, a) => s + a.amount, 0);
      const unallocated = payment.amount - allocated;
      return sum + unallocated;
    }, 0);
}

/**
 * Get age analysis for a client (Current, 30 Days, 60+ Days)
 */
export function getClientAging(
  clientId: string,
  invoices: Invoice[],
  payments: Payment[]
): { current: number; thirtyDays: number; sixtyPlus: number; total: number } {
  const today = new Date();
  const clientInvoices = invoices.filter(
    inv => inv.clientId === clientId && !inv.claimed
  );

  let current = 0;
  let thirtyDays = 0;
  let sixtyPlus = 0;

  clientInvoices.forEach(inv => {
    const balance = getInvoiceBalance(inv, payments);
    if (balance === 0) return; // Skip fully paid invoices

    const invoiceDate = new Date(inv.date + 'T00:00:00');
    const daysOld = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOld <= 30) {
      current += balance;
    } else if (daysOld <= 60) {
      thirtyDays += balance;
    } else {
      sixtyPlus += balance;
    }
  });

  return {
    current,
    thirtyDays,
    sixtyPlus,
    total: current + thirtyDays + sixtyPlus
  };
}

/**
 * Get all unpaid/partial invoices for a client, sorted by date (oldest first)
 */
export function getClientOutstandingInvoices(
  clientId: string,
  invoices: Invoice[],
  payments: Payment[]
): Array<Invoice & { balance: number }> {
  return invoices
    .filter(inv => inv.clientId === clientId && !inv.claimed)
    .map(inv => ({
      ...inv,
      balance: getInvoiceBalance(inv, payments)
    }))
    .filter(inv => inv.balance > 0)
    .sort((a, b) => a.date.localeCompare(b.date)); // Oldest first
}

/**
 * Format currency (South African Rand)
 */
export function formatCurrency(amount: number): string {
  return 'R' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
