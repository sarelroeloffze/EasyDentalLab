import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({ label, error, fullWidth = true, ...props }: InputProps) {
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
      <input
        {...props}
        className="input-field"
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          border: '1px solid var(--c-border)',
          borderRadius: 6,
          background: 'var(--c-surface2)',
          color: 'var(--c-text1)',
          transition: 'border-color 0.2s',
          ...(error ? { borderColor: '#ef4444' } : {})
        }}
      />
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
