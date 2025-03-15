import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // Use the auth context instead of directly accessing localStorage
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state if authentication status is still being determined
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/Login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
