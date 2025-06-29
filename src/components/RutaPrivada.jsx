import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RutaPrivada = () => {
  const { usuario } = useAuth();

  return usuario ? <Outlet /> : <Navigate to="/login" />;
};

export default RutaPrivada;
