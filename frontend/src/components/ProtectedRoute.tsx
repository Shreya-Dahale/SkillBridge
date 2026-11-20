import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from './AppLayout';

// Auth bypass: ProtectedRoute no longer checks login.
// All routes are freely accessible.
export const ProtectedRoute: React.FC = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default ProtectedRoute;
