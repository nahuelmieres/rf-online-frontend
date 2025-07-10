import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inicio from '../pages/Inicio';
import Login from "../pages/Login";
import Planes from '../pages/Planes';
import Entrenadores from '../pages/Entrenadores/Entrenadores';
import Cuenta from '../pages/Cuenta';
import GestionUsuarios from '../pages/Usuarios/GestionUsuarios';
import RutaPrivada from '../components/RutaPrivada';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Públicas */}
            <Route path="/login" element={<Login />} />

            {/* Privadas */}
            <Route element={<RutaPrivada />}>
                <Route path="/" element={<Inicio />} />
                <Route path="/planes" element={<Planes />} />
                <Route path="/entrenadores" element={<Entrenadores />} />
                <Route path="/cuenta" element={<Cuenta />} />

                {/* Nueva ruta de gestión - Solo accesible para admin */}
                <Route
                    path="/gestion/usuarios"
                    element={
                        <GestionUsuarios />
                    }
                />
            </Route>
        </Routes>
    );
};

export default AppRoutes;