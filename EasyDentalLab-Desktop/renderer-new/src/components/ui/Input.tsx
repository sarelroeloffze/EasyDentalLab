import React from 'react';

interface InputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
  textarea?: boolean;
  rows?: number;
  style?: React.CSSProperties;
  title?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autoFocus?: boolean;
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  error,
  fullWidth = true,
  textarea,
  rows = 3,
  style,
  title,
  disabled,
  min,
  max,
  step,
  autoFocus
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid var(--c-border)',
    borderRadius: 6,
    background: 'var(--c-surface2)',
    color: 'var(--c-text1)',
    transition: 'border-color 0.2s',
    ...(error ? { borderColor: '#ef4444' } : {}),
    ...style
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
      {textarea ? (
        <textarea
          className="input-field"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          title={title}
          disabled={disabled}
          rows={rows}
          style={inputStyle}
          autoFocus={autoFocus}
        />
      ) : (
        <input
          className="input-field"
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          title={title}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          style={inputStyle}
          autoFocus={autoFocus}
        />
      )}
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
