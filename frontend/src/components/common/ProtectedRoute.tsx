'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (roles && !roles.includes(user.role)) {
        router.replace('/');
      }
    }
  }, [user, isLoading, roles, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!user) {
    return <LoadingSpinner fullScreen text="Redirecting to login..." />;
  }

  if (roles && !roles.includes(user.role)) {
    return <LoadingSpinner fullScreen text="Redirecting..." />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
