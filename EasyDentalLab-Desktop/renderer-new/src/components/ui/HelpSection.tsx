import { useState, useEffect } from 'react';
import { HELP_TOPICS } from '../../constants/helpContent';

const HELP_LANG_KEY = 'edl_help_lang';

export function HelpSection() {
  const [open, setOpen] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'af'>(() => {
    const saved = localStorage.getItem(HELP_LANG_KEY);
    return (saved === 'af' ? 'af' : 'en') as 'en' | 'af';
  });

  useEffect(() => {
    localStorage.setItem(HELP_LANG_KEY, lang);
  }, [lang]);

  const toggle = (id: string) => setOpen(prev => prev === id ? null : id);

  return (
    <div>
      {/* Language Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 20,
        padding: '12px 16px',
        background: 'var(--c-surface)',
        borderRadius: 8,
        border: '1px solid var(--c-border)'
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', marginRight: 8 }}>
            {lang === 'en' ? 'Help Language:' : 'Hulp Taal:'}
          </span>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '6px 14px',
              border: lang === 'en' ? '2px solid #3b82f6' : '1px solid var(--c-border)',
              borderRadius: 6,
              background: lang === 'en' ? '#eff6ff' : 'var(--c-surface)',
              color: lang === 'en' ? '#1e40af' : 'var(--c-text2)',
              fontWeight: lang === 'en' ? 600 : 400,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            English
          </button>
          <button
            onClick={() => setLang('af')}
            style={{
              padding: '6px 14px',
              border: lang === 'af' ? '2px solid #3b82f6' : '1px solid var(--c-border)',
              borderRadius: 6,
              background: lang === 'af' ? '#eff6ff' : 'var(--c-surface)',
              color: lang === 'af' ? '#1e40af' : 'var(--c-text2)',
              fontWeight: lang === 'af' ? 600 : 400,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Afrikaans
          </button>
        </div>
      </div>

      {/* Help Topics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {HELP_TOPICS.map(topic => (
          <div
            key={topic.id}
            style={{
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--c-surface)'
            }}
          >
            <button
              onClick={() => toggle(topic.id)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: open === topic.id ? 'var(--c-surface2)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--c-text1)',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: 20 }}>{topic.icon}</span>
              <span style={{ flex: 1 }}>{topic.title[lang]}</span>
              <span style={{
                fontSize: 18,
                transition: 'transform 0.2s',
                transform: open === topic.id ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>
            {open === topic.id && (
              <div style={{
                padding: '18px 20px',
                borderTop: '1px solid var(--c-border)',
                fontSize: 14,
                lineHeight: 1.75,
                color: 'var(--c-text2)'
              }}>
                {topic.content[lang]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
