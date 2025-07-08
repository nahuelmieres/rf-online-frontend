import React, { useState, useEffect } from 'react';
import { User, Shield, Dumbbell } from 'lucide-react';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';

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

      // Ajuste clave: Accedemos correctamente a data.usuarios
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

  if (cargando) return <Loader className="h-64" text="Cargando entrenadores..." />;

  if (error) return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-center">
      <Dumbbell className="mx-auto text-orange-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
      <p className="mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary"
      >
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Dumbbell className="text-orange-500" />
        Nuestros Entrenadores
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entrenadores.length > 0 ? (
          entrenadores.map(entrenador => (
            <div key={entrenador._id} className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className="avatar mb-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">{entrenador.nombre}</h3>
              <p className="text-orange-500 font-medium">
                Entrenador
              </p>
              {entrenador.email && (
                <p className="text-gray-600 mt-1 text-sm">{entrenador.email}</p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay entrenadores registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntrenadoresCliente;