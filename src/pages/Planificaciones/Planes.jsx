import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';
import TarjetaPlan from './TarjetaPlan';

const Planes = () => {
  const [planificacionesBasicas, setPlanificacionesBasicas] = useState([]);
  const [planificacionPersonalizada, setPlanificacionPersonalizada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const obtenerPlanificaciones = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Obtengo planificaciones básicas
        const resBasicas = await fetch('/api/planificaciones?categoria=basica', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Verificar si hay usuario autenticado
        if (!user) {
          setCargando(false);
          return;
        }
        
        // Obtener planificación personalizada si existe
        let resPersonalizada = null;
        if (user?.planPersonalizado?.id) {
          resPersonalizada = await fetch(`/api/planificaciones/${user.planPersonalizado.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }

        if (!resBasicas.ok) {
          throw new Error('Error al obtener planificaciones básicas');
        }
        
        const dataBasicas = await resBasicas.json();
        setPlanificacionesBasicas(dataBasicas);
        
        if (resPersonalizada && resPersonalizada.ok) {
          const dataPersonalizada = await resPersonalizada.json();
          setPlanificacionPersonalizada(dataPersonalizada.data);
        }

      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        mostrarNotificacion('error', err.message);
      } finally {
        setCargando(false);
      }
    };

    // Solo obtener datos si hay usuario
    if (user !== null) {
      obtenerPlanificaciones();
    } else {
      setCargando(false);
    }
  }, [user]); // Dependencia user

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 5000);
  };

  if (cargando) {
    return <Loader mensaje="Cargando las planificaciones..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-black text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          mensaje={notificacion.mensaje}
          onCerrar={() => setNotificacion(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-8">Planificaciones</h1>
      
      {/* Sección para usuarios autenticados */}
      {user ? (
        <>
          {/* Planificación personalizada */}
          {planificacionPersonalizada ? (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Tu Plan Personalizado</h2>
              <TarjetaPlan 
                planificacion={planificacionPersonalizada} 
                esPersonalizada={true} 
              />
            </div>
          ) : (
            <div className="mb-8 p-6 border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-center">
              <h2 className="text-xl font-bold mb-2">¿QUERES UN PLAN PERSONALIZADO?</h2>
              <p className="mb-4">Contrata una planificación personalizada adaptada 100% a tus necesidades</p>
              <button className="px-4 py-2 bg-orange-600 text-white font-bold">
                SOLICITAR PERSONALIZADO
              </button>
            </div>
          )}
          
          {/* Planificaciones básicas */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Planificaciones Básicas</h2>
            {planificacionesBasicas.length > 0 ? (
              planificacionesBasicas.map(plan => (
                <TarjetaPlan 
                  key={plan._id} 
                  planificacion={plan} 
                  esPersonalizada={false} 
                />
              ))
            ) : (
              <p>No hay planificaciones básicas disponibles.</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Acceso restringido</h2>
          <p className="mb-6">Debes iniciar sesión para ver tus planificaciones</p>
          <a 
            href="/login" 
            className="px-4 py-2 bg-black text-white font-bold"
          >
            Iniciar sesión
          </a>
        </div>
      )}
    </div>
  );
};

export default Planes;