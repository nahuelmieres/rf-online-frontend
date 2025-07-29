import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Dumbbell, Calendar, AlertTriangle, Loader2, Plus, Zap, ZapOff, Coffee, MessageSquare, Edit2, Trash2, Send, Check, X, User } from 'lucide-react';
import Loader from '../../components/Loader';
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

                // 2. Obtengo planificación si existe
                if (targetUser.planificacion) {
                    const planRes = await fetch(`${import.meta.env.VITE_API_URL}/api/planificaciones/${targetUser.planificacion}`, {
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
                    const comentariosData = await cargarComentarios(targetUser.planificacion);
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
            <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-8 text-center">
                <X className="mx-auto w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-500 mb-4">ERROR</h2>
                <p className="text-lg mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                    RECARGAR PÁGINA
                </button>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-8 text-center">
                <AlertTriangle className="mx-auto w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-4">NO SE ENCONTRARON DATOS DEL USUARIO</h2>
                <button
                    onClick={() => navigate('/gestion/usuarios')}
                    className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                    VOLVER A GESTIÓN DE USUARIOS
                </button>
            </div>
        );
    }

    const esEntrenador = currentUser?.rol === 'admin' || currentUser?.rol === 'coach';

    return (
        <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 md:p-8">
            {notificacion.mostrar && (
                <Notificacion
                    tipo={notificacion.tipo}
                    mensaje={notificacion.mensaje}
                    onClose={() => setNotificacion(prev => ({ ...prev, mostrar: false }))}
                />
            )}

            {/* Sección de información del usuario */}
            <div className="border-2 border-black dark:border-gray-600 p-6 mb-8">
                <div className="flex items-start justify-between border-b-2 border-black dark:border-gray-600 pb-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                            <User className="w-6 h-6 text-white dark:text-black" />
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight">
                            INFORMACIÓN DEL USUARIO
                        </h2>
                    </div>

                    {currentUser?.id === usuario._id && (
                        <span className="px-3 py-1 border-2 border-black dark:border-gray-600 text-sm font-bold">
                            TÚ
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-lg font-bold mb-1">NOMBRE:</p>
                        <p className="text-xl">{usuario.nombre?.toUpperCase()}</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold mb-1">EMAIL:</p>
                        <p className="text-xl">{usuario.email}</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold mb-1">ROL:</p>
                        <p className="text-xl capitalize">{usuario.rol}</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold mb-1">ESTADO DE PAGO:</p>
                        <div className="flex items-center gap-2">
                            {usuario.estadoPago ? (
                                <Check className="text-green-500" size={20} />
                            ) : (
                                <X className="text-red-500" size={20} />
                            )}
                            <span className="text-xl">
                                {usuario.estadoPago ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de planificación */}
            <div className="border-2 border-black dark:border-gray-600 p-6">
                <div className="flex items-center gap-4 border-b-2 border-black dark:border-gray-600 pb-4 mb-6">
                    <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                        <Dumbbell className="w-6 h-6 text-white dark:text-black" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight">
                        PLANIFICACIÓN ASIGNADA
                    </h2>
                </div>

                {planificacion ? (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2">
                                {planificacion.titulo?.toUpperCase()} ({planificacion.tipo?.toUpperCase()})
                            </h3>
                            <p className="text-lg mb-4">{planificacion.descripcion}</p>
                            <p className="text-sm">
                                <span className="font-bold">CREADA POR:</span> {planificacion.creadoPor?.nombre?.toUpperCase() || 'DESCONOCIDO'}
                                ({planificacion.creadoPor?.rol?.toUpperCase() || 'SIN ROL'})
                            </p>
                        </div>

                        <div className="border-t-2 border-black dark:border-gray-600 pt-6 mb-8">
                            <h4 className="text-xl font-bold mb-4">
                                RESUMEN:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="border-2 border-black dark:border-gray-600 p-4">
                                    <p className="text-sm font-bold">SEMANAS</p>
                                    <p className="text-2xl font-bold">{planificacion.totalSemanas || 0}</p>
                                </div>
                                <div className="border-2 border-black dark:border-gray-600 p-4">
                                    <p className="text-sm font-bold">DÍAS</p>
                                    <p className="text-2xl font-bold">{planificacion.totalDias || 0}</p>
                                </div>
                                <div className="border-2 border-black dark:border-gray-600 p-4">
                                    <p className="text-sm font-bold">BLOQUES</p>
                                    <p className="text-2xl font-bold">{planificacion.totalBloques || 0}</p>
                                </div>
                                <div className="border-2 border-black dark:border-gray-600 p-4">
                                    <p className="text-sm font-bold">DESCANSOS</p>
                                    <p className="text-2xl font-bold">{planificacion.totalDescansos || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detalle de la planificación con comentarios */}
                        <div className="space-y-8">
                            {planificacion.semanas?.map((semana) => (
                                <div key={semana.numero} className="border-2 border-black dark:border-gray-600 p-6">
                                    <h4 className="text-xl font-bold mb-6">
                                        SEMANA {semana.numero}
                                    </h4>

                                    <div className="space-y-8">
                                        {semana.dias?.map((dia) => {
                                            const comentarioKey = `${semana.numero}-${dia.nombre}`;
                                            const comentario = comentarios[comentarioKey];

                                            return (
                                                <div key={dia._id} className="border-b-2 border-black dark:border-gray-600 pb-6 last:border-b-0 last:pb-0">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <h5 className="text-lg font-bold">
                                                            {dia.nombre?.toUpperCase()}
                                                        </h5>
                                                        {dia.descanso && (
                                                            <span className="flex items-center gap-2 px-3 py-1 border-2 border-black dark:border-gray-600 text-sm font-bold">
                                                                <Coffee className="w-4 h-4" />
                                                                DÍA DE DESCANSO
                                                            </span>
                                                        )}
                                                    </div>

                                                    {!dia.descanso && dia.bloquesPoblados?.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {dia.bloquesPoblados.map((bloque) => (
                                                                <div key={bloque._id} className="border-2 border-black dark:border-gray-600 p-4">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <Zap className="w-5 h-5 text-orange-500" />
                                                                        <span className="font-bold text-orange-500">
                                                                            {bloque.tipo === 'ejercicios' ? 'RUTINA DE EJERCICIOS' : 'NOTAS'}
                                                                        </span>
                                                                    </div>

                                                                    {bloque.tipo === 'ejercicios' ? (
                                                                        <div className="space-y-3">
                                                                            {bloque.ejercicios?.map((ejercicio, index) => (
                                                                                <div key={index} className="p-3 border-2 border-black dark:border-gray-600">
                                                                                    <div className="flex items-start gap-4">
                                                                                        <div className="flex-1">
                                                                                            <h6 className="font-bold">{ejercicio.nombre?.toUpperCase()}</h6>
                                                                                            <div className="flex flex-wrap gap-4 mt-2">
                                                                                                <span className="text-sm font-bold">
                                                                                                    SERIES: {ejercicio.series}
                                                                                                </span>
                                                                                                <span className="text-sm font-bold">
                                                                                                    REPS: {ejercicio.repeticiones}
                                                                                                </span>
                                                                                                {ejercicio.peso && (
                                                                                                    <span className="text-sm font-bold">
                                                                                                        PESO: {ejercicio.peso}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        {ejercicio.linkVideo && (
                                                                                            <a
                                                                                                href={ejercicio.linkVideo}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                                                                                            >
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                                                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                                                                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                                                                                </svg>
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="whitespace-pre-line">
                                                                            {bloque.contenidoTexto}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : !dia.descanso ? (
                                                        <div className="flex items-center gap-2 px-3 py-2 border-2 border-black dark:border-gray-600">
                                                            <ZapOff className="w-5 h-5" />
                                                            <span className="font-bold">NO HAY EJERCICIOS ASIGNADOS</span>
                                                        </div>
                                                    ) : null}

                                                    <div className="mt-6">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <MessageSquare className="w-5 h-5" />
                                                            <h6 className="font-bold">COMENTARIOS</h6>
                                                        </div>

                                                        {editandoComentario?.dia === dia.nombre && editandoComentario?.semana === semana.numero ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    value={editandoTexto}
                                                                    onChange={(e) => setEditandoTexto(e.target.value)}
                                                                    className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none"
                                                                    rows="3"
                                                                    placeholder="ESCRIBE TU COMENTARIO..."
                                                                />
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={manejarEditarComentario}
                                                                        className="px-6 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                                                                    >
                                                                        GUARDAR
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditandoComentario(null)}
                                                                        className="px-6 py-2 border-2 border-black dark:border-gray-600 font-bold hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 transition-all"
                                                                    >
                                                                        CANCELAR
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : comentario ? (
                                                            <div className="border-2 border-black dark:border-gray-600 p-4">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className="flex-1">
                                                                        <p className="whitespace-pre-line">
                                                                            {comentario.texto}
                                                                        </p>
                                                                        <div className="mt-2 text-sm">
                                                                            {formatDate(comentario.fechaCreacion)}
                                                                        </div>
                                                                    </div>
                                                                    {comentario.autor?._id === currentUser?.id && (
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditandoComentario(comentario);
                                                                                    setEditandoTexto(comentario.texto);
                                                                                }}
                                                                                className="p-1 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
                                                                                title="Editar comentario"
                                                                            >
                                                                                <Edit2 className="w-5 h-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => manejarEliminarComentario(comentario._id, semana.numero, dia.nombre)}
                                                                                className="p-1 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:bg-opacity-20"
                                                                                title="Eliminar comentario"
                                                                            >
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {comentario.respuesta && (
                                                                    <div className="mt-4 pl-4 border-l-4 border-orange-500">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-sm font-bold text-orange-500">
                                                                                        {comentario.respuesta.autor?.nombre?.toUpperCase() || currentUser.nombre?.toUpperCase()}:
                                                                                    </span>
                                                                                    <span className="text-sm">
                                                                                        {formatDate(comentario.respuesta.fecha)}
                                                                                    </span>
                                                                                </div>

                                                                                {editandoRespuesta?.comentarioId === comentario._id ? (
                                                                                    <div className="mt-2">
                                                                                        <textarea
                                                                                            value={textoEditandoRespuesta}
                                                                                            onChange={(e) => setTextoEditandoRespuesta(e.target.value)}
                                                                                            className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none"
                                                                                            rows="2"
                                                                                        />
                                                                                        <div className="flex gap-2 mt-2">
                                                                                            <button
                                                                                                onClick={manejarEditarRespuesta}
                                                                                                className="px-4 py-1 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold text-sm"
                                                                                            >
                                                                                                GUARDAR
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => setEditandoRespuesta(null)}
                                                                                                className="px-4 py-1 border-2 border-black dark:border-gray-600 font-bold text-sm"
                                                                                            >
                                                                                                CANCELAR
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <p className="whitespace-pre-line">
                                                                                            {comentario.respuesta.texto}
                                                                                        </p>
                                                                                        {esEntrenador && comentario.respuesta.autor?._id === currentUser?.id && (
                                                                                            <div className="flex gap-3 mt-2">
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setEditandoRespuesta({
                                                                                                            comentarioId: comentario._id,
                                                                                                            texto: comentario.respuesta.texto
                                                                                                        });
                                                                                                        setTextoEditandoRespuesta(comentario.respuesta.texto);
                                                                                                    }}
                                                                                                    className="text-sm font-bold flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
                                                                                                >
                                                                                                    <Edit2 size={14} /> EDITAR
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => manejarEliminarRespuesta(comentario._id, semana.numero, dia.nombre)}
                                                                                                    className="text-sm font-bold flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:bg-opacity-20"
                                                                                                >
                                                                                                    <Trash2 size={14} /> ELIMINAR
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Formulario para responder comentario (solo entrenadores) */}
                                                                {esEntrenador && !comentario.respuesta && (
                                                                    <div className="mt-4">
                                                                        <textarea
                                                                            value={respuestas[comentario._id] || ''}
                                                                            onChange={(e) => setRespuestas(prev => ({
                                                                                ...prev,
                                                                                [comentario._id]: e.target.value
                                                                            }))}
                                                                            className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none"
                                                                            rows="2"
                                                                            placeholder="ESCRIBE TU RESPUESTA COMO ENTRENADOR..."
                                                                        />
                                                                        <button
                                                                            onClick={manejarResponderComentario(comentario._id, semana.numero, dia.nombre)}
                                                                            disabled={!respuestas[comentario._id]?.trim()}
                                                                            className="mt-2 flex items-center gap-2 px-6 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <Send className="w-5 h-5" />
                                                                            <span>ENVIAR RESPUESTA</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <form onSubmit={manejarNuevoComentario(dia.nombre, semana.numero)} className="space-y-3">
                                                                <textarea
                                                                    value={nuevosComentarios[comentarioKey] || ''}
                                                                    onChange={(e) => setNuevosComentarios(prev => ({
                                                                        ...prev,
                                                                        [comentarioKey]: e.target.value
                                                                    }))}
                                                                    className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none"
                                                                    rows="3"
                                                                    placeholder="ESCRIBE UN COMENTARIO SOBRE ESTE DÍA..."
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={!nuevosComentarios[comentarioKey]?.trim()}
                                                                    className="flex items-center gap-2 px-6 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Send className="w-5 h-5" />
                                                                    <span>ENVIAR COMENTARIO</span>
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="border-2 border-black dark:border-gray-600 p-6 text-center">
                        <p className="text-lg font-bold">ESTE USUARIO NO TIENE UNA PLANIFICACIÓN ASIGNADA.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerfilUsuario;