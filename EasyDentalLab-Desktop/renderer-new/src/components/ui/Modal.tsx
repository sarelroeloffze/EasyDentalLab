import React, { useRef, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  onCloseAttempt?: () => boolean; // Return false to prevent close
}

export function Modal({ isOpen, onClose, title, children, width = 600, onCloseAttempt }: ModalProps) {
  const windowJustFocusedRef = useRef(false);

  useEffect(() => {
    const handleFocus = () => {
      windowJustFocusedRef.current = true;
      setTimeout(() => {
        windowJustFocusedRef.current = false;
      }, 200); // 200ms grace period
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (windowJustFocusedRef.current) return;
    
    if (e.target === e.currentTarget) {
      // Clicked on overlay
      if (onCloseAttempt) {
        const canClose = onCloseAttempt();
        if (canClose) onClose();
      } else {
        onClose();
      }
    }
  };

  const handleCloseClick = () => {
    if (onCloseAttempt) {
      const canClose = onCloseAttempt();
      if (canClose) onClose();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        style={{
          background: 'var(--c-surface)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: width,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--c-border)'
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--c-text1)' }}>
            {title}
          </h2>
          <button
            onClick={handleCloseClick}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'var(--c-text3)',
              padding: '4px 8px',
              lineHeight: 1
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
