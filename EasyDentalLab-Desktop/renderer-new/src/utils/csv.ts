// ============================================================
// CSV Parsing and Generation
// ============================================================

import type { Client, Tariff, Macro, Payment, MedicalAid, Invoice } from '../types';

/**
 * Parse Client CSV
 */
export function parseClientCSV(csv: string): Client[] {
  const lines = csv.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const rows = lines.slice(1); // skip header
  return rows.map(row => {
    const [id, name, practice, phone, email, pcns, address, city, postalCode] = row.split(',').map(s => s.trim());
    return { id, name, practice, phone, email, pcns, address, city, postalCode };
  });
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
 */
export function buildClientsCSV(clients: Client[]): string {
  const header = 'ID,Name,Practice,Phone,Email,PCNS,Address,City,PostalCode';
  const rows = clients.map(c => 
    `${c.id},${c.name},${c.practice},${c.phone},${c.email},${c.pcns},${c.address},${c.city},${c.postalCode}`
  );
  return [header, ...rows].join('\n');
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
