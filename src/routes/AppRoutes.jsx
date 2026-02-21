import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import Inicio from '../pages/Inicio';
import Login from "../pages/Login";
import Planes from '../pages/Planificaciones/Planes';
import Planificacion from '../pages/Planificaciones/DetallePlanificacion';
import Entrenadores from '../pages/Entrenadores/Entrenadores';
import Cuenta from '../pages/Cuenta';
import GestionUsuarios from '../pages/Usuarios/GestionUsuarios';
import GestionPlanificaciones from '../pages/Planificaciones/GestionPlanificaciones';
import RutaPrivada from '../components/RutaPrivada';
import Registro from '../pages/Registro';
import CrearPlanificacion from '../pages/Planificaciones/CrearPlanificacion';
import Suscripcion from '../pages/Pagos/Suscripcion';
import PerfilUsuario from '../pages/Usuarios/PerfilUsuario';
import TerminosCondiciones from '../pages/TerminosCondiciones';
import ReservaForm from '../pages/Reservas/ReservaForm';
import MisReservas from '../pages/Reservas/MisReservas';
import GestionReservas from '../pages/Reservas/GestionReservas';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ForoPlanificacion from '../pages/Planificaciones/ForoPlanificacion';
import { ChatPage } from '@/features/chat';
import Loader from '@/components/Loader';

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <Loader className="h-screen" />;

  return (
    <Routes>
      {/* ============================================ */}
      {/* RUTAS PÚBLICAS */}
      {/* ============================================ */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route 
        path="/registro" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Registro />}
      />
      <Route path="/terminos" element={<TerminosCondiciones />} />
      <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ============================================ */}
      {/* RUTAS PRIVADAS - NO REQUIEREN SUSCRIPCIÓN */}
      {/* ============================================ */}
      <Route element={<RutaPrivada requireSubscription={false} />}>
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/suscripcion" element={<Suscripcion />} />
      </Route>

      {/* ============================================ */}
      {/* RUTAS PRIVADAS - REQUIEREN SUSCRIPCIÓN */}
      {/* (Clientes sin suscripción activa serán redirigidos a /suscripcion) */}
      {/* ============================================ */}
      <Route element={<RutaPrivada />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/planificacion/:id" element={<Planificacion />} />
        <Route path="/planificacion/:idPlanificacion/foro" element={<ForoPlanificacion />} />
        <Route path="/entrenadores" element={<Entrenadores />} />
        <Route path="/reservar" element={<ReservaForm />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        
        {/* Chat */}
        <Route
          path="/chat"
          element={<ChatPage userId={user?.id} userRole={user?.rol} />}
        />
      </Route>

      {/* ============================================ */}
      {/* RUTAS DE ADMINISTRACIÓN */}
      {/* (Solo Admin y Coach) */}
      {/* ============================================ */}
      <Route element={<RutaPrivada rolesPermitidos={['admin', 'coach']} />}>
        <Route path="/gestion/usuarios" element={<GestionUsuarios />} />
        <Route path="/gestion/planificaciones" element={<GestionPlanificaciones />} />
        <Route path="/gestion/reservas" element={<GestionReservas />} />
        <Route path="/crear-plan" element={<CrearPlanificacion />} />
        <Route path="/perfil/:userId" element={<PerfilUsuario />} />
      </Route>

      {/* ============================================ */}
      {/* FALLBACK */}
      {/* ============================================ */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;