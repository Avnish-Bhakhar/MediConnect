import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span style={{ fontSize: '1.2rem' }}>{icons[type]}</span>
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-800)' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '1rem' }}>✕</button>
    </div>
  );
};

export default Toast;
