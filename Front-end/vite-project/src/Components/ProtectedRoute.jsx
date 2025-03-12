import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/Login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
