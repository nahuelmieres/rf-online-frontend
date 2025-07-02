import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Dumbbell, User, ArrowRight } from 'lucide-react';

const Inicio = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12 px-4">
        <h2 className="text-3xl font-bold text-gym-orange dark:text-primary-dark mb-3">
          ¡Bienvenido a RF Online!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Accedé a tus planificaciones, entrenadores y más, todo desde un solo lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Card Planes */}
        <Link
          to="/planes"
          className="card group p-6" /* Padding interno aumentado */
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
              <Calendar className="w-6 h-6 text-gym-orange dark:text-orange-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Planes
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Mirá tus planificaciones activas y próximas rutinas.
          </p>
          <div className="flex items-center text-gym-orange dark:text-orange-300 mt-auto">
            <span className="text-sm font-medium">Ver más</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card Entrenadores */}
        <Link
          to="/entrenadores"
          className="card group p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
              <User className="w-6 h-6 text-gym-orange dark:text-orange-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Entrenadores
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Conocé quién te guía y cómo contactarlo.
          </p>
          <div className="flex items-center text-gym-orange dark:text-orange-300 mt-auto">
            <span className="text-sm font-medium">Ver más</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card Cuenta */}
        <Link
          to="/cuenta"
          className="card group p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
              <Dumbbell className="w-6 h-6 text-gym-orange dark:text-orange-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Mi Cuenta
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Gestioná tus datos y el estado de tu suscripción.
          </p>
          <div className="flex items-center text-gym-orange dark:text-orange-300 mt-auto">
            <span className="text-sm font-medium">Ver más</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Inicio;