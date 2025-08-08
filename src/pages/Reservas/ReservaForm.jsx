import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar, Check, LocateIcon, Loader2, X } from 'lucide-react';
import Notificacion from '../../components/Notificacion';
import { useAuth } from '../../hooks/useAuth';

const ReservaForm = () => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [sucursal, setSucursal] = useState('');
    const [tipo, setTipo] = useState('');
    const [hora, setHora] = useState('');
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [notificacion, setNotificacion] = useState(null);
    const { user } = useAuth();

    // Obtener disponibilidad al cambiar fecha o sucursal
    useEffect(() => {
        if (!fechaSeleccionada || !sucursal) return;

        const fetchDisponibilidad = async () => {
            setCargando(true);
            try {
                const fechaISO = format(fechaSeleccionada, 'yyyy-MM-dd');
                const res = await fetch(`/api/reservas/disponibilidad?fecha=${fechaISO}&sucursal=${sucursal}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await res.json();
                setDisponibilidad(data);
            } catch (error) {
                setNotificacion({ tipo: 'error', mensaje: 'Error al cargar disponibilidad', onClose: () => setNotificacion(null) });
            } finally {
                setCargando(false);
            }
        };

        fetchDisponibilidad();
    }, [fechaSeleccionada, sucursal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setNotificacion({ tipo: 'error', mensaje: 'Debes iniciar sesión' });
            return;
        }

        try {
            const fechaCompleta = new Date(`${format(fechaSeleccionada, 'yyyy-MM-dd')}T${hora}`);
            console.log("Fecha completa:", fechaCompleta);

            const res = await fetch('/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                 },
                body: JSON.stringify({
                    fecha: fechaCompleta.toISOString(),
                    tipo,
                    sucursal
                })
            });

            const data = await res.json();
            if (res.ok) {
                setNotificacion({ tipo: 'success', mensaje: '¡Reserva realizada con éxito!' });
                // Resetear selecciones
                setTipo('');
                setHora('');
            } else {
                setNotificacion({ tipo: 'error', mensaje: data.error || 'Error al reservar' });
            }
        } catch (error) {
            setNotificacion({ tipo: 'error', mensaje: 'Error de conexión' });
        }
    };

    // Calcular fechas disponibles (hasta 2 semanas)
    const hoy = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);

    return (
        <div className="max-w-3xl mx-auto p-4 border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard">
            {notificacion && (
                <Notificacion
                    tipo={notificacion.tipo}
                    mensaje={notificacion.mensaje}
                    onClose={() => setNotificacion(null)}
                />
            )}

            <h2 className="text-2xl font-bold mb-6">RESERVAR TURNO</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de fecha */}
                <div>
                    <Calendar className="mb-2" size={24} />
                    <label className="block text-lg font-bold mb-2">Fecha</label>
                    <div className="flex overflow-x-auto gap-2 pb-4">
                        {Array.from({ length: 15 }).map((_, i) => {
                            const fecha = addDays(hoy, i);
                            const fechaStr = format(fecha, 'yyyy-MM-dd');
                            return (
                                <button
                                    key={fechaStr}
                                    type="button"
                                    onClick={() => setFechaSeleccionada(fecha)}
                                    className={`flex-shrink-0 px-4 py-2 min-w-[120px] border-2 font-bold ${isSameDay(fecha, fechaSeleccionada)
                                            ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {format(fecha, 'dd/MM')}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selector de sucursal */}
                <div>
                    <LocateIcon className="mb-2" size={24} />
                    <label className="block text-lg font-bold mb-2">Sucursal</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSucursal('malvin')}
                            className={`p-4 border-2 text-center ${sucursal === 'malvin'
                                    ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                    : 'border-gray-300 dark:border-gray-700'
                                }`}
                        >
                            Malvín
                        </button>
                        <button
                            type="button"
                            onClick={() => setSucursal('blanqueada')}
                            className={`p-4 border-2 text-center ${sucursal === 'blanqueada'
                                    ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                    : 'border-gray-300 dark:border-gray-700'
                                }`}
                        >
                            La Blanqueada
                        </button>
                    </div>
                </div>

                {/* Selector de tipo */}
                <div>
                    <label className="block text-lg font-bold mb-2">Tipo de reserva</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setTipo('salud')}
                            className={`p-4 border-2 text-center ${tipo === 'salud'
                                    ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                    : 'border-gray-300 dark:border-gray-700'
                                }`}
                        >
                            Salud y Fitness
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('openbox')}
                            className={`p-4 border-2 text-center ${tipo === 'openbox'
                                    ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                    : 'border-gray-300 dark:border-gray-700'
                                }`}
                        >
                            Open Box
                        </button>
                    </div>
                </div>

                {/* Horarios disponibles */}
                <div>
                    <label className="block text-lg font-bold mb-2">Horarios</label>
                    {cargando ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin" size={24} />
                        </div>
                    ) : disponibilidad.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {disponibilidad.map((slot, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setHora(format(parseISO(slot.horario), 'HH:mm'))}
                                    className={`p-3 border-2 text-center ${hora === format(parseISO(slot.horario), 'HH:mm')
                                            ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                            : 'border-gray-300 dark:border-gray-700'
                                        } ${tipo === 'salud' && slot.salud <= 0 ? 'opacity-50 cursor-not-allowed' : tipo === 'openbox' && slot.openbox <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={(tipo === 'salud' && slot.salud <= 0) || (tipo === 'openbox' && slot.openbox <= 0)}
                                >
                                    {format(parseISO(slot.horario), 'HH:mm')}
                                    <div className="text-xs mt-1">
                                        {tipo === 'salud' ? `(${slot.salud} cupos)` : `(${slot.openbox} cupos)`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="py-4 text-center">No hay horarios disponibles para esta fecha</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!fechaSeleccionada || !sucursal || !tipo || !hora}
                    className="w-full py-3 px-4 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black text-lg font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
                >
                    RESERVAR
                </button>
            </form>
        </div>
    );
};

export default ReservaForm;