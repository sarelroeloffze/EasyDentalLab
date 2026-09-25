import { useState, useRef, useMemo } from 'react';
import { SvgIcon, ICO } from '../../utils/icons';

interface MedicalAidSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  style?: React.CSSProperties;
}

// Default medical aid options (fallback)
const DEFAULT_MEDICAL_AID_OPTIONS = [
  { value: 'Discovery Health', label: 'Discovery Health' },
  { value: 'Bonitas', label: 'Bonitas' },
  { value: 'Momentum Health', label: 'Momentum Health' },
  { value: 'Bestmed', label: 'Bestmed' },
  { value: 'Fedhealth', label: 'Fedhealth' },
  { value: 'Medshield', label: 'Medshield' },
];

/**
 * Combobox for Medical Aid Name
 * Searchable dropdown that also accepts custom/free-text entry
 */
export function MedicalAidSelect({ label, value, onChange, options, style }: MedicalAidSelectProps) {
  const opts = (options && options.length > 0) ? options : DEFAULT_MEDICAL_AID_OPTIONS;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return opts;
    const q = query.toLowerCase();
    return opts.filter(o => o.label.toLowerCase().includes(q));
  }, [query, opts]);

  const pick = (val: string) => {
    onChange(val);
    setQuery("");
    setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (ref.current && !ref.current.contains(document.activeElement)) {
        if (query.trim()) onChange(query.trim());
        setOpen(false);
        setQuery("");
      }
    }, 150);
  };

  return (
    <div style={{ position: 'relative', ...(style || {}) }} ref={ref}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--c-text2)',
          marginBottom: 4
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          className="input-field"
          autoComplete="off"
          style={{ paddingRight: 32 }}
          value={open ? query : (value || "")}
          placeholder="Type or select medical aid..."
          onFocus={() => { setOpen(true); setQuery(""); }}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length > 0) {
                pick(filtered[0].value);
              } else if (query.trim()) {
                onChange(query.trim());
                setOpen(false);
                setQuery("");
              }
            }
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
        />
        <span
          onMouseDown={e => {
            e.preventDefault();
            if (open) {
              setOpen(false);
              setQuery("");
            } else {
              setOpen(true);
              setQuery("");
            }
          }}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: 'var(--c-text3)',
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <SvgIcon path={ICO.chevronDown} size={16} />
        </span>
      </div>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxHeight: 220,
          overflowY: 'auto',
          marginTop: 4
        }}>
          {filtered.length === 0 && query ? (
            <div style={{
              padding: '8px 14px',
              fontSize: 12,
              color: 'var(--c-text3)',
              fontStyle: 'italic'
            }}>
              No match — press Enter to use "{query}"
            </div>
          ) : filtered.map(o => (
            <div
              key={o.value}
              onMouseDown={e => { e.preventDefault(); pick(o.value); }}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                cursor: 'pointer',
                borderBottom: '1px solid var(--c-border2)',
                background: o.value === value ? 'var(--c-sel)' : 'var(--c-surface)'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--c-surface2)')}
              onMouseOut={e => (e.currentTarget.style.background = o.value === value ? 'var(--c-sel)' : 'var(--c-surface)')}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
