import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { LoginFormValues } from '../types';

export const useAuth = () => {
  const { signIn: signInContext, signOut: signOutContext, user } = useAuthContext();
  const navigate = useNavigate();

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await apiService.login({ email, password });
      await signInContext({ email, password });
      return response;
    },
    [signInContext]
  );

  const signOut = useCallback(() => {
    signOutContext();
    navigate('/login');
  }, [signOutContext, navigate]);

  const isAdmin = useCallback(() => {
    return user?.profile === 'admin';
  }, [user]);

  const isUser = useCallback(() => {
    return user?.profile === 'usuario';
  }, [user]);

  return {
    user,
    signIn,
    signOut,
    isAdmin,
    isUser,
  };
}; 