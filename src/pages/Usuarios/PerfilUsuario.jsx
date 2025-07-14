// src/pages/Perfil/PerfilUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import Loader from '../../components/Loader';

const PerfilUsuario = () => {
    const { userId } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [planificacion, setPlanificacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                
                // Cargar datos del usuario
                const resUsuario = await fetch(`/api/usuarios/clientes?id=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!resUsuario.ok) throw new Error('Error al cargar usuario');
                
                const dataUsuario = await resUsuario.json();
                const usuarioData = dataUsuario.data.usuarios[0];
                setUsuario(usuarioData);
                
                // Si tiene planificación, cargarla
                if (usuarioData.planificacion) {
                    const resPlan = await fetch(`/api/planificaciones/${usuarioData.planificacion}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    if (!resPlan.ok) throw new Error('Error al cargar planificación');
                    
                    const dataPlan = await resPlan.json();
                    setPlanificacion(dataPlan.data);
                }
                
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        
        cargarDatos();
    }, [userId]);

    if (cargando) return <Loader />;
    
    if (error) return (
        <div className="text-center p-8">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded">
                <X size={18} />
                <span>{error}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Sección de información del usuario */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    Información del Usuario
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
                                <Check className="text-green-500" size={18} />
                            ) : (
                                <X className="text-red-500" size={18} />
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
                                {planificacion.titulo}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">{planificacion.descripcion}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Creada por: {planificacion.creadoPor.nombre} ({planificacion.creadoPor.rol})
                            </p>
                        </div>
                        
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Resumen:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Semanas</p>
                                    <p className="font-medium">{planificacion.totalSemanas}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Días</p>
                                    <p className="font-medium">{planificacion.totalDias}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Bloques</p>
                                    <p className="font-medium">{planificacion.totalBloques}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-gray-500 dark:text-gray-400">Descansos</p>
                                    <p className="font-medium">{planificacion.totalDescansos}</p>
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