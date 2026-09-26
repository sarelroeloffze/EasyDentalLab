import { useState, useRef, useMemo, useEffect } from 'react';
import { SvgIcon, ICO } from '../../utils/icons';

interface SearchSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  autoOpen?: boolean; // Auto-open dropdown on focus
  onAddNew?: (query: string) => void; // Callback to add new item when no matches
}

export function SearchSelect({ label, value, onChange, options, placeholder, style, autoFocus, autoOpen, onAddNew }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hlIdx, setHlIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    const matches = options.filter(o => o.label.toLowerCase().includes(q));
    setHlIdx(0); // Reset highlight when filter changes
    return matches;
  }, [options, query]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (!open || !dropdownRef.current || filtered.length === 0) return;

    const container = dropdownRef.current;
    const items = container.children;
    const itemIdx = onAddNew && filtered.length === 0 ? 0 : hlIdx;
    if (!items[itemIdx]) return;

    const item = items[itemIdx] as HTMLElement;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.clientHeight;

    if (itemTop < containerTop) {
      container.scrollTop = itemTop;
    } else if (itemBottom > containerBottom) {
      container.scrollTop = itemBottom - container.clientHeight;
    }
  }, [hlIdx, open, filtered.length, onAddNew]);

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
          style={{ paddingRight: 32, width: '100%' }}
          value={open ? query : (selected?.label || "")}
          placeholder={placeholder || "Type to search..."}
          onFocus={() => {
            setQuery("");
            if (autoOpen) setOpen(true);
          }}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (!open) setOpen(true);
              else if (filtered.length > 0) {
                setHlIdx(prev => Math.min(prev + 1, filtered.length - 1));
              }
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (open && filtered.length > 0) {
                setHlIdx(prev => Math.max(prev - 1, 0));
              }
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (open && filtered.length > 0) {
                pick(filtered[hlIdx].value);
              } else if (open && filtered.length === 0 && onAddNew && query.trim()) {
                onAddNew(query.trim());
                setOpen(false);
                setQuery("");
              }
            } else if (e.key === 'Escape' && open) {
              e.stopPropagation();
              setOpen(false);
              setQuery("");
            }
          }}
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
        <div
          ref={dropdownRef}
          style={{
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
          }}
        >
          {filtered.length === 0 ? (
            onAddNew && query.trim() ? (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAddNew(query.trim());
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: '#2563eb',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: hlIdx === 0 ? '#dbeafe' : 'var(--c-surface)'
                }}
                onMouseOver={(e) => { setHlIdx(0); e.currentTarget.style.background = '#dbeafe'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = hlIdx === 0 ? '#dbeafe' : 'var(--c-surface)'; }}
              >
                <span style={{ fontSize: 16 }}>+</span>
                <span>Add new "{query.trim()}"</span>
              </div>
            ) : (
              <div style={{
                padding: '12px 16px',
                fontSize: 13,
                color: 'var(--c-text4)',
                textAlign: 'center'
              }}>
                No matches found
              </div>
            )
          ) : filtered.map((o, idx) => (
            <div
              key={o.value}
              onMouseDown={(e) => { e.preventDefault(); pick(o.value); }}
              onMouseOver={() => setHlIdx(idx)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                cursor: 'pointer',
                borderBottom: '1px solid var(--c-border2)',
                background: idx === hlIdx ? '#dbeafe' : 'var(--c-surface)'
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
