import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';
import { User, UserCheck, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const GestionUsuarios = () => {
  const { user, loading: authLoading } = useAuth();

  // Estados del componente
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [rolesFiltrados, setRolesFiltrados] = useState(['admin', 'coach', 'cliente']);
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    tipo: 'success',
    mensaje: ''
  });

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

      // Preparo los parámetros de consulta
      const queryParams = new URLSearchParams({
        page: paginacion.page,
        limit: paginacion.limit,
      });

      // Agrego búsqueda global (search) si hay filtro
      if (filtro && filtro.trim() !== '') {
        queryParams.append('search', filtro.trim()); // Cambiado de 'busqueda' a 'search'
      }

      // Agrego filtros de rol (el backend espera 'rol')
      rolesFiltrados.forEach(rol => {
        if (rol && rol.trim() !== '') {
          queryParams.append('rol', rol.trim());
        }
      });

      // Podría agregar también filtro por estadoPago si lo necesitamos
      // queryParams.append('estadoPago', estadoFiltro);

      console.log('Parámetros enviados al backend:', queryParams.toString());

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
      console.log('Respuesta del backend:', result);

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


  // Cambio el rol de usuario
  const cambiarRol = async (userId, nuevoRol) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/cambiar-rol`, {
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
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
            Acceso no autorizado
          </h2>
          <p className="text-red-700 dark:text-red-300 mt-2">
            {!user ? 'No autenticado' : `Rol actual: ${user.rol} (Se requiere administrador)`}
          </p>
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <UserCheck className="text-blue-500" />
          Administración de Usuarios
        </h1>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {(paginacion.page - 1) * paginacion.limit + 1}-
          {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de {paginacion.total} usuarios
        </div>
      </div>

      {/* Sección de filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Búsqueda por texto */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
            className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
          >
            <span>Filtrar por rol</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${menuFiltrosAbierto ? 'rotate-180' : ''}`}
            />
          </button>

          {menuFiltrosAbierto && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
              onMouseLeave={() => setMenuFiltrosAbierto(false)}
            >
              <div className="p-2 space-y-2">
                {['admin', 'coach', 'cliente'].map((rol) => (
                  <label key={rol} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={rolesFiltrados.includes(rol)}
                      onChange={() => toggleFiltroRol(rol)}
                      className="rounded h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span className="capitalize dark:text-gray-200">
                      {rol === 'cliente' ? 'Cliente' : rol === 'coach' ? 'Entrenador' : 'Administrador'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cambiar Rol
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {usuarios.length > 0 ? (
                usuarios.map((usuario) => (
                  <tr key={usuario._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {usuario.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Registrado: {new Date(usuario.fechaRegistro).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.estadoPago
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {usuario.estadoPago ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.rol === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : usuario.rol === 'coach'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {usuario.rol === 'cliente' ? 'Cliente' : usuario.rol === 'coach' ? 'Entrenador' : 'Administrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <select
                        value={usuario.rol}
                        onChange={(e) => cambiarRol(usuario._id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                        disabled={usuario._id === user.id}
                      >
                        <option value="admin">Administrador</option>
                        <option value="coach">Entrenador</option>
                        <option value="cliente">Cliente</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <Search className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No se encontraron usuarios</p>
                      <p className="text-sm mt-1">Prueba ajustando los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {paginacion.totalPaginas > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="flex-1 flex justify-between sm:justify-end items-center gap-4">
              <button
                onClick={() => cambiarPagina(paginacion.page - 1)}
                disabled={paginacion.page === 1}
                className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
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
                      className={`px-3 py-1 border text-sm font-medium rounded-md transition-colors ${pageNum === paginacion.page
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <span className="text-sm text-gray-700 dark:text-gray-300 mx-2 sm:hidden">
                Página {paginacion.page} de {paginacion.totalPaginas}
              </span>

              <button
                onClick={() => cambiarPagina(paginacion.page + 1)}
                disabled={paginacion.page >= paginacion.totalPaginas}
                className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

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