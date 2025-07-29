import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Dumbbell, AlertCircle, Trash2, Check, Search, Link, Loader2,
  Edit2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import FormularioBloque from '../../components/FormularioBloque';
import ErrorBoundary from '../../components/ErrorBoundary';
import Notificacion from '../../components/Notificacion';

const EntrenadoresAdminCoach = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, isAuthenticated } = useAuth();
  const [bloques, setBloques] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [planificacionSeleccionada, setPlanificacionSeleccionada] = useState(null);
  const [planificaciones, setPlanificaciones] = useState([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);
  const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: 'success',
    titulo: '',
    mensaje: '',
    tiempo: 5000
  });
  const [creandoBloque, setCreandoBloque] = useState(false);

  // Muestro una notificación al usuario
  const mostrarNotificacion = (tipo, titulo, mensaje, tiempo = 5000) => {
    setNotificacion({
      mostrar: true,
      tipo,
      titulo,
      mensaje,
      tiempo
    });
  };

  // Obtengo todas las planificaciones del usuario
  const obtenerPlanificaciones = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No encuentro el token de autenticación');
      }

      const res = await fetch(`${API_URL}/api/planificaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener planificaciones`);
      }

      const planificaciones = await res.json();
      return Array.isArray(planificaciones) ? planificaciones : [];
    } catch (error) {
      console.error('Error al obtener planificaciones:', error);
      mostrarNotificacion(
        'error',
        'Error al cargar',
        error.message || 'No puedo cargar las planificaciones'
      );
      return [];
    }
  }, [API_URL]);

  // Obtengo todos los bloques de entrenamiento
  const obtenerBloques = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No encuentro el token de autenticación');
      }

      const res = await fetch(`${API_URL}/api/bloques`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        throw new Error('La sesión expiró, por favor inicia sesión nuevamente');
      }

      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener bloques`);
      }

      const { data } = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener bloques:', error);
      throw error;
    }
  }, [API_URL]);

  // Cargo los datos necesarios para el componente
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      if (!isAuthenticated) {
        throw new Error('Necesitas iniciar sesión para acceder a esta página');
      }

      const [bloquesData, planificacionesData] = await Promise.all([
        obtenerBloques().catch(e => {
          console.error("Error cargando bloques:", e);
          mostrarNotificacion(
            'error',
            'Error al cargar',
            e.message || 'No puedo cargar los bloques'
          );
          return [];
        }),
        obtenerPlanificaciones().catch(e => {
          console.error("Error cargando planificaciones:", e);
          mostrarNotificacion(
            'error',
            'Error al cargar',
            e.message || 'No puedo cargar las planificaciones'
          );
          return [];
        })
      ]);

      setBloques(Array.isArray(bloquesData) ? bloquesData : []);
      setPlanificaciones(Array.isArray(planificacionesData) ? planificacionesData : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated, obtenerBloques, obtenerPlanificaciones]);

  useEffect(() => {
    if (isAuthenticated) {
      cargarDatos();
    }
  }, [isAuthenticated, cargarDatos]);

  // Filtro los bloques según el criterio de búsqueda
  const bloquesFiltrados = useMemo(() => {
    const palabrasClave = (filtro || '')
      .toLowerCase()
      .split(' ')
      .filter(p => p.trim() !== '');

    return bloques.filter(bloque => {
      if (!bloque || typeof bloque !== 'object') return false;

      const nombre = (bloque.titulo || '').toLowerCase();
      const tipo = bloque.tipo || '';
      const etiquetas = Array.isArray(bloque.etiquetas) ? bloque.etiquetas.map(e => e.toLowerCase()) : [];
      const ejercicios = Array.isArray(bloque.ejercicios) ? bloque.ejercicios : [];

      return palabrasClave.every(palabra =>
        nombre.includes(palabra) ||
        etiquetas.some(tag => tag.includes(palabra)) ||
        (tipo === 'ejercicios' &&
          ejercicios.some(ej =>
            ej &&
            typeof ej === 'object' &&
            (ej.nombre || '').toLowerCase().includes(palabra)
          )
        )
      );
    });
  }, [bloques, filtro]);


  // Verifico si el usuario es el creador del bloque
  const esCreador = useCallback((bloque) => {
    if (!bloque || !bloque.creadoPor || !user) return false;
    return bloque.creadoPor === user.id || user.rol === 'admin';
  }, [user]);

  // Manejo la selección/deselección de bloques
  const toggleSeleccion = useCallback((id) => {
    if (!id) return;
    setSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  // Creo un nuevo bloque de entrenamiento
  const crearBloque = async (bloqueData) => {
    try {
      setCreandoBloque(true);
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarNotificacion(
          'error',
          'Error de autenticación',
          'Necesitas iniciar sesión para realizar esta acción',
          8000
        );
        return;
      }

      // Valido y formateo los datos del bloque
      const bloqueValidado = {
        titulo: bloqueData.nombre?.trim() || 'Nuevo bloque',
        tipo: bloqueData.tipo || 'ejercicios',
        creadoPor: user.id,
        ...(bloqueData.tipo === 'texto' && {
          contenidoTexto: bloqueData.contenidoTexto?.trim() || '',
        }),
        ...(bloqueData.tipo === 'ejercicios' && {
          ejercicios: Array.isArray(bloqueData.ejercicios)
            ? bloqueData.ejercicios.filter(e => e).map(e => ({
              nombre: e.nombre?.trim() || 'Ejercicio sin nombre',
              series: parseInt(e.series) || 0,
              repeticiones: e.repeticiones?.toString() || '0',
              ...(e.peso && { peso: e.peso.toString() }),
              ...(e.linkVideo && { linkVideo: e.linkVideo.toString() })
            }))
            : [],
        }),
        etiquetas: bloqueData.etiquetas || []
      };


      const res = await fetch(`${API_URL}/api/bloques`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bloqueValidado)
      });

      // Manejo la respuesta del servidor
      const responseData = await res.text();
      let data;

      try {
        data = responseData ? JSON.parse(responseData) : {};
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status} al crear bloque`);
      }

      // Preparo el nuevo bloque para el estado
      const nuevoBloque = {
        ...(data.data || data),
        _id: data.data?._id || data._id || Math.random().toString(36).substring(2),
        nombre: data.data?.nombre || data.nombre || 'Nuevo bloque',
        ejercicios: Array.isArray(data.data?.ejercicios)
          ? data.data.ejercicios
          : Array.isArray(data.ejercicios)
            ? data.ejercicios
            : []
      };

      setBloques(prev => [...prev, nuevoBloque]);

      mostrarNotificacion(
        'success',
        'Bloque creado',
        `"${nuevoBloque.nombre}" fue creado exitosamente`
      );
      setMostrarModal(false);

      // Actualizo la lista de bloques para asegurar consistencia
      const bloquesActualizados = await obtenerBloques();
      setBloques(bloquesActualizados);

    } catch (err) {
      console.error('Error al crear bloque:', err);
      mostrarNotificacion(
        'error',
        'Error al crear',
        err.message || 'No puedo crear el bloque',
        8000
      );
    } finally {
      setCreandoBloque(false);
    }
  };

  // Actualizo un bloque existente
  const actualizarBloque = async (bloqueData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarNotificacion(
          'error',
          'Error de autenticación',
          'Necesitas iniciar sesión para realizar esta acción',
          8000
        );
        return;
      }

      const res = await fetch(`${API_URL}/api/bloques/${bloqueData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bloqueData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar bloque');
      }

      const { data } = await res.json();
      setBloques(prev => prev.map(b => b._id === data._id ? {
        ...data,
        ejercicios: Array.isArray(data.ejercicios) ? data.ejercicios : []
      } : b));

      mostrarNotificacion(
        'success',
        'Actualización exitosa',
        `El bloque "${data.nombre}" fue actualizado correctamente`
      );

      setModoEdicion(null);
      setMostrarModal(false);
    } catch (err) {
      console.error('Error al actualizar bloque:', err);
      mostrarNotificacion(
        'error',
        'Error al actualizar',
        err.message || 'No puedo guardar los cambios',
        8000
      );
    }
  };

  // Elimino un bloque existente
  const eliminarBloque = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarNotificacion(
          'error',
          'Error de autenticación',
          'Necesitas iniciar sesión para realizar esta acción',
          8000
        );
        return;
      }

      const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este bloque permanentemente?');
      if (!confirmar) return;

      const res = await fetch(`${API_URL}/api/bloques/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar bloque');
      }

      const bloqueAEliminar = bloques.find(b => b._id === id);
      const nombreBloque = bloqueAEliminar?.nombre || 'Bloque';

      setBloques(prev => prev.filter(b => b._id !== id));

      mostrarNotificacion(
        'success',
        'Eliminación exitosa',
        `"${nombreBloque}" fue eliminado permanentemente`
      );

      if (modoEdicion === id) {
        setModoEdicion(null);
        setMostrarModal(false);
      }
    } catch (err) {
      console.error('Error al eliminar bloque:', err);
      mostrarNotificacion(
        'error',
        'Error al eliminar',
        err.message || 'No puedo eliminar el bloque',
        8000
      );
    }
  };

  // Asigno bloques a una planificación específica
  const asignarBloquesAPlanificacion = async () => {
    if (!planificacionSeleccionada) {
      mostrarNotificacion(
        'error',
        'Falta planificación',
        'Debes seleccionar una planificación primero',
        8000
      );
      return;
    }

    if (seleccionados.length === 0) {
      mostrarNotificacion(
        'error',
        'No hay bloques',
        'Selecciona al menos un bloque para asignar',
        8000
      );
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Necesitas iniciar sesión');

      mostrarNotificacion(
        'info',
        'Procesando',
        `Asignando ${seleccionados.length} bloque(s)...`,
        0
      );

      let asignacionesExitosas = 0;
      const errores = [];

      for (const bloqueId of seleccionados) {
        try {
          const response = await fetch(
            `${API_URL}/api/planificaciones/${planificacionSeleccionada}/semanas/${semanaSeleccionada}/dias`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                idBloque: bloqueId,
                dia: diaSeleccionado
              })
            }
          );

          // Manejo específico de errores de referencia inválida
          if (response.status === 400) {
            const errorData = await response.json();
            if (errorData.message && errorData.message.includes('no existen')) {
              // Limpiar referencias inválidas en el frontend
              setPlanificaciones(prev => prev.map(p => {
                if (p._id === planificacionSeleccionada) {
                  return limpiarPlanificacion(p);
                }
                return p;
              }));
              throw new Error('Referencias inválidas detectadas. Intente nuevamente');
            }
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al asignar bloque');
          }

          const result = await response.json();
          console.log('Bloque asignado:', result);
          asignacionesExitosas++;
        } catch (error) {
          console.error(`Error asignando bloque ${bloqueId}:`, error);
          errores.push(`• ${error.message}`);
        }
      }

      const [nuevosBloques, nuevasPlanificaciones] = await Promise.all([
        obtenerBloques(),
        obtenerPlanificaciones()
      ]);

      setBloques(nuevosBloques);
      setPlanificaciones(nuevasPlanificaciones);
      setSeleccionados([]);

      if (errores.length === 0) {
        mostrarNotificacion(
          'success',
          '¡Éxito!',
          `${asignacionesExitosas} bloque(s) asignado(s) a ${diaSeleccionado}`
        );
      } else if (asignacionesExitosas > 0) {
        mostrarNotificacion(
          'warning',
          'Resultado parcial',
          `${asignacionesExitosas} éxito(s), ${errores.length} error(es):\n${errores.join('\n')}`,
          10000
        );
      } else {
        mostrarNotificacion(
          'error',
          'Error en asignación',
          `Ningún bloque pudo asignarse:\n${errores.join('\n')}`,
          10000
        );
      }

    } catch (error) {
      console.error('Error general:', error);
      mostrarNotificacion(
        'error',
        'Error crítico',
        error.message || 'Ocurrió un error inesperado',
        10000
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-8 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">AUTENTICACIÓN REQUERIDA</h2>
        <p className="text-lg mb-6">NECESITAS INICIAR SESIÓN PARA ACCEDER A ESTA PÁGINA</p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          IR A INICIAR SESIÓN
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-8 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500 mb-4">ERROR</h2>
        <p className="text-lg mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          RECARGAR PÁGINA
        </button>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
        <p className="mt-4 text-lg font-medium">CARGANDO DATOS...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
            <Dumbbell className="w-6 h-6 text-white dark:text-black" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user.rol === 'admin' ? 'ADMINISTRACIÓN DE BLOQUES' : 'MIS BLOQUES'}
          </h1>
        </div>
        <button
          onClick={() => {
            setModoEdicion(null);
            setMostrarModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>NUEVO BLOQUE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Bloques */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="BUSCAR BLOQUES..."
              className="pl-10 w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloquesFiltrados.map(bloque => {
              if (!bloque || !bloque._id) return null;

              const ejercicios = Array.isArray(bloque.ejercicios) ? bloque.ejercicios : [];
              const esTipoEjercicios = bloque.tipo === 'ejercicios';

              return (
                <div
                  key={bloque._id}
                  className={`border-2 p-4 transition-all cursor-pointer ${
                    seleccionados.includes(bloque._id)
                      ? 'border-primary-light dark:border-primary-dark bg-orange-50 dark:bg-orange-900/20'
                      : 'border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5'
                  }`}
                  onClick={() => toggleSeleccion(bloque._id)}
                >
                  <h3 className="text-xl font-bold mb-2">
                    {bloque.titulo?.toUpperCase() || 'BLOQUE SIN NOMBRE'}
                  </h3>
                  <p className="text-lg mb-3">
                    {esTipoEjercicios
                      ? `${ejercicios.length} EJERCICIOS`
                      : 'NOTAS/INSTRUCCIONES'}
                  </p>

                  {esTipoEjercicios && (
                    <div className="space-y-2 mb-3">
                      {ejercicios.slice(0, 3).map((ej, index) => (
                        <p key={index} className="text-sm">
                          • {ej.nombre?.toUpperCase() || 'EJERCICIO SIN NOMBRE'}
                          {(ej.series && ej.repeticiones)
                            ? ` (${ej.series}X${ej.repeticiones})`
                            : ''}
                        </p>
                      ))}
                      {ejercicios.length > 3 && (
                        <p className="text-sm">+{ejercicios.length - 3} MÁS...</p>
                      )}
                    </div>
                  )}

                  {Array.isArray(bloque.etiquetas) && bloque.etiquetas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {bloque.etiquetas.map((etiqueta, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 border-2 border-black dark:border-gray-600 text-xs font-bold"
                        >
                          #{etiqueta.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    {esCreador(bloque) && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModoEdicion(bloque._id);
                            setMostrarModal(true);
                          }}
                          className="p-1 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
                          title="Editar bloque"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarBloque(bloque._id);
                          }}
                          className="p-1 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:bg-opacity-20"
                          title="Eliminar bloque"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {!esCreador(bloque) && bloque.creadoPor?.nombre && (
                      <p className="text-xs">
                        CREADO POR: {bloque.creadoPor.nombre.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {bloquesFiltrados.length === 0 && (
            <div className="border-2 border-black dark:border-gray-600 p-8 text-center">
              <p className="text-xl font-medium">
                {filtro ? 'NO HAY BLOQUES CON ESE CRITERIO' : 'NO HAY BLOQUES DISPONIBLES'}
              </p>
            </div>
          )}
        </div>

        {/* Panel de Asignación */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 border-2 border-black dark:border-gray-600 p-6 bg-white dark:bg-black shadow-hard">
            <h2 className="text-xl font-bold mb-6 border-b-2 border-black dark:border-gray-600 pb-2">
              ASIGNAR A PLANIFICACIÓN
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-2">PLANIFICACIÓN</label>
                <select
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
                  value={planificacionSeleccionada || ''}
                  onChange={(e) => setPlanificacionSeleccionada(e.target.value)}
                >
                  <option value="">SELECCIONA UNA PLANIFICACIÓN</option>
                  {planificaciones.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.titulo?.toUpperCase()} ({plan.tipo?.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold mb-2">SEMANA</label>
                  <select
                    className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
                    value={semanaSeleccionada}
                    onChange={(e) => setSemanaSeleccionada(parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>SEMANA {num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold mb-2">DÍA</label>
                  <select
                    className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
                    value={diaSeleccionado}
                    onChange={(e) => setDiaSeleccionado(e.target.value)}
                  >
                    {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'].map(dia => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
                </div>
              </div>

              {seleccionados.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">
                    BLOQUES SELECCIONADOS ({seleccionados.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {bloques
                      .filter(b => b && seleccionados.includes(b._id))
                      .map(bloque => (
                        <div
                          key={bloque._id}
                          className="flex items-center justify-between p-3 border-2 border-black dark:border-gray-600"
                        >
                          <div>
                            <p className="font-bold">{bloque.nombre?.toUpperCase()}</p>
                            <p className="text-sm">
                              {Array.isArray(bloque.ejercicios) ? bloque.ejercicios.length : 0} EJERCICIOS
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSeleccion(bloque._id);
                            }}
                            className="p-1 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:bg-opacity-20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                onClick={asignarBloquesAPlanificacion}
                disabled={!planificacionSeleccionada || seleccionados.length === 0}
                className={`w-full mt-4 px-6 py-3 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                  !planificacionSeleccionada || seleccionados.length === 0
                    ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                    : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>ASIGNAR BLOQUES</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar bloques */}
      <Modal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        title={modoEdicion ? 'EDITAR BLOQUE' : 'CREAR NUEVO BLOQUE'}
      >
        <FormularioBloque
          bloque={modoEdicion ? bloques.find(b => b._id === modoEdicion) : null}
          onSubmit={modoEdicion ? actualizarBloque : crearBloque}
          onCancel={() => setMostrarModal(false)}
          onDelete={modoEdicion ? () => {
            eliminarBloque(modoEdicion);
            setMostrarModal(false);
          } : null}
          isSubmitting={creandoBloque}
        />
      </Modal>

      {/* Notificación */}
      {notificacion.mostrar && (
        <Notificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          tiempo={notificacion.tiempo}
          onClose={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
        />
      )}
    </div>
    </ErrorBoundary>
  );
};

export default EntrenadoresAdminCoach;