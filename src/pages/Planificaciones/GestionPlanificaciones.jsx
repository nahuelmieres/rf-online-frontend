import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';

const GestionPlanificaciones = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [planificaciones, setPlanificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [planSeleccionada, setPlanSeleccionada] = useState('');
  const [asignando, setAsignando] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const { usuario } = useAuth();

  const obtenerDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const [resUsuarios, resPlanes] = await Promise.all([
        fetch('/api/usuarios/clientes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }),
        fetch('/api/planificaciones', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })
      ]);

      if (!resUsuarios.ok || !resPlanes.ok) {
        const errorData = await resUsuarios.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al obtener datos');
      }

      const dataUsuarios = await resUsuarios.json();
      const dataPlanes = await resPlanes.json();

      // Ordenar usuarios: primero los sin planificación
      const usuariosOrdenados = (dataUsuarios.data?.usuarios || []).sort((a, b) => {
        if (!a.planificacion && b.planificacion) return -1;
        if (a.planificacion && !b.planificacion) return 1;
        return 0;
      });

      setUsuarios(usuariosOrdenados);
      setPlanificaciones(dataPlanes);
    } catch (e) {
      console.error('Error al obtener datos:', e);
      setError(e.message || 'No se pudieron cargar los datos');
      mostrarNotificacion('error', e.message || 'Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const asignarPlanificacion = async (idUsuario) => {
    try {
      if (!planSeleccionada) {
        mostrarNotificacion('advertencia', 'Seleccioná una planificación primero');
        return;
      }

      setAsignando(true);

      const res = await fetch(`/api/usuarios/asignar-plan/${idUsuario}/planificacion/${planSeleccionada}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al asignar planificación');
      }

      mostrarNotificacion('exito', 'Planificación asignada correctamente');
      await obtenerDatos();
    } catch (err) {
      console.error('Error al asignar planificación:', err);
      mostrarNotificacion('error', err.message || 'No se pudo asignar la planificación');
    } finally {
      setAsignando(false);
    }
  };

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 5000);
  };

  const obtenerNombrePlanificacion = (idPlanificacion) => {
    if (!idPlanificacion) return 'Sin planificación asignada';
    const plan = planificaciones.find(p => p._id === idPlanificacion);
    return plan?.titulo || 'Planificación desconocida';
  };

  // Filtrar usuarios según el término de búsqueda
  const usuariosFiltrados = usuarios.filter(user => {
    const searchTerm = terminoBusqueda.toLowerCase();
    return (
      user.nombre.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      obtenerNombrePlanificacion(user.planificacion).toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    obtenerDatos();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded">
          <X size={18} />
          <span>{error}</span>
          <button
            onClick={obtenerDatos}
            className="ml-2 text-orange-600 dark:text-orange-400 hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onCerrar={() => setNotificacion(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Asignar Planificaciones
        {usuario?.rol === 'admin' && (
          <span className="ml-2 text-sm font-normal bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
            Modo Administrador
          </span>
        )}
      </h1>

      {/* Barra de búsqueda */}
      <div className="mb-6 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios por nombre, email o planificación..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-gray-100"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
          {terminoBusqueda && (
            <button
              onClick={() => setTerminoBusqueda('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Selector de planificación */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Seleccioná una planificación para asignar
        </label>
        <select
          value={planSeleccionada}
          onChange={(e) => setPlanSeleccionada(e.target.value)}
          className="w-full border px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">-- Seleccioná una planificación --</option>
          {planificaciones.map(plan => (
            <option
              key={plan._id}
              value={plan._id}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {plan.titulo} ({plan.tipo})
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Planificación actual</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Asignar</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr
                key={usuario._id}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                  <a
                    href={`/perfil/${usuario._id}`}
                    className="text-orange-600 dark:text-orange-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {usuario.nombre}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{usuario.email}</td>
                <td className="px-4 py-3">
                  {usuario.planificacion ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="text-green-500 dark:text-green-400" size={16} />
                      <span className="text-gray-800 dark:text-gray-200">
                        {obtenerNombrePlanificacion(usuario.planificacion)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Sin planificación asignada</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => asignarPlanificacion(usuario._id)}
                    disabled={asignando || !planSeleccionada}
                    className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${asignando || !planSeleccionada
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                  >
                    {asignando ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Asignando...
                      </>
                    ) : (
                      'Asignar'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionPlanificaciones;