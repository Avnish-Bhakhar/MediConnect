import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Appointments from './pages/Appointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorSetup from './pages/DoctorSetup';
import AssistantDashboard from './pages/AssistantDashboard';
import AdminPanel from './pages/AdminPanel';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

interface ToastMsg { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen text="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <SocketProvider>
      <BrowserRouter>
        <Navbar />
        <div className="toast-container">
          {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/appointments" element={<ProtectedRoute roles={['patient']}><Appointments /></ProtectedRoute>} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/setup" element={<ProtectedRoute roles={['doctor']}><DoctorSetup /></ProtectedRoute>} />
          <Route path="/assistant/dashboard" element={<ProtectedRoute roles={['assistant', 'admin']}><AssistantDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
