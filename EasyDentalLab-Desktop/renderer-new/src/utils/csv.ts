// ============================================================
// CSV Parsing and Generation
// ============================================================

import type { Client, Tariff, Macro, Payment, MedicalAid, Invoice } from '../types';

/**
 * Parse Client CSV
 * Format: Name,Practice,Email,Phone,WhatsApp,Address,Webpage,Notes,ReferringPCNS
 */
export function parseClientCSV(csv: string): Client[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const clients: Client[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row: string[] = [];
    let field = '', inQuote = false;
    for (let c = 0; c < lines[i].length; c++) {
      const ch = lines[i][c];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { row.push(field.trim()); field = ''; }
      else { field += ch; }
    }
    row.push(field.trim());

    if (row.length >= 1 && row[0]) {
      clients.push({
        id: 'csv_c_' + i,
        name: row[0] || '',
        practice: row[1] || '',
        email: row[2] || '',
        phone: row[3] || '',
        whatsapp: row[4] || '',
        address: row[5] || '',
        webpage: row[6] || '',
        notes: row[7] || '',
        pcns: row[8] || '',
        city: '',
        postalCode: ''
      });
    }
  }
  return clients;
}

/**
 * Parse Tariff CSV
 */
export function parseTariffCSV(csv: string): Tariff[] {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const rows = lines.slice(1); // skip header
  return rows.map(row => {
    const parts = row.split(',').map(s => s.trim());
    const [id, code, tariffCode, description, descriptionAFR, price, category, measure] = parts;
    return {
      id,
      code,
      tariffCode: tariffCode || code,
      description,
      descriptionAFR,
      price: parseFloat(price) || 0,
      category,
      measure
    };
  });
}

/**
 * Parse Macro CSV
 */
export function parseMacroCSV(csv: string): Macro[] {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const macros: Macro[] = [];
  const rows = lines.slice(1); // skip header
  
  rows.forEach(row => {
    const [id, name, codesJSON] = row.split(',').map(s => s.trim());
    try {
      const codes = JSON.parse(codesJSON);
      macros.push({ id, name, codes });
    } catch (e) {
      console.warn('Failed to parse macro codes:', codesJSON);
    }
  });
  
  return macros;
}

/**
 * Parse MedicalAids CSV
 */
export function parseMedicalAidsCSV(csv: string): MedicalAid[] {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const rows = lines.slice(1); // skip header
  return rows.map(row => {
    const [name] = row.split(',').map(s => s.trim());
    return { name };
  });
}

/**
 * Build Clients CSV
 * Format: Name,Practice,Email,Phone,WhatsApp,Address,Webpage,Notes,ReferringPCNS
 */
export function buildClientsCSV(clients: Client[]): string {
  const esc = (s: string | undefined) => '"' + (s || '').replace(/"/g, '""') + '"';
  let csv = "Name,Practice,Email,Phone,WhatsApp,Address,Webpage,Notes,ReferringPCNS\n";
  clients.filter(c => !c.archived).forEach(c => {
    csv += [
      esc(c.name),
      esc(c.practice),
      esc(c.email),
      esc(c.phone),
      esc(c.whatsapp),
      esc(c.address),
      esc(c.webpage),
      esc(c.notes),
      esc(c.pcns)
    ].join(',') + '\n';
  });
  return csv;
}

/**
 * Build Tariffs CSV
 */
export function buildTariffsCSV(tariffs: Tariff[]): string {
  const header = 'ID,UserCode,TariffCode,Description,DescriptionAFR,Price,Category,Measure';
  const rows = tariffs.map(t => 
    `${t.id},${t.code},${t.tariffCode || t.code},${t.description},${t.descriptionAFR},${t.price},${t.category},${t.measure}`
  );
  return [header, ...rows].join('\n');
}

/**
 * Build Macros CSV
 */
export function buildMacrosCSV(macros: Macro[]): string {
  const header = 'ID,Name,Codes';
  const rows = macros.map(m => 
    `${m.id},${m.name},"${JSON.stringify(m.codes).replace(/"/g, '""')}"`
  );
  return [header, ...rows].join('\n');
}

/**
 * Build Payments CSV
 */
export function buildPaymentsCSV(payments: Payment[], invoices: Invoice[]): string {
  const header = 'PaymentID,PaymentDate,ClientID,ClientName,Amount,Reference,Method,Unallocated,InvoiceID,InvoiceNumber,InvoiceDate,Patient,Allocated';
  const rows: string[] = [];
  
  payments.forEach(p => {
    const allocated = (p.allocations || []).reduce((s, a) => s + a.amount, 0);
    const unallocated = p.amount - allocated;
    
    if ((p.allocations || []).length === 0) {
      // Unallocated payment
      rows.push(`${p.id},${p.date},${p.clientId},${p.clientName},${p.amount},${p.reference},${p.method},${unallocated},,,,, `);
    } else {
      // One row per allocation
      p.allocations.forEach(alloc => {
        const inv = invoices.find(i => i.id === alloc.invoiceId);
        const patient = inv ? `${inv.patientSurname} ${inv.patientName}`.trim() : '';
        rows.push(
          `${p.id},${p.date},${p.clientId},${p.clientName},${p.amount},${p.reference},${p.method},${unallocated},` +
          `${alloc.invoiceId},${inv?.number || ''},${inv?.date || ''},${patient},${alloc.amount}`
        );
      });
    }
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Build MedicalAids CSV
 */
export function buildMedicalAidsCSV(medicalAids: MedicalAid[]): string {
  const header = 'Name';
  const rows = medicalAids.map(m => m.name);
  return [header, ...rows].join('\n');
}
