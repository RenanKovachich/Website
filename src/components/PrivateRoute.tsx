import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredProfile?: 'admin' | 'usuario';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredProfile,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredProfile && user.profile !== requiredProfile) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}; 