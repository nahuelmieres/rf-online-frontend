import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Search, AlertTriangle, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Notificacion from '../../components/Notificacion';
import SmartLink from '../../components/SmartLink/SmartLink';
import ModalVerSolicitud from '../../components/ModalVerSolicitud'; // Importamos el modal

const GestionPlanificaciones = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [planificaciones, setPlanificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [planSeleccionada, setPlanSeleccionada] = useState('');
  const [asignando, setAsignando] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Estados para el modal
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);
  
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
        fetch('/api/planificaciones?categoria=personalizada', {
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

      // Ordenar usuarios: primero los que tienen planRequest y NO tienen planPersonalizado
      const usuariosOrdenados = (dataUsuarios.data?.usuarios || []).sort((a, b) => {
        const aPendiente = a.planRequest && !a.planPersonalizado;
        const bPendiente = b.planRequest && !b.planPersonalizado;
        
        if (aPendiente && !bPendiente) return -1;
        if (!aPendiente && bPendiente) return 1;
        
        if (!a.planPersonalizado && b.planPersonalizado) return -1;
        if (a.planPersonalizado && !b.planPersonalizado) return 1;
        
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

  // Función para abrir el modal con la solicitud
  const abrirModalSolicitud = async (usuario) => {
    try {
      setCargandoSolicitud(true);
      
      const res = await fetch(`/api/usuarios/plan-requests/${usuario._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Error al cargar la solicitud');
      }

      const data = await res.json();
      
      setSolicitudSeleccionada(data.planRequest);
      setUsuarioSeleccionado(usuario);
      setModalSolicitudAbierto(true);
    } catch (error) {
      console.error('Error al cargar solicitud:', error);
      mostrarNotificacion('error', 'No se pudo cargar la solicitud');
    } finally {
      setCargandoSolicitud(false);
    }
  };

  const asignarPlanificacion = async (idUsuario) => {
    try {
      if (!planSeleccionada) {
        mostrarNotificacion('advertencia', 'SELECCIONÁ UNA PLANIFICACIÓN PRIMERO');
        return;
      }

      setAsignando(true);

      console.log(`Asignando planificación ${planSeleccionada} al usuario ${idUsuario}`);
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

  const obtenerEstadoUsuario = (user) => {
    if (user.planRequest && !user.planPersonalizado) {
      return 'pendiente';
    } else if (user.planPersonalizado) {
      return 'completado';
    } else {
      return 'sin-solicitud';
    }
  };

  const usuariosFiltrados = usuarios.filter(user => {
    const searchTerm = terminoBusqueda.toLowerCase();
    const estado = obtenerEstadoUsuario(user);
    
    if (filtroEstado === 'pendientes' && estado !== 'pendiente') return false;
    if (filtroEstado === 'completados' && estado !== 'completado') return false;
    if (filtroEstado === 'sin-solicitud' && estado !== 'sin-solicitud') return false;
    
    return (
      user.nombre?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      obtenerNombrePlanificacion(user.planPersonalizado).toLowerCase().includes(searchTerm)
    );
  });

  const contadores = {
    todos: usuarios.length,
    pendientes: usuarios.filter(user => obtenerEstadoUsuario(user) === 'pendiente').length,
    completados: usuarios.filter(user => obtenerEstadoUsuario(user) === 'completado').length,
    'sin-solicitud': usuarios.filter(user => obtenerEstadoUsuario(user) === 'sin-solicitud').length
  };

  const getRowStyles = (user) => {
    const estado = obtenerEstadoUsuario(user);
    switch (estado) {
      case 'pendiente': return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500 font-bold';
      case 'completado': return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500';
      case 'sin-solicitud': return 'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-l-gray-300';
      default: return '';
    }
  };

  const getEstadoIcon = (user) => {
    const estado = obtenerEstadoUsuario(user);
    switch (estado) {
      case 'pendiente': return <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={16} />;
      case 'completado': return <UserCheck className="text-green-600 dark:text-green-400" size={16} />;
      default: return null;
    }
  };

  const getEstadoText = (user) => {
    const estado = obtenerEstadoUsuario(user);
    switch (estado) {
      case 'pendiente': return 'SOLICITUD PENDIENTE';
      case 'completado': return 'PLAN ASIGNADO';
      case 'sin-solicitud': return 'SIN SOLICITUD';
      default: return '';
    }
  };

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
          onClose={() => setNotificacion(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">
            ASIGNAR PLANIFICACIONES PERSONALIZADAS
          </h1>
          {usuario?.rol === 'admin' && (
            <span className="px-3 py-1 border-2 border-black dark:border-gray-600 text-sm font-bold">
              MODO ADMINISTRADOR
            </span>
          )}
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-8 space-y-4">
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

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-2 border-2 font-bold text-sm shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
              filtroEstado === 'todos'
                ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                : 'border-gray-400 text-gray-600 dark:text-gray-400 bg-white dark:bg-black'
            }`}
          >
            TODOS ({contadores.todos})
          </button>
          <button
            onClick={() => setFiltroEstado('pendientes')}
            className={`px-4 py-2 border-2 font-bold text-sm shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
              filtroEstado === 'pendientes'
                ? 'border-yellow-600 bg-yellow-600 text-white'
                : 'border-yellow-500 text-yellow-600 dark:text-yellow-500 bg-white dark:bg-black'
            }`}
          >
            PENDIENTES ({contadores.pendientes})
          </button>
          <button
            onClick={() => setFiltroEstado('completados')}
            className={`px-4 py-2 border-2 font-bold text-sm shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
              filtroEstado === 'completados'
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-green-500 text-green-600 dark:text-green-500 bg-white dark:bg-black'
            }`}
          >
            COMPLETADOS ({contadores.completados})
          </button>
          <button
            onClick={() => setFiltroEstado('sin-solicitud')}
            className={`px-4 py-2 border-2 font-bold text-sm shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
              filtroEstado === 'sin-solicitud'
                ? 'border-gray-600 bg-gray-600 text-white'
                : 'border-gray-500 text-gray-600 dark:text-gray-500 bg-white dark:bg-black'
            }`}
          >
            SIN SOLICITUD ({contadores['sin-solicitud']})
          </button>
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
          className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none shadow-hard"
        >
          <option value="">-- SELECCIONÁ UNA PLANIFICACIÓN --</option>
          {planificaciones.map(plan => (
            <option key={plan._id} value={plan._id} className="bg-white dark:bg-black">
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
              <th className="px-4 py-3 text-left text-lg font-bold">ESTADO</th>
              <th className="px-4 py-3 text-left text-lg font-bold">PLANIFICACIÓN ACTUAL</th>
              <th className="px-4 py-3 text-left text-lg font-bold">ASIGNAR</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr
                key={usuario._id}
                className={`border-b border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 transition-colors ${getRowStyles(usuario)}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <SmartLink
                      to={`/perfil/${usuario._id}`}
                      className="font-bold hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {usuario.nombre?.toUpperCase()}
                    </SmartLink>
                    {usuario.planRequest && (
                      <button
                        onClick={() => abrirModalSolicitud(usuario)}
                        disabled={cargandoSolicitud}
                        className="text-xs border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white px-2 py-1 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cargandoSolicitud ? 'CARGANDO...' : 'VER SOLICITUD'}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{usuario.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getEstadoIcon(usuario)}
                    <span className="font-medium">{getEstadoText(usuario)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {usuario.planPersonalizado ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="text-green-500" size={16} />
                      <span>{obtenerNombrePlanificacion(usuario.planPersonalizado)}</span>
                    </span>
                  ) : (
                    <span className="text-red-500 dark:text-red-400 font-medium">
                      SIN PLANIFICACIÓN PERSONALIZADA
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => asignarPlanificacion(usuario._id)}
                    disabled={asignando || !planSeleccionada || usuario.planPersonalizado}
                    className={`px-4 py-2 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                      asignando || !planSeleccionada || usuario.planPersonalizado
                        ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                        : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 hover:border-green-600 hover:text-white'
                    }`}
                  >
                    {asignando ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        ASIGNANDO...
                      </span>
                    ) : usuario.planPersonalizado ? (
                      'YA ASIGNADO'
                    ) : (
                      'ASIGNAR'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-8 border-2 border-black dark:border-gray-600 border-t-0">
            <p className="text-lg font-medium">
              {terminoBusqueda || filtroEstado !== 'todos' 
                ? 'NO SE ENCONTRARON USUARIOS CON LOS FILTROS APLICADOS'
                : 'NO HAY USUARIOS PARA MOSTRAR'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal para ver solicitud */}
      <ModalVerSolicitud
        isOpen={modalSolicitudAbierto}
        onClose={() => {
          setModalSolicitudAbierto(false);
          setSolicitudSeleccionada(null);
          setUsuarioSeleccionado(null);
        }}
        planRequest={solicitudSeleccionada}
        usuario={usuarioSeleccionado}
        onAsignarPlanificacion={asignarPlanificacion}
      />
    </div>
  );
};

export default GestionPlanificaciones;