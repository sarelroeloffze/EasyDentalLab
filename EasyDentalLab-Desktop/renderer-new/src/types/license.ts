/**
 * License Key System - Type Definitions
 *
 * Ed25519 cryptographic license keys for trial/full access control
 */

export interface LicensePayload {
  email: string;           // Tester/customer email
  type: 'trial' | 'full';  // License type
  expires?: string;        // ISO date (optional, only for trials)
  app: string;            // "EasyDentalLab"
  version?: string;       // App version (optional)
}

export interface LicenseKey {
  payload: LicensePayload;
  signature: string;
  raw: string;            // Full key string (PAYLOAD.SIGNATURE)
}

export interface LicenseStatus {
  valid: boolean;         // Signature valid and not expired
  expired: boolean;       // Trial past expiry date
  daysRemaining?: number; // Days until expiry (trials only)
  payload?: LicensePayload;
  error?: string;         // Error message if validation failed
}
