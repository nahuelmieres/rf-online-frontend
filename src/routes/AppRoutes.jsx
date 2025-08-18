import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import ForgotPassword  from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ForoPlanificacion from '../pages/Planificaciones/ForoPlanificacion';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/terminos" element={<TerminosCondiciones />} />
            <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Privadas */}
            <Route element={<RutaPrivada />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/planes" element={<Planes />} />
                <Route path="/planificacion/:id" element={<Planificacion />} />
                <Route path="/entrenadores" element={<Entrenadores />} />
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/reservar" element={<ReservaForm />} />
                <Route path="/mis-reservas" element={<MisReservas />} />
                <Route path="/gestion/reservas" element={<GestionReservas />} />
                <Route path="/planificacion/:idPlanificacion/foro" element={<ForoPlanificacion />} />

                {/* Nueva ruta de gestión */}
                <Route
                    path="/gestion/usuarios"
                    element={
                        <GestionUsuarios />
                    }
                />
                <Route
                    path="/gestion/planificaciones"
                    element={
                        <GestionPlanificaciones />
                    }
                />
                <Route
                    path="/crear-plan"
                    element={
                        <CrearPlanificacion />
                    }
                />
                <Route
                    path="/suscripcion"
                    element={
                        <Suscripcion />
                    }
                />
                {/* Nueva ruta dinámica para perfiles */}
                <Route path="/perfil/:userId" element={<PerfilUsuario />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;