import React, { useEffect, useRef } from 'react';
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
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, duration = 2800 }) => {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onDismissRef.current();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, duration]);

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
    <div
      key={toast.id}
      className={`gy-toast-container toast-${toast.type || 'info'}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-content">
        {renderIcon()}
        <span className="toast-text">{toast.text}</span>
      </div>
    </div>
  );
};
