// ============================================================
// Financial Calculations
// ============================================================

import type { Invoice, Payment } from '../types';

/**
 * Get total amount paid on an invoice
 */
export function getInvoiceAmountPaid(invoiceId: string, payments: Payment[]): number {
  return payments.reduce((sum, p) => {
    const allocation = p.allocations?.find(a => a.invoiceId === invoiceId);
    return sum + (allocation?.amount || 0);
  }, 0);
}

/**
 * Get outstanding balance for an invoice
 */
export function getInvoiceBalance(invoice: Invoice, payments: Payment[]): number {
  const total = invoice.total != null
    ? invoice.total
    : (invoice.items || []).reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);
  const paid = getInvoiceAmountPaid(invoice.id, payments);
  return total - paid;
}

/**
 * Get display status for an invoice (paid/partial/unpaid)
 */
export function getInvoiceDisplayStatus(invoice: Invoice, payments: Payment[]): 'paid' | 'partial' | 'unpaid' {
  if (invoice.status === 'paid') return 'paid';
  
  const balance = getInvoiceBalance(invoice, payments);
  if (balance <= 0) return 'paid';
  
  const total = invoice.total != null
    ? invoice.total
    : (invoice.items || []).reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);
  
  if (balance < total) return 'partial';
  return 'unpaid';
}

/**
 * Get client credit (unallocated payments)
 */
export function getClientCredit(clientId: string, payments: Payment[]): number {
  return payments
    .filter(p => p.clientId === clientId)
    .reduce((sum, p) => {
      const allocated = (p.allocations || []).reduce((s, a) => s + a.amount, 0);
      return sum + (p.amount - allocated);
    }, 0);
}

/**
 * Get client aging (total outstanding, excluding claimed invoices)
 */
export function getClientAging(clientId: string, invoices: Invoice[], payments: Payment[]): number {
  return invoices
    .filter(inv => inv.clientId === clientId && inv.status !== 'paid' && !inv.claimed)
    .reduce((sum, inv) => sum + getInvoiceBalance(inv, payments), 0);
}

/**
 * Calculate VAT from subtotal
 */
export function calculateVAT(subtotal: number, vatPercent: number): {
  exclusive: number;
  vatAmount: number;
} {
  if (vatPercent === 0) {
    return { exclusive: subtotal, vatAmount: 0 };
  }
  const exclusive = subtotal / (1 + vatPercent / 100);
  const vatAmount = subtotal - exclusive;
  return { exclusive, vatAmount };
}

/**
 * Calculate invoice total with discount
 */
export function calculateTotal(
  items: Array<{ qty: number; price: number }>,
  discountEnabled: boolean,
  discountPercent: number
): {
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
} {
  const subtotal = items.reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);
  const percent = Math.min(100, Math.max(0, parseFloat(String(discountPercent)) || 0));
  const discountAmount = discountEnabled ? subtotal * (percent / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  
  return { subtotal, discountAmount, afterDiscount };
}
