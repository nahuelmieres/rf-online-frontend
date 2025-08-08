import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock, LocateIcon, Dumbbell, X, Users, Loader2 } from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GestionReservas = () => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        fecha: null,
        sucursal: '',
        tipo: ''
    });

    // Cargar reservas inicialmente
    useEffect(() => {
        if (user && (user.rol === 'admin' || user.rol === 'coach')) {
            obtenerReservas();
        }
    }, [user]);

    const obtenerReservas = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();

            if (filtros.fecha) {
                params.append('fecha', format(filtros.fecha, 'yyyy-MM-dd'));
            }
            if (filtros.sucursal) params.append('sucursal', filtros.sucursal);
            if (filtros.tipo) params.append('tipo', filtros.tipo);

            const res = await fetch(`/api/reservas?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) throw new Error('Error al obtener reservas');

            const data = await res.json();
            setReservas(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        obtenerReservas();
    };

    const limpiarFiltros = () => {
        setFiltros({
            fecha: null,
            sucursal: '',
            tipo: ''
        });
        // Volver a cargar todas las reservas
        obtenerReservas();
    };

    // Agrupar reservas por fecha, horario, sucursal y tipo
    const agruparReservas = () => {
        const grupos = {};

        reservas.forEach(reserva => {
            const fechaISO = parseISO(reserva.fecha);
            const fechaKey = format(fechaISO, 'yyyy-MM-dd');
            const horaKey = format(fechaISO, 'HH:mm');

            const grupoKey = `${fechaKey}-${horaKey}-${reserva.sucursal}-${reserva.tipo}`;

            if (!grupos[grupoKey]) {
                grupos[grupoKey] = {
                    fecha: fechaKey,
                    hora: horaKey,
                    sucursal: reserva.sucursal,
                    tipo: reserva.tipo,
                    usuarios: [],
                    count: 0
                };
            }

            grupos[grupoKey].usuarios.push({
                nombre: reserva.usuario.nombre,
                email: reserva.usuario.email
            });
            grupos[grupoKey].count = grupos[grupoKey].usuarios.length;
        });

        // Convertir a un array y agrupar por fecha
        const gruposArray = Object.values(grupos);
        const agrupadosPorFecha = {};

        gruposArray.forEach(grupo => {
            if (!agrupadosPorFecha[grupo.fecha]) {
                agrupadosPorFecha[grupo.fecha] = [];
            }
            agrupadosPorFecha[grupo.fecha].push(grupo);
        });

        return agrupadosPorFecha;
    };

    const reservasAgrupadas = agruparReservas();

    if (!user || (user.rol !== 'admin' && user.rol !== 'coach')) {
        return (
            <div className="max-w-3xl mx-auto p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Acceso no autorizado</h2>
                <p>No tienes permisos para ver esta página</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">ADMINISTRACIÓN DE RESERVAS</h2>

            {/* Filtros siempre visibles */}
            <div className="mb-6 p-4 border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block mb-2 font-bold flex items-center gap-2">
                            <Calendar size={20} />
                            <span>Fecha</span>
                        </label>
                        <div className="relative">
                            <DatePicker
                                selected={filtros.fecha}
                                onChange={(date) => setFiltros({ ...filtros, fecha: date })}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Seleccione una fecha"
                                className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                                isClearable
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-bold flex items-center gap-2">
                            <LocateIcon size={20} />
                            <span>Sucursal</span>
                        </label>
                        <div className="relative">
                            <select
                                value={filtros.sucursal}
                                onChange={(e) => setFiltros({ ...filtros, sucursal: e.target.value })}
                                className="w-full p-2 border-2 border-black dark:border-gray-600 appearance-none bg-white dark:bg-black"
                            >
                                <option value="">Todas</option>
                                <option value="malvin">Malvín</option>
                                <option value="blanqueada">La Blanqueada</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-bold flex items-center gap-2">
                            <Dumbbell size={20} />
                            <span>Tipo</span>
                        </label>
                        <div className="relative">
                            <select
                                value={filtros.tipo}
                                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                                className="w-full p-2 border-2 border-black dark:border-gray-600 appearance-none bg-white dark:bg-black"
                            >
                                <option value="">Todos</option>
                                <option value="salud">Salud y Fitness</option>
                                <option value="openbox">Open Box</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={aplicarFiltros}
                            className="px-4 py-2 border-2 border-black dark:border-gray-600 flex-1 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            Aplicar filtros
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="px-4 py-2 border-2 border-black dark:border-gray-600 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Contadores generales */}
            {!loading && !error && reservas.length > 0 && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Contador 1: Reservas totales */}
                    <div className="p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-center shadow-hard">
                        <p className="text-2xl font-bold text-black dark:text-white">{reservas.length}</p>
                        <p className="text-black dark:text-gray-300">Reservas totales</p>
                    </div>

                    {/* Contador 2: Días con reservas */}
                    <div className="p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-center shadow-hard">
                        <p className="text-2xl font-bold text-black dark:text-white">{Object.keys(reservasAgrupadas).length}</p>
                        <p className="text-black dark:text-gray-300">Días con reservas</p>
                    </div>

                    {/* Contador 3: Horarios ocupados */}
                    <div className="p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-center shadow-hard">
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {Object.values(reservasAgrupadas).reduce((total, gruposDia) => total + gruposDia.length, 0)}
                        </p>
                        <p className="text-black dark:text-gray-300">Horarios ocupados</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">
                    <div className="flex justify-center">
                        <Loader2 className="animate-spin text-orange-500" />
                    </div>
                    <p className="mt-2">Cargando reservas...</p>
                </div>
            ) : error ? (
                <div className="p-4 border-2 border-red-500 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
                    <p>{error}</p>
                </div>
            ) : reservas.length === 0 ? (
                <div className="text-center py-8">
                    <p>No se encontraron reservas con los filtros seleccionados</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(reservasAgrupadas)
                        .sort(([fechaA], [fechaB]) => new Date(fechaA) - new Date(fechaB))
                        .map(([fecha, gruposDia]) => (
                            <div key={fecha} className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black">
                                {/* Cabecera */}
                                <div className="p-3 bg-white dark:bg-black border-b-2 border-black dark:border-gray-600 flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2 text-black dark:text-white">
                                        <Calendar size={18} className="text-black dark:text-white" />
                                        {format(new Date(fecha), 'EEEE, d MMMM yyyy').toUpperCase()}
                                    </h3>
                                    <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 font-bold">
                                        {gruposDia.length} {gruposDia.length === 1 ? 'horario' : 'horarios'}
                                    </span>
                                </div>

                                {/* Cuerpo */}
                                <div className="divide-y-2 divide-black dark:divide-gray-600 bg-white dark:bg-black">
                                    {gruposDia
                                        .sort((a, b) => a.hora.localeCompare(b.hora))
                                        .map((grupo, index) => (
                                            <div key={index} className="p-4 bg-white dark:bg-black">
                                                {/* Grid de información */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 text-black dark:text-white">
                                                    <div>
                                                        <p className="font-bold flex items-center gap-2">
                                                            <Clock size={16} className="text-black dark:text-white" />
                                                            {grupo.hora}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="capitalize flex items-center gap-2">
                                                            <LocateIcon size={16} className="text-black dark:text-white" />
                                                            {grupo.sucursal === 'malvin' ? 'Malvín' : 'La Blanqueada'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="capitalize flex items-center gap-2">
                                                            <Dumbbell size={16} className="text-black dark:text-white" />
                                                            {grupo.tipo === 'salud' ? 'Salud y Fitness' : 'Open Box'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="font-bold flex items-center gap-2">
                                                            <Users size={16} className="text-black dark:text-white" />
                                                            {grupo.count} {grupo.count === 1 ? 'usuario' : 'usuarios'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Lista de usuarios */}
                                                <div className="mt-3">
                                                    <h4 className="font-bold mb-2 text-black dark:text-white">Usuarios:</h4>
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                        {grupo.usuarios.map((usuario, idx) => (
                                                            <li key={idx} className="p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-900">
                                                                <p className="font-medium text-black dark:text-white">{usuario.nombre}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{usuario.email}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default GestionReservas;