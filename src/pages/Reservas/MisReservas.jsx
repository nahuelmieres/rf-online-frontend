import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, X, Loader2 } from 'lucide-react';
import Notificacion from '../../components/Notificacion';
import { useAuth } from '../../hooks/useAuth';

const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const obtenerReservas = async () => {
      if (!user) return;
      
      try {
        setCargando(true);
        const res = await fetch('/api/reservas/mis-reservas', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setReservas(data);
        }
      } catch (error) {
        setNotificacion({ tipo: 'error', mensaje: 'Error al cargar reservas' });
      } finally {
        setCargando(false);
      }
    };
    
    obtenerReservas();
  }, [user]);

  const cancelarReserva = async (id) => {
    try {
      const res = await fetch(`/api/reservas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        setReservas(reservas.filter(r => r._id !== id));
        setNotificacion({ tipo: 'success', mensaje: 'Reserva cancelada' });
      }
    } catch (error) {
      setNotificacion({ tipo: 'error', mensaje: 'Error al cancelar reserva' });
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard">
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}

      <h2 className="text-2xl font-bold mb-6">MIS RESERVAS</h2>

      {reservas.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="mx-auto mb-4" size={40} />
          <p>No tienes reservas activas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservas.map(reserva => (
            <div 
              key={reserva._id}
              className="border-2 border-black dark:border-gray-600 p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-bold">
                  {format(parseISO(reserva.fecha), 'dd/MM/yyyy HH:mm')}
                </div>
                <div className="text-sm">
                  {reserva.sucursal === 'malvin' ? 'Malvín' : 'La Blanqueada'} - 
                  {reserva.tipo === 'salud' ? ' Salud y Fitness' : ' Open Box'}
                </div>
              </div>
              
              <button
                onClick={() => cancelarReserva(reserva._id)}
                className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisReservas;