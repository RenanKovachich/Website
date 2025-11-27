import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RequireRole } from '../components/RequireAuth';
import { MainLayout } from '../components/Layout/MainLayout';
import { CircularProgress, Box } from '@mui/material';

// Imports diretos para evitar problemas de chunks
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminSpaces from '../pages/Admin/Spaces';
import AdminReservations from '../pages/Admin/Reservations';
import AdminUsers from '../pages/Admin/Users';
import AdminProfile from '../pages/Admin/Profile';
import UserDashboard from '../pages/User/Dashboard';
import UserSpaces from '../pages/User/Spaces';
import UserReservations from '../pages/User/Reservations';
import UserProfile from '../pages/User/Profile';

// Componente de loading
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="50vh"
  >
    <CircularProgress />
  </Box>
);

const AppRoutes: React.FC = () => {

  return (
    <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas do admin com redirect canônico */}
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <MainLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="spaces" element={<AdminSpaces />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Rotas do usuário com redirect canônico */}
        <Route
          path="/usuario"
          element={
            <RequireRole role="usuario">
              <MainLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/usuario/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="spaces" element={<UserSpaces />} />
          <Route path="reservations" element={<UserReservations />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/usuario/dashboard" replace />} />
        </Route>

        {/* Rota 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
};

export { AppRoutes }; 