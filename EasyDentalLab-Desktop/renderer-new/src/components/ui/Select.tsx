import React from 'react';

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  title?: string;
  disabled?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  fullWidth = true,
  style,
  title,
  disabled
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

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
          {required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        required={required}
        title={title}
        disabled={disabled}
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
          ...(error ? { borderColor: '#ef4444' } : {}),
          ...style
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
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
