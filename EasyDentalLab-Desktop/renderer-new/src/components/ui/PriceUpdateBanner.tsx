// ============================================================
// Price Update Notification Banner
// ============================================================

import type { PriceListVersion } from '../../utils/priceUpdates';

interface PriceUpdateBannerProps {
  tariffsUpdateAvailable: boolean;
  medicalAidsUpdateAvailable: boolean;
  latestVersion: PriceListVersion | null;
  onViewChanges: () => void;
  onUpdateNow: () => void;
  onDismiss: () => void;
}

export function PriceUpdateBanner({
  tariffsUpdateAvailable,
  medicalAidsUpdateAvailable,
  latestVersion,
  onViewChanges,
  onUpdateNow,
  onDismiss,
}: PriceUpdateBannerProps) {
  if (!tariffsUpdateAvailable && !medicalAidsUpdateAvailable) {
    return null;
  }

  const updateItems: string[] = [];
  if (tariffsUpdateAvailable) {
    updateItems.push(`${latestVersion?.tariffs.codeCount || 0} tariff codes`);
  }
  if (medicalAidsUpdateAvailable) {
    updateItems.push(`${latestVersion?.medicalAids.aidCount || 0} medical aids`);
  }

  const updateText = updateItems.join(' and ');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#fbbf24', // Yellow-400
        borderBottom: '2px solid #f59e0b', // Yellow-500
        padding: '12px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Icon + Message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          <div>
            <div style={{ fontWeight: 600, color: '#78350f', marginBottom: '2px' }}>
              New price list available (v{latestVersion?.version})
            </div>
            <div style={{ fontSize: '13px', color: '#92400e' }}>
              {updateText} • Released {latestVersion?.releaseDate}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={onViewChanges}
            style={{
              padding: '6px 14px',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#92400e',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fef3c7';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
            }}
          >
            View Changes
          </button>

          <button
            onClick={onUpdateNow}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#f59e0b',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#d97706';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f59e0b';
            }}
          >
            Update Now
          </button>

          <button
            onClick={onDismiss}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#92400e',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fef3c7';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Remind Me Tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
