/**
 * License Key System - Validator
 *
 * Ed25519 signature validation using WebCrypto API
 * Fully offline - no internet required
 */

import type { LicensePayload, LicenseStatus } from '../types/license';

const LICENSE_STORAGE_KEY = 'edl_license_key';

/**
 * Base64URL decode (URL-safe base64)
 */
function base64UrlDecode(str: string): Uint8Array {
  // Convert URL-safe base64 to regular base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + padding;

  // Decode base64 to binary string
  const binaryString = atob(base64Padded);

  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Import Ed25519 public key from base64
 */
async function importPublicKey(publicKeyB64: string): Promise<CryptoKey> {
  const keyData = base64UrlDecode(publicKeyB64);

  return await crypto.subtle.importKey(
    'raw',
    keyData.buffer as ArrayBuffer,
    {
      name: 'Ed25519',
      namedCurve: 'Ed25519'
    },
    false,
    ['verify']
  );
}

/**
 * Verify Ed25519 signature
 */
async function verifySignature(
  publicKey: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
): Promise<boolean> {
  try {
    return await crypto.subtle.verify(
      'Ed25519',
      publicKey,
      signature.buffer as ArrayBuffer,
      data.buffer as ArrayBuffer
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Check if license is expired
 */
function checkExpiry(payload: LicensePayload): { expired: boolean; daysRemaining?: number } {
  // Full licenses never expire
  if (payload.type === 'full' || !payload.expires) {
    return { expired: false };
  }

  const expiryDate = new Date(payload.expires);
  const now = new Date();

  // Check if expired
  if (now > expiryDate) {
    return { expired: true };
  }

  // Calculate days remaining
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / msPerDay);

  return { expired: false, daysRemaining };
}

/**
 * Validate license key
 */
export async function validateLicenseKey(
  key: string,
  publicKeyB64: string
): Promise<LicenseStatus> {
  try {
    // DEVELOPER MODE: Bypass license check if public key not configured
    if (publicKeyB64 === 'REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR') {
      return {
        valid: true,
        expired: false,
        payload: {
          email: 'developer@localhost',
          app: 'EasyDentalLab',
          type: 'full',
          issued: new Date().toISOString().slice(0, 10)
        }
      };
    }

    // Parse key format: PAYLOAD_B64URL.SIGNATURE_B64URL
    const parts = key.trim().split('.');
    if (parts.length !== 2) {
      return {
        valid: false,
        expired: false,
        error: 'Malformed license key. Expected format: PAYLOAD.SIGNATURE'
      };
    }

    const [payloadB64, signatureB64] = parts;

    // Decode payload
    let payload: LicensePayload;
    try {
      const payloadBytes = base64UrlDecode(payloadB64);
      const payloadJson = new TextDecoder().decode(payloadBytes);
      payload = JSON.parse(payloadJson);
    } catch (error) {
      return {
        valid: false,
        expired: false,
        error: 'Invalid payload encoding'
      };
    }

    // Validate payload fields
    if (!payload.email || !payload.type || !payload.app) {
      return {
        valid: false,
        expired: false,
        error: 'Missing required fields in license payload'
      };
    }

    if (payload.app !== 'EasyDentalLab') {
      return {
        valid: false,
        expired: false,
        error: 'License key is not for EasyDentalLab'
      };
    }

    // Import public key
    let publicKey: CryptoKey;
    try {
      publicKey = await importPublicKey(publicKeyB64);
    } catch (error) {
      return {
        valid: false,
        expired: false,
        error: 'Failed to import public key'
      };
    }

    // Verify signature
    const signatureBytes = base64UrlDecode(signatureB64);
    const payloadBytes = new TextEncoder().encode(payloadB64);

    const signatureValid = await verifySignature(publicKey, signatureBytes, payloadBytes);

    if (!signatureValid) {
      return {
        valid: false,
        expired: false,
        error: 'Invalid license signature. Key may be forged or corrupted.'
      };
    }

    // Check expiry
    const { expired, daysRemaining } = checkExpiry(payload);

    return {
      valid: true,
      expired,
      daysRemaining,
      payload,
      error: expired ? 'License has expired' : undefined
    };

  } catch (error) {
    console.error('License validation error:', error);
    return {
      valid: false,
      expired: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Save license key to localStorage
 */
export function saveLicenseKey(key: string): void {
  localStorage.setItem(LICENSE_STORAGE_KEY, key.trim());
}

/**
 * Get license key from localStorage
 */
export function getLicenseKey(): string | null {
  return localStorage.getItem(LICENSE_STORAGE_KEY);
}

/**
 * Clear license key from localStorage
 */
export function clearLicenseKey(): void {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
}

/**
 * Format expiry date for display
 */
export function formatExpiryDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get trial status message
 */
export function getTrialStatusMessage(daysRemaining: number): {
  message: string;
  severity: 'info' | 'warning' | 'critical';
} {
  if (daysRemaining <= 7) {
    return {
      message: `Trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}!`,
      severity: 'critical'
    };
  } else if (daysRemaining <= 14) {
    return {
      message: `Trial expires in ${daysRemaining} days`,
      severity: 'warning'
    };
  } else {
    return {
      message: `Trial: ${daysRemaining} days remaining`,
      severity: 'info'
    };
  }
}
