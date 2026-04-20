import React from 'react';

interface Props { fullScreen?: boolean; text?: string; }

const LoadingSpinner: React.FC<Props> = ({ fullScreen, text }) => {
  if (fullScreen) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
      <div style={{ width: 60, height: 60, border: '4px solid var(--gray-200)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      {text && <p style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{text}</p>}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" />
      {text && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
