import React, { useEffect, useState } from 'react';
import { Dumbbell, Calendar, AlertTriangle, Loader2, Plus, Zap, ZapOff, Coffee } from 'lucide-react';
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

        // Primero obtenemos el perfil para saber qué planificación tiene el usuario
        const resPerfil = await fetch('http://localhost:3000/api/usuarios/perfil', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resPerfil.ok) {
          throw new Error('Error al obtener el perfil');
        }

        const { data: perfilData } = await resPerfil.json();
        
        // Si tiene planificación, obtenemos los datos completos
        if (perfilData.planificacion) {
          const resPlan = await fetch(`http://localhost:3000/api/planificaciones/${perfilData.planificacion.id}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!resPlan.ok) {
            throw new Error('Error al obtener la planificación');
          }

          const { data: planificacionData } = await resPlan.json();
          setPlanData({
            usuario: perfilData.usuario,
            planificacion: planificacionData
          });
        } else {
          setPlanData({
            usuario: perfilData.usuario,
            planificacion: null
          });
        }

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
        {(usuario?.rol === 'admin' || usuario?.rol === 'coach') && (
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
        <div className="space-y-8">
          {/* Resumen del Plan */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {planificacion.titulo}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{planificacion.descripcion}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs px-3 py-1 rounded-full capitalize">
                {planificacion.tipo}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{planificacion.totalSemanas} semanas • {planificacion.totalBloques} rutinas • {planificacion.totalDescansos} descansos</span>
              </div>
            </div>
          </div>

          {/* Listado de Semanas */}
          {planificacion.semanas?.map((semana) => (
            <div key={semana.numero} className="card p-6">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
                Semana {semana.numero}
              </h4>

              <div className="space-y-6">
                {semana.dias?.map((dia) => (
                  <div key={dia._id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h5 className="text-md font-medium text-gray-800 dark:text-white">
                        {dia.nombre}
                      </h5>
                      {dia.descanso && (
                        <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Coffee className="w-4 h-4" />
                          Día de descanso
                        </span>
                      )}
                    </div>
                    
                    {!dia.descanso && dia.bloquesPoblados?.length > 0 ? (
                      <div className="space-y-4">
                        {dia.bloquesPoblados.map((bloque) => (
                          <div key={bloque._id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                              <span className="font-medium text-orange-500 dark:text-orange-400">
                                {bloque.tipo === 'ejercicios' ? 'Rutina de ejercicios' : 'Notas'}
                              </span>
                            </div>
                            
                            {bloque.tipo === 'ejercicios' ? (
                              <div className="space-y-3">
                                {bloque.ejercicios?.map((ejercicio, index) => (
                                  <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-1">
                                        <h6 className="font-medium text-gray-800 dark:text-white">{ejercicio.nombre}</h6>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                          <span className="text-sm text-gray-600 dark:text-gray-300">
                                            Series: {ejercicio.series}
                                          </span>
                                          <span className="text-sm text-gray-600 dark:text-gray-300">
                                            Reps: {ejercicio.repeticiones}
                                          </span>
                                          {ejercicio.peso && (
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                              Peso: {ejercicio.peso}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {ejercicio.linkVideo && (
                                        <a 
                                          href={ejercicio.linkVideo} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                {bloque.contenidoTexto}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : !dia.descanso ? (
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <ZapOff className="w-4 h-4" />
                        <span>No hay ejercicios asignados</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Planes;