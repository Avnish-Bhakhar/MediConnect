import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  notifications: SocketNotification[];
  clearNotifications: () => void;
}

interface SocketNotification {
  id: string;
  message: string;
  type: string;
  timestamp: Date;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);

  useEffect(() => {
    if (!token) return;

    const s = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    s.on('connect', () => console.log('Socket connected'));
    s.on('new_appointment', (data) => {
      setNotifications(prev => [{
        id: Date.now().toString(), message: data.message, type: 'info', timestamp: new Date()
      }, ...prev]);
    });
    s.on('appointment_updated', (data) => {
      setNotifications(prev => [{
        id: Date.now().toString(), message: data.message, type: 'success', timestamp: new Date()
      }, ...prev]);
    });
    s.on('notification', (data) => {
      setNotifications(prev => [{
        id: Date.now().toString(), message: data.message, type: data.type || 'info', timestamp: new Date()
      }, ...prev]);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};
