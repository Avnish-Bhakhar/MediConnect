'use client';

import React, { useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import Navbar from '../components/common/Navbar';
import Toast from '../components/common/Toast';

interface ToastMsg {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <AuthProvider>
      <SocketProvider>
        <Navbar />
        <div className="toast-container">
          {toasts.map(t => (
            <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
          ))}
        </div>
        <main>{children}</main>
      </SocketProvider>
    </AuthProvider>
  );
}
