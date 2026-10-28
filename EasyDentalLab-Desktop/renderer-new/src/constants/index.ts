// ============================================================
// Price List Update Constants
// ============================================================

/**
 * GitHub repository URL for official price lists
 * Users can also manually download from this repo
 */
export const PRICE_LISTS_REPO_URL = 'https://raw.githubusercontent.com/sarelroeloffze/EasyDentalLab-PriceLists/main';

/**
 * Current embedded tariffs version
 * Should match the version in the embedded Tariffs CSV
 */
export const TARIFFS_VERSION = '2027.1';

/**
 * Current embedded medical aids version
 * Should match the version in the embedded MedicalAids CSV
 */
export const MEDICAL_AIDS_VERSION = '2027.1';

/**
 * Current medical aid tariffs version
 * Tracks the version of per-medical-aid pricing data
 */
export const MEDICAL_AID_TARIFFS_VERSION = '2027.1';

/**
 * Local storage keys for tracking last update check
 */
export const LAST_UPDATE_CHECK_KEY = 'edl_last_update_check';
export const PRICE_UPDATE_DISMISSED_KEY = 'edl_price_update_dismissed';

/**
 * Update check interval (24 hours in milliseconds)
 */
export const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

// Re-export from initialData
export { APP_VERSION, STORAGE_KEY, DARK_MODE_KEY, INITIAL_DATA } from './initialData';
