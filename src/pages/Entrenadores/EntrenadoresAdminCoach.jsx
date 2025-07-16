import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Dumbbell, Edit, Trash2, Check, Search } from 'lucide-react';
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

      const nombre = (bloque.nombre || '').toLowerCase();
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card p-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Autenticación requerida
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            Necesitas iniciar sesión para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline bg-white dark:bg-gray-800"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Loader className="h-64" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
          <Dumbbell className="text-orange-500" />
          {user.rol === 'admin' ? 'Administración de Bloques' : 'Mis Bloques'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Bloques */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar bloques..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  setModoEdicion(null);
                  setMostrarModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-md"
              >
                <Plus size={18} />
                Nuevo Bloque
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bloquesFiltrados.map(bloque => {
                if (!bloque || !bloque._id) return null;

                const ejercicios = Array.isArray(bloque.ejercicios) ? bloque.ejercicios : [];
                const esTipoEjercicios = bloque.tipo === 'ejercicios';

                return (
                  <div
                    key={bloque._id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${seleccionados.includes(bloque._id)
                      ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700'
                      : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}
                    onClick={() => toggleSeleccion(bloque._id)}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {bloque.titulo || 'Bloque sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {esTipoEjercicios
                        ? `${ejercicios.length} ejercicios`
                        : 'Notas/Instrucciones'}
                    </p>

                    {esTipoEjercicios ? (
                      <div className="mt-2 space-y-1">
                        {ejercicios.slice(0, 3).map((ej, index) => {
                          if (!ej || typeof ej !== 'object') return null;
                          return (
                            <p key={index} className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              • {ej.nombre || 'Ejercicio sin nombre'}
                              {(ej.series && ej.repeticiones)
                                ? ` (${ej.series}x${ej.repeticiones})`
                                : ''}
                            </p>
                          );
                        })}
                        {ejercicios.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{ejercicios.length - 3} más...
                          </p>
                        )}
                      </div>
                    ) : (
                      bloque.contenidoTexto && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {bloque.contenidoTexto}
                          </p>
                        </div>
                      )
                    )}

                    {/* Etiquetas (compartidas para ambos tipos) */}
                    {Array.isArray(bloque.etiquetas) && bloque.etiquetas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {bloque.etiquetas.map((etiqueta, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs px-2 py-0.5 rounded-full"
                          >
                            #{etiqueta}
                          </span>
                        ))}
                      </div>
                    )}


                    {!esCreador(bloque) && bloque.creadoPor?.nombre && (
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                        Creado por: {bloque.creadoPor.nombre}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {bloquesFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {filtro ? 'No hay bloques con ese criterio' : 'No hay bloques disponibles'}
              </div>
            )}
          </div>

          {/* Panel de Asignación */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Asignar a Planificación</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seleccionar Planificación
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={planificacionSeleccionada || ''}
                    onChange={(e) => setPlanificacionSeleccionada(e.target.value)}
                  >
                    <option value="">Selecciona una planificación</option>
                    {planificaciones.map(plan => (
                      <option key={plan._id} value={plan._id}>
                        {plan.titulo} ({plan.tipo}) - Creada por: {plan.creadoPor?.nombre || 'Desconocido'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Semana
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={semanaSeleccionada}
                      onChange={(e) => setSemanaSeleccionada(parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>Semana {num}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Día
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={diaSeleccionado}
                      onChange={(e) => setDiaSeleccionado(e.target.value)}
                    >
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {seleccionados.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                      Bloques seleccionados ({seleccionados.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {bloques
                        .filter(b => b && seleccionados.includes(b._id))
                        .map(bloque => (
                          <div
                            key={bloque._id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{bloque.nombre}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {Array.isArray(bloque.ejercicios) ? bloque.ejercicios.length : 0} ejercicios
                              </p>
                            </div>
                            <button
                              onClick={() => toggleSeleccion(bloque._id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={asignarBloquesAPlanificacion}
                  disabled={!planificacionSeleccionada || seleccionados.length === 0}
                  className={`w-full mt-4 px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${!planificacionSeleccionada || seleccionados.length === 0
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                >
                  <Check size={18} />
                  Asignar Bloques
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para crear/editar bloques */}
        <Modal
          isOpen={mostrarModal}
          onClose={() => setMostrarModal(false)}
          title={modoEdicion ? 'Editar Bloque' : 'Crear Nuevo Bloque'}
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

        {/* Notificación centrada */}
        {notificacion.mostrar && (
          <Notificacion
            tipo={notificacion.tipo}
            titulo={notificacion.titulo}
            mensaje={notificacion.mensaje}
            tiempo={notificacion.tiempo}
            onClose={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
            mostrarBarra={notificacion.tiempo > 0}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EntrenadoresAdminCoach;