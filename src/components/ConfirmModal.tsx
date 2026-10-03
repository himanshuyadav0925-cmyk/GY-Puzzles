import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This will permanently reset your progress.',
  confirmText = 'Reset Progress',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop confirm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="confirm-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="confirm-header-icon-row">
            <div className={`confirm-icon-wrap ${isDanger ? 'icon-danger' : 'icon-warning'}`}>
              <AlertTriangle size={24} />
            </div>
            <h2 id="confirm-title" className="modal-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Cancel action"
          >
            <X size={18} />
          </button>
        </div>

        <p className="confirm-message">
          {message}
        </p>

        <div className="confirm-actions-row">
          <button
            type="button"
            className="secondary-btn flex-1"
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`${isDanger ? 'danger-btn' : 'primary-btn'} flex-1`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
