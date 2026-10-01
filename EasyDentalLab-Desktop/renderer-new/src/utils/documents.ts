import type { AppData, Client, Payment } from '../types';
import { fmtDate } from './helpers';
import { getClientAging, getInvoiceBalance, formatCurrency } from './payments';

/**
 * Print a document in a new window
 */
export function printDoc(html: string) {
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.print();
    }, 500);
  }
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsApp(phone: string, message: string) {
  const num = phone.replace(/\D/g, '');
  const formatted = num.startsWith('0') && !num.startsWith('00') ? '27' + num.slice(1) : num;
  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;

  if (window.electronAPI) {
    window.electronAPI.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
}

/**
 * Build statement HTML for browser print
 */
export function buildStatementHTML(clientId: string, data: AppData): string {
  const client = data.clients.find(c => c.id === clientId);
  if (!client) return '';

  const profile = data.profile;
  const layout = { ...profile.layout };
  const aging = getClientAging(clientId, data.invoices, data.payments || []);

  const invoices = data.invoices
    .filter(inv => inv.clientId === clientId && !inv.claimed)
    .map(inv => ({
      ...inv,
      balance: getInvoiceBalance(inv, data.payments || [])
    }))
    .filter(inv => inv.balance > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const today = new Date();
  const statementDate = fmtDate(today.toISOString().split('T')[0]);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Statement - ${client.name}</title>
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20mm; font-size: ${layout.bodyFontSize || 11}pt; }
    h1 { font-size: 18pt; margin-bottom: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    th, td { padding: 6pt; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; font-weight: bold; }
    .right { text-align: right; }
    .total-row { font-weight: bold; background: #f9f9f9; }
  </style>
</head>
<body>
  <h1>ACCOUNT STATEMENT</h1>
  <p><strong>${profile.businessName}</strong></p>
  <p>${profile.address}</p>
  <p>Tel: ${profile.phone} | Email: ${profile.email}</p>
  <p style="margin-top: 10pt;"><strong>Statement Date:</strong> ${statementDate}</p>
  <p><strong>Account:</strong> ${client.name}${client.practice ? ' — ' + client.practice : ''}</p>

  <table style="margin-top: 15pt;">
    <thead>
      <tr>
        <th>Invoice #</th>
        <th>Date</th>
        <th>Patient</th>
        <th class="right">Amount</th>
        <th class="right">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${invoices.map(inv => `
        <tr>
          <td>${inv.number}</td>
          <td>${fmtDate(inv.date)}</td>
          <td>${[inv.patientSurname, inv.patientName].filter(Boolean).join(', ') || '—'}</td>
          <td class="right">${formatCurrency(inv.total || 0)}</td>
          <td class="right">${formatCurrency(inv.balance)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <table style="margin-top: 15pt; width: 50%; margin-left: auto;">
    <tr><td><strong>Current (0-30 days):</strong></td><td class="right">${formatCurrency(aging.current)}</td></tr>
    <tr><td><strong>30-60 days:</strong></td><td class="right">${formatCurrency(aging.thirtyDays)}</td></tr>
    <tr><td><strong>Over 60 days:</strong></td><td class="right">${formatCurrency(aging.sixtyPlus)}</td></tr>
    <tr class="total-row"><td><strong>Total Outstanding:</strong></td><td class="right">${formatCurrency(aging.total)}</td></tr>
  </table>
</body>
</html>`;
}

/**
 * Print statement
 */
export function printStatement(clientId: string, data: AppData) {
  const html = buildStatementHTML(clientId, data);
  printDoc(html);
}

/**
 * WhatsApp statement (generates PDF and opens WhatsApp)
 */
export async function whatsappStatement(client: Client, _data: AppData) {
  // For now, we'll use the simpler approach of just opening WhatsApp with a message
  // The actual PDF generation would require jsPDF which we'll add later
  const message = `Statement for ${client.name}\n\nPlease find your account statement attached.`;
  const phone = client.whatsapp || client.phone;
  if (phone) {
    openWhatsApp(phone, message);
  } else {
    alert('No phone/WhatsApp number on file for this client.');
  }
}

/**
 * Build receipt HTML for browser print
 */
export function buildReceiptHTML(payment: Payment, _client: Client, data: AppData): string {
  const profile = data.profile;
  const layout = { ...profile.layout };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${payment.reference}</title>
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20mm; font-size: ${layout.bodyFontSize || 11}pt; }
    h1 { font-size: 18pt; margin-bottom: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    th, td { padding: 6pt; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; font-weight: bold; }
    .right { text-align: right; }
    .total-row { font-weight: bold; background: #f9f9f9; }
  </style>
</head>
<body>
  <h1>PAYMENT RECEIPT</h1>
  <p><strong>${profile.businessName}</strong></p>
  <p>${profile.address}</p>
  <p>Tel: ${profile.phone} | Email: ${profile.email}</p>

  <p style="margin-top: 15pt;"><strong>Receipt Date:</strong> ${fmtDate(payment.date)}</p>
  <p><strong>Received From:</strong> ${payment.clientName}</p>
  <p><strong>Amount Received:</strong> ${formatCurrency(payment.amount)}</p>
  <p><strong>Payment Method:</strong> ${payment.method.toUpperCase()}</p>
  <p><strong>Reference:</strong> ${payment.reference || '—'}</p>

  ${payment.allocations && payment.allocations.length > 0 ? `
    <table style="margin-top: 15pt;">
      <thead>
        <tr>
          <th>Invoice #</th>
          <th class="right">Amount Applied</th>
        </tr>
      </thead>
      <tbody>
        ${payment.allocations.map(alloc => `
          <tr>
            <td>${data.invoices.find(inv => inv.id === alloc.invoiceId)?.number || '—'}</td>
            <td class="right">${formatCurrency(alloc.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  <table style="margin-top: 15pt; width: 50%; margin-left: auto;">
    <tr class="total-row">
      <td><strong>Total Received:</strong></td>
      <td class="right">${formatCurrency(payment.amount)}</td>
    </tr>
  </table>

  <p style="margin-top: 20pt; text-align: center; font-size: 10pt; color: #666;">
    Thank you for your payment
  </p>
</body>
</html>`;
}

/**
 * Print receipt
 */
export function printReceipt(payment: Payment, client: Client, data: AppData) {
  const html = buildReceiptHTML(payment, client, data);
  printDoc(html);
}

/**
 * WhatsApp receipt (generates PDF and opens WhatsApp)
 */
export async function whatsappReceipt(payment: Payment, client: Client, _data: AppData) {
  const message = `Payment Receipt\n\nAmount: ${formatCurrency(payment.amount)}\nDate: ${fmtDate(payment.date)}\nReference: ${payment.reference || '—'}\n\nThank you for your payment.`;
  const phone = client.whatsapp || client.phone;
  if (phone) {
    openWhatsApp(phone, message);
  } else {
    alert('No phone/WhatsApp number on file for this client.');
  }
}
