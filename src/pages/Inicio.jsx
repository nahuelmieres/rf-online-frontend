import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Dumbbell, User, ArrowRight } from 'lucide-react';

const Inicio = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          REAL FORCE <span className="text-primary-light dark:text-primary-dark">ONLINE</span>
        </h2>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto font-medium">
          TU ENTRENAMIENTO COMIENZA ACÁ. ACCEDÉ A TUS RUTINAS, CONECTÁ CON ENTRENADORES Y GESTIONÁ TU PROGRESO.
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
        {/* Card Planes */}
        <Link
          to="/planes"
          className="card p-8 group border-2 border-black dark:border-gray-600 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Calendar className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-2xl font-bold">
              PLANES
            </h3>
          </div>
          <p className="text-lg mb-6">
            MIRÁ TU PLANIFICACIÓN ACTIVA Y PRÓXIMAS RUTINAS.
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold">VER MÁS</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card Entrenadores */}
        <Link
          to="/entrenadores"
          className="card p-8 group border-2 border-black dark:border-gray-600 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <User className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-2xl font-bold">
              PROFES
            </h3>
          </div>
          <p className="text-lg mb-6">
            CONOCÉ QUIÉN TE GUÍA Y CÓMO CONTACTARLO.
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold">VER MÁS</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Card Cuenta */}
        <Link
          to="/cuenta"
          className="card p-8 group border-2 border-black dark:border-gray-600 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Dumbbell className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-2xl font-bold">
              MI CUENTA
            </h3>
          </div>
          <p className="text-lg mb-6">
            GESTIONÁ TUS DATOS Y EL ESTADO DE TU SUSCRIPCIÓN.
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold">VER MÁS</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Inicio;