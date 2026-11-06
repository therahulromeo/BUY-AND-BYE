import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'flex-start' }}>
        <div
          style={{
            padding: 'var(--spacing-2)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: confirmVariant === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
            color: confirmVariant === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
