import React, { useEffect, useState } from 'react';

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPlanes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/planificaciones", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.msg || "Error al obtener planificaciones");

        // Filtrar solo los planes activos
        const activos = data.filter(plan => plan.estadoPago);
        setPlanes(activos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerPlanes();
  }, []);

  if (cargando) return <p className="p-4">Cargando planes...</p>;
  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;

  return (
    <section className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">Tus Planes Activos</h2>
      {planes.length === 0 ? (
        <p className="text-gray-600">No tenés planes activos por el momento.</p>
      ) : (
        <ul className="space-y-4">
          {planes.map(plan => (
            <li key={plan._id} className="p-4 border rounded shadow bg-white">
              <h3 className="font-semibold text-lg text-orange-500">{plan.nombre}</h3>
              <p className="text-sm text-gray-700">
                <strong>Inicio:</strong> {new Date(plan.fechaInicio).toLocaleDateString()}<br />
                <strong>Duración:</strong> {plan.semanas.length} semanas
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Planes;
