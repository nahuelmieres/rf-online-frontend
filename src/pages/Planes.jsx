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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // Verifico si la respuesta fue exitosa
        if (!res.ok) {
          throw new Error(data.mensaje || 'Error al obtener el perfil');
        }

        // Me protejo ante posibles errores de estructura
        const plan = data?.planificacion || null;
        setPlanificacion(plan);

      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerPlanificacion();
  }, []);

  if (cargando) return <p className="text-center mt-10">Cargando planificación...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Tus Planes Activos</h2>

      {!planificacion ? (
        <p className="text-gray-600">No tenés planes activos por el momento.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {planificacion.titulo}
          </h3>
          <p className="text-gray-600 mb-2">{planificacion.descripcion}</p>
          <p className="text-sm text-gray-500 mb-4">Tipo: {planificacion.tipo}</p>

          {planificacion.semanas?.length > 0 ? (
            <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-4 rounded">
              Ver Semanas
            </button>
          ) : (
            <p className="text-gray-500 text-sm italic">Aún no hay semanas asignadas</p>
          )}
        </div>
      )}
    </section>
  );
};

export default Planes;