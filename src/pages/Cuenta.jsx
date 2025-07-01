import React, { useEffect, useState } from "react";

const Cuenta = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/usuarios/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setPerfil(data);
      } catch (error) {
        console.error("Error al obtener el perfil", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-600 dark:text-gray-400">Cargando datos...</div>;

  if (!perfil) return <div className="text-center mt-20 text-red-500 dark:text-red-400">Error al cargar el perfil.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border-l-4 border-orange-500">
      <h1 className="text-2xl font-bold text-orange-500 dark:text-orange-400 mb-6">Mi cuenta</h1>
      
      <div className="space-y-4">
        <div className="flex items-baseline">
          <span className="inline-block w-24 font-medium text-gray-700 dark:text-gray-300">Nombre:</span>
          <span className="text-gray-900 dark:text-white">{perfil.nombre}</span>
        </div>
        
        <div className="flex items-baseline">
          <span className="inline-block w-24 font-medium text-gray-700 dark:text-gray-300">Email:</span>
          <span className="text-gray-900 dark:text-white">{perfil.email}</span>
        </div>
        
        <div className="flex items-baseline">
          <span className="inline-block w-24 font-medium text-gray-700 dark:text-gray-300">Rol:</span>
          <span className="text-gray-900 dark:text-white capitalize">{perfil.rol}</span>
        </div>
        
        <div className="flex items-baseline">
          <span className="inline-block w-24 font-medium text-gray-700 dark:text-gray-300">Estado:</span>
          <span className={`font-medium ${perfil.estadoPago ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {perfil.estadoPago ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cuenta;