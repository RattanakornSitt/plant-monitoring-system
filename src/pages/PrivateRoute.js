// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../pages/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
