// ============================================================
// Formatting Utilities
// ============================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escHtml(s: string | number | null | undefined): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generate a unique ID
 */
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Format currency (ZAR)
 */
export function fmt(n: number | string | null | undefined): string {
  const num = typeof n === 'string' ? parseFloat(n) : (n || 0);
  return 'R ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Format date as YYYY-MM-DD
 */
export function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function today(): string {
  return fmtDate(new Date());
}

/**
 * Format phone number for WhatsApp (SA numbers)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  let p = (phone || '').replace(/\D/g, '');
  // SA numbers starting with 0 (but not 00): 0xx → 27xx
  if (p.startsWith('0') && !p.startsWith('00')) {
    p = '27' + p.substring(1);
  }
  // Strip + prefix from international numbers
  if (p.startsWith('+')) {
    p = p.substring(1);
  }
  return p;
}
