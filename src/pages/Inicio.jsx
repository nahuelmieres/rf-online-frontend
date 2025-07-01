import React from 'react';
import { Link } from 'react-router-dom';

const Inicio = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-4">
        ¡Bienvenido a RF Online!
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        Accedé a tus planificaciones, entrenadores y más, todo desde un solo lugar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Planes */}
        <Link
          to="/planes"
          className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-lg border-l-4 border-orange-500 p-6 transition-all hover:translate-y-[-4px]"
        >
          <h3 className="text-xl font-semibold text-orange-500 dark:text-orange-400 mb-3">
            Ver Planes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Mirá tus planificaciones activas y próximas rutinas.
          </p>
        </Link>

        {/* Card Entrenadores */}
        <Link
          to="/entrenadores"
          className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-lg border-l-4 border-orange-500 p-6 transition-all hover:translate-y-[-4px]"
        >
          <h3 className="text-xl font-semibold text-orange-500 dark:text-orange-400 mb-3">
            Tus Entrenadores
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Conocé quién te guía y cómo contactarlo.
          </p>
        </Link>

        {/* Card Cuenta */}
        <Link
          to="/cuenta"
          className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-lg border-l-4 border-orange-500 p-6 transition-all hover:translate-y-[-4px]"
        >
          <h3 className="text-xl font-semibold text-orange-500 dark:text-orange-400 mb-3">
            Mi Cuenta
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gestioná tus datos y el estado de tu suscripción.
          </p>
        </Link>
      </div>
    </section>
  );
};

export default Inicio;