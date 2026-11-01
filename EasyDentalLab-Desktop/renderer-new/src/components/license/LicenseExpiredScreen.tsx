/**
 * License Expired Screen
 *
 * Hard lockout screen when trial license has expired
 * No close/escape - user must enter valid key, uninstall, or export data
 */

import { useState } from 'react';
import { validateLicenseKey, saveLicenseKey, formatExpiryDate } from '../../utils/license';
import { LICENSE_PUBLIC_KEY_B64, SUPPORT_EMAIL } from '../../constants/license';

interface LicenseExpiredScreenProps {
  expiredLicenseEmail: string;
  expiredLicenseDate: string;
  onActivate: () => void;
  onExportData: () => void;
}

export function LicenseExpiredScreen({
  expiredLicenseEmail,
  expiredLicenseDate,
  onActivate,
  onExportData
}: LicenseExpiredScreenProps) {
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
        setError('This license key has also expired. Please contact support for a valid license.');
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

  const handleUninstall = () => {
    const confirmed = confirm(
      'This will uninstall EasyDentalLab from your system.\n\n' +
      'IMPORTANT: Export your data first if you want to keep it.\n\n' +
      'Continue with uninstall?'
    );

    if (confirmed) {
      // Call Electron IPC to trigger uninstall
      window.electronAPI?.uninstallApp?.();
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
        maxWidth: 550,
        width: '90%',
        padding: 40,
        backgroundColor: 'var(--c-surface)',
        borderRadius: 12,
        border: '1px solid var(--c-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Trial Expired Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 48,
            marginBottom: 16
          }}>
            🔒
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#dc2626',
            marginBottom: 8
          }}>
            Trial License Expired
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--c-text2)',
            lineHeight: 1.6
          }}>
            Your trial license expired on <strong>{formatExpiryDate(expiredLicenseDate)}</strong>
          </p>
          <p style={{
            fontSize: 14,
            color: 'var(--c-text3)',
            marginTop: 8
          }}>
            Licensed to: {expiredLicenseEmail}
          </p>
        </div>

        {/* Purchase Message */}
        <div style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 8,
          borderLeft: '4px solid #f59e0b'
        }}>
          <p style={{
            fontSize: 14,
            color: '#92400e',
            margin: 0,
            lineHeight: 1.6
          }}>
            To continue using EasyDentalLab, please contact <strong>{SUPPORT_EMAIL}</strong> to purchase a license.
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
            New License Key
          </label>
          <textarea
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your new license key here..."
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
            transition: 'background-color 0.2s',
            marginBottom: 12
          }}
        >
          {validating ? 'Validating...' : 'Activate License'}
        </button>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid var(--c-border)',
          margin: '24px 0'
        }} />

        {/* Secondary Actions */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24
        }}>
          <button
            onClick={onExportData}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--c-text1)',
              backgroundColor: 'var(--c-surface2)',
              border: '1px solid var(--c-border)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            📦 Export Data
          </button>
          <button
            onClick={handleUninstall}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 14,
              fontWeight: 600,
              color: '#dc2626',
              backgroundColor: 'var(--c-surface2)',
              border: '1px solid #fecaca',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            🗑️ Uninstall
          </button>
        </div>

        {/* Support Link */}
        <div style={{
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
