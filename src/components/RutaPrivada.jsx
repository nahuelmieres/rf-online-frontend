import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loader from './Loader';

const RutaPrivada = ({ rolesPermitidos = [], requireSubscription = true }) => {
  const { user, isAuthenticated, hasActiveSubscription, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader className="h-screen" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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

  // NUEVO: Usuarios de solo reservas solo pueden acceder a rutas de reservas
  if (user.rol === 'reservas') {
    const rutasPermitidas = ['/cuenta', '/reservar', '/mis-reservas'];
    if (!rutasPermitidas.includes(location.pathname)) {
      return <Navigate to="/reservar" replace />;
    }
  }

  // Verificar suscripción (solo para clientes normales, no para reservas)
  if (
    requireSubscription &&
    user.rol === 'cliente' && 
    !hasActiveSubscription && 
    location.pathname !== '/suscripcion'
  ) {
    return <Navigate to="/suscripcion" replace />;
  }

  return <Outlet />;
};

export default RutaPrivada;