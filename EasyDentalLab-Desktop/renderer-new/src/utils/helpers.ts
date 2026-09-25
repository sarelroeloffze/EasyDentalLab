// ============================================================
// Helper Functions
// ============================================================

import type { Tariff } from '../types';

/**
 * Generate a random ID
 */
export const genId = (): string => {
  return Math.random().toString(36).slice(2, 11);
};

/**
 * Format currency (South African Rand)
 */
export const fmt = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'R 0.00';
  return 'R ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Format date for display (YYYY-MM-DD → DD/MM/YYYY)
 */
export const fmtDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const today = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get description for tariff in specified language
 */
export const descForLang = (tariff: Tariff, lang: 'en' | 'af'): string => {
  if (lang === 'af' && tariff.descriptionAFR) {
    return tariff.descriptionAFR;
  }
  return tariff.description || tariff.code || '';
};

/**
 * Escape HTML special characters to prevent XSS
 */
export const escHtml = (str: string | number | null | undefined): string => {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
