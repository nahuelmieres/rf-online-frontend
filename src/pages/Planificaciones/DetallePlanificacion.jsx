import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Check, Dumbbell, Calendar, AlertTriangle, Loader2, Zap, ZapOff, Coffee, MessageSquare, Edit2, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import Notificacion from '../../components/Notificacion';
import Modal from '../../components/Modal';
import { useAuth } from '../../hooks/useAuth';
import SmartLink from '../../components/SmartLink/SmartLink';

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

const getYouTubeId = (url) => {
    let id = '';
    let isShort = false;

    // Detectar Shorts
    if (url.includes('youtube.com/shorts/')) {
        id = url.split('youtube.com/shorts/')[1].split('?')[0];
        isShort = true;
    } else {
        // Manejar URLs estándar
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        id = (match && match[2].length === 11) ? match[2] : null;
    }

    return { id, isShort };
};

const DetallePlanificacion = () => {
    const { id } = useParams();
    const [planificacion, setPlanificacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [semanaActiva, setSemanaActiva] = useState(0);
    const [notificacion, setNotificacion] = useState(null);
    const [comentarios, setComentarios] = useState({});
    const [historialComentarios, setHistorialComentarios] = useState({});
    const [nuevosComentarios, setNuevosComentarios] = useState({});
    const [respuestas, setRespuestas] = useState({});
    const [editandoComentario, setEditandoComentario] = useState(null);
    const [editandoTexto, setEditandoTexto] = useState('');
    const [editandoRespuesta, setEditandoRespuesta] = useState(null);
    const [textoEditandoRespuesta, setTextoEditandoRespuesta] = useState('');
    const { user, loading: authLoading } = useAuth();
    const [cargandoComentarios, setCargandoComentarios] = useState(true);
    const [mostrarHistorial, setMostrarHistorial] = useState({});
    const [videosExpandidos, setVideosExpandidos] = useState({});

    // Estado para confirmación de eliminación
    const [confirmarEliminar, setConfirmarEliminar] = useState({
        mostrar: false,
        bloqueId: null,
        bloqueTitulo: '',
        diaNombre: '',
        semanaNumero: null
    });
    const [eliminando, setEliminando] = useState(false);

    useEffect(() => {
        const obtenerPlanificacion = async () => {
            try {
                setCargando(true);
                setError(null);

                const res = await fetch(`/api/planificaciones/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Planificación no encontrada');
                }

                const data = await res.json();
                setPlanificacion(data.data);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
                mostrarNotificacion('error', 'Error al cargar', err.message);
            } finally {
                setCargando(false);
            }
        };

        obtenerPlanificacion();
    }, [id]);

    // Efecto para obtener comentarios (incluye historial)
    useEffect(() => {
        const obtenerComentarios = async () => {
            if (!user?.id) return;

            try {
                setCargandoComentarios(true);
                const resComentarios = await fetch(
                    `/api/comentarios?planificacion=${id}&idUsuario=${user.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (resComentarios.ok) {
                    const { data: comentariosData } = await resComentarios.json();
                    const comentariosOrganizados = {};
                    const historialOrganizado = {};

                    // Agrupar por semana-día
                    comentariosData.forEach(comentario => {
                        const key = `${comentario.semana}-${comentario.dia}`;

                        if (!historialOrganizado[key]) {
                            historialOrganizado[key] = [];
                        }
                        historialOrganizado[key].push(comentario);
                    });

                    // Ordenar historial del más antiguo al más nuevo
                    Object.keys(historialOrganizado).forEach(key => {
                        historialOrganizado[key].sort((a, b) =>
                            new Date(a.creadoEn) - new Date(b.creadoEn)
                        );

                        // El comentario a mostrar es el más reciente (último del array ordenado)
                        comentariosOrganizados[key] = historialOrganizado[key][historialOrganizado[key].length - 1];
                    });

                    setComentarios(comentariosOrganizados);
                    setHistorialComentarios(historialOrganizado);
                }
            } catch (err) {
                console.error('Error cargando comentarios:', err);
            } finally {
                setCargandoComentarios(false);
            }
        };

        obtenerComentarios();
    }, [id, user]);

    const mostrarNotificacion = (tipo, titulo, mensaje) => {
        setNotificacion({ tipo, titulo, mensaje });
    };

    const cerrarNotificacion = () => {
        setNotificacion(null);
    };

    const toggleHistorial = (key) => {
        setMostrarHistorial(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleVideoExpandido = (videoKey) => {
        setVideosExpandidos(prev => ({
            ...prev,
            [videoKey]: !prev[videoKey]
        }));
    };

    const pedirConfirmacionEliminar = (bloqueId, bloqueTitulo, diaNombre, semanaNumero) => {
        setConfirmarEliminar({
            mostrar: true,
            bloqueId,
            bloqueTitulo,
            diaNombre,
            semanaNumero
        });
    };

    const cancelarEliminar = () => {
        if (eliminando) return;
        setConfirmarEliminar({
            mostrar: false,
            bloqueId: null,
            bloqueTitulo: '',
            diaNombre: '',
            semanaNumero: null
        });
    };

    const eliminarBloqueDeDia = async () => {
        const { bloqueId, bloqueTitulo, diaNombre, semanaNumero } = confirmarEliminar;

        try {
            setEliminando(true);
            const token = localStorage.getItem('token');
            const res = await fetch(
                `/api/planificaciones/${id}/semanas/${semanaNumero}/bloques/${bloqueId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al eliminar el bloque');
            }

            // Recargar la planificación
            const planRes = await fetch(`/api/planificaciones/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (planRes.ok) {
                const data = await planRes.json();
                setPlanificacion(data.data);
                mostrarNotificacion('success', 'Bloque eliminado', `"${bloqueTitulo}" fue eliminado de ${diaNombre}`);
            }

            cancelarEliminar();
        } catch (err) {
            console.error('Error al eliminar bloque:', err);
            mostrarNotificacion('error', 'Error al eliminar', err.message || 'No se pudo eliminar el bloque');
        } finally {
            setEliminando(false);
        }
    };

    const manejarNuevoComentario = (diaNombre, semanaNumero) => {
        return async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const key = `${semanaNumero}-${diaNombre}`;
            const texto = nuevosComentarios[key];

            try {
                const res = await fetch(`/api/comentarios`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        planificacion: id,
                        semana: semanaNumero,
                        dia: diaNombre,
                        texto
                    })
                });

                if (res.ok) {
                    const { data } = await res.json();

                    // Actualizar comentario actual
                    setComentarios(prev => ({
                        ...prev,
                        [key]: data
                    }));

                    // Actualizar historial
                    setHistorialComentarios(prev => ({
                        ...prev,
                        [key]: [...(prev[key] || []), data]
                    }));

                    setNuevosComentarios(prev => {
                        const nuevos = { ...prev };
                        delete nuevos[key];
                        return nuevos;
                    });
                }
            } catch (err) {
                console.error('Error al crear comentario:', err);
            }
        };
    };

    const manejarEditarComentario = async () => {
        if (!editandoComentario) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/api/comentarios/${editandoComentario._id}`, {
                method: 'PUT',
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

                // Actualizar en el historial
                setHistorialComentarios(prev => ({
                    ...prev,
                    [key]: prev[key].map(c => c._id === data._id ? data : c)
                }));

                setEditandoComentario(null);
                setEditandoTexto('');
            }
        } catch (err) {
            console.error('Error al editar comentario:', err);
        }
    };

    const manejarEliminarComentario = async (comentarioId, semanaNumero, diaNombre) => {
        const token = localStorage.getItem('token');
        const key = `${semanaNumero}-${diaNombre}`;

        try {
            const res = await fetch(`/api/comentarios/${comentarioId}`, {
                method: 'DELETE',
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

                // Eliminar del historial
                setHistorialComentarios(prev => ({
                    ...prev,
                    [key]: (prev[key] || []).filter(c => c._id !== comentarioId)
                }));
            }
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
        }
    };

    const manejarResponderComentario = (comentarioId, semanaNumero, diaNombre) => {
        return async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const respuestaTexto = respuestas[comentarioId];
            const key = `${semanaNumero}-${diaNombre}`;

            try {
                const res = await fetch(`/api/comentarios/${comentarioId}/responder`, {
                    method: 'POST',
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
                }
            } catch (err) {
                console.error('Error al responder comentario:', err);
            }
        };
    };

    const manejarEditarRespuesta = async () => {
        if (!editandoRespuesta) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/api/comentarios/${editandoRespuesta.comentarioId}/respuesta`, {
                method: 'PUT',
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
            }
        } catch (err) {
            console.error('Error al editar respuesta:', err);
        }
    };

    const manejarEliminarRespuesta = async (comentarioId, semanaNumero, diaNombre) => {
        const token = localStorage.getItem('token');
        const key = `${semanaNumero}-${diaNombre}`;

        try {
            const res = await fetch(`/api/comentarios/${comentarioId}/respuesta`, {
                method: 'DELETE',
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
            }
        } catch (err) {
            console.error('Error al eliminar respuesta:', err);
        }
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
                <p className="mt-4 text-lg font-medium">CARGANDO PLANIFICACIÓN...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center border-2 border-black dark:border-gray-600 bg-white dark:bg-black mx-6 my-8">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">ERROR AL CARGAR LA PLANIFICACIÓN</h3>
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

    if (!planificacion) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-center">
                <p>No se encontraron datos de la planificación</p>
                <SmartLink
                    to="/planes"
                    className="mt-4 inline-block px-4 py-2 bg-black text-white"
                >
                    <ChevronLeft size={16} className="inline mr-1" /> Volver
                </SmartLink>
            </div>
        );
    }

    // Determinar si el usuario es entrenador/admin
    const esEntrenador = user?.rol === 'admin' || user?.rol === 'coach';

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {notificacion && (
                <Notificacion
                    tipo={notificacion.tipo}
                    titulo={notificacion.titulo}
                    mensaje={notificacion.mensaje}
                    onClose={cerrarNotificacion}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
                <div className="flex items-center gap-4">
                    <SmartLink
                        to="/planes"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                    >
                        <ChevronLeft size={20} className="mr-1" /> VOLVER
                    </SmartLink>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        DETALLE DE PLANIFICACIÓN
                    </h1>
                </div>
            </div>

            {/* Plan Header */}
            <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 mb-8">
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
                    <SmartLink
                        to={`/planificacion/${planificacion._id}/foro`}
                        className="px-4 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        target='_blank'
                    >
                        VER FORO
                    </SmartLink>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">DURACIÓN TOTAL</h3>
                        <p className="text-xl flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {planificacion.semanas?.length || 0} semanas
                        </p>
                    </div>
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">DÍAS ACTIVOS</h3>
                        <p className="text-xl flex items-center gap-2">
                            <Dumbbell className="w-5 h-5" />
                            {planificacion.totalDias - planificacion.totalDescansos || 0} días
                        </p>
                    </div>
                    <div className="border border-black dark:border-gray-600 p-4">
                        <h3 className="font-bold mb-2">ESTADO</h3>
                        <p className="text-xl flex items-center gap-2">
                            <Check className="text-green-500 w-5 h-5" /> Activa
                        </p>
                    </div>
                </div>
            </div>

            {/* Selector de semanas */}
            <div className="mb-6 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                    {planificacion.semanas?.map((semana, index) => (
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

            {/* Detalle de la semana */}
            <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-4 sm:p-8">
                <h2 className="text-xl font-bold mb-6">
                    SEMANA {planificacion.semanas?.[semanaActiva]?.numero} - DETALLE
                </h2>

                <div className="flex flex-col gap-8">
                    {planificacion.semanas?.[semanaActiva]?.dias?.map((dia, diaIndex) => {
                        const comentarioKey = `${planificacion.semanas[semanaActiva].numero}-${dia.nombre}`;
                        const comentario = comentarios[comentarioKey];
                        const historial = historialComentarios[comentarioKey] || [];
                        const tieneHistorial = historial.length > 1;

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
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {bloque.tipo === 'ejercicios' ? (
                                                                <Zap className="w-4 h-4 text-yellow-500" />
                                                            ) : (
                                                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                                            )}
                                                            <h4 className="font-bold text-sm">
                                                                {bloque.titulo || 'Bloque sin título'}
                                                            </h4>
                                                        </div>

                                                        {esEntrenador && (
                                                            <button
                                                                onClick={() => pedirConfirmacionEliminar(
                                                                    bloque._id,
                                                                    bloque.titulo,
                                                                    dia.nombre,
                                                                    planificacion.semanas[semanaActiva].numero
                                                                )}
                                                                className="p-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                                title="Eliminar bloque"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {bloque.tipo === 'ejercicios' ? (
                                                        <div className="space-y-4">
                                                            {bloque.ejercicios?.map((ejercicio, ejIndex) => {
                                                                const escala = (ejercicio.escala || '').toUpperCase();
                                                                const esfuerzoVal = ejercicio.esfuerzoPercibido ?? '';
                                                                const tieneEsfuerzo = escala && esfuerzoVal !== '' && esfuerzoVal !== null && esfuerzoVal !== undefined;
                                                                // CLAVE: Incluir bloqueIndex Y diaIndex para hacer la key única
                                                                const videoKey = `${semanaActiva}-${diaIndex}-${bloqueIndex}-${ejIndex}`;
                                                                const videoExpandido = videosExpandidos[videoKey];

                                                                return (
                                                                    <div key={ejIndex} className="border-t border-gray-300 dark:border-gray-600 pt-3 first:border-t-0 first:pt-0">
                                                                        {/* Nombre del ejercicio */}
                                                                        <p className="font-bold text-lg mb-2">{ejercicio.nombre}</p>

                                                                        {/* Series y repeticiones MÁS GRANDES */}
                                                                        <div className="flex items-center gap-3 mb-3">
                                                                            <span className="text-2xl font-bold">
                                                                                {ejercicio.series}x{ejercicio.repeticiones}
                                                                            </span>

                                                                            {tieneEsfuerzo && (
                                                                                <span
                                                                                    className={[
                                                                                        "inline-flex items-center gap-1 px-3 py-1",
                                                                                        "border-2 border-black dark:border-gray-600",
                                                                                        "bg-white dark:bg-black font-bold"
                                                                                    ].join(' ')}
                                                                                    title={escala === 'RPE' ? 'Esfuerzo percibido (1–10)' : 'Repeticiones en recámara (0–5)'}
                                                                                >
                                                                                    <span className="text-sm tracking-wide">{escala}</span>
                                                                                    <span className="text-lg">{esfuerzoVal}</span>
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Video más pequeño y expandible */}
                                                                        {ejercicio.linkVideo && (() => {
                                                                            const { id, isShort } = getYouTubeId(ejercicio.linkVideo);
                                                                            return (
                                                                                <div className="mt-2">
                                                                                    <button
                                                                                        onClick={() => toggleVideoExpandido(videoKey)}
                                                                                        className="flex items-center gap-2 mb-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                                                    >
                                                                                        <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24">
                                                                                            <path fill="currentColor" d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                                                        </svg>
                                                                                        <span>{videoExpandido ? 'Ocultar' : 'Ver'} video demostrativo {isShort ? '(Short)' : ''}</span>
                                                                                        {videoExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                                    </button>

                                                                                    {videoExpandido && (
                                                                                        <div className={`relative ${isShort ? 'aspect-[9/16] w-full max-w-[280px]' : 'aspect-video max-w-md'} bg-black rounded`}>
                                                                                            <iframe
                                                                                                className="w-full h-full rounded"
                                                                                                src={`https://www.youtube.com/embed/${id}?autoplay=1${isShort ? '&controls=0&modestbranding=1' : '&rel=0&modestbranding=1'}`}
                                                                                                title="Video demostración del ejercicio"
                                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                                allowFullScreen
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })()}
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

                                {/* Sección de comentarios - SIN RESTRICCIÓN DE CATEGORÍA */}
                                {!cargandoComentarios && (
                                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquare className="w-4 h-4" />
                                            <h5 className="text-sm font-bold">COMENTARIOS</h5>
                                        </div>

                                        {/* Mostrar historial de comentarios */}
                                        {tieneHistorial && (
                                            <div className="mb-4">
                                                <button
                                                    onClick={() => toggleHistorial(comentarioKey)}
                                                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
                                                >
                                                    {mostrarHistorial[comentarioKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    <span>{mostrarHistorial[comentarioKey] ? 'Ocultar' : 'Ver'} historial ({historial.length} comentarios)</span>
                                                </button>

                                                {mostrarHistorial[comentarioKey] && (
                                                    <div className="space-y-3 mb-4 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                                        {historial.map((comentarioHistorico, idx) => (
                                                            <div key={comentarioHistorico._id} className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
                                                                <p className="whitespace-pre-line mb-1">{comentarioHistorico.texto}</p>
                                                                <div className="text-xs text-gray-500">
                                                                    {formatDate(comentarioHistorico.creadoEn)}
                                                                    {idx === historial.length - 1 && <span className="ml-2 font-bold text-blue-600">(Más reciente)</span>}
                                                                </div>
                                                                {comentarioHistorico.respuesta && (
                                                                    <div className="mt-2 pl-3 border-l-2 border-orange-500">
                                                                        <span className="text-xs font-bold text-orange-500">RESPUESTA:</span>
                                                                        <p className="text-xs mt-1">{comentarioHistorico.respuesta.texto}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Modo edición del comentario más reciente */}
                                        {editandoComentario?._id === comentario?._id ? (
                                            <div className="space-y-2 mb-4">
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
                                                        onClick={() => {
                                                            setEditandoComentario(null);
                                                            setEditandoTexto('');
                                                        }}
                                                        className="px-3 py-1 bg-white dark:bg-black text-black dark:text-white text-xs font-bold border border-black dark:border-gray-600"
                                                    >
                                                        CANCELAR
                                                    </button>
                                                </div>
                                            </div>
                                        ) : comentario ? (
                                            /* Mostrar comentario más reciente */
                                            <div className="text-sm mb-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="whitespace-pre-line">{comentario.texto}</p>
                                                    {comentario.autor?._id === user?.id && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditandoComentario(comentario);
                                                                    setEditandoTexto(comentario.texto);
                                                                }}
                                                                className="text-gray-500 hover:text-blue-500"
                                                                title="Editar comentario"
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
                                                                title="Eliminar comentario"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {formatDate(comentario.creadoEn)}
                                                </div>

                                                {/* Respuesta del entrenador */}
                                                {comentario.respuesta && (
                                                    <div className="mt-3 pl-3 border-l-2 border-orange-500">
                                                        <span className="text-xs font-bold text-orange-500">RESPUESTA DEL ENTRENADOR:</span>
                                                        <p className="text-sm mt-1">{comentario.respuesta.texto}</p>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {formatDate(comentario.respuesta.fecha)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* Formulario para agregar NUEVO comentario (visible solo si ya existe al menos un comentario previo O si no eres entrenador y no hay ninguno) */}
                                        {!esEntrenador && (comentario || historial.length === 0) && (
                                            <form
                                                onSubmit={manejarNuevoComentario(
                                                    dia.nombre,
                                                    planificacion.semanas[semanaActiva].numero
                                                )}
                                                className="space-y-2"
                                            >
                                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    {comentario ? 'AGREGAR NUEVO COMENTARIO' : 'AGREGAR COMENTARIO'}
                                                </label>
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
                                                    placeholder={comentario ? "Añadir nuevo comentario sobre este día..." : "Añadir comentario..."}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!nuevosComentarios[comentarioKey]?.trim()}
                                                    className="flex items-center gap-1 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold border border-black dark:border-gray-600 disabled:opacity-50"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    <span>ENVIAR COMENTARIO</span>
                                                </button>
                                            </form>
                                        )}

                                        {/* Responder comentario (solo entrenadores) */}
                                        {esEntrenador && comentario && !comentario.respuesta && (
                                            <div className="mt-3">
                                                <label className="text-xs font-bold text-orange-500">
                                                    RESPONDER COMO ENTRENADOR
                                                </label>
                                                <textarea
                                                    value={respuestas[comentario._id] || ''}
                                                    onChange={(e) =>
                                                        setRespuestas((prev) => ({
                                                            ...prev,
                                                            [comentario._id]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-sm mt-2"
                                                    rows="2"
                                                    placeholder="Escribe tu respuesta..."
                                                />
                                                <button
                                                    onClick={manejarResponderComentario(
                                                        comentario._id,
                                                        planificacion.semanas[semanaActiva].numero,
                                                        dia.nombre
                                                    )}
                                                    disabled={!respuestas[comentario._id]?.trim()}
                                                    className="mt-2 flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-xs font-bold border border-orange-500 disabled:opacity-50"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    <span>ENVIAR RESPUESTA</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {confirmarEliminar.mostrar && (
                <Modal
                    isOpen={confirmarEliminar.mostrar}
                    onClose={cancelarEliminar}
                    title="CONFIRMAR ELIMINACIÓN"
                >
                    <p className="mb-6 text-lg">
                        ¿Estás seguro de eliminar <strong>"{confirmarEliminar.bloqueTitulo}"</strong> de <strong>{confirmarEliminar.diaNombre}</strong>?
                    </p>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                        Esta acción no se puede deshacer.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={cancelarEliminar}
                            className="px-4 py-2 border-2 border-black dark:border-gray-600 font-bold hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
                            disabled={eliminando}
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={eliminarBloqueDeDia}
                            className="px-4 py-2 border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white disabled:opacity-60"
                            disabled={eliminando}
                        >
                            {eliminando ? 'ELIMINANDO...' : 'ELIMINAR'}
                        </button>
                    </div>
                </Modal>
            )}
        </section>
    );
};

export default DetallePlanificacion;