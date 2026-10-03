import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'hint' | 'warning';

export interface ToastMessage {
  id: string;
  text: string;
  type?: ToastType;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={16} className="toast-icon-green" />;
      case 'hint':
        return <Sparkles size={16} className="toast-icon-gold" />;
      case 'warning':
        return <AlertCircle size={16} className="toast-icon-amber" />;
      default:
        return <Info size={16} className="toast-icon-blue" />;
    }
  };

  return (
    <div className={`gy-toast-container toast-${toast.type || 'info'}`} role="status" aria-live="polite">
      <div className="toast-content">
        {renderIcon()}
        <span className="toast-text">{toast.text}</span>
      </div>
    </div>
  );
};
