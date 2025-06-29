import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Inicio = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-orange-500 mb-4">¡Bienvenido a RF Online!</h2>
      <p className="text-gray-700 mb-6">
        Accedé a tus planificaciones, entrenadores y más, todo desde un solo lugar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Link a planes */}
        <Link
          to="/planes"
          className="bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-xl p-6 transition-all"
        >
          <h3 className="text-lg font-semibold text-orange-600 mb-2">Ver Planes</h3>
          <p className="text-sm text-gray-600">Mirá tus planificaciones activas y próximas rutinas.</p>
        </Link>

        {/* Link a entrenadores */}
        <Link
          to="/entrenadores"
          className="bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-xl p-6 transition-all"
        >
          <h3 className="text-lg font-semibold text-orange-600 mb-2">Tus Entrenadores</h3>
          <p className="text-sm text-gray-600">Conocé quién te guía y cómo contactarlo.</p>
        </Link>

        {/* Link a cuenta */}
        <Link
          to="/cuenta"
          className="bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-xl p-6 transition-all"
        >
          <h3 className="text-lg font-semibold text-orange-600 mb-2">Mi Cuenta</h3>
          <p className="text-sm text-gray-600">Gestioná tus datos y el estado de tu suscripción.</p>
        </Link>
      </div>
    </section>
  );
};

export default Inicio;