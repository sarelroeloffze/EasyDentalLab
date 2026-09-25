import React from 'react';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'style'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, fullWidth = true, options, ...props }: SelectProps) {
  return (
    <div style={{ marginBottom: 16, width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--c-text2)'
        }}>
          {label}
          {props.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <select
        {...props}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          border: '1px solid var(--c-border)',
          borderRadius: 6,
          background: 'var(--c-surface2)',
          color: 'var(--c-text1)',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          ...(error ? { borderColor: '#ef4444' } : {})
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div style={{
          marginTop: 6,
          fontSize: 12,
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
