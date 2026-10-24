// ============================================================
// Pricing Utilities
// ============================================================

import type { AppData } from '../types';

/**
 * Get the price for a tariff code based on pricing mode and selected medical aid
 *
 * @param code - The tariff code
 * @param medicalAid - The selected medical aid (e.g., "Discovery Health - Executive")
 * @param data - The app data
 * @returns The price to use for this tariff
 */
export function getTariffPrice(
  code: string,
  medicalAid: string | undefined,
  data: AppData
): number {
  // Find the tariff
  const tariff = data.tariffs.find(t => t.code === code);
  if (!tariff) {
    console.warn(`Tariff code ${code} not found`);
    return 0;
  }

  // If pricing mode is single or no medical aid selected, use standard price
  const pricingMode = data.profile.pricingMode || 'single';
  if (pricingMode === 'single' || !medicalAid) {
    return tariff.price;
  }

  // Per-aid pricing: look for custom rate
  const customRate = data.medicalAidTariffs.find(
    mat => mat.medicalAid === medicalAid && mat.code === code
  );

  // Return custom rate if exists, otherwise fall back to standard price
  return customRate?.price ?? tariff.price;
}

/**
 * Get prices for multiple tariff codes at once
 *
 * @param codes - Array of tariff codes
 * @param medicalAid - The selected medical aid
 * @param data - The app data
 * @returns Map of code to price
 */
export function getTariffPrices(
  codes: string[],
  medicalAid: string | undefined,
  data: AppData
): Map<string, number> {
  const prices = new Map<string, number>();

  codes.forEach(code => {
    prices.set(code, getTariffPrice(code, medicalAid, data));
  });

  return prices;
}

/**
 * Check if a medical aid has any custom rates defined
 *
 * @param medicalAid - The medical aid to check
 * @param data - The app data
 * @returns true if custom rates exist
 */
export function hasCustomRates(
  medicalAid: string,
  data: AppData
): boolean {
  return data.medicalAidTariffs.some(mat => mat.medicalAid === medicalAid);
}

/**
 * Get the count of custom rates for a medical aid
 *
 * @param medicalAid - The medical aid to check
 * @param data - The app data
 * @returns Count of custom rates
 */
export function getCustomRatesCount(
  medicalAid: string,
  data: AppData
): number {
  return data.medicalAidTariffs.filter(mat => mat.medicalAid === medicalAid).length;
}
