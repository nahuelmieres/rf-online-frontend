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

          {planificacion.semanas?.map((semana) => (
            <div key={semana.numero} className="card p-6">
              <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
                Semana {semana.numero}
              </h4>

              <div className="space-y-6">
                {semana.dias?.map((dia) => {
                  const comentarioKey = `${semana.numero}-${dia.nombre}`;
                  const comentario = comentarios[comentarioKey];

                  return (
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

                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios</h6>
                        </div>

                        {editandoComentario?.dia === dia.nombre && editandoComentario?.semana === semana.numero ? (
                          <div className="space-y-3">
                            <textarea
                              value={editandoTexto}
                              onChange={(e) => setEditandoTexto(e.target.value)}
                              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                              rows="3"
                              placeholder="Escribe tu comentario..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={manejarEditarComentario}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditandoComentario(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : comentario ? (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                {comentario.texto}
                              </p>
                              {comentario.autor?._id === usuario?.id && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setEditandoComentario(comentario);
                                      setEditandoTexto(comentario.texto);
                                    }}
                                    className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                    title="Editar comentario"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => manejarEliminarComentario(comentario._id, semana.numero, dia.nombre)}
                                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    title="Eliminar comentario"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {comentario.respuesta && (
                              <div className="mt-4 pl-4 border-l-2 border-orange-500 dark:border-orange-400">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-orange-500 dark:text-orange-400">Entrenador:</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                  {comentario.respuesta.texto}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <form onSubmit={manejarNuevoComentario(dia.nombre, semana.numero)} className="space-y-3">
                            <textarea
                              value={nuevosComentarios[comentarioKey] || ''}
                              onChange={(e) => setNuevosComentarios(prev => ({
                                ...prev,
                                [comentarioKey]: e.target.value
                              }))}
                              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                              rows="3"
                              placeholder="Escribe un comentario sobre este día..."
                            />
                            <button
                              type="submit"
                              disabled={!nuevosComentarios[comentarioKey]?.trim()}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                              <span>Enviar comentario</span>
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