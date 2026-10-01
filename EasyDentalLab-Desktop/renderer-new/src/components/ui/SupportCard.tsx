import { SUPPORT_WHATSAPP, SUPPORT_EMAIL } from '../../constants/initialData';

export function SupportCard() {
  const openWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I need help with EasyDentalLab.')}`;
    if (window.electronAPI) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const openEmail = () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('EasyDentalLab Support')}`;
    if (window.electronAPI) {
      window.electronAPI.openExternal(url);
    } else {
      window.location.href = url;
    }
  };

  return (
    <div style={{
      background: 'var(--c-surface)',
      borderRadius: 12,
      padding: 24,
      border: '1px solid var(--c-border)'
    }}>
      <h2 style={{
        fontSize: 16,
        fontWeight: 700,
        margin: '0 0 4px',
        color: 'var(--c-text1)'
      }}>
        💬 Support
      </h2>
      <p style={{
        fontSize: 13,
        color: 'var(--c-text3)',
        margin: '0 0 16px'
      }}>
        Need help? Contact support via WhatsApp or email.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={openWhatsApp}
          style={{
            padding: '10px 16px',
            background: '#25D366',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 18 }}>💬</span>
          WhatsApp Support
        </button>

        <button
          onClick={openEmail}
          style={{
            padding: '10px 16px',
            background: 'var(--c-surface2)',
            color: 'var(--c-text1)',
            border: '1px solid var(--c-border)',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span style={{ fontSize: 18 }}>✉️</span>
          Email Support
        </button>
      </div>
    </div>
  );
}
