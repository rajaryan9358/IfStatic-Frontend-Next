import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onDismiss, duration = 4500, position = 'bottom-right' }) => {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <div className={`toast-container ${position}`} role="status" aria-live="polite">
      <div className={`toast toast-${type}`}>
        <div className="toast-content">
          <span>{message}</span>
        </div>
        <button type="button" className="toast-close" onClick={onDismiss} aria-label="Dismiss notification">
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
