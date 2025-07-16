import React, { useEffect, useState } from "react";
import { User, Mail, Shield, CreditCard, Loader2, AlertCircle, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cuenta = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/perfil`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener el perfil');
        
        const { data } = await res.json();
        setPerfil(data.usuario);
      } catch (error) {
        console.error("Error al obtener el perfil", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Función para verificar el estado de la suscripción basado en fechaVencimiento
  const getSubscriptionStatus = () => {
    // Admin/coach siempre tienen acceso
    if (perfil?.rol === 'admin' || perfil?.rol === 'coach') {
      return { status: 'Activa', message: 'Acceso completo (staff)' };
    }

    if (!perfil?.fechaVencimiento) {
      return { status: 'Inactiva', message: 'Sin suscripción activa' };
    }
    
    const hoy = new Date();
    const vencimiento = new Date(perfil.fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) {
      return { status: 'Vencida', message: 'Suscripción vencida' };
    }
    if (diffDays <= 7) {
      return { 
        status: 'Activa', 
        message: `Vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}` 
      };
    }
    return { status: 'Activa', message: 'Suscripción activa' };
  };

  // Obtener el estado actual
  const subscriptionStatus = getSubscriptionStatus();
  const isActive = subscriptionStatus.status === 'Activa';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tus datos...</p>
    </div>
  );

  if (error || !perfil) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
      <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-500 dark:text-red-400 mb-2">Error al cargar el perfil</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
      <Link 
        to="/" 
        className="text-orange-500 dark:text-orange-400 hover:underline"
      >
        Volver al inicio
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 card">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-orange-500 dark:text-orange-400" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi cuenta</h1>
      </div>
      
      <div className="space-y-6">
        {/* Sección Información Personal */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Información personal</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<User className="w-5 h-5" />}
              label="Nombre"
              value={perfil.nombre}
            />
            
            <InfoItem 
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={perfil.email}
            />
            
            <InfoItem 
              icon={<Shield className="w-5 h-5" />}
              label="Rol"
              value={perfil.rol}
              capitalize
            />
          </div>
        </div>

        {/* Sección Suscripción */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Suscripción</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<CreditCard className="w-5 h-5" />}
              label="Estado"
              value={isActive ? "Activo" : "Inactivo"}
              iconStatus={isActive ? 
                <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                <XCircle className="w-5 h-5 text-red-500" />
              }
            />

            <InfoItem 
              icon={<Calendar className="w-5 h-5" />}
              label="Vencimiento"
              value={formatDate(perfil.fechaVencimiento)}
              status={subscriptionStatus.message}
            />
          </div>

          {/* Mensaje de estado de suscripción */}
          <div className={`mt-4 p-3 rounded-md ${
            !isActive ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
            subscriptionStatus.message.includes('Vence en') ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
            perfil.rol === 'admin' || perfil.rol === 'coach' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
            'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
          }`}>
            {perfil.rol === 'admin' || perfil.rol === 'coach' ? (
              <p>Tienes acceso completo como {perfil.rol}</p>
            ) : !isActive ? (
              <p>No tienes una suscripción activa.</p>
            ) : subscriptionStatus.message.includes('Vence en') ? (
              <p>Tu suscripción {subscriptionStatus.message}. ¡No olvides renovarla!</p>
            ) : (
              <p>Tu suscripción está activa.</p>
            )}
          </div>

          {(perfil.rol === 'cliente' && (!isActive || subscriptionStatus.message.includes('Vence en'))) && (
            <Link
              to="/suscripcion"
              className="inline-block mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
            >
              {isActive ? 'Renovar suscripción' : 'Activar suscripción'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para items de información
const InfoItem = ({ icon, label, value, capitalize = false, iconStatus = null, status = null }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-gray-800 dark:text-white ${capitalize ? 'capitalize' : ''}`}>
        {value}
        {iconStatus && <span className="ml-2">{iconStatus}</span>}
      </p>
      {status && (
        <p className={`text-sm mt-1 ${
          status.includes('Vence en') ? 'text-yellow-500 dark:text-yellow-400' :
          status === 'Suscripción vencida' || status === 'Sin suscripción activa' ? 'text-red-500 dark:text-red-400' :
          'text-green-500 dark:text-green-400'
        }`}>
          {status}
        </p>
      )}
    </div>
  </div>
);

export default Cuenta;