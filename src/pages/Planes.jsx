import React, { useEffect, useState } from 'react';
import { Dumbbell, Calendar, AlertTriangle, Loader2, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Planes = () => {
  const [planData, setPlanData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No estás autenticado');

        const res = await fetch('http://localhost:3000/api/usuarios/perfil', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al obtener el perfil');
        }

        const { data } = await res.json();
        console.log('Datos recibidos:', data); // Para debug
        setPlanData(data);

      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar el plan');
      } finally {
        setCargando(false);
      }
    };

    obtenerPlan();
  }, []);

  if (cargando) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tu plan...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error al cargar el plan</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="text-orange-500 dark:text-orange-400 hover:underline"
      >
        Reintentar
      </button>
    </div>
  );

  const { usuario, planificacion } = planData || {};

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Tu Plan de Entrenamiento
          </h2>
        </div>
        {usuario?.rol === 'admin' && (
          <Link 
            to="/crear-plan"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Plan</span>
          </Link>
        )}
      </div>

      {!planificacion ? (
        <div className="card p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tenés un plan activo actualmente.
          </p>
          <Link
            to="/solicitar-plan"
            className="inline-flex items-center gap-2 text-orange-500 dark:text-orange-400 hover:underline"
          >
            Solicitar un plan personalizado
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumen del Plan */}
          <div className="card p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {planificacion.titulo}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs px-3 py-1 rounded-full capitalize">
                    {planificacion.tipo}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{planificacion.semanas?.length || 0} semanas</span>
                  </div>
                </div>
              </div>
              <Link
                to={`/mi-plan`}
                className="flex items-center gap-1 text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition"
              >
                <span>Ver detalles completos</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Listado de Semanas */}
          {planificacion.semanas?.map((semana) => (
            <div key={semana.numero} className="card p-6">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Semana {semana.numero}
              </h4>

              {semana.bloques?.map((bloque) => (
                <div key={bloque.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-orange-500 dark:text-orange-400">
                      {bloque.tipo === 'ejercicios' ? 'Rutina de ejercicios' : 'Notas'}
                    </span>
                  </div>
                  
                  {bloque.tipo === 'ejercicios' ? (
                    <div className="space-y-3">
                      {bloque.contenido?.map((ejercicio, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h5 className="font-medium text-gray-800 dark:text-white">{ejercicio.nombre}</h5>
                          <div className="flex flex-wrap gap-4 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Series: {ejercicio.series}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Reps: {ejercicio.repeticiones}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Peso: {ejercicio.peso}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {bloque.contenido}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Planes;