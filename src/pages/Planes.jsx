import React, { useEffect, useState } from 'react';

const Planes = () => {
  const [planificacion, setPlanificacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPlanificacion = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/usuarios/perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.mensaje || 'Error al obtener el perfil');
        
        setPlanificacion(data?.planificacion || null);

      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar los planes');
      } finally {
        setCargando(false);
      }
    };

    obtenerPlanificacion();
  }, []);

  if (cargando) return (
    <div className="text-center mt-20 text-gray-600 dark:text-gray-400">
      Cargando planificación...
    </div>
  );

  if (error) return (
    <div className="text-center mt-20 text-red-600 dark:text-red-400">
      {error}
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-8">
        Tus Planes Activos
      </h2>

      {!planificacion ? (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border-l-4 border-orange-500">
          <p className="text-gray-600 dark:text-gray-300">
            No tenés planes activos por el momento.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border-l-4 border-orange-500 transition-all hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {planificacion.titulo}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {planificacion.descripcion}
              </p>
              <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs px-3 py-1 rounded-full">
                {planificacion.tipo}
              </span>
            </div>

            {planificacion.semanas?.length > 0 ? (
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition self-start md:self-center">
                Ver Semanas
              </button>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic self-start md:self-center">
                Aún no hay semanas asignadas
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Planes;