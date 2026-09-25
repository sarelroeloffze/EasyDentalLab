import React from 'react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  icon?: string;
}

export function Button({ 
  variant = 'primary', 
  fullWidth = false, 
  icon,
  children, 
  ...props 
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: '#2563eb',
          color: '#fff',
          border: 'none'
        };
      case 'secondary':
        return {
          background: 'var(--c-surface2)',
          color: 'var(--c-text1)',
          border: '1px solid var(--c-border)'
        };
      case 'danger':
        return {
          background: '#ef4444',
          color: '#fff',
          border: 'none'
        };
    }
  };

  return (
    <button
      {...props}
      style={{
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 500,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        ...(fullWidth ? { width: '100%' } : {}),
        ...getVariantStyles(),
        ...(props.disabled ? {
          opacity: 0.5,
          cursor: 'not-allowed'
        } : {})
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
