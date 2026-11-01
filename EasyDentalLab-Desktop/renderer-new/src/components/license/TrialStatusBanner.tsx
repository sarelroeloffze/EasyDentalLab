/**
 * Trial Status Banner
 *
 * Countdown banner for trial licenses
 * Shows when trial has <= 30 days remaining
 * Color-coded: blue (30+ days), orange (14-7 days), red (< 7 days)
 */

import { getTrialStatusMessage, formatExpiryDate } from '../../utils/license';
import { SUPPORT_EMAIL } from '../../constants/license';

interface TrialStatusBannerProps {
  daysRemaining: number;
  expiryDate: string;
  onDismiss?: () => void;
}

export function TrialStatusBanner({
  daysRemaining,
  expiryDate,
  onDismiss
}: TrialStatusBannerProps) {
  const { message, severity } = getTrialStatusMessage(daysRemaining);

  // Color scheme based on severity
  const colors = {
    info: {
      bg: '#dbeafe',
      border: '#3b82f6',
      text: '#1e40af'
    },
    warning: {
      bg: '#fed7aa',
      border: '#f97316',
      text: '#9a3412'
    },
    critical: {
      bg: '#fee2e2',
      border: '#dc2626',
      text: '#991b1b'
    }
  };

  const color = colors[severity];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: color.bg,
      borderBottom: `2px solid ${color.border}`,
      padding: '12px 16px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <span style={{ fontSize: 20 }}>
          {severity === 'info' && 'ℹ️'}
          {severity === 'warning' && '⚠️'}
          {severity === 'critical' && '🔴'}
        </span>
        <div>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: color.text,
            margin: 0,
            marginBottom: 4
          }}>
            {message}
          </p>
          <p style={{
            fontSize: 13,
            color: color.text,
            margin: 0,
            opacity: 0.8
          }}>
            Trial expires: {formatExpiryDate(expiryDate)} — Contact{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                color: color.text,
                textDecoration: 'underline',
                fontWeight: 600
              }}
            >
              {SUPPORT_EMAIL}
            </a>
            {' '}to purchase a license
          </p>
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 600,
            color: color.text,
            backgroundColor: 'transparent',
            border: `1px solid ${color.border}`,
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
