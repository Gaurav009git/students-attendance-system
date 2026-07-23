import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (role && user && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'} />;
  }
  
  return children;
}

export default PrivateRoute;