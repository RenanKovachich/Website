import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserLayout } from '../layouts/UserLayout';
import UserDashboard from '../pages/User/Dashboard';
import UserSpaces from '../pages/User/Spaces';
import UserReservations from '../pages/User/Reservations';
import UserProfile from '../pages/User/Profile';

const UserRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.profile !== 'usuario') {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="spaces" element={<UserSpaces />} />
        <Route path="reservations" element={<UserReservations />} />
        <Route path="reservations/new/:spaceId" element={<UserReservations />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/usuario" replace />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes; 