import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Edit, Trash2, X, Check, User, MoreVertical, ChevronLeft } from 'lucide-react';

const ForoPlanificacion = () => {
    const { idPlanificacion } = useParams();
    const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
    const API_URL = import.meta.env.VITE_API_URL;
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [editando, setEditando] = useState(null);
    const [textoEditado, setTextoEditado] = useState('');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [planificacion, setPlanificacion] = useState(null);

    // Obtengo token de autenticación
    const token = localStorage.getItem('token');

    // Obtengo información de la planificación
    useEffect(() => {
        const obtenerPlanificacion = async () => {
            try {
                const res = await fetch(`${API_URL}/api/planificaciones/${idPlanificacion}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    throw new Error('Error al obtener la planificación');
                }
                const response = await res.json();
                setPlanificacion(response.data); // Accede a response.data
            } catch (err) {
                setError(err.message);
            }
        };
        obtenerPlanificacion();
    }, [idPlanificacion]);

    // Obtengo mensajes del foro
    const obtenerMensajes = async () => {
        try {
            setCargando(true);
            const res = await fetch(`${API_URL}/api/foros/${idPlanificacion}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Error al obtener los mensajes del foro');
            }

            const data = await res.json();
            setMensajes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Enviar nuevo mensaje
    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/foros/${idPlanificacion}/mensajes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ contenido: nuevoMensaje })
            });

            if (!res.ok) {
                throw new Error('Error al enviar el mensaje');
            }

            const nuevoMensajeData = await res.json();
            setMensajes([...mensajes, nuevoMensajeData]);
            setNuevoMensaje('');
        } catch (err) {
            setError(err.message);
        }
    };

    // Iniciar edición de mensaje
    const iniciarEdicion = (mensaje) => {
        setEditando(mensaje._id);
        setTextoEditado(mensaje.contenido);
    };

    // Cancelar edición
    const cancelarEdicion = () => {
        setEditando(null);
        setTextoEditado('');
    };

    // Guardar mensaje editado
    const guardarEdicion = async (mensajeId) => {
        if (!textoEditado.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/foros/mensajes/${mensajeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ contenido: textoEditado })
            });

            if (!res.ok) {
                throw new Error('Error al actualizar el mensaje');
            }

            const mensajeActualizado = await res.json();
            setMensajes(mensajes.map(msg =>
                msg._id === mensajeId ? { ...msg, contenido: mensajeActualizado.contenido } : msg
            ));
            cancelarEdicion();
        } catch (err) {
            setError(err.message);
        }
    };

    // Eliminar mensaje
    const eliminarMensaje = async (mensajeId) => {
        try {
            const res = await fetch(`${API_URL}/api/foros/mensajes/${mensajeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Error al eliminar el mensaje');
            }

            setMensajes(mensajes.filter(msg => msg._id !== mensajeId));
        } catch (err) {
            setError(err.message);
        }
    };

    // Cargar mensajes al montar el componente
    useEffect(() => {
        obtenerMensajes();
    }, [idPlanificacion]);

    // Manejar envío con Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Link
                            to={`/planificacion/${idPlanificacion}`}
                            className="flex items-center gap-1 px-3 py-1 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm"
                        >
                            <ChevronLeft size={16} /> VOLVER
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            FORO: {planificacion?.titulo || 'Planificación'}
                        </h1>
                    </div>

                    <div className="h-1 w-24 bg-black dark:bg-white mx-auto mb-4"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
                        <div className="flex flex-wrap gap-2">
                            <div className="border-2 border-black dark:border-gray-600 px-3 py-1 bg-white dark:bg-black">
                                <span className="font-bold">Tipo:</span> {planificacion?.tipo}
                            </div>
                            {planificacion?.categoria && (
                                <div className="border-2 border-black dark:border-gray-600 px-3 py-1 bg-white dark:bg-black">
                                    <span className="font-bold">Categoría:</span> {planificacion.categoria}
                                </div>
                            )}
                        </div>

                        {planificacion?.creadoPor && (
                            <div className="border-2 border-black dark:border-gray-600 px-3 py-1 bg-white dark:bg-black text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Creada por:</span>{' '}
                                <span className="font-medium">{planificacion.creadoPor.nombre}</span>
                            </div>
                        )}
                    </div>

                    {planificacion?.descripcion && (
                        <div className="border-2 border-black dark:border-gray-600 p-3 mb-4 bg-white dark:bg-black">
                            <p className="text-gray-700 dark:text-gray-300">{planificacion.descripcion}</p>
                        </div>
                    )}

                    <div className="border-t-2 border-black dark:border-gray-600 pt-4">
                        <h2 className="text-xl font-bold text-center">DISCUSIÓN</h2>
                    </div>
                </div>

                {/* Mensajes de error */}
                {error && (
                    <div className="mb-6 border-2 border-red-500 bg-red-100 dark:bg-black px-4 py-3 flex items-center gap-3">
                        <X className="flex-shrink-0 text-red-500" size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Formulario para nuevo mensaje */}
                <div className="mb-10 border-2 border-black dark:border-gray-600 p-4 md:p-6 bg-white dark:bg-black shadow-hard">
                    <h2 className="text-xl font-bold mb-4">NUEVO MENSAJE</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <textarea
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Escribe tu mensaje aquí..."
                                className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black min-h-[120px] focus:outline-none resize-none"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                                Enter para enviar
                            </div>
                        </div>
                        <button
                            onClick={enviarMensaje}
                            disabled={!nuevoMensaje.trim()}
                            className="h-12 w-12 md:h-auto md:w-auto flex items-center justify-center md:px-4 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            <Send className="md:mr-2" size={20} />
                            <span className="hidden md:inline">ENVIAR</span>
                        </button>
                    </div>
                </div>

                {/* Lista de mensajes */}
                {cargando ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
                        <p className="mt-4">Cargando mensajes...</p>
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="text-center py-10 border-2 border-black dark:border-gray-600 p-6 bg-white dark:bg-black">
                        <h3 className="text-xl font-bold mb-2">No hay mensajes aún</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Sé el primero en compartir tus pensamientos sobre esta planificación
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {mensajes.map((mensaje) => (
                            <div
                                key={mensaje._id}
                                className="border-2 border-black dark:border-gray-600 p-4 md:p-6 bg-white dark:bg-black shadow-hard"
                            >
                                {/* Encabezado del mensaje */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-black dark:bg-white p-2 border-2 border-black dark:border-gray-600">
                                            <User className="h-5 w-5 text-white dark:text-black" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{mensaje.autor.nombre}</h3>
                                            <p className="text-xs text-gray-500">
                                                {new Date(mensaje.fecha).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Menú de acciones (solo para el autor) */}
                                    {mensaje.autor._id === usuarioActual.id && (
                                        <div className="relative group">
                                            <button className="p-1">
                                                <MoreVertical size={20} />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-black border-2 border-black dark:border-gray-600 shadow-hard opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                <button
                                                    onClick={() => iniciarEdicion(mensaje)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => eliminarMensaje(mensaje._id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2 text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Contenido del mensaje */}
                                {editando === mensaje._id ? (
                                    <div className="mt-4">
                                        <textarea
                                            value={textoEditado}
                                            onChange={(e) => setTextoEditado(e.target.value)}
                                            className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black min-h-[100px] focus:outline-none"
                                        />
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button
                                                onClick={cancelarEdicion}
                                                className="px-4 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold flex items-center gap-2"
                                            >
                                                <X size={16} />
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => guardarEdicion(mensaje._id)}
                                                className="px-4 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold flex items-center gap-2"
                                            >
                                                <Check size={16} />
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 whitespace-pre-line">
                                        {mensaje.contenido}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

export default ForoPlanificacion;