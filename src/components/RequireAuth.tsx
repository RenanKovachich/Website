import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

interface RequireRoleProps {
  children: React.ReactNode;
  role: 'admin' | 'usuario';
}

// Componente para rotas que requerem autenticação
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rotas que requerem um perfil específico
export const RequireRole: React.FC<RequireRoleProps> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.profile !== role) {
    // Redireciona baseado no perfil do usuário
    if (user.profile === 'admin') {
      return <Navigate to="/admin/spaces" replace />;
    } else {
      return <Navigate to="/usuario/reservations" replace />;
    }
  }

  return <>{children}</>;
};

// Exportação padrão para compatibilidade
export default RequireAuth;
