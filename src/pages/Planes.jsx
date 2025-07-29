import React, { useEffect, useState } from 'react';
import { Dumbbell, Calendar, AlertTriangle, Loader2, Plus, Zap, ZapOff, Coffee, MessageSquare, Edit2, Trash2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Planes = () => {
  const [planData, setPlanData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [comentarios, setComentarios] = useState({});
  const [nuevosComentarios, setNuevosComentarios] = useState({});
  const [editandoComentario, setEditandoComentario] = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');

  useEffect(() => {
    const obtenerPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No estás autenticado');

        // Obtener perfil
        const resPerfil = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/perfil`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resPerfil.ok) throw new Error('Error al obtener el perfil');
        const { data: perfilData } = await resPerfil.json();

        if (perfilData.planificacion) {
          // Obtener todos los comentarios del usuario para esta planificación primero
          const resComentarios = await fetch(
            `${import.meta.env.VITE_API_URL}/api/comentarios?` + new URLSearchParams({
              planificacion: perfilData.planificacion.id,
              idUsuario: perfilData.usuario.id
            }),
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          let comentariosData = {};
          if (resComentarios.ok) {
            const { data } = await resComentarios.json();
            
            // Organizar comentarios por semana y día
            data.forEach(comentario => {
              const key = `${comentario.semana}-${comentario.dia}`;
              comentariosData[key] = comentario;
            });
          }

          // Obtener planificación
          const resPlan = await fetch(`${import.meta.env.VITE_API_URL}/api/planificaciones/${perfilData.planificacion.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!resPlan.ok) throw new Error('Error al obtener la planificación');
          const { data: planificacionData } = await resPlan.json();

          setPlanData({
            usuario: perfilData.usuario,
            planificacion: planificacionData
          });
          setComentarios(comentariosData);
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

  const manejarNuevoComentario = (diaNombre, semanaNumero) => {
    return async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      const key = `${semanaNumero}-${diaNombre}`;
      const texto = nuevosComentarios[key];

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            planificacion: planData.planificacion._id,
            semana: semanaNumero,
            dia: diaNombre,
            texto
          })
        });

        if (res.ok) {
          const { data } = await res.json();
          setComentarios(prev => ({
            ...prev,
            [`${semanaNumero}-${diaNombre}`]: data
          }));
          setNuevosComentarios(prev => {
            const nuevos = { ...prev };
            delete nuevos[key];
            return nuevos;
          });
        }
      } catch (err) {
        console.error('Error al crear comentario:', err);
      }
    };
  };

  const manejarEditarComentario = async () => {
    if (!editandoComentario) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${editandoComentario._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texto: editandoTexto
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        const key = `${data.semana}-${data.dia}`;
        setComentarios(prev => ({
          ...prev,
          [key]: data
        }));
        setEditandoComentario(null);
        setEditandoTexto('');
      }
    } catch (err) {
      console.error('Error al editar comentario:', err);
    }
  };

  const manejarEliminarComentario = async (comentarioId, semanaNumero, diaNombre) => {
    const token = localStorage.getItem('token');
    const key = `${semanaNumero}-${diaNombre}`;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${comentarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        setComentarios(prev => {
          const nuevos = { ...prev };
          delete nuevos[key];
          return nuevos;
        });
      }
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
    }
  };

  if (cargando) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
      <p className="mt-4 text-lg font-medium">CARGANDO TU PLAN...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center border-2 border-black dark:border-gray-600 bg-white dark:bg-black mx-6 my-8">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">ERROR AL CARGAR EL PLAN</h3>
      <p className="text-lg mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
      >
        REINTENTAR
      </button>
    </div>
  );

  const { usuario, planificacion } = planData || {};

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b-2 border-black dark:border-gray-600 pb-6">
        <div className="flex items-center gap-4">
          <Dumbbell className="w-8 h-8 text-primary-light dark:text-primary-dark" />
          <h2 className="text-3xl font-extrabold tracking-tight">
            TU PLAN DE ENTRENAMIENTO
          </h2>
        </div>
        {(usuario?.rol === 'admin' || usuario?.rol === 'coach') && (
          <Link
            to="/crear-plan"
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-600 shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>NUEVO PLAN</span>
          </Link>
        )}
      </div>

      {!planificacion ? (
        <div className="border-2 border-black dark:border-gray-600 p-8 text-center">
          <p className="text-xl mb-6">
            NO TENÉS UN PLAN ACTIVO ACTUALMENTE.
          </p>
          <Link
            to="/solicitar-plan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-600 shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            SOLICITAR UN PLAN PERSONALIZADO
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Plan Header */}
          <div className="border-2 border-black dark:border-gray-600 p-8">
            <h3 className="text-2xl font-bold mb-4">
              {planificacion.titulo}
            </h3>
            <p className="text-lg mb-6">{planificacion.descripcion}</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-600">
                {planificacion.tipo.toUpperCase()}
              </span>
              <div className="flex items-center gap-3 text-lg">
                <Calendar className="w-5 h-5" />
                <span>{planificacion.totalSemanas} SEMANAS • {planificacion.totalBloques} RUTINAS • {planificacion.totalDescansos} DESCANSO</span>
              </div>
            </div>
          </div>

          {/* Semanas */}
          {planificacion.semanas?.map((semana) => (
            <div key={semana.numero} className="border-2 border-black dark:border-gray-600 p-8">
              <h4 className="text-xl font-bold mb-8">
                SEMANA {semana.numero}
              </h4>

              <div className="space-y-8">
                {semana.dias?.map((dia) => {
                  const comentarioKey = `${semana.numero}-${dia.nombre}`;
                  const comentario = comentarios[comentarioKey];

                  return (
                    <div key={dia._id} className="border-b-2 border-black dark:border-gray-600 pb-8 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-4 mb-6">
                        <h5 className="text-lg font-bold">
                          {dia.nombre.toUpperCase()}
                        </h5>
                        {dia.descanso && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-medium">
                            <Coffee className="w-5 h-5" />
                            DÍA DE DESCANSO
                          </span>
                        )}
                      </div>

                      {!dia.descanso && dia.bloquesPoblados?.length > 0 ? (
                        <div className="space-y-6">
                          {dia.bloquesPoblados.map((bloque) => (
                            <div key={bloque._id} className="border-2 border-black dark:border-gray-600 p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                                <span className="font-bold">
                                  {bloque.tipo === 'ejercicios' ? 'RUTINA DE EJERCICIOS' : 'NOTAS'}
                                </span>
                              </div>

                              {bloque.tipo === 'ejercicios' ? (
                                <div className="space-y-4">
                                  {bloque.ejercicios?.map((ejercicio, index) => (
                                    <div key={index} className="border-2 border-black dark:border-gray-600 p-4">
                                      <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                          <h6 className="text-lg font-bold mb-2">{ejercicio.nombre.toUpperCase()}</h6>
                                          <div className="flex flex-wrap gap-6">
                                            <span className="font-medium">
                                              SERIES: {ejercicio.series}
                                            </span>
                                            <span className="font-medium">
                                              REPS: {ejercicio.repeticiones}
                                            </span>
                                            {ejercicio.peso && (
                                              <span className="font-medium">
                                                PESO: {ejercicio.peso}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {ejercicio.linkVideo && (
                                          <a
                                            href={ejercicio.linkVideo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0"
                                          >
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              width="24" 
                                              height="24" 
                                              viewBox="0 0 24 24" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="2" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                              className="text-primary-light dark:text-primary-dark hover:text-black dark:hover:text-white transition-colors"
                                            >
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
                                <p className="text-lg whitespace-pre-line">
                                  {bloque.contenidoTexto}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : !dia.descanso ? (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800">
                          <ZapOff className="w-5 h-5" />
                          <span className="font-medium">NO HAY EJERCICIOS ASIGNADOS</span>
                        </div>
                      ) : null}

                      {/* Comentarios */}
                      <div className="mt-8">
                        <div className="flex items-center gap-3 mb-4">
                          <MessageSquare className="w-5 h-5" />
                          <h6 className="font-bold">COMENTARIOS</h6>
                        </div>

                        {editandoComentario?.dia === dia.nombre && editandoComentario?.semana === semana.numero ? (
                          <div className="space-y-4">
                            <textarea
                              value={editandoTexto}
                              onChange={(e) => setEditandoTexto(e.target.value)}
                              className="w-full p-4 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg"
                              rows="4"
                              placeholder="ESCRIBE TU COMENTARIO..."
                            />
                            <div className="flex gap-4">
                              <button
                                onClick={manejarEditarComentario}
                                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-600 shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                              >
                                GUARDAR
                              </button>
                              <button
                                onClick={() => setEditandoComentario(null)}
                                className="px-6 py-3 bg-white dark:bg-black text-black dark:text-white font-bold border-2 border-black dark:border-gray-600 shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                              >
                                CANCELAR
                              </button>
                            </div>
                          </div>
                        ) : comentario ? (
                          <div className="border-2 border-black dark:border-gray-600 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <p className="text-lg whitespace-pre-line">
                                {comentario.texto}
                              </p>
                              {comentario.autor?._id === usuario?.id && (
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => {
                                      setEditandoComentario(comentario);
                                      setEditandoTexto(comentario.texto);
                                    }}
                                    className="text-gray-500 hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                                    title="Editar comentario"
                                  >
                                    <Edit2 className="w-6 h-6" />
                                  </button>
                                  <button
                                    onClick={() => manejarEliminarComentario(comentario._id, semana.numero, dia.nombre)}
                                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    title="Eliminar comentario"
                                  >
                                    <Trash2 className="w-6 h-6" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {comentario.respuesta && (
                              <div className="mt-6 pl-6 border-l-4 border-primary-light dark:border-primary-dark">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="font-bold text-primary-light dark:text-primary-dark">{comentario.respuesta.autor.nombre.toUpperCase()}:</span>
                                </div>
                                <p className="text-lg whitespace-pre-line">
                                  {comentario.respuesta.texto}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <form onSubmit={manejarNuevoComentario(dia.nombre, semana.numero)} className="space-y-4">
                            <textarea
                              value={nuevosComentarios[comentarioKey] || ''}
                              onChange={(e) => setNuevosComentarios(prev => ({
                                ...prev,
                                [comentarioKey]: e.target.value
                              }))}
                              className="w-full p-4 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg"
                              rows="4"
                              placeholder="ESCRIBE UN COMENTARIO SOBRE ESTE DÍA..."
                            />
                            <button
                              type="submit"
                              disabled={!nuevosComentarios[comentarioKey]?.trim()}
                              className="flex items-center gap-3 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-600 shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-5 h-5" />
                              <span>ENVIAR COMENTARIO</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Planes;