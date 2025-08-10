import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, Dumbbell, Calendar, AlertTriangle, Loader2, Zap, ZapOff, Coffee, MessageSquare, Edit2, Trash2, Send, Check, User } from 'lucide-react';
import Notificacion from '../../components/Notificacion';

// Función para formatear fechas
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const PerfilUsuario = () => {
    const { userId } = useParams();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
    const [usuario, setUsuario] = useState(null);
    const [planificacion, setPlanificacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [semanaActiva, setSemanaActiva] = useState(0);
    const [comentarios, setComentarios] = useState({});
    const [nuevosComentarios, setNuevosComentarios] = useState({});
    const [respuestas, setRespuestas] = useState({});
    const [editandoComentario, setEditandoComentario] = useState(null);
    const [editandoTexto, setEditandoTexto] = useState('');
    const [editandoRespuesta, setEditandoRespuesta] = useState(null);
    const [textoEditandoRespuesta, setTextoEditandoRespuesta] = useState('');
    const [notificacion, setNotificacion] = useState({
        mostrar: false,
        tipo: 'success',
        mensaje: ''
    });
    const navigate = useNavigate();

    // Función para cargar comentarios
    const cargarComentarios = async (planificacionId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/comentarios?` + new URLSearchParams({
                    planificacion: planificacionId,
                    idUsuario: userId
                }),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!res.ok) throw new Error('ERROR AL OBTENER COMENTARIOS');

            const { data } = await res.json();
            const comentariosData = {};

            data.forEach(comentario => {
                const key = `${comentario.semana}-${comentario.dia}`;
                comentariosData[key] = comentario;
            });

            return comentariosData;
        } catch (err) {
            console.error('Error cargando comentarios:', err);
            return {};
        }
    };

    const mostrarNotificacion = (tipo, mensaje) => {
        setNotificacion({
            mostrar: true,
            tipo,
            mensaje
        });
        setTimeout(() => setNotificacion(prev => ({ ...prev, mostrar: false })), 5000);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!userId || authLoading) return;

        const fetchData = async () => {
            try {
                setCargando(true);
                setError(null);

                // 1. Obtener datos del usuario
                const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/clientes?id=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!userRes.ok) {
                    const errorData = await userRes.json().catch(() => ({}));
                    throw new Error(errorData.message || 'ERROR AL CARGAR USUARIO');
                }

                const userData = await userRes.json();
                if (!userData.data?.usuarios?.length) {
                    throw new Error('USUARIO NO ENCONTRADO');
                }

                const targetUser = userData.data.usuarios[0];
                setUsuario(targetUser);

                // 2. Obtengo planificación personalizada si existe
                if (targetUser.planPersonalizado) {
                    const planRes = await fetch(`${import.meta.env.VITE_API_URL}/api/planificaciones/${targetUser.planPersonalizado}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    });

                    if (!planRes.ok) {
                        const errorData = await planRes.json().catch(() => ({}));
                        throw new Error(errorData.message || 'ERROR AL CARGAR PLANIFICACIÓN');
                    }

                    const planData = await planRes.json();
                    setPlanificacion(planData.data);

                    // 3. Cargo comentarios
                    const comentariosData = await cargarComentarios(targetUser.planPersonalizado);
                    setComentarios(comentariosData);
                }
            } catch (err) {
                console.error('Error cargando perfil:', err);
                setError(err.message);
                mostrarNotificacion('error', err.message);
                if (err.message.includes('no encontrado') || err.message.includes('inválido')) {
                    navigate('/gestion/usuarios', { replace: true });
                }
            } finally {
                setCargando(false);
            }
        };

        fetchData();
    }, [userId, isAuthenticated, authLoading, navigate]);

    const manejarNuevoComentario = (diaNombre, semanaNumero) => {
        return async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const key = `${semanaNumero}-${diaNombre}`;
            const texto = nuevosComentarios[key];

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        planificacion: planificacion._id,
                        semana: semanaNumero,
                        dia: diaNombre,
                        texto
                    })
                });

                if (res.ok) {
                    const { data } = await res.json();
                    setComentarios(prev => ({
                        ...prev,
                        [`${semanaNumero}-${diaNombre}`]: data
                    }));
                    setNuevosComentarios(prev => {
                        const nuevos = { ...prev };
                        delete nuevos[key];
                        return nuevos;
                    });
                    mostrarNotificacion('success', 'COMENTARIO ENVIADO');
                }
            } catch (err) {
                console.error('Error al crear comentario:', err);
                mostrarNotificacion('error', 'ERROR AL ENVIAR COMENTARIO');
            }
        };
    };

    const manejarEditarComentario = async () => {
        if (!editandoComentario) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${editandoComentario._id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texto: editandoTexto
                })
            });

            if (res.ok) {
                const { data } = await res.json();
                const key = `${data.semana}-${data.dia}`;
                setComentarios(prev => ({
                    ...prev,
                    [key]: data
                }));
                setEditandoComentario(null);
                setEditandoTexto('');
                mostrarNotificacion('success', 'COMENTARIO ACTUALIZADO');
            }
        } catch (err) {
            console.error('Error al editar comentario:', err);
            mostrarNotificacion('error', 'ERROR AL ACTUALIZAR COMENTARIO');
        }
    };

    const manejarEliminarComentario = async (comentarioId, semanaNumero, diaNombre) => {
        const token = localStorage.getItem('token');
        const key = `${semanaNumero}-${diaNombre}`;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${comentarioId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                setComentarios(prev => {
                    const nuevos = { ...prev };
                    delete nuevos[key];
                    return nuevos;
                });
                mostrarNotificacion('success', 'COMENTARIO ELIMINADO');
            }
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            mostrarNotificacion('error', 'ERROR AL ELIMINAR COMENTARIO');
        }
    };

    const manejarResponderComentario = (comentarioId, semanaNumero, diaNombre) => {
        return async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const respuestaTexto = respuestas[comentarioId];
            const key = `${semanaNumero}-${diaNombre}`;

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${comentarioId}/responder`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ texto: respuestaTexto })
                });

                if (res.ok) {
                    const { data } = await res.json();
                    setComentarios(prev => ({
                        ...prev,
                        [key]: data
                    }));
                    setRespuestas(prev => {
                        const nuevos = { ...prev };
                        delete nuevos[comentarioId];
                        return nuevos;
                    });
                    mostrarNotificacion('success', 'RESPUESTA ENVIADA');
                }
            } catch (err) {
                console.error('Error al responder comentario:', err);
                mostrarNotificacion('error', 'ERROR AL ENVIAR RESPUESTA');
            }
        };
    };

    const manejarEditarRespuesta = async () => {
        if (!editandoRespuesta) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${editandoRespuesta.comentarioId}/respuesta`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texto: textoEditandoRespuesta
                })
            });

            if (res.ok) {
                const { data } = await res.json();
                const key = `${data.semana}-${data.dia}`;
                setComentarios(prev => ({
                    ...prev,
                    [key]: data
                }));
                setEditandoRespuesta(null);
                setTextoEditandoRespuesta('');
                mostrarNotificacion('success', 'RESPUESTA ACTUALIZADA');
            }
        } catch (err) {
            console.error('Error al editar respuesta:', err);
            mostrarNotificacion('error', 'ERROR AL ACTUALIZAR RESPUESTA');
        }
    };

    const manejarEliminarRespuesta = async (comentarioId, semanaNumero, diaNombre) => {
        const token = localStorage.getItem('token');
        const key = `${semanaNumero}-${diaNombre}`;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comentarios/${comentarioId}/respuesta`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const comentarioActual = comentarios[key];
                const comentarioActualizado = {
                    ...comentarioActual,
                    respuesta: null
                };

                setComentarios(prev => ({
                    ...prev,
                    [key]: comentarioActualizado
                }));
                mostrarNotificacion('success', 'RESPUESTA ELIMINADA');
            }
        } catch (err) {
            console.error('Error al eliminar respuesta:', err);
            mostrarNotificacion('error', 'ERROR AL ELIMINAR RESPUESTA');
        }
    };

    if (authLoading || cargando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
                <p className="mt-4 text-lg font-medium">CARGANDO DATOS...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center border-2 border-black dark:border-gray-600 bg-white dark:bg-black mx-6 my-8">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">ERROR AL CARGAR PERFIL</h3>
                <p className="text-lg mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                    REINTENTAR
                </button>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-center">
                <p>No se encontraron datos del usuario</p>
                <Link
                    to="/gestion/planificaciones"
                    className="mt-4 inline-block px-4 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                    <ChevronLeft size={16} className="inline mr-1" /> Volver
                </Link>
            </div>
        );
    }

    const esEntrenador = currentUser?.rol === 'admin' || currentUser?.rol === 'coach';

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {notificacion.mostrar && (
                <Notificacion
                    tipo={notificacion.tipo}
                    mensaje={notificacion.mensaje}
                    onCerrar={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/gestion/planificaciones"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                    >
                        <ChevronLeft size={20} className="mr-1" /> VOLVER
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        PERFIL DE USUARIO
                    </h1>
                </div>
            </div>

            {/* Sección de información del usuario */}
            <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                        <User className="w-6 h-6 text-white dark:text-black" />
                    </div>
                    <h2 className="text-xl font-bold">INFORMACIÓN DEL USUARIO</h2>

                    {currentUser?.id === usuario._id && (
                        <span className="ml-auto px-3 py-1 border-2 border-black dark:border-gray-600 text-sm font-bold">
                            TÚ
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">NOMBRE</h3>
                        <p className="text-xl">{usuario.nombre?.toUpperCase()}</p>
                    </div>
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">EMAIL</h3>
                        <p className="text-xl">{usuario.email}</p>
                    </div>
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">ROL</h3>
                        <p className="text-xl capitalize">{usuario.rol}</p>
                    </div>
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">ESTADO DE PAGO</h3>
                        <div className="flex items-center gap-2">
                            {usuario.estadoPago ? (
                                <Check className="text-green-500" size={20} />
                            ) : (
                                <span className="text-red-500 font-bold">X</span>
                            )}
                            <span className="text-xl">
                                {usuario.estadoPago ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de planificación */}
            <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                        <Dumbbell className="w-6 h-6 text-white dark:text-black" />
                    </div>
                    <h2 className="text-xl font-bold">PLANIFICACIÓN ASIGNADA</h2>
                </div>

                {planificacion ? (
                    <div>
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{planificacion.titulo || 'Sin título'}</h2>
                                    <p className="text-lg mb-4">{planificacion.descripcion || 'Sin descripción'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 border border-black dark:border-gray-600 text-sm">
                                        {planificacion.tipo?.toUpperCase() || 'SIN TIPO'}
                                    </span>
                                    <span className={`px-3 py-1 border text-sm ${planificacion.categoria === 'personalizada'
                                        ? 'border-purple-500 text-purple-500'
                                        : 'border-orange-500 text-orange-500'
                                        }`}>
                                        {planificacion.categoria?.toUpperCase() || 'SIN CATEGORÍA'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                                <div className="border border-black dark:border-gray-600 p-4">
                                    <h3 className="font-bold mb-2">SEMANAS</h3>
                                    <p className="text-xl flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        {planificacion.semanas?.length || 0}
                                    </p>
                                </div>
                                <div className="border border-black dark:border-gray-600 p-4">
                                    <h3 className="font-bold mb-2">DÍAS ACTIVOS</h3>
                                    <p className="text-xl flex items-center gap-2">
                                        <Dumbbell className="w-5 h-5" />
                                        {planificacion.totalDias - planificacion.totalDescansos || 0}
                                    </p>
                                </div>
                                <div className="border border-black dark:border-gray-600 p-4">
                                    <h3 className="font-bold mb-2">BLOQUES</h3>
                                    <p className="text-xl">{planificacion.totalBloques || 0}</p>
                                </div>
                                <div className="border border-black dark:border-gray-600 p-4">
                                    <h3 className="font-bold mb-2">DESCANSOS</h3>
                                    <p className="text-xl">{planificacion.totalDescansos || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Selector de semanas */}
                        {planificacion.semanas?.length > 0 && (
                            <div className="mb-6 overflow-x-auto">
                                <div className="flex space-x-2 pb-2">
                                    {planificacion.semanas.map((semana, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSemanaActiva(index)}
                                            className={`flex-shrink-0 px-4 py-2 min-w-[120px] border-2 font-bold ${semanaActiva === index
                                                ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            Semana {semana.numero}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detalle de la semana activa */}
                        <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-4 sm:p-8">
                            <h2 className="text-xl font-bold mb-6">
                                SEMANA {planificacion.semanas?.[semanaActiva]?.numero} - DETALLE
                            </h2>

                            <div className="flex flex-col gap-8">
                                {planificacion.semanas?.[semanaActiva]?.dias?.map((dia, diaIndex) => {
                                    const comentarioKey = `${planificacion.semanas[semanaActiva].numero}-${dia.nombre}`;
                                    const comentario = comentarios[comentarioKey];

                                    return (
                                        <div
                                            key={diaIndex}
                                            className={`border-2 p-6 w-full ${dia.descanso
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-black dark:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <h3 className="font-bold text-lg">
                                                    {dia.nombre || 'Día sin nombre'}
                                                </h3>
                                                {dia.descanso && (
                                                    <span className="flex items-center gap-1 text-sm">
                                                        <Coffee className="w-4 h-4" /> DESCANSO
                                                    </span>
                                                )}
                                            </div>

                                            {!dia.descanso ? (
                                                <div className="space-y-4">
                                                    {dia.bloquesPoblados?.length > 0 ? (
                                                        dia.bloquesPoblados.map((bloque, bloqueIndex) => (
                                                            <div key={bloqueIndex} className="border border-black dark:border-gray-600 p-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {bloque.tipo === 'ejercicios' ? (
                                                                        <Zap className="w-4 h-4 text-yellow-500" />
                                                                    ) : (
                                                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                                                    )}
                                                                    <h4 className="font-bold text-sm">
                                                                        {bloque.titulo || 'Bloque sin título'}
                                                                    </h4>
                                                                </div>

                                                                {bloque.tipo === 'ejercicios' ? (
                                                                    <div className="space-y-3">
                                                                        {bloque.ejercicios?.map((ejercicio, ejIndex) => {
                                                                            const escala = (ejercicio.escala || '').toUpperCase();
                                                                            const esfuerzoVal = ejercicio.esfuerzoPercibido ?? '';
                                                                            const tieneEsfuerzo =
                                                                                escala && esfuerzoVal !== '' && esfuerzoVal !== null && esfuerzoVal !== undefined;

                                                                            return (
                                                                                <div key={ejIndex} className="text-sm">
                                                                                    <p className="font-semibold">{ejercicio.nombre}</p>

                                                                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                                                                        <span>
                                                                                            {ejercicio.series}x{ejercicio.repeticiones}
                                                                                        </span>

                                                                                        {tieneEsfuerzo && (
                                                                                            <span
                                                                                                className={[
                                                                                                    "inline-flex items-center gap-1 px-2 py-0.5",
                                                                                                    "border-2 border-black dark:border-gray-600",
                                                                                                    "bg-white dark:bg-black font-bold"
                                                                                                ].join(' ')}
                                                                                                title={escala === 'RPE' ? 'Esfuerzo percibido (6–10)' : 'Repeticiones en recámara (0–5)'}
                                                                                            >
                                                                                                <span className="text-[10px] tracking-wide">{escala}</span>
                                                                                                <span className="text-xs">{esfuerzoVal}</span>
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    {ejercicio.linkVideo && (
                                                                                        <a
                                                                                            href={ejercicio.linkVideo}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="text-xs text-blue-500 hover:underline"
                                                                                        >
                                                                                            Ver video
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm whitespace-pre-line">
                                                                        {bloque.contenidoTexto || 'Sin contenido'}
                                                                    </p>
                                                                )}

                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <ZapOff className="w-4 h-4" />
                                                            <span>No hay ejercicios asignados</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <Check className="mx-auto text-green-500 mb-2" size={20} />
                                                    <p className="text-sm font-medium">DÍA DE RECUPERACIÓN</p>
                                                </div>
                                            )}

                                            {/* Comentarios y respuestas */}
                                            {esEntrenador && !comentario ? null : (
                                                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <h5 className="text-sm font-bold">COMENTARIOS</h5>
                                                    </div>

                                                    {/* Modo edición del comentario */}
                                                    {editandoComentario?.dia === dia.nombre &&
                                                        editandoComentario?.semana === planificacion.semanas[semanaActiva].numero ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={editandoTexto}
                                                                onChange={(e) => setEditandoTexto(e.target.value)}
                                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm"
                                                                rows="3"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={manejarEditarComentario}
                                                                    className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold border border-black dark:border-gray-600"
                                                                >
                                                                    GUARDAR
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditandoComentario(null)}
                                                                    className="px-3 py-1 bg-white dark:bg-black text-black dark:text-white text-xs font-bold border border-black dark:border-gray-600"
                                                                >
                                                                    CANCELAR
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : comentario ? (
                                                        <div className="text-sm">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="whitespace-pre-line">{comentario.texto}</p>
                                                                {comentario.autor?._id === currentUser?.id && (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditandoComentario(comentario);
                                                                                setEditandoTexto(comentario.texto);
                                                                            }}
                                                                            className="text-gray-500 hover:text-blue-500"
                                                                        >
                                                                            <Edit2 className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                manejarEliminarComentario(
                                                                                    comentario._id,
                                                                                    planificacion.semanas[semanaActiva].numero,
                                                                                    dia.nombre
                                                                                )
                                                                            }
                                                                            className="text-gray-500 hover:text-red-500"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatDate(comentario.fechaCreacion)}
                                                            </div>

                                                            {/* RESPUESTA DEL ENTRENADOR */}
                                                            {comentario.respuesta && (
                                                                <div className="mt-4 pl-4 border-l-2 border-orange-500">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <div>
                                                                            <div className="flex items-center gap-1 text-xs mb-1">
                                                                                <span className="font-bold text-orange-500">
                                                                                    {comentario.respuesta.autor?.nombre?.toUpperCase() || currentUser?.nombre?.toUpperCase()}:
                                                                                </span>
                                                                                <span className="text-gray-500">
                                                                                    {formatDate(comentario.respuesta.fecha)}
                                                                                </span>
                                                                            </div>

                                                                            {/* Si está editando la respuesta */}
                                                                            {editandoRespuesta?.comentarioId === comentario._id ? (
                                                                                <div className="mt-1">
                                                                                    <textarea
                                                                                        value={textoEditandoRespuesta}
                                                                                        onChange={(e) => setTextoEditandoRespuesta(e.target.value)}
                                                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm"
                                                                                        rows="6"
                                                                                    />
                                                                                    <div className="flex gap-2 mt-1">
                                                                                        <button
                                                                                            onClick={manejarEditarRespuesta}
                                                                                            className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold border border-black dark:border-gray-600"
                                                                                        >
                                                                                            GUARDAR
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setEditandoRespuesta(null)}
                                                                                            className="px-2 py-1 bg-white dark:bg-black text-black dark:text-white text-xs font-bold border border-black dark:border-gray-600"
                                                                                        >
                                                                                            CANCELAR
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <p className="whitespace-pre-line">{comentario.respuesta.texto}</p>

                                                                                    {/* Solo el autor de la respuesta (coach/admin) puede editarla o borrarla */}
                                                                                    {esEntrenador && comentario.respuesta.autor?._id === currentUser?.id && (
                                                                                        <div className="flex gap-2 mt-1">
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setEditandoRespuesta({
                                                                                                        comentarioId: comentario._id,
                                                                                                        texto: comentario.respuesta.texto,
                                                                                                    });
                                                                                                    setTextoEditandoRespuesta(comentario.respuesta.texto);
                                                                                                }}
                                                                                                className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-500"
                                                                                            >
                                                                                                <Edit2 size={12} /> EDITAR
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    manejarEliminarRespuesta(
                                                                                                        comentario._id,
                                                                                                        planificacion.semanas[semanaActiva].numero,
                                                                                                        dia.nombre
                                                                                                    )
                                                                                                }
                                                                                                className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-500"
                                                                                            >
                                                                                                <Trash2 size={12} /> ELIMINAR
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Formulario para responder comentario (solo si es entrenador y aún no respondió) */}
                                                            {esEntrenador && !comentario.respuesta && (
                                                                <div className="mt-3">
                                                                    <textarea
                                                                        value={respuestas[comentario._id] || ''}
                                                                        onChange={(e) =>
                                                                            setRespuestas((prev) => ({
                                                                                ...prev,
                                                                                [comentario._id]: e.target.value,
                                                                            }))
                                                                        }
                                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm"
                                                                        rows="2"
                                                                        placeholder="Escribe tu respuesta como entrenador..."
                                                                    />
                                                                    <button
                                                                        onClick={manejarResponderComentario(
                                                                            comentario._id,
                                                                            planificacion.semanas[semanaActiva].numero,
                                                                            dia.nombre
                                                                        )}
                                                                        disabled={!respuestas[comentario._id]?.trim()}
                                                                        className="mt-2 flex items-center gap-1 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold border border-black dark:border-gray-600 disabled:opacity-50"
                                                                    >
                                                                        <Send className="w-3 h-3" />
                                                                        <span>ENVIAR RESPUESTA</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Solo clientes pueden comentar si no hay comentario aún
                                                        !esEntrenador && (
                                                            <form
                                                                onSubmit={manejarNuevoComentario(
                                                                    dia.nombre,
                                                                    planificacion.semanas[semanaActiva].numero
                                                                )}
                                                                className="space-y-2"
                                                            >
                                                                <textarea
                                                                    value={nuevosComentarios[comentarioKey] || ''}
                                                                    onChange={(e) =>
                                                                        setNuevosComentarios((prev) => ({
                                                                            ...prev,
                                                                            [comentarioKey]: e.target.value,
                                                                        }))
                                                                    }
                                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm"
                                                                    rows="2"
                                                                    placeholder="Añadir comentario..."
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={!nuevosComentarios[comentarioKey]?.trim()}
                                                                    className="flex items-center gap-1 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold border border-black dark:border-gray-600 disabled:opacity-50"
                                                                >
                                                                    <Send className="w-3 h-3" />
                                                                    <span>ENVIAR</span>
                                                                </button>
                                                            </form>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border-2 border-black dark:border-gray-600 p-6 text-center">
                        <p className="text-lg font-bold">ESTE USUARIO NO TIENE UNA PLANIFICACIÓN ASIGNADA.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PerfilUsuario;