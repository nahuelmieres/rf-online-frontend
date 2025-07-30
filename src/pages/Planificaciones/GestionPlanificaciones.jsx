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
        mostrarNotificacion('advertencia', 'SELECCIONÁ UNA PLANIFICACIÓN PRIMERO');
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

      mostrarNotificacion('success', 'PLANIFICACIÓN ASIGNADA CORRECTAMENTE');
      await obtenerDatos();
    } catch (err) {
      console.error('Error al asignar planificación:', err);
      mostrarNotificacion('error', err.message || 'NO SE PUDO ASIGNAR LA PLANIFICACIÓN');
    } finally {
      setAsignando(false);
    }
  };

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 5000);
  };

  const obtenerNombrePlanificacion = (idPlanificacion) => {
    if (!idPlanificacion) return 'SIN PLANIFICACIÓN ASIGNADA';
    const plan = planificaciones.find(p => p._id === idPlanificacion);
    return plan?.titulo?.toUpperCase() || 'PLANIFICACIÓN DESCONOCIDA';
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
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
        <p className="mt-4 text-lg font-medium">CARGANDO DATOS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-8 text-center">
        <X className="mx-auto w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500 mb-4">ERROR</h2>
        <p className="text-lg mb-6">{error}</p>
        <button
          onClick={obtenerDatos}
          className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 md:p-8">
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onCerrar={() => setNotificacion(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">
            ASIGNAR PLANIFICACIONES
          </h1>
          {usuario?.rol === 'admin' && (
            <span className="px-3 py-1 border-2 border-black dark:border-gray-600 text-sm font-bold">
              MODO ADMINISTRADOR
            </span>
          )}
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-8 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-black dark:text-white" />
          </div>
          <input
            type="text"
            placeholder="BUSCAR USUARIOS POR NOMBRE, EMAIL O PLANIFICACIÓN..."
            className="block w-full pl-10 pr-3 py-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none text-lg"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
          />
          {terminoBusqueda && (
            <button
              onClick={() => setTerminoBusqueda('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-black dark:text-white hover:text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Selector de planificación */}
      <div className="mb-8">
        <label className="block text-lg font-bold mb-2">
          SELECCIONÁ UNA PLANIFICACIÓN PARA ASIGNAR
        </label>
        <select
          value={planSeleccionada}
          onChange={(e) => setPlanSeleccionada(e.target.value)}
          className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
        >
          <option value="">-- SELECCIONÁ UNA PLANIFICACIÓN --</option>
          {planificaciones.map(plan => (
            <option
              key={plan._id}
              value={plan._id}
              className="bg-white dark:bg-black"
            >
              {plan.titulo?.toUpperCase()} ({plan.tipo?.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-black dark:border-gray-600">
          <thead>
            <tr className="border-b-2 border-black dark:border-gray-600">
              <th className="px-4 py-3 text-left text-lg font-bold">USUARIO</th>
              <th className="px-4 py-3 text-left text-lg font-bold">EMAIL</th>
              <th className="px-4 py-3 text-left text-lg font-bold">PLANIFICACIÓN ACTUAL</th>
              <th className="px-4 py-3 text-left text-lg font-bold">ASIGNAR</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr
                key={usuario._id}
                className="border-b border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
              >
                <td className="px-4 py-3">
                  <a
                    href={`/perfil/${usuario._id}`}
                    className="font-bold hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {usuario.nombre?.toUpperCase()}
                  </a>
                </td>
                <td className="px-4 py-3">{usuario.email}</td>
                <td className="px-4 py-3">
                  {usuario.planificacion ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="text-green-500" size={16} />
                      <span>
                        {obtenerNombrePlanificacion(usuario.planificacion)}
                      </span>
                    </span>
                  ) : (
                    <span>SIN PLANIFICACIÓN ASIGNADA</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => asignarPlanificacion(usuario._id)}
                    disabled={asignando || !planSeleccionada}
                    className={`px-4 py-2 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                      asignando || !planSeleccionada
                        ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                        : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                    }`}
                  >
                    {asignando ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        ASIGNANDO...
                      </span>
                    ) : (
                      'ASIGNAR'
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