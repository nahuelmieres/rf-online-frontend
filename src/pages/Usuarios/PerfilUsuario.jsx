import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Check, X, Loader2 } from 'lucide-react';
import Loader from '../../components/Loader';

const PerfilUsuario = () => {
    const { userId } = useParams();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
    const [usuario, setUsuario] = useState(null);
    const [planificacion, setPlanificacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!userId || authLoading) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 1. Obtener datos del usuario
                const userRes = await fetch(`/api/usuarios/clientes?id=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!userRes.ok) {
                    const errorData = await userRes.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al cargar usuario');
                }

                const userData = await userRes.json();
                if (!userData.data?.usuarios?.length) {
                    throw new Error('Usuario no encontrado');
                }

                const targetUser = userData.data.usuarios[0];
                setUsuario(targetUser);

                // 2. Obtener planificación si existe
                if (targetUser.planificacion) {
                    const planRes = await fetch(`/api/planificaciones/${targetUser.planificacion}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!planRes.ok) {
                        const errorData = await planRes.json().catch(() => ({}));
                        throw new Error(errorData.message || 'Error al cargar planificación');
                    }

                    const planData = await planRes.json();
                    setPlanificacion(planData.data);
                }
            } catch (err) {
                console.error('Error cargando perfil:', err);
                setError(err.message);
                if (err.message.includes('no encontrado') || err.message.includes('inválido')) {
                    navigate('/gestion/usuarios', { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, isAuthenticated, authLoading, navigate]);

    if (authLoading || loading) {
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
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 text-orange-600 dark:text-orange-400 hover:underline"
                >
                    Recargar página
                </button>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="text-center mt-8">
                <p className="text-gray-600 dark:text-gray-400">No se encontraron datos del usuario</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Sección de información del usuario */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Información del Usuario
                    {currentUser?.id === usuario._id && (
                        <span className="ml-2 text-sm font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Tú
                        </span>
                    )}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300">Nombre:</p>
                        <p className="text-gray-800 dark:text-white font-medium">{usuario.nombre}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-300">Email:</p>
                        <p className="text-gray-800 dark:text-white font-medium">{usuario.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-300">Rol:</p>
                        <p className="text-gray-800 dark:text-white font-medium capitalize">{usuario.rol}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-300">Estado de pago:</p>
                        <div className="flex items-center gap-1">
                            {usuario.estadoPago ? (
                                <Check className="text-green-500 dark:text-green-400" size={18} />
                            ) : (
                                <X className="text-red-500 dark:text-red-400" size={18} />
                            )}
                            <span className="text-gray-800 dark:text-white font-medium">
                                {usuario.estadoPago ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de planificación */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Planificación Asignada
                </h2>
                
                {planificacion ? (
                    <div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                {planificacion.titulo} ({planificacion.tipo})
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">{planificacion.descripcion}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Creada por: {planificacion.creadoPor?.nombre || 'Desconocido'} 
                                ({planificacion.creadoPor?.rol || 'Sin rol'})
                            </p>
                        </div>
                        
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Resumen:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Semanas</p>
                                    <p className="font-medium">{planificacion.totalSemanas || 0}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Días</p>
                                    <p className="font-medium">{planificacion.totalDias || 0}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Bloques</p>
                                    <p className="font-medium">{planificacion.totalBloques || 0}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Descansos</p>
                                    <p className="font-medium">{planificacion.totalDescansos || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                        Este usuario no tiene una planificación asignada.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PerfilUsuario;