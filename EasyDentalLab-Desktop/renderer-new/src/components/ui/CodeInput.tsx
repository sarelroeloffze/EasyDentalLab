import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Tariff } from '../../types';

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onSelect: (tariff: Tariff) => void;
  onAddLine?: () => void;
  tariffs: Tariff[];
  inputStyle?: React.CSSProperties;
  rowId?: string;
}

export function CodeInput({ 
  value, 
  // onChange, 
  onSelect, 
  onAddLine, 
  tariffs, 
  inputStyle,
  rowId 
}: CodeInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hlIdx, setHlIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate filtered items and match index
  const { items: filtered, matchIdx } = useMemo(() => {
    const q = (query || value || '').toLowerCase().trim();

    const sortedTariffs = [...tariffs].sort((a, b) =>
      (a.code || '').localeCompare(b.code || '', undefined, { numeric: true })
    );

    if (!q) return { items: sortedTariffs.slice(0, 100), matchIdx: 0 };

    // TRUE FILTER: only show codes that start with typed query
    const matches = sortedTariffs.filter(t =>
      (t.code || '').toLowerCase().startsWith(q)
    );

    // Find exact match index (0 if exact match exists at position 0)
    const exactMatchIdx = matches.findIndex(t =>
      (t.code || '').toLowerCase() === q
    );

    return { items: matches, matchIdx: exactMatchIdx >= 0 ? exactMatchIdx : 0 };
  }, [tariffs, query, value]);

  // Update highlight position when query changes
  useEffect(() => {
    if (query) setHlIdx(matchIdx);
  }, [query, matchIdx]);

  // Auto-scroll to keep highlighted item visible
  useEffect(() => {
    if (!open || !dropdownRef.current || filtered.length === 0) return;

    const container = dropdownRef.current;
    const items = container.children;
    if (!items[hlIdx]) return;

    const item = items[hlIdx] as HTMLElement;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.clientHeight;

    if (itemTop < containerTop) {
      container.scrollTop = itemTop;
    } else if (itemBottom > containerBottom) {
      container.scrollTop = itemBottom - container.clientHeight;
    }
  }, [hlIdx, open, filtered.length]);

  // Close dropdown on scroll
  useEffect(() => {
    if (!open) return;

    const closeOnScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setQuery('');
    };

    window.addEventListener('scroll', closeOnScroll, true);
    return () => window.removeEventListener('scroll', closeOnScroll, true);
  }, [open]);

  // Pick a tariff (single source of truth for selection)
  const pick = (tariff: Tariff) => {
    onSelect(tariff);
    setQuery('');
    setOpen(false);
  };

  // Move focus to qty field
  const moveToQtyField = () => {
    setTimeout(() => {
      const row = inputRef.current?.closest('tr');
      if (!row) return;
      
      const qtyInput = row.querySelector('input[type="number"]') as HTMLInputElement;
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
    }, 50);
  };

  // Confirm highlighted code and add new line
  const confirmAndAddLine = () => {
    const q = (query || value || '').trim();
    if (q && filtered.length > 0) {
      const match = filtered[hlIdx] || filtered[0];
      if (match) onSelect(match);
    }
    setOpen(false);
    setQuery('');

    if (onAddLine) {
      setTimeout(() => {
        onAddLine();
        setTimeout(() => {
          const table = inputRef.current?.closest('table');
          if (!table) return;
          
          const allCodeInputs = table.querySelectorAll('input[data-field="code"]');
          const last = allCodeInputs[allCodeInputs.length - 1] as HTMLInputElement;
          if (last) last.focus();
        }, 50);
      }, 10);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        const q = query.trim().toLowerCase();
        if (q && q !== (value || '').toLowerCase()) {
          const match = tariffs.find(t => (t.code || '').toLowerCase() === q);
          if (match) onSelect(match);
        }
        setOpen(false);
        setQuery('');
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter: Confirm and add new line
        confirmAndAddLine();
      } else if (open && filtered.length > 0) {
        // Enter: Pick highlighted code and move to qty
        const q = (query || value || '').trim();
        if (q) {
          const match = filtered[hlIdx] || filtered[0];
          if (match) {
            pick(match);
            moveToQtyField();
          }
        }
      } else if (value) {
        // Enter with dropdown closed: just move to qty
        moveToQtyField();
      }
    } else if (e.key === 'ArrowRight' && inputRef.current?.selectionStart === (query || value || '').length) {
      // Right arrow at end: move to qty field
      e.preventDefault();
      if (open) setOpen(false);
      moveToQtyField();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();

      if (open && filtered.length > 0) {
        const q = (query || value || '').toLowerCase().trim();
        const highlighted = filtered[hlIdx];

        // If typed code exactly matches highlighted code, confirm and add new line
        // This enables fast data entry: type code, press Down, type next code
        if (highlighted && q === highlighted.code.toLowerCase()) {
          confirmAndAddLine();
        } else {
          // Otherwise navigate down in dropdown
          setHlIdx(prev => Math.min(prev + 1, filtered.length - 1));
        }
      } else if (filtered.length > 0) {
        // Dropdown closed but matches exist: confirm and add new line
        confirmAndAddLine();
      }
      // If filtered.length === 0, do nothing (no matches for this code)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open && filtered.length > 0) {
        // Navigate up in dropdown
        setHlIdx(prev => Math.max(prev - 1, 0));
      }
    } else if (e.key === 'Tab') {
      // Tab: confirm and let browser move focus
      const q = (query || value || '').trim();
      if (q && open && filtered.length > 0) {
        const match = filtered[hlIdx] || filtered[0];
        if (match) pick(match);
      }
      setOpen(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (open) {
        // Dropdown is open: close it and stop propagation
        // Keep the typed text so user can continue from where they left off
        e.stopPropagation();
        setOpen(false);
      }
      // If dropdown already closed, let Escape bubble up to close the form
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="input-field"
        data-field="code"
        data-row={rowId}
        value={query || value}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setQuery(value || '');
          // Only open dropdown if field has value (don't show on blank lines)
          if (value && value.trim()) {
            setOpen(true);
          }
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={inputStyle}
        placeholder="Code..."
        title="Type to search codes, ↑↓ arrows to navigate, Enter to select, Ctrl+Enter to add new line"
        autoComplete="off"
      />
      
      {open && (() => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (!rect) return null;

        return (
          <div
            ref={dropdownRef}
            className="code-dropdown"
            style={{
              position: 'fixed',
              top: (rect.bottom || 0) + 2,
              left: rect.left || 0,
              zIndex: 99999,
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
              maxHeight: 600,
              minHeight: 400,
              overflowY: 'auto',
              minWidth: 500,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {filtered.length === 0 ? (
              <div style={{
                padding: '32px 20px',
                textAlign: 'center',
                color: 'var(--c-text3)',
                fontSize: 14
              }}>
                No matching codes found for "{query || value}"
              </div>
            ) : filtered.map((t, idx) => (
              <div
                key={t.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setHlIdx(idx);
                  pick(t);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--c-border2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: idx === hlIdx ? '#dbeafe' : 'var(--c-surface)',
                  minHeight: '28px',
                  lineHeight: '1.3'
                }}
                onMouseOver={() => setHlIdx(idx)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: 1,
                  minWidth: 0
                }}>
                  <span style={{
                    fontFamily: 'monospace',
                    color: '#2563eb',
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: 'nowrap'
                  }}>
                    {t.code}
                  </span>
                  <span style={{
                    color: 'var(--c-text2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 12
                  }}>
                    {t.description}
                  </span>
                </div>
                <span style={{
                  fontWeight: 700,
                  color: '#059669',
                  whiteSpace: 'nowrap',
                  fontSize: 12
                }}>
                  R {t.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
