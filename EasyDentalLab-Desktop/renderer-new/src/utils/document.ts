// ============================================================
// Document Utilities - Print & PDF Generation
// ============================================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Invoice, Estimate, AppData, LineItem } from '../types';
import { fmt, fmtDate, escHtml, descForLang } from './helpers';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

type Document = Invoice | Estimate;
type DocumentType = 'invoice' | 'estimate';

/**
 * Build HTML for browser printing
 */
export const buildDocumentHTML = (doc: Document, data: AppData, type: DocumentType): string => {
  const client = data.clients.find(c => c.id === doc.clientId);
  const p = data.profile;
  const isInv = type === 'invoice';
  const title = isInv ? 'TAX INVOICE' : 'ESTIMATE';

  const items = [...(doc.items || [])].sort((a, b) => {
    const codeA = String(a.code || '').toLowerCase();
    const codeB = String(b.code || '').toLowerCase();
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });

  const subtotal = items.reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);
  const discountEnabled = doc.discountEnabled || false;
  const discountPercent = Math.min(100, Math.max(0, parseFloat(String(doc.discountPercent)) || 0));
  const discountAmount = discountEnabled ? subtotal * (discountPercent / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const vatRate = parseFloat(String(p.vatPercent)) || 0;
  const exclusive = vatRate > 0 ? afterDiscount / (1 + vatRate / 100) : afterDiscount;
  const vatAmount = afterDiscount - exclusive;

  const patientFull = [
    doc.patientSurname,
    doc.patientName ? doc.patientName + (doc.patientTitle ? ' [' + doc.patientTitle + ']' : '') : ''
  ].filter(Boolean).join(', ');
  const memberFull = doc.memberName || '';
  const bd = [p.bankName, p.bankAccount, p.bankBranch ? 'Branch ' + p.bankBranch : ''].filter(Boolean).join(', ');
  const L = p.layout;

  const getDesc = (item: LineItem) => {
    const tariff = data.tariffs.find(t => t.code === item.code);
    return tariff ? descForLang(tariff, doc.lang) : item.description;
  };

  const rows = items.map(i => `<tr>
    <td>${escHtml(i.tariffCode || i.code)}</td>
    <td>${escHtml(i.qty)}</td>
    <td>${escHtml(getDesc(i))}</td>
    <td style="text-align:right">R&nbsp;&nbsp;${parseFloat(String(i.price || 0)).toFixed(2)}</td>
    <td style="text-align:right">R&nbsp;&nbsp;${((parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0)).toFixed(2)}</td>
  </tr>`).join('');

  const emptyCount = Math.max(0, 18 - items.length);
  const emptyRows = Array(emptyCount).fill(`<tr>
    <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
  </tr>`).join('');

  const logoHtml = p.logo ? `<img src="${p.logo}" style="max-height:${L.logoSize || 60}px;max-width:200px;object-fit:contain"/>` : '';
  const headerAlign = L.logoPosition === 'left' ? 'flex-start' : L.logoPosition === 'center' ? 'center' : 'flex-end';

  const html = `<!DOCTYPE html><html><head><title>${title} #${doc.number}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; color: #000; font-size: ${L.fontSize || 11}px; line-height: 1.35; }
    @media screen {
      body { padding: 20px; background: #d0d0d0; }
      .page { background: white; width: 210mm; margin: 0 auto; padding: 12mm 14mm; box-shadow: 0 2px 20px rgba(0,0,0,0.2); min-height: 297mm; position: relative; }
    }
    @media print { .no-print { display: none !important; } .page { padding: 12mm 14mm; min-height: auto; } }
    table { border-collapse: collapse; }
    .c { padding: 3px 6px; border: 1px solid #000; font-size: ${L.fontSize || 11}px; vertical-align: top; }
    .ch { padding: 3px 6px; border: 1px solid #000; font-size: ${L.fontSize || 11}px; font-weight: bold; vertical-align: top; }
    .nb { padding: 2px 0; font-size: ${L.fontSize || 11}px; vertical-align: top; border: none; }
    .items-table { border: 1px solid #000; }
    .items-table th { padding: 3px 6px; font-size: ${L.fontSize || 11}px; font-weight: bold; vertical-align: top; border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000; }
    .items-table th:first-child { border-left: none; }
    .items-table th:last-child { border-right: none; }
    .items-table td { padding: 3px 6px; font-size: ${L.fontSize || 11}px; vertical-align: top; border: none; border-left: 1px solid #000; border-right: 1px solid #000; }
    .items-table td:first-child { border-left: none; }
    .items-table td:last-child { border-right: none; }
    .totals-table { border: 1px solid #000; width: 100%; }
    .totals-table td { padding: 3px 6px; font-size: ${L.fontSize || 11}px; vertical-align: top; border: none; }
  </style></head><body>
  <div class="page">
    ${logoHtml ? `<div style="display:flex;justify-content:${headerAlign};margin-bottom:6px">${logoHtml}</div>` : ''}
    <div style="text-align:right;margin-bottom:4px">
      <div style="font-size:22px;font-weight:bold">${escHtml(p.businessName || 'EasyDentalLab')}</div>
      <div style="font-size:16px;font-weight:bold;margin-top:1px">${title}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
      <div style="font-size:${L.fontSize || 11}px;line-height:1.4;max-width:55%">
        <div style="font-weight:normal;margin-bottom:1px">${escHtml(p.businessName || 'EasyDentalLab')}</div>
        ${p.address ? `<div style="white-space:pre-line">${escHtml(p.address)}</div>` : ''}
        ${p.phone ? `<div>Tel: ${escHtml(p.phone)}</div>` : ''}
        ${p.email ? `<div>${escHtml(p.email)}</div>` : ''}
      </div>
      <table style="font-size:${L.fontSize || 11}px">
        <tr><td class="c">Date</td><td class="c">${fmtDate(doc.date)}</td></tr>
        <tr><td class="c">${isInv ? 'Invoice' : 'Estimate'}</td><td class="c">${escHtml(doc.number)}</td></tr>
        ${p.vatNumber ? `<tr><td class="c">VAT registration</td><td class="c">${escHtml(p.vatNumber)}</td></tr>` : ''}
        ${p.labNumber ? `<tr><td class="c">Laboratory</td><td class="c">${escHtml(p.labNumber)}</td></tr>` : ''}
        ${!isInv && 'validUntil' in doc && doc.validUntil ? `<tr><td class="c">Valid until</td><td class="c">${fmtDate((doc as Estimate).validUntil || '')}</td></tr>` : ''}
        ${'estimateRef' in doc && doc.estimateRef ? `<tr><td class="c">Estimate ref</td><td class="c">#${escHtml((doc as Invoice).estimateRef || '')}</td></tr>` : ''}
        <tr><td class="c">Page</td><td class="c">1 of 1</td></tr>
        ${p.pcns ? `<tr><td class="c">Laboratory PCNS</td><td class="c">${escHtml(p.pcns)}</td></tr>` : ''}
      </table>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px">
      <div style="font-size:${L.fontSize || 11}px;line-height:1.4;max-width:55%">
        <div>Referring provider: <strong>${escHtml(client?.name || doc.clientName)}</strong>${client?.practice ? ' — ' + escHtml(client.practice) : ''}</div>
        ${client?.pcns ? `<div>Referring PCNS: ${escHtml(client.pcns)}</div>` : ''}
        ${client?.address ? `<div style="white-space:pre-line">${escHtml(client.address)}</div>` : ''}
        ${client?.phone ? `<div>Tel: ${escHtml(client.phone)}</div>` : ''}
        ${client?.email ? `<div>${escHtml(client.email)}</div>` : ''}
      </div>
      <table style="font-size:${L.fontSize || 11}px">
        <tr><th class="ch" colspan="2">Patient/member details</th></tr>
        <tr><td class="c">Medical fund</td><td class="c">${escHtml(doc.medicalAidName)}</td></tr>
        <tr><td class="c">Membership</td><td class="c">${escHtml(doc.medicalAidNumber)}</td></tr>
        <tr><td class="c">Main member</td><td class="c">${escHtml(memberFull)}</td></tr>
        <tr><td class="c">Patient</td><td class="c">${escHtml(patientFull)}</td></tr>
      </table>
    </div>
    ${bd ? `<div style="border:1px solid #000;padding:3px 6px;margin-bottom:3px;font-size:${L.fontSize || 11}px">Bank details: ${escHtml(bd)}</div>` : ''}
    <table class="items-table" style="width:100%;margin-bottom:3px">
      <thead><tr>
        <th style="width:12%">Code</th>
        <th style="width:8%">Qty</th>
        <th style="width:52%">Description</th>
        <th style="width:14%;text-align:right">Unit price</th>
        <th style="width:14%;text-align:right">Total</th>
      </tr></thead>
      <tbody>${rows}${emptyRows}</tbody>
    </table>
    ${doc.notes ? `<div style="border:1px solid #000;padding:3px 6px;margin-bottom:3px;font-size:${L.fontSize || 11}px"><strong>Notes:</strong> ${escHtml(doc.notes)}</div>` : ''}
    <table class="totals-table">
      <tr><td style="text-align:right;font-weight:bold">Subtotal:</td><td style="width:100px;text-align:right;font-weight:bold">${fmt(subtotal)}</td></tr>
      ${discountEnabled ? `<tr><td style="text-align:right;color:#dc2626">Discount (${discountPercent.toFixed(1)}%):</td><td style="text-align:right;color:#dc2626">- ${fmt(discountAmount)}</td></tr>` : ''}
      ${vatRate > 0 ? `<tr><td style="text-align:right;font-size:${(L.fontSize || 11) - 1}px;color:#666">VAT at ${vatRate}% included:</td><td style="text-align:right;font-size:${(L.fontSize || 11) - 1}px;color:#666">${fmt(vatAmount)}</td></tr>` : ''}
      <tr><td style="text-align:right;font-weight:bold;font-size:${(L.fontSize || 11) + 2}px;border-top:1px solid #000;padding-top:4px">${isInv ? 'Invoice' : 'Estimate'} total ${vatRate > 0 ? '(incl. VAT at ' + vatRate + '%)' : '(no VAT)'}:</td><td style="text-align:right;font-weight:bold;font-size:${(L.fontSize || 11) + 2}px;border-top:1px solid #000;padding-top:4px">${fmt(afterDiscount)}</td></tr>
    </table>
    ${L.footerMessage ? `<div style="margin-top:8px;font-size:${(L.fontSize || 11) - 1}px;color:#666">${escHtml(L.footerMessage)}</div>` : ''}
    ${L.confirmationMessage ? `<div style="margin-top:8px;font-size:${(L.fontSize || 11) - 1}px;font-style:italic">${escHtml(L.confirmationMessage)}</div>` : ''}
  </div>
  <div class="no-print" style="text-align:center;margin:20px">
    <button onclick="window.print()" style="padding:12px 24px;font-size:16px;cursor:pointer;background:#2563eb;color:white;border:none;border-radius:6px">Print ${title}</button>
    <button onclick="window.close()" style="padding:12px 24px;font-size:16px;cursor:pointer;background:#6b7280;color:white;border:none;border-radius:6px;margin-left:8px">Close</button>
  </div>
  </body></html>`;

  return html;
};

/**
 * Print document in browser
 */
export const printDocument = (doc: Document, data: AppData, type: DocumentType): void => {
  const html = buildDocumentHTML(doc, data, type);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Please allow popups to print documents.');
  }
};

/**
 * Build PDF blob using jsPDF
 */
export const buildPDFBlob = async (doc: Document, data: AppData, type: DocumentType): Promise<Blob> => {
  const client = data.clients.find(c => c.id === doc.clientId);
  const p = data.profile;
  const isInv = type === 'invoice';
  const titleLabel = isInv ? 'TAX INVOICE' : 'ESTIMATE';

  const items = [...(doc.items || [])].sort((a, b) => {
    const codeA = String(a.code || '').toLowerCase();
    const codeB = String(b.code || '').toLowerCase();
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });

  const subtotal = items.reduce((s, i) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0);
  const discountEnabled = doc.discountEnabled || false;
  const discountPercent = Math.min(100, Math.max(0, parseFloat(String(doc.discountPercent)) || 0));
  const discountAmount = discountEnabled ? subtotal * (discountPercent / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const vatRate = parseFloat(String(p.vatPercent)) || 0;
  const exclusive = vatRate > 0 ? afterDiscount / (1 + vatRate / 100) : afterDiscount;
  const vatAmount = afterDiscount - exclusive;
  const L = p.layout;

  const patientFull = [
    doc.patientSurname,
    doc.patientName ? doc.patientName + (doc.patientTitle ? ' [' + doc.patientTitle + ']' : '') : ''
  ].filter(Boolean).join(', ');
  const memberFull = doc.memberName || '';
  const bd = [p.bankName, p.bankAccount, p.bankBranch ? 'Branch ' + p.bankBranch : ''].filter(Boolean).join(', ');

  const getDesc = (item: LineItem) => {
    const tariff = data.tariffs.find(t => t.code === item.code);
    return tariff ? descForLang(tariff, doc.lang) : item.description;
  };

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const ml = 14, mr = 14, pw = 210;
  const cw = pw - ml - mr;
  const fs = 9;
  const lh = 4;
  let y = 12;

  // Logo
  if (p.logo) {
    try {
      const logoMaxH = Math.min((L.logoSize || 60) * 0.265, 16);
      const logoW = 50;
      const logoAlign = L.logoPosition || 'right';
      let lx = ml;
      if (logoAlign === 'right') lx = pw - mr - logoW;
      else if (logoAlign === 'center') lx = (pw - logoW) / 2;
      pdf.addImage(p.logo, 'AUTO', lx, y, logoW, logoMaxH);
      y += logoMaxH + 2;
    } catch (e) {
      console.warn('Logo add failed:', e);
    }
  }

  // Business name + doc type (right aligned)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(p.businessName || 'EasyDentalLab', pw - mr, y, { align: 'right' });
  y += 6;
  pdf.setFontSize(13);
  pdf.text(titleLabel, pw - mr, y, { align: 'right' });
  y += 6;

  // ROW 1: Business info (left) + Doc info table (right)
  const row1Y = y;
  let ly = y;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(fs);
  pdf.text(p.businessName || 'EasyDentalLab', ml, ly); ly += lh;
  if (p.address) {
    p.address.split('\n').forEach(line => { pdf.text(line.trim(), ml, ly); ly += lh; });
  }
  if (p.phone) { pdf.text('Tel: ' + p.phone, ml, ly); ly += lh; }
  if (p.email) { pdf.text(p.email, ml, ly); ly += lh; }

  // Right side: doc info table
  const infoRows: any[] = [];
  infoRows.push(['Date', fmtDate(doc.date)]);
  infoRows.push([isInv ? 'Invoice' : 'Estimate', String(doc.number)]);
  if (p.vatNumber) infoRows.push(['VAT registration', p.vatNumber]);
  if (p.labNumber) infoRows.push(['Laboratory', p.labNumber]);
  if (!isInv && 'validUntil' in doc && doc.validUntil) infoRows.push(['Valid until', fmtDate((doc as Estimate).validUntil || '')]);
  if ('estimateRef' in doc && doc.estimateRef) infoRows.push(['Estimate ref', '#' + (doc as Invoice).estimateRef]);
  infoRows.push(['Page', '1 of 1']);
  if (p.pcns) infoRows.push(['Laboratory PCNS', p.pcns]);

  const infoTblX = pw - mr - 78;
  pdf.autoTable({
    startY: row1Y - 3,
    margin: { left: infoTblX },
    tableWidth: 78,
    body: infoRows,
    theme: 'grid',
    styles: { fontSize: fs, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], font: 'helvetica' },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 43 } },
  });
  y = Math.max(ly, pdf.lastAutoTable.finalY) + 3;

  // ROW 2: Referring provider (left) + Patient/member (right)
  const row2Y = y;
  ly = y;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(fs);
  const rpLabel = 'Referring provider: ';
  pdf.text(rpLabel, ml, ly);
  const rpLabelW = pdf.getTextWidth(rpLabel);
  pdf.setFont('helvetica', 'bold');
  const refName = client?.name || doc.clientName || '';
  pdf.text(refName, ml + rpLabelW, ly);
  pdf.setFont('helvetica', 'normal');
  if (client?.practice) {
    const afterName = ml + rpLabelW + pdf.getTextWidth(refName);
    pdf.text(' — ' + client.practice, afterName, ly);
  }
  ly += lh;
  if (client?.pcns) { pdf.text('Referring PCNS: ' + client.pcns, ml, ly); ly += lh; }
  if (client?.address) {
    client.address.split('\n').forEach(line => { pdf.text(line.trim(), ml, ly); ly += lh; });
  }
  if (client?.phone) { pdf.text('Tel: ' + client.phone, ml, ly); ly += lh; }
  if (client?.email) { pdf.text(client.email, ml, ly); ly += lh; }

  // Right: patient/member table
  const pmW = 100;
  const pmX = pw - mr - pmW;
  pdf.autoTable({
    startY: row2Y - 5,
    margin: { left: pmX },
    tableWidth: pmW,
    body: [
      [{ content: 'Patient/member details', colSpan: 2, styles: { fontStyle: 'bold' } }],
      ['Medical fund', doc.medicalAidName || ''],
      ['Membership', doc.medicalAidNumber || ''],
      ['Main member', memberFull],
      ['Patient', patientFull],
    ],
    theme: 'grid',
    styles: { fontSize: fs, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], font: 'helvetica' },
    columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: pmW - 28 } },
  });
  y = Math.max(ly, pdf.lastAutoTable.finalY) + 2;

  // Bank details
  if (bd) {
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.2);
    pdf.rect(ml, y, cw, 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fs);
    pdf.text('Bank details: ' + bd, ml + 2, y + 3.2);
    y += 7;
  }

  // Items table
  const itemRows = items.map(i => [
    i.tariffCode || i.code,
    String(i.qty),
    getDesc(i),
    'R  ' + parseFloat(String(i.price || 0)).toFixed(2),
    'R  ' + ((parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0)).toFixed(2)
  ]);

  pdf.autoTable({
    startY: y,
    margin: { left: ml, right: mr },
    head: [['Code', 'Qty', 'Description', 'Unit price', 'Total']],
    body: itemRows,
    theme: 'grid',
    styles: { fontSize: fs, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], font: 'helvetica' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 22, halign: 'left' },
      1: { cellWidth: 15, halign: 'left' },
      2: { cellWidth: 95, halign: 'left' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' }
    },
  });
  y = pdf.lastAutoTable.finalY + 2;

  // Notes
  if (doc.notes) {
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.2);
    const notesLines = pdf.splitTextToSize('Notes: ' + doc.notes, cw - 4);
    const notesH = notesLines.length * lh + 2;
    pdf.rect(ml, y, cw, notesH);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fs);
    pdf.text(notesLines, ml + 2, y + 3.5);
    y += notesH + 2;
  }

  // Totals table
  const totalsRows: any[] = [];
  totalsRows.push([{ content: 'Subtotal:', styles: { halign: 'right', fontStyle: 'bold' } }, { content: fmt(subtotal), styles: { halign: 'right', fontStyle: 'bold' } }]);
  if (discountEnabled) {
    totalsRows.push([
      { content: `Discount (${discountPercent.toFixed(1)}%):`, styles: { halign: 'right', textColor: [220, 38, 38] } },
      { content: '- ' + fmt(discountAmount), styles: { halign: 'right', textColor: [220, 38, 38] } }
    ]);
  }
  if (vatRate > 0) {
    totalsRows.push([
      { content: `VAT at ${vatRate}% included:`, styles: { halign: 'right', fontSize: fs - 1, textColor: [102, 102, 102] } },
      { content: fmt(vatAmount), styles: { halign: 'right', fontSize: fs - 1, textColor: [102, 102, 102] } }
    ]);
  }
  totalsRows.push([
    { content: `${isInv ? 'Invoice' : 'Estimate'} total ${vatRate > 0 ? '(incl. VAT at ' + vatRate + '%)' : '(no VAT)'}:`, styles: { halign: 'right', fontStyle: 'bold', fontSize: fs + 2 } },
    { content: fmt(afterDiscount), styles: { halign: 'right', fontStyle: 'bold', fontSize: fs + 2 } }
  ]);

  pdf.autoTable({
    startY: y,
    margin: { left: ml, right: mr },
    body: totalsRows,
    theme: 'grid',
    styles: { fontSize: fs, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.2, textColor: [0, 0, 0], font: 'helvetica' },
    columnStyles: { 0: { cellWidth: cw - 40 }, 1: { cellWidth: 40 } },
  });
  y = pdf.lastAutoTable.finalY + 2;

  // Footer messages
  if (L.footerMessage) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fs - 1);
    pdf.setTextColor(102, 102, 102);
    const footerLines = pdf.splitTextToSize(L.footerMessage, cw);
    pdf.text(footerLines, ml, y);
    y += footerLines.length * lh;
  }
  if (L.confirmationMessage) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(fs - 1);
    pdf.setTextColor(0, 0, 0);
    const confLines = pdf.splitTextToSize(L.confirmationMessage, cw);
    pdf.text(confLines, ml, y);
  }

  return pdf.output('blob');
};

/**
 * Save PDF document (download)
 */
export const savePDFDocument = async (doc: Document, data: AppData, type: DocumentType): Promise<void> => {
  const isInv = type === 'invoice';
  const fileLabel = isInv ? 'Invoice' : 'Estimate';
  const filename = `${fileLabel}_${doc.number}.pdf`;
  try {
    const pdfBlob = await buildPDFBlob(doc, data, type);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfBlob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch (e) {
    console.error('Save PDF failed:', e);
    alert('Could not generate PDF: ' + (e as Error).message);
  }
};

/**
 * WhatsApp document - generates PDF and opens WhatsApp
 */
export const whatsappDocument = async (doc: Document, data: AppData, type: DocumentType): Promise<void> => {
  const client = data.clients.find(c => c.id === doc.clientId);
  const p = data.profile;
  const isInv = type === 'invoice';
  const fileLabel = isInv ? 'Invoice' : 'Estimate';
  const filename = `${fileLabel}_${doc.number}.pdf`;

  try {
    const pdfBlob = await buildPDFBlob(doc, data, type);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfBlob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);

    let phone = (client?.phone || '').replace(/[^0-9+]/g, '');
    if (phone.startsWith('0') && !phone.startsWith('00')) phone = '27' + phone.slice(1);
    else if (phone.startsWith('+')) phone = phone.slice(1);

    const waMsg = `${p.businessName || 'EasyDentalLab'} — ${fileLabel} #${doc.number}\n\nPlease see attached PDF.`;
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    setTimeout(() => {
      if (window.electronAPI) {
        window.electronAPI.openExternal(waUrl);
      } else {
        window.open(waUrl, '_blank');
      }
    }, 500);
  } catch (e) {
    console.error('WhatsApp PDF failed:', e);
    alert('Could not generate PDF: ' + (e as Error).message + '\nOpening for printing instead.');
    printDocument(doc, data, type);
  }
};
