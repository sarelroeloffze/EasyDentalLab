import { HelpSection } from '../ui';

export function Help() {
  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--c-text1)', marginBottom: 8 }}>
          Help & Documentation
        </h1>
        <p style={{ fontSize: 14, color: 'var(--c-text3)' }}>
          Complete guide to using EasyDentalLab
        </p>
      </div>

      <HelpSection />
    </div>
  );
}
