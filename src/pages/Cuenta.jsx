import React, { useEffect, useState } from "react";
import { User, Mail, Shield, CreditCard, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cuenta = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/usuarios/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener el perfil');
        
        const data = await res.json();
        setPerfil(data);
      } catch (error) {
        console.error("Error al obtener el perfil", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

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
          
          <InfoItem 
            icon={<CreditCard className="w-5 h-5" />}
            label="Estado"
            value={perfil.estadoPago ? "Activo" : "Inactivo"}
            iconStatus={perfil.estadoPago ? 
              <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
              <XCircle className="w-5 h-5 text-red-500" />
            }
          />

          {!perfil.estadoPago && (
            <Link
              to="/suscripcion"
              className="inline-block mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
            >
              Activar suscripción
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para items de información
const InfoItem = ({ icon, label, value, capitalize = false, iconStatus = null }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-gray-800 dark:text-white ${capitalize ? 'capitalize' : ''}`}>
        {value}
        {iconStatus && <span className="ml-2">{iconStatus}</span>}
      </p>
    </div>
  </div>
);

export default Cuenta;