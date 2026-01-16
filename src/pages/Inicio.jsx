import React from 'react';
import { Calendar, Dumbbell, User, Clock } from 'lucide-react';
import SmartLink from '../components/SmartLink/SmartLink';

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

      {/* Cards Section - 1 columna hasta 768px, 2 columnas hasta 1280px, 4 columnas en 1280px+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 md:px-0">
        {/* Card Planes */}
        <SmartLink
          to="/planes"
          className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Calendar className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-xl font-bold">
              PLANES
            </h3>
          </div>
          <p className="text-base mb-4">
            MIRÁ TU PLANIFICACIÓN ACTIVA Y PRÓXIMAS RUTINAS.
          </p>
          <div className="flex items-center gap-2 mt-auto text-sm font-bold">
            <span>VER MÁS</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </SmartLink>

        {/* Card Entrenadores */}
        <SmartLink
          to="/entrenadores"
          className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <User className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-xl font-bold">
              PROFES
            </h3>
          </div>
          <p className="text-base mb-4">
            CONOCÉ QUIÉN TE GUÍA Y CÓMO CONTACTARLO.
          </p>
          <div className="flex items-center gap-2 mt-auto text-sm font-bold">
            <span>VER MÁS</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </SmartLink>

        {/* Card Cuenta */}
        <SmartLink
          to="/cuenta"
          className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Dumbbell className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-xl font-bold">
              MI CUENTA
            </h3>
          </div>
          <p className="text-base mb-4">
            GESTIONÁ TUS DATOS Y EL ESTADO DE TU SUSCRIPCIÓN.
          </p>
          <div className="flex items-center gap-2 mt-auto text-sm font-bold">
            <span>VER MÁS</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </SmartLink>

        {/* Card Reservas */}
        <SmartLink
          to="/reservar"
          className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
              <Clock className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="text-xl font-bold">
              RESERVAS
            </h3>
          </div>
          <p className="text-base mb-4">
            RESERVÁ TU CLASE O ENTRENAMIENTO EN EL GIMNASIO.
          </p>
          <div className="flex items-center gap-2 mt-auto text-sm font-bold">
            <span>VER MÁS</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </SmartLink>
      </div>
    </section>
  );
};

export default Inicio;