import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const RutaPrivada = ({ rolesPermitidos = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader className="h-screen" />;
  }

  // Si no está autenticado, redirige al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles definidos y el usuario no tiene uno permitido
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(user.rol)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
            Acceso no autorizado
          </h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Si pasa todas las validaciones
  return <Outlet />;
};

export default RutaPrivada;