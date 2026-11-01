/**
 * License Key System - Constants
 *
 * IMPORTANT: LICENSE_PUBLIC_KEY_B64 must be replaced with actual public key
 * Generated via license/keyGenerator.html
 *
 * NEVER commit the private key to the repository!
 */

// TODO: Replace with actual public key from keyGenerator.html
// This placeholder will accept NO keys (validation will fail)
export const LICENSE_PUBLIC_KEY_B64 = 'REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR';

// LocalStorage key for license storage
export const LICENSE_STORAGE_KEY = 'edl_license_key';

// App identifier (must match license payload)
export const APP_NAME = 'EasyDentalLab';

// Support contact
export const SUPPORT_EMAIL = 'sarel@roeloffze.com';

// Trial banner display thresholds (days remaining)
export const TRIAL_WARNING_DAYS = 30;   // Show banner when ≤ 30 days
export const TRIAL_URGENT_DAYS = 14;    // Orange warning at ≤ 14 days
export const TRIAL_CRITICAL_DAYS = 7;   // Red critical at ≤ 7 days
