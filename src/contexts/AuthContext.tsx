import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Empresa, LoginFormValues, RegisterFormValues, AuthContext as AuthContextType } from '../types';
import { apiService } from '../services/api';

interface AuthContextData extends AuthContextType {
  loading: boolean;
  signIn: (data: LoginFormValues) => Promise<{ data: User }>;
  signUp: (data: RegisterFormValues) => Promise<void>;
  signOut: () => void;
  refreshContext: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  // Reidratação do usuário ao montar a app
  useEffect(() => {
    const storedUser = localStorage.getItem('@LinkSpace:user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setEmpresa(userData.empresa || null);
        
        // Definir contexto no serviço de API
        if (userData.empresaId) {
          apiService.setContext(userData);
        }
      } catch (error) {
        console.error('Erro ao reidratar usuário:', error);
        localStorage.removeItem('@LinkSpace:user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (data: LoginFormValues) => {
    const response = await apiService.login(data);
    setUser(response.data);
    setEmpresa(response.data.empresa || null);
    localStorage.setItem('@LinkSpace:user', JSON.stringify(response.data));
    return response;
  };

  const signUp = async (data: RegisterFormValues) => {
    const response = await apiService.register(data);
    setUser(response.data);
    setEmpresa(response.data.empresa || null);
    localStorage.setItem('@LinkSpace:user', JSON.stringify(response.data));
  };

  const signOut = () => {
    setUser(null);
    setEmpresa(null);
    apiService.clearContext();
    localStorage.removeItem('@LinkSpace:user');
  };

  const refreshContext = () => {
    if (user) {
      apiService.setContext(user);
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      empresa,
      empresaId: user?.empresaId || null,
      isAdmin: user?.profile === 'admin',
      isUser: user?.profile === 'usuario',
      loading,
      signIn,
      signUp,
      signOut,
      refreshContext,
    }),
    [user, empresa, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 