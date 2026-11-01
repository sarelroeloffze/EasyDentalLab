/**
 * License Entry Screen
 *
 * First-time license entry when no valid key is stored
 * Full-screen modal that blocks app access until valid key entered
 */

import { useState } from 'react';
import { validateLicenseKey, saveLicenseKey } from '../../utils/license';
import { LICENSE_PUBLIC_KEY_B64, SUPPORT_EMAIL } from '../../constants/license';

interface LicenseEntryScreenProps {
  onActivate: () => void;
}

export function LicenseEntryScreen({ onActivate }: LicenseEntryScreenProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const status = await validateLicenseKey(licenseKey, LICENSE_PUBLIC_KEY_B64);

      if (!status.valid) {
        setError(status.error || 'Invalid license key');
        setValidating(false);
        return;
      }

      if (status.expired) {
        setError('This license key has expired. Please contact support for a renewal.');
        setValidating(false);
        return;
      }

      // Valid key - save and activate
      saveLicenseKey(licenseKey);
      onActivate();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
      setValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleActivate();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--c-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999
    }}>
      <div style={{
        maxWidth: 500,
        width: '90%',
        padding: 40,
        backgroundColor: 'var(--c-surface)',
        borderRadius: 12,
        border: '1px solid var(--c-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* App Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--c-text1)',
            marginBottom: 8
          }}>
            EasyDentalLab
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--c-text2)'
          }}>
            Dental Laboratory Invoicing
          </p>
        </div>

        {/* Instructions */}
        <div style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: 'var(--c-surface2)',
          borderRadius: 8,
          borderLeft: '4px solid #3b82f6'
        }}>
          <p style={{
            fontSize: 14,
            color: 'var(--c-text2)',
            margin: 0,
            lineHeight: 1.6
          }}>
            Please enter your license key to activate EasyDentalLab.
            If you don't have a key, contact <strong>{SUPPORT_EMAIL}</strong>
          </p>
        </div>

        {/* License Key Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--c-text1)',
            marginBottom: 8
          }}>
            License Key
          </label>
          <textarea
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your license key here..."
            disabled={validating}
            style={{
              width: '100%',
              minHeight: 120,
              padding: 12,
              fontSize: 13,
              fontFamily: 'monospace',
              backgroundColor: 'var(--c-surface2)',
              color: 'var(--c-text1)',
              border: '1px solid var(--c-border)',
              borderRadius: 6,
              resize: 'vertical',
              lineHeight: 1.5
            }}
          />
          <p style={{
            fontSize: 12,
            color: 'var(--c-text3)',
            marginTop: 6,
            marginBottom: 0
          }}>
            Ctrl+Enter to activate
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6
          }}>
            <p style={{
              fontSize: 13,
              color: '#dc2626',
              margin: 0
            }}>
              ❌ {error}
            </p>
          </div>
        )}

        {/* Activate Button */}
        <button
          onClick={handleActivate}
          disabled={validating || !licenseKey.trim()}
          style={{
            width: '100%',
            padding: 14,
            fontSize: 16,
            fontWeight: 600,
            color: 'white',
            backgroundColor: validating ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: 8,
            cursor: validating || !licenseKey.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {validating ? 'Validating...' : 'Activate License'}
        </button>

        {/* Support Link */}
        <div style={{
          marginTop: 24,
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--c-text3)'
        }}>
          Need help?{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
