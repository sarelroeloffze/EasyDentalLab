/**
 * EasyDentalLab — License Validator
 * Ed25519 asymmetric signature-based license verification.
 *
 * Works in:
 *   • Plain HTML (file:// or http://)  — window.LicenseValidator
 *   • Vite / React / bundler           — import LicenseValidator from './licenseValidator.js'
 *   • Node.js 18+                      — require('./licenseValidator.js')
 *
 * STEP 1: Open keyGenerator.html in your browser to generate a key pair.
 * STEP 2: Copy the PUBLIC KEY shown there and paste it into PUBLIC_KEY_B64 below.
 * STEP 3: Ship licenseValidator.js with your app. Keep the private key safe — never here.
 */

// ─── Developer configuration ──────────────────────────────────────────────────

/**
 * Ed25519 public key — raw bytes, standard base64 (not base64url).
 * Generate this once with keyGenerator.html. Safe to ship — cannot derive private key.
 * Replace the placeholder below with your actual key.
 */
const PUBLIC_KEY_B64 = "REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR";

/**
 * Optional remote revocation endpoint.
 * POST { key: "<license string>" } → responds { valid: bool, reason: string }
 * If the server is unreachable the validator falls back to offline checks silently.
 * Set ONLINE_CHECK_ENABLED = false to skip entirely (e.g. purely local/offline apps).
 */
const VALIDATION_URL   = "https://your-endpoint.com/api/validate";
const ONLINE_CHECK_ENABLED = false;

/** localStorage key where the saved license string is stored. */
const STORAGE_KEY = "edl_license_key";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _b64ToBytes(b64) {
  const binary = atob(b64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function _b64urlToBytes(b64url) {
  // base64url → standard base64 → bytes
  return _b64ToBytes(b64url.replace(/-/g, "+").replace(/_/g, "/"));
}

function _payloadB64urlToJson(b64url) {
  try {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

// ─── LicenseValidator ─────────────────────────────────────────────────────────

const LicenseValidator = {
  _cachedKey: null,

  /**
   * Import and cache the Ed25519 public key from the hardcoded base64 constant.
   * @returns {Promise<CryptoKey>}
   */
  async _publicKey() {
    if (this._cachedKey) return this._cachedKey;
    if (PUBLIC_KEY_B64 === "REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR") {
      throw new Error("Public key not configured. Run keyGenerator.html first.");
    }
    const raw = _b64ToBytes(PUBLIC_KEY_B64);
    this._cachedKey = await crypto.subtle.importKey(
      "raw", raw, { name: "Ed25519" }, false, ["verify"]
    );
    return this._cachedKey;
  },

  /**
   * Verify the cryptographic signature and expiry of a license key string.
   * Does NOT perform a remote revocation check.
   *
   * @param {string} licenseKey  — "PAYLOAD_B64URL.SIGNATURE_B64URL"
   * @returns {Promise<{valid:boolean, payload?:object, expired?:boolean, error?:string}>}
   */
  async verify(licenseKey) {
    if (!licenseKey || typeof licenseKey !== "string") {
      return { valid: false, error: "No license key provided." };
    }

    const parts = licenseKey.trim().split(".");
    if (parts.length !== 2) {
      return { valid: false, error: "Malformed license key (expected PAYLOAD.SIGNATURE)." };
    }

    const [payloadB64url, sigB64url] = parts;

    // Decode payload JSON
    const payload = _payloadB64urlToJson(payloadB64url);
    if (!payload) {
      return { valid: false, error: "License payload could not be decoded." };
    }

    // Verify Ed25519 signature over the raw payload string (the bytes before the dot)
    let sigValid = false;
    try {
      const pubKey   = await this._publicKey();
      const msgBytes = new TextEncoder().encode(payloadB64url);
      const sigBytes = _b64urlToBytes(sigB64url);
      sigValid = await crypto.subtle.verify({ name: "Ed25519" }, pubKey, sigBytes, msgBytes);
    } catch (err) {
      return { valid: false, error: "Signature verification error: " + err.message };
    }

    if (!sigValid) {
      return { valid: false, error: "Invalid license signature." };
    }

    // Check expiry
    if (payload.expires) {
      const expiry = new Date(payload.expires);
      expiry.setHours(23, 59, 59, 999); // grace: end of expiry day
      if (Date.now() > expiry.getTime()) {
        return { valid: false, expired: true, payload, error: "License expired on " + payload.expires + "." };
      }
    }

    return { valid: true, payload };
  },

  /**
   * Full validation: offline signature check + optional remote revocation check.
   * Safe to call on every app launch — network errors never block the user.
   *
   * @param {string} licenseKey
   * @returns {Promise<{valid:boolean, payload?:object, expired?:boolean, error?:string}>}
   */
  async validate(licenseKey) {
    const local = await this.verify(licenseKey);
    if (!local.valid) return local;

    if (ONLINE_CHECK_ENABLED) {
      try {
        const res = await fetch(VALIDATION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: licenseKey }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.valid) {
            return { valid: false, error: data.reason || "License has been revoked." };
          }
        }
        // Non-200 or unreachable → fall through to local result
      } catch {
        // Network unavailable — treat as valid (offline-first)
      }
    }

    return local;
  },

  /**
   * Load the saved license key from localStorage, validate it, and return a
   * structured status object ready to drive your UI.
   *
   * Returned status values:
   *   "none"    — no license key stored
   *   "valid"   — valid key; check .type ("trial" | "full") and .daysLeft
   *   "expired" — signature was valid but the date has passed
   *   "invalid" — signature check failed or key is malformed
   *
   * @returns {Promise<{status:string, type?:string, daysLeft?:number|null, payload?:object, error?:string}>}
   */
  async getStatus() {
    // Public key not yet configured — dev/unconfigured mode, bypass gate entirely
    if (PUBLIC_KEY_B64 === "REPLACE_WITH_PUBLIC_KEY_FROM_KEY_GENERATOR") {
      return { status: "valid", type: "full" };
    }
    const key = localStorage.getItem(STORAGE_KEY) || "";
    if (!key) return { status: "none" };

    const result = await this.validate(key);
    if (!result.valid) {
      return {
        status: result.expired ? "expired" : "invalid",
        payload: result.payload,
        error: result.error,
      };
    }

    const { payload } = result;
    const type = payload.type || "full";
    let daysLeft = null;
    if (payload.expires) {
      const expiry = new Date(payload.expires);
      expiry.setHours(23, 59, 59, 999);
      daysLeft = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86_400_000));
    }

    return { status: "valid", type, daysLeft, payload };
  },

  /** Persist a license key string to localStorage. */
  saveLicense(key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  },

  /** Remove the stored license key. */
  clearLicense() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────
// Works as ES module, CommonJS, or plain <script> tag.
if (typeof module !== "undefined" && module.exports) {
  module.exports = LicenseValidator;
} else if (typeof window !== "undefined") {
  window.LicenseValidator = LicenseValidator;
}
