// ============================================================
// Copy Modal - 3 Copy Mode Options
// ============================================================

import { Modal } from './Modal';
import { Button } from './Button';

export type CopyMode = 'all' | 'patient' | 'detail';

interface CopyModalProps {
  open: boolean;
  onClose: () => void;
  onCopy: (mode: CopyMode) => void;
  documentType: 'invoice' | 'estimate';
}

export function CopyModal({ open, onClose, onCopy, documentType }: CopyModalProps) {
  const docLabel = documentType === 'invoice' ? 'Invoice' : 'Estimate';

  const handleCopy = (mode: CopyMode) => {
    onCopy(mode);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Copy ${docLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--c-text2)' }}>
          Choose what to copy to the new {docLabel.toLowerCase()}:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            onClick={() => handleCopy('all')}
            style={{
              padding: 16,
              border: '2px solid var(--c-border)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'var(--c-surface)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border)';
              e.currentTarget.style.background = 'var(--c-surface)';
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--c-text1)' }}>
              📋 Copy All
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-text3)' }}>
              Copy patient/dentist info + line items (with current prices from tariffs)
            </div>
          </div>

          <div
            onClick={() => handleCopy('patient')}
            style={{
              padding: 16,
              border: '2px solid var(--c-border)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'var(--c-surface)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border)';
              e.currentTarget.style.background = 'var(--c-surface)';
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--c-text1)' }}>
              👤 Patient Only
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-text3)' }}>
              Copy patient/dentist info only (blank line items)
            </div>
          </div>

          <div
            onClick={() => handleCopy('detail')}
            style={{
              padding: 16,
              border: '2px solid var(--c-border)',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: 'var(--c-surface)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-border)';
              e.currentTarget.style.background = 'var(--c-surface)';
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--c-text1)' }}>
              📝 Detail Only
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-text3)' }}>
              Copy line items only (blank patient/dentist info)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
