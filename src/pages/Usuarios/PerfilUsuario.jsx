import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Dumbbell, Calendar, AlertTriangle, Loader2, Plus, Zap, ZapOff, Coffee, MessageSquare, Edit2, Trash2, Send, Check, X, User } from 'lucide-react';
import Loader from '../../components/Loader';

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

            if (!res.ok) throw new Error('Error al obtener comentarios');

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
                    throw new Error(errorData.message || 'Error al cargar usuario');
                }

                const userData = await userRes.json();
                if (!userData.data?.usuarios?.length) {
                    throw new Error('Usuario no encontrado');
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
                        throw new Error(errorData.message || 'Error al cargar planificación');
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
            }
        } catch (err) {
            console.error('Error al editar comentario:', err);
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
            }
        } catch (err) {
            console.error('Error al editar respuesta:', err);
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
            }
        } catch (err) {
            console.error('Error al eliminar respuesta:', err);
        }
    };

    if (authLoading || cargando) {
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

    const esEntrenador = currentUser?.rol === 'admin' || currentUser?.rol === 'coach';

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Sección de información del usuario */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                            <User className="inline-block mr-2" size={20} />
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

                    {currentUser?.id === usuario._id && (
                        <span className="text-sm font-normal bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Tú
                        </span>
                    )}
                </div>
            </div>

            {/* Sección de planificación */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                    <Dumbbell className="inline-block mr-2" size={20} />
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
                                <span className="font-medium">Creada por:</span> {planificacion.creadoPor?.nombre || 'Desconocido'}
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

                        {/* Detalle de la planificación con comentarios */}
                        <div className="mt-8 space-y-8">
                            {planificacion.semanas?.map((semana) => (
                                <div key={semana.numero} className="card p-6">
                                    <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
                                        Semana {semana.numero}
                                    </h4>

                                    <div className="space-y-6">
                                        {semana.dias?.map((dia) => {
                                            const comentarioKey = `${semana.numero}-${dia.nombre}`;
                                            const comentario = comentarios[comentarioKey];

                                            return (
                                                <div key={dia._id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h5 className="text-md font-medium text-gray-800 dark:text-white">
                                                            {dia.nombre}
                                                        </h5>
                                                        {dia.descanso && (
                                                            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                                <Coffee className="w-4 h-4" />
                                                                Día de descanso
                                                            </span>
                                                        )}
                                                    </div>

                                                    {!dia.descanso && dia.bloquesPoblados?.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {dia.bloquesPoblados.map((bloque) => (
                                                                <div key={bloque._id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Zap className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                                                        <span className="font-medium text-orange-500 dark:text-orange-400">
                                                                            {bloque.tipo === 'ejercicios' ? 'Rutina de ejercicios' : 'Notas'}
                                                                        </span>
                                                                    </div>

                                                                    {bloque.tipo === 'ejercicios' ? (
                                                                        <div className="space-y-3">
                                                                            {bloque.ejercicios?.map((ejercicio, index) => (
                                                                                <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded">
                                                                                    <div className="flex items-start gap-3">
                                                                                        <div className="flex-1">
                                                                                            <h6 className="font-medium text-gray-800 dark:text-white">{ejercicio.nombre}</h6>
                                                                                            <div className="flex flex-wrap gap-4 mt-2">
                                                                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                                                    Series: {ejercicio.series}
                                                                                                </span>
                                                                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                                                    Reps: {ejercicio.repeticiones}
                                                                                                </span>
                                                                                                {ejercicio.peso && (
                                                                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                                                        Peso: {ejercicio.peso}
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
                                                                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                                                            {bloque.contenidoTexto}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : !dia.descanso ? (
                                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                            <ZapOff className="w-4 h-4" />
                                                            <span>No hay ejercicios asignados</span>
                                                        </div>
                                                    ) : null}

                                                    <div className="mt-6">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                            <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios</h6>
                                                        </div>

                                                        {editandoComentario?.dia === dia.nombre && editandoComentario?.semana === semana.numero ? (
                                                            <div className="space-y-3">
                                                                <textarea
                                                                    value={editandoTexto}
                                                                    onChange={(e) => setEditandoTexto(e.target.value)}
                                                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                                                                    rows="3"
                                                                    placeholder="Escribe tu comentario..."
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={manejarEditarComentario}
                                                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                                                                    >
                                                                        Guardar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditandoComentario(null)}
                                                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : comentario ? (
                                                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="flex-1">
                                                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                                                            {comentario.texto}
                                                                        </p>
                                                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                                                                                className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                                                                title="Editar comentario"
                                                                            >
                                                                                <Edit2 className="w-5 h-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => manejarEliminarComentario(comentario._id, semana.numero, dia.nombre)}
                                                                                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                                                title="Eliminar comentario"
                                                                            >
                                                                                <Trash2 className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {comentario.respuesta && (
                                                                    <div className="mt-4 pl-4 border-l-2 border-orange-500 dark:border-orange-400">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <span className="text-xs font-medium text-orange-500 dark:text-orange-400">
                                                                                        {comentario.respuesta.autor?.nombre || currentUser.nombre}:
                                                                                    </span>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                                        {formatDate(comentario.respuesta.fecha)}
                                                                                    </span>
                                                                                </div>

                                                                                {editandoRespuesta?.comentarioId === comentario._id ? (
                                                                                    <div className="mt-2">
                                                                                        <textarea
                                                                                            value={textoEditandoRespuesta}
                                                                                            onChange={(e) => setTextoEditandoRespuesta(e.target.value)}
                                                                                            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                                                                                            rows="2"
                                                                                        />
                                                                                        <div className="flex gap-2 mt-2">
                                                                                            <button
                                                                                                onClick={manejarEditarRespuesta}
                                                                                                className="px-3 py-1 text-xs bg-orange-500 text-white rounded"
                                                                                            >
                                                                                                Guardar
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => setEditandoRespuesta(null)}
                                                                                                className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded"
                                                                                            >
                                                                                                Cancelar
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                                                            {comentario.respuesta.texto}
                                                                                        </p>
                                                                                        {esEntrenador && comentario.respuesta.autor?._id === currentUser?.id && (
                                                                                            <div className="flex gap-2 mt-2">
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setEditandoRespuesta({
                                                                                                            comentarioId: comentario._id,
                                                                                                            texto: comentario.respuesta.texto
                                                                                                        });
                                                                                                        setTextoEditandoRespuesta(comentario.respuesta.texto);
                                                                                                    }}
                                                                                                    className="text-xs text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1"
                                                                                                >
                                                                                                    <Edit2 size={14} /> Editar
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => manejarEliminarRespuesta(comentario._id, semana.numero, dia.nombre)}
                                                                                                    className="text-xs text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1"
                                                                                                >
                                                                                                    <Trash2 size={14} /> Eliminar
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
                                                                            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                                                                            rows="2"
                                                                            placeholder="Escribe tu respuesta como entrenador..."
                                                                        />
                                                                        <button
                                                                            onClick={manejarResponderComentario(comentario._id, semana.numero, dia.nombre)}
                                                                            disabled={!respuestas[comentario._id]?.trim()}
                                                                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <Send className="w-4 h-4" />
                                                                            <span>Enviar respuesta</span>
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
                                                                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                                                                    rows="3"
                                                                    placeholder="Escribe un comentario sobre este día..."
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={!nuevosComentarios[comentarioKey]?.trim()}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                    <span>Enviar comentario</span>
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
                    <p className="text-gray-500 dark:text-gray-400">
                        Este usuario no tiene una planificación asignada.
                    </p>
                )}
            </div>
        </div>
    );
};

export default PerfilUsuario;