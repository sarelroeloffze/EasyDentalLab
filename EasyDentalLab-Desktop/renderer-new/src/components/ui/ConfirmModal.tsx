interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  title = "Confirm",
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
      }}
      tabIndex={-1}
    >
      <div
        style={{
          background: 'var(--c-surface)',
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            color: danger ? '#dc2626' : '#f59e0b',
            fontSize: 24,
            lineHeight: 1
          }}>
            {danger ? '⚠️' : 'ℹ️'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--c-text1)',
              marginBottom: 8
            }}>
              {title}
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--c-text2)',
              lineHeight: 1.5
            }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            className={danger ? "btn btn-danger" : "btn btn-primary"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
