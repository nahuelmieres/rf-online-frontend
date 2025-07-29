import React, { useState, useEffect } from 'react';
import { User, Shield, Dumbbell, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const EntrenadoresCliente = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [entrenadores, setEntrenadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const obtenerEntrenadores = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/usuarios/clientes?rol=admin&rol=coach`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status} al obtener entrenadores`);
      }

      const responseData = await res.json();

      if (!responseData.success || !responseData.data?.usuarios) {
        throw new Error('Formato de respuesta inesperado');
      }

      return responseData.data.usuarios;
    } catch (error) {
      console.error('Error detallado:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error(`No se pudieron cargar los entrenadores: ${error.message}`);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError(null);
        const datos = await obtenerEntrenadores();
        setEntrenadores(datos);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  if (cargando) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin" />
      <p className="mt-4 text-lg font-medium">CARGANDO ENTRENADORES...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black p-8 text-center">
      <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-500 mb-3">ERROR</h2>
      <p className="text-lg mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
      >
        REINTENTAR
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
          <Dumbbell className="w-6 h-6 text-white dark:text-black" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">NUESTROS ENTRENADORES</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entrenadores.length > 0 ? (
          entrenadores.map(entrenador => (
            <div 
              key={entrenador._id} 
              className="border-2 border-black dark:border-gray-600 p-6 text-center "
            >
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto border-2 border-black dark:border-gray-600 bg-black dark:bg-white flex items-center justify-center">
                  <User className="w-10 h-10 text-white dark:text-black" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{entrenador.nombre.toUpperCase()}</h3>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                <span className="font-bold">
                  ENTRENADOR
                </span>
              </div>
              {entrenador.email && (
                <p className="text-lg">{entrenador.email}</p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full border-2 border-black dark:border-gray-600 p-8 text-center">
            <User className="mx-auto w-12 h-12 mb-4" />
            <p className="text-xl font-medium">NO HAY ENTRENADORES REGISTRADOS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntrenadoresCliente;