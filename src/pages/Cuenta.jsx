import React, { useEffect, useState } from "react";
import { User, Mail, Shield, CreditCard, Loader2, AlertCircle, CheckCircle2, XCircle, Calendar, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cuenta = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const formatDate = (dateString) => {
    if (!dateString) return 'NO DEFINIDA';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  const getSubscriptionStatus = () => {
    if (perfil?.rol === 'admin' || perfil?.rol === 'coach') {
      return { status: 'ACTIVA', message: 'ACCESO COMPLETO (STAFF)' };
    }

    if (!perfil?.fechaVencimiento) {
      return { status: 'INACTIVA', message: 'SIN SUSCRIPCIÓN ACTIVA' };
    }
    
    const hoy = new Date();
    const vencimiento = new Date(perfil.fechaVencimiento);
    const diffTime = vencimiento - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays < 0) {
      return { status: 'VENCIDA', message: 'SUSCRIPCIÓN VENCIDA' };
    }
    if (diffDays <= 7) {
      return { 
        status: 'ACTIVA', 
        message: `VENCE EN ${diffDays} DÍA${diffDays !== 1 ? 'S' : ''}` 
      };
    }
    return { status: 'ACTIVA', message: 'SUSCRIPCIÓN ACTIVA' };
  };

  const subscriptionStatus = getSubscriptionStatus();
  const isActive = subscriptionStatus.status === 'ACTIVA';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
      <p className="mt-4 text-lg font-medium">CARGANDO TUS DATOS...</p>
    </div>
  );

  if (error || !perfil) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-6 mx-4">
      <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">ERROR AL CARGAR EL PERFIL</h3>
      <p className="text-lg mb-6">{error}</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
      >
        VOLVER AL INICIO
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight">MI CUENTA</h1>
      </div>
      
      <div className="space-y-8">
        {/* Sección Información Personal */}
        <div className="border-b-2 border-black dark:border-gray-600 pb-8">
          <h2 className="text-xl font-bold mb-6">INFORMACIÓN PERSONAL</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              icon={<User />}
              label="NOMBRE"
              value={perfil.nombre}
            />
            
            <InfoItem 
              icon={<Mail />}
              label="EMAIL"
              value={perfil.email}
            />
            
            <InfoItem 
              icon={<Shield />}
              label="ROL"
              value={perfil.rol.toUpperCase()}
            />
          </div>
        </div>

        {/* Sección Suscripción */}
        <div>
          <h2 className="text-xl font-bold mb-6">SUSCRIPCIÓN</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem 
              icon={<CreditCard />}
              label="ESTADO"
              value={isActive ? "ACTIVO" : "INACTIVO"}
              iconStatus={isActive ? 
                <CheckCircle2 className="text-green-500" /> : 
                <XCircle className="text-red-500" />
              }
            />

            <InfoItem 
              icon={<Calendar />}
              label="VENCIMIENTO"
              value={formatDate(perfil.fechaVencimiento)}
              status={subscriptionStatus.message}
            />
          </div>

          {/* Mensaje de estado de suscripción */}
          <div className={`mt-6 p-4 border-2 ${
            !isActive ? 'border-red-500 bg-red-100 dark:bg-black text-red-500' :
            subscriptionStatus.message.includes('VENCE EN') ? 'border-yellow-500 bg-yellow-100 dark:bg-black text-yellow-500' :
            perfil.rol === 'admin' || perfil.rol === 'coach' ? 'border-blue-500 bg-blue-100 dark:bg-black text-blue-500' :
            'border-green-500 bg-green-100 dark:bg-black text-green-500'
          }`}>
            <p className="font-bold">
              {perfil.rol === 'admin' || perfil.rol === 'coach' ? (
                `TIENES ACCESO COMPLETO COMO ${perfil.rol.toUpperCase()}`
              ) : !isActive ? (
                'NO TIENES UNA SUSCRIPCIÓN ACTIVA'
              ) : subscriptionStatus.message.includes('VENCE EN') ? (
                `TU SUSCRIPCIÓN ${subscriptionStatus.message}. ¡NO OLVIDES RENOVARLA!`
              ) : (
                'TU SUSCRIPCIÓN ESTÁ ACTIVA'
              )}
            </p>
          </div>

          {(perfil.rol === 'cliente' && (!isActive || subscriptionStatus.message.includes('VENCE EN'))) && (
            <Link
              to="/suscripcion"
              className="inline-block mt-6 px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              {isActive ? 'RENOVAR SUSCRIPCIÓN' : 'ACTIVAR SUSCRIPCIÓN'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, iconStatus = null, status = null }) => (
  <div className="border-2 border-black dark:border-gray-600 p-4">
    <div className="flex items-center gap-4 mb-3">
      <div className="bg-black dark:bg-white p-2 border-2 border-black dark:border-gray-600">
        {React.cloneElement(icon, {
          className: "w-6 h-6 text-white dark:text-black"
        })}
      </div>
      <div>
        <p className="text-lg font-bold">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl">{value}</p>
          {iconStatus && React.cloneElement(iconStatus, {
            className: "w-6 h-6"
          })}
        </div>
        {status && (
          <p className={`mt-2 font-medium ${
            status.includes('VENCE EN') ? 'text-yellow-500' :
            status === 'SUSCRIPCIÓN VENCIDA' || status === 'SIN SUSCRIPCIÓN ACTIVA' ? 'text-red-500' :
            'text-green-500'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default Cuenta;