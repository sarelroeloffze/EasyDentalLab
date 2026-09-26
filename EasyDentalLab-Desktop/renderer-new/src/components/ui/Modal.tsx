import React, { useRef, useEffect } from 'react';

interface ModalProps {
  open?: boolean; // Support both 'open' and 'isOpen'
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
  wide?: boolean;
  onCloseAttempt?: (onClose: () => void) => void; // Callback that receives onClose
  autoFocus?: boolean; // Auto-focus overlay when modal opens (default: true)
}

export function Modal({ isOpen, open, onClose, title, children, width, wide, onCloseAttempt, autoFocus = true }: ModalProps) {
  const windowJustFocusedRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalOpen = open ?? isOpen ?? false;
  const modalWidth = wide ? 900 : (width || 600);

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

  // Auto-focus modal when it opens (unless disabled for pickers with search inputs)
  useEffect(() => {
    if (autoFocus && modalOpen && overlayRef.current) {
      // Small delay to let child inputs claim focus first
      const timer = setTimeout(() => {
        if (overlayRef.current && document.activeElement?.tagName !== 'INPUT') {
          overlayRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, modalOpen]);

  const handleClose = () => {
    if (onCloseAttempt) {
      onCloseAttempt(onClose);
    } else {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (windowJustFocusedRef.current) return;

    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  };

  if (!modalOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
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
          maxWidth: modalWidth,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        {title && (
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
              onClick={handleClose}
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
        )}

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
