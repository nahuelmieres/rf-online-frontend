import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Check, Dumbbell, Calendar, AlertTriangle, Loader2, Zap, ZapOff, Coffee, MessageSquare, Edit2, Trash2, Send } from 'lucide-react';
import Notificacion from '../../components/Notificacion';
import { useAuth } from '../../hooks/useAuth';

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

const DetallePlanificacion = () => {
    const { id } = useParams();
    const [planificacion, setPlanificacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [semanaActiva, setSemanaActiva] = useState(0);
    const [notificacion, setNotificacion] = useState(null);
    const [comentarios, setComentarios] = useState({});
    const [nuevosComentarios, setNuevosComentarios] = useState({});
    const [respuestas, setRespuestas] = useState({});
    const [editandoComentario, setEditandoComentario] = useState(null);
    const [editandoTexto, setEditandoTexto] = useState('');
    const [editandoRespuesta, setEditandoRespuesta] = useState(null);
    const [textoEditandoRespuesta, setTextoEditandoRespuesta] = useState('');
    const { user, loading: authLoading } = useAuth();
    const [cargandoComentarios, setCargandoComentarios] = useState(true);

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
                mostrarNotificacion('error', err.message);
            } finally {
                setCargando(false);
            }
        };

        obtenerPlanificacion();
    }, [id]);

    // Efecto independiente para comentarios (depende de user)
    useEffect(() => {
        const obtenerComentarios = async () => {
            if (!user?.id) return; // Salir si no tenemos usuario

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

                    comentariosData.forEach(comentario => {
                        const key = `${comentario.semana}-${comentario.dia}`;
                        comentariosOrganizados[key] = comentario;
                    });

                    setComentarios(comentariosOrganizados);
                }
            } catch (err) {
                console.error('Error cargando comentarios:', err);
            } finally {
                setCargandoComentarios(false);
            }
        };

        obtenerComentarios();
    }, [id, user]); // Dependemos explícitamente de user

    const mostrarNotificacion = (tipo, mensaje) => {
        setNotificacion({ tipo, mensaje });
        setTimeout(() => setNotificacion(null), 5000);
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
                    setComentarios(prev => ({
                        ...prev,
                        [key]: data
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
                <Link
                    to="/planes"
                    className="mt-4 inline-block px-4 py-2 bg-black text-white"
                >
                    <ChevronLeft size={16} className="inline mr-1" /> Volver
                </Link>
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
                    mensaje={notificacion.mensaje}
                    onCerrar={() => setNotificacion(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/planes"
                        className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                    >
                        <ChevronLeft size={20} className="mr-1" /> VOLVER
                    </Link>
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

            {/* Selector de semanas - Horizontal scroll en móvil */}
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
                                                            {bloque.ejercicios?.map((ejercicio, ejIndex) => (
                                                                <div key={ejIndex} className="text-sm">
                                                                    <p className="font-semibold">{ejercicio.nombre}</p>
                                                                    <p className="text-xs">
                                                                        {ejercicio.series}x{ejercicio.repeticiones}
                                                                        {ejercicio.peso && ` @ ${ejercicio.peso}kg`}
                                                                    </p>
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
                                                            ))}
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
                                {!cargandoComentarios && planificacion.categoria === 'personalizada' && !esEntrenador && (
                                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquare className="w-4 h-4" />
                                            <h5 className="text-sm font-bold">COMENTARIOS</h5>
                                        </div>

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
                                        ) : (
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
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default DetallePlanificacion;