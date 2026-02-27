import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';
import {
  User, UserCheck, Search, ChevronDown, ChevronLeft, ChevronRight,
  UserPlus, Copy, DollarSign, Loader2
} from 'lucide-react';

const GestionUsuarios = () => {
  const { user, loading: authLoading } = useAuth();

  // Estados del componente
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [rolesFiltrados, setRolesFiltrados] = useState(['admin', 'coach', 'cliente', 'reservas']);
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: 'success',
    mensaje: ''
  });

  // NUEVO: Estado para modal de crear usuario
  const [modalCrearUsuario, setModalCrearUsuario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '' });
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [passwordGenerada, setPasswordGenerada] = useState(null);

  // Paginación
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPaginas: 1
  });

  // Obtengo usuarios
  const obtenerUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: paginacion.page,
        limit: paginacion.limit,
      });

      if (filtro && filtro.trim() !== '') {
        queryParams.append('search', filtro.trim());
      }

      rolesFiltrados.forEach(rol => {
        if (rol && rol.trim() !== '') {
          queryParams.append('rol', rol.trim());
        }
      });

      const response = await fetch(`/api/usuarios/clientes?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}`);
        } catch (jsonError) {
          const textError = await response.text();
          throw new Error(textError || `Error ${response.status}`);
        }
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Estructura de respuesta inválida');
      }

      setUsuarios(result.data.usuarios || []);
      setPaginacion(prev => ({
        ...prev,
        total: result.data.pagination?.total || 0,
        totalPaginas: Math.ceil((result.data.pagination?.total || 0) / prev.limit),
        page: result.data.pagination?.page || 1,
        limit: result.data.pagination?.limit || prev.limit
      }));

    } catch (err) {
      console.error('Error al obtener usuarios:', err);

      let errorMessage = err.message;
      if (err.message.includes('Unexpected token')) {
        errorMessage = 'Error procesando la respuesta del servidor';
      } else if (err.message.includes('401')) {
        errorMessage = 'Sesión expirada, por favor vuelva a iniciar sesión';
      }

      setError(errorMessage);
      setNotificacion({
        mostrar: true,
        tipo: 'error',
        mensaje: errorMessage
      });
    } finally {
      setCargando(false);
    }
  };

  // NUEVO: Crear usuario de reservas
  const crearUsuarioReservas = async () => {
    try {
      setCreandoUsuario(true);

      const response = await fetch('/api/usuarios/crear-usuario-reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al crear usuario');
      }

      setPasswordGenerada(data.usuario.passwordTemporal);

      setNotificacion({
        mostrar: true,
        tipo: 'success',
        mensaje: 'Usuario creado exitosamente'
      });

      // NO cerrar el modal aquí - dejar que el usuario copie la password
      // obtenerUsuarios(); // NO llamar aquí

    } catch (err) {
      setNotificacion({
        mostrar: true,
        tipo: 'error',
        mensaje: err.message
      });
      setCreandoUsuario(false); // IMPORTANTE: resetear loading en error
    } finally {
      setCreandoUsuario(false);
    }
  };

  // ACTUALIZADO: Cerrar modal y resetear
  const cerrarModal = () => {
    setModalCrearUsuario(false);
    setNuevoUsuario({ nombre: '', email: '' });
    setPasswordGenerada(null);
    setCreandoUsuario(false); // AGREGAR

    // IMPORTANTE: Recargar usuarios solo al cerrar
    obtenerUsuarios();
  };

  // NUEVO: Copiar contraseña
  const copiarPassword = () => {
    navigator.clipboard.writeText(passwordGenerada);
    setNotificacion({
      mostrar: true,
      tipo: 'success',
      mensaje: 'Contraseña copiada al portapapeles'
    });
  };

  // Cambio el rol de usuario
  const cambiarRol = async (userId, nuevoRol) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/rol`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nuevoRol })
      });

      if (!res.ok) throw new Error(await res.text());

      setUsuarios(prev => prev.map(u =>
        u._id === userId ? { ...u, rol: nuevoRol } : u
      ));

      setNotificacion({
        mostrar: true,
        tipo: 'success',
        mensaje: 'Rol actualizado correctamente'
      });

    } catch (err) {
      setNotificacion({
        mostrar: true,
        tipo: 'error',
        mensaje: 'Error al actualizar rol: ' + err.message
      });
    }
  };

  // NUEVO: Toggle pago manual
  const togglePagoManual = async (userId, estadoActual) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/pago-manual`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ pagoManual: !estadoActual })
      });

      if (!res.ok) throw new Error(await res.text());

      setUsuarios(prev => prev.map(u =>
        u._id === userId ? { ...u, pagoManual: !estadoActual } : u
      ));

      setNotificacion({
        mostrar: true,
        tipo: 'success',
        mensaje: `Pago manual ${!estadoActual ? 'activado' : 'desactivado'}`
      });

    } catch (err) {
      setNotificacion({
        mostrar: true,
        tipo: 'error',
        mensaje: 'Error al actualizar pago manual: ' + err.message
      });
    }
  };

  // Alterno filtros por rol
  const toggleFiltroRol = (rol) => {
    setRolesFiltrados(prev =>
      prev.includes(rol)
        ? prev.filter(r => r !== rol)
        : [...prev, rol]
    );
    setPaginacion(prev => ({ ...prev, page: 1 }));
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > paginacion.totalPaginas) return;
    setPaginacion(prev => ({ ...prev, page: nuevaPagina }));
  };

  // Efecto para cargar usuarios
  useEffect(() => {
    if (!authLoading) {
      obtenerUsuarios();
    }
  }, [filtro, rolesFiltrados, paginacion.page, authLoading]);

  // Estados de carga y permisos
  if (authLoading) {
    return <Loader mensaje="Verificando autenticación..." />;
  }

  if (!user || user.rol !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="border-2 border-red-500 dark:border-red-400 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
            Acceso no autorizado
          </h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            {!user ? 'No autenticado' : `Rol actual: ${user.rol} (Se requiere administrador)`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <UserCheck className="text-blue-500" size={24} />
            ADMINISTRACIÓN DE USUARIOS
          </h1>
        </div>

        {/* NUEVO: Botón crear usuario de reservas */}
        <button
          onClick={() => setModalCrearUsuario(true)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 bg-green-500 text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <UserPlus size={20} />
          CREAR USUARIO RESERVAS
        </button>
      </div>

      {/* Contador */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Mostrando {(paginacion.page - 1) * paginacion.limit + 1}-
        {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de {paginacion.total} usuarios
      </div>

      {/* Sección de filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Búsqueda por texto */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="block w-full pl-10 pr-3 py-3 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-black focus:outline-none focus:ring-0 transition-all"
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginacion(prev => ({ ...prev, page: 1 }));
            }}
          />
        </div>

        {/* Filtro por roles */}
        <div className="relative">
          <button
            onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}
            className="inline-flex justify-center items-center gap-2 px-4 py-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors w-full sm:w-auto font-bold"
          >
            <span>FILTRAR POR ROL</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${menuFiltrosAbierto ? 'rotate-180' : ''}`}
            />
          </button>

          {menuFiltrosAbierto && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-black rounded-md shadow-hard border-2 border-black dark:border-gray-600 z-10"
              onMouseLeave={() => setMenuFiltrosAbierto(false)}
            >
              <div className="p-2 space-y-2">
                {['admin', 'coach', 'cliente', 'reservas'].map((rol) => (
                  <label
                    key={rol}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${rolesFiltrados.includes(rol)
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                  >
                    <input
                      type="checkbox"
                      checked={rolesFiltrados.includes(rol)}
                      onChange={() => toggleFiltroRol(rol)}
                      className="rounded h-4 w-4 text-blue-500 focus:ring-0 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                    />
                    <span className="capitalize font-medium dark:text-gray-200">
                      {rol === 'cliente' ? 'Cliente' :
                        rol === 'coach' ? 'Entrenador' :
                          rol === 'reservas' ? 'Solo Reservas' : 'Administrador'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black rounded-lg shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider border-b-2 border-black dark:border-gray-600">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider border-b-2 border-black dark:border-gray-600">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider border-b-2 border-black dark:border-gray-600">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider border-b-2 border-black dark:border-gray-600">
                  Rol Actual
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider border-b-2 border-black dark:border-gray-600">
                  Cambiar Rol
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-200 uppercase tracking-wider border-b-2 border-black dark:border-gray-600">
                  Pago Manual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario._id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-black dark:border-gray-600">
                          <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-bold text-gray-900 dark:text-white">
                            {usuario.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Registrado: {new Date(usuario.fechaRegistro).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 dark:text-gray-300">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-sm font-bold rounded-full ${usuario.estadoPago
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-500 dark:border-green-600'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-2 border-yellow-500 dark:border-yellow-600'
                        }`}>
                        {usuario.estadoPago ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-sm font-bold rounded-full ${usuario.rol === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-2 border-purple-500 dark:border-purple-600'
                          : usuario.rol === 'coach'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-2 border-blue-500 dark:border-blue-600'
                            : usuario.rol === 'reservas'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-2 border-orange-500 dark:border-orange-600'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-500 dark:border-green-600'
                        }`}>
                        {usuario.rol === 'cliente' ? 'Cliente' :
                          usuario.rol === 'coach' ? 'Entrenador' :
                            usuario.rol === 'reservas' ? 'Solo Reservas' : 'Administrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={usuario.rol}
                        onChange={(e) => cambiarRol(usuario._id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2.5 text-base border-2 border-black dark:border-gray-600 focus:outline-none focus:ring-0 sm:text-sm rounded-md bg-white dark:bg-black text-gray-900 dark:text-white"
                        disabled={usuario._id === user.id}
                      >
                        <option value="admin">Administrador</option>
                        <option value="coach">Entrenador</option>
                        <option value="cliente">Cliente</option>
                        <option value="reservas">Solo Reservas</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePagoManual(usuario._id, usuario.pagoManual)}
                        className={`px-3 py-1.5 border-2 font-bold rounded-md transition-all ${usuario.pagoManual
                            ? 'border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'border-gray-400 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                      >
                        <DollarSign className="inline w-4 h-4 mr-1" />
                        {usuario.pagoManual ? 'ACTIVADO' : 'DESACTIVADO'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
                      <Search className="h-16 w-16 mb-4 opacity-60" />
                      <p className="text-xl font-bold">No se encontraron usuarios</p>
                      <p className="text-base mt-2">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {paginacion.totalPaginas > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t-2 border-black dark:border-gray-600 bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 flex justify-between sm:justify-end items-center gap-4">
              <button
                onClick={() => cambiarPagina(paginacion.page - 1)}
                disabled={paginacion.page === 1}
                className="relative inline-flex items-center px-4 py-2 border-2 border-black dark:border-gray-600 text-sm font-bold rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Anterior
              </button>

              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
                  let pageNum;
                  if (paginacion.totalPaginas <= 5) {
                    pageNum = i + 1;
                  } else if (paginacion.page <= 3) {
                    pageNum = i + 1;
                  } else if (paginacion.page >= paginacion.totalPaginas - 2) {
                    pageNum = paginacion.totalPaginas - 4 + i;
                  } else {
                    pageNum = paginacion.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => cambiarPagina(pageNum)}
                      className={`px-4 py-2 border-2 text-sm font-bold rounded-md transition-all shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${pageNum === paginacion.page
                          ? 'bg-black dark:bg-white border-black dark:border-gray-600 text-white dark:text-black'
                          : 'bg-white dark:bg-black border-black dark:border-gray-600 text-black dark:text-white'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <span className="text-sm font-medium text-gray-900 dark:text-gray-300 mx-2 sm:hidden">
                Página {paginacion.page} de {paginacion.totalPaginas}
              </span>

              <button
                onClick={() => cambiarPagina(paginacion.page + 1)}
                disabled={paginacion.page >= paginacion.totalPaginas}
                className="relative inline-flex items-center px-4 py-2 border-2 border-black dark:border-gray-600 text-sm font-bold rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              >
                Siguiente
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NUEVO: Modal crear usuario */}
      {modalCrearUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-black border-2 border-black dark:border-gray-600 rounded-lg shadow-hard max-w-md w-full p-6">
            {!passwordGenerada ? (
              <>
                <h2 className="text-2xl font-extrabold mb-4">CREAR USUARIO DE RESERVAS</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Este usuario solo podrá acceder a las funciones de reservas
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">NOMBRE</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario(prev => ({ ...prev, nombre: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">EMAIL</label>
                    <input
                      type="email"
                      placeholder="usuario@email.com"
                      className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={crearUsuarioReservas}
                    disabled={creandoUsuario || !nuevoUsuario.nombre || !nuevoUsuario.email}
                    className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-600 bg-green-500 text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {creandoUsuario ? (
                      <>
                        <Loader2 className="inline animate-spin mr-2" size={16} />
                        CREANDO...
                      </>
                    ) : 'CREAR USUARIO'}
                  </button>

                  <button
                    onClick={cerrarModal}
                    className="px-4 py-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold mb-4 text-green-600">¡USUARIO CREADO!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Comparte esta contraseña temporal con el usuario:
                </p>

                <div className="bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-gray-600 p-4 rounded mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">CONTRASEÑA TEMPORAL:</p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-2xl font-mono font-bold">{passwordGenerada}</code>
                    <button
                      onClick={copiarPassword}
                      className="p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                      title="Copiar contraseña"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-orange-600 dark:text-orange-400 mb-6">
                  ⚠️ El usuario deberá cambiar esta contraseña en su primer inicio de sesión
                </p>

                <button
                  onClick={cerrarModal}
                  className="w-full px-4 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  ENTENDIDO
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notificación */}
      {notificacion.mostrar && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onClose={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
          tiempo={5000}
        />
      )}
    </div>
  );
};

export default GestionUsuarios;