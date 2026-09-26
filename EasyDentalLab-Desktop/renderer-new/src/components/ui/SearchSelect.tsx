import { useState, useRef, useMemo } from 'react';
import { SvgIcon, ICO } from '../../utils/icons';

interface SearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

export function SearchSelect({ label, value, onChange, options, placeholder, style, autoFocus }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  // Close on outside click
  const handleBlur = () => {
    setTimeout(() => {
      if (ref.current && !ref.current.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 150);
  };

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const pick = (val: string) => {
    onChange(val);
    setQuery("");
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', ...style }} ref={ref}>
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
          style={{ paddingRight: 32 }}
          value={open ? query : (selected?.label || "")}
          placeholder={placeholder || "Type to search..."}
          onFocus={() => { setQuery(""); }}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onBlur={handleBlur}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <span
          onMouseDown={(e) => {
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
          {filtered.length === 0 ? (
            <div style={{
              padding: '12px 16px',
              fontSize: 13,
              color: 'var(--c-text4)',
              textAlign: 'center'
            }}>
              No matches found
            </div>
          ) : filtered.map(o => (
            <div
              key={o.value}
              onMouseDown={(e) => { e.preventDefault(); pick(o.value); }}
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
