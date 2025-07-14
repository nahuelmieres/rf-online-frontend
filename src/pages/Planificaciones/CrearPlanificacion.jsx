import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';

const CrearPlanificacion = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'fuerza',
    cantidadSemanas: 2,
    diasPorSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  if (loading) return <Loader className="h-64" />;

  if (!user || !['admin', 'coach'].includes(user.rol)) {
    navigate('/no-autorizado');
    return null;
  }

  const mostrarNotificacion = (tipo, titulo, mensaje, tiempo = 5000) => {
    setNotificacion({ tipo, titulo, mensaje, tiempo });
    setTimeout(() => setNotificacion(null), tiempo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.diasPorSemana.length === 0) {
      mostrarNotificacion(
        'error',
        'Días no seleccionados',
        'Debes seleccionar al menos un día de entrenamiento',
        6000
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planificaciones/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear planificación');
      }

      mostrarNotificacion(
        'success',
        '¡Planificación creada!',
        'La planificación se ha creado correctamente',
        4000
      );

      setTimeout(() => {
        navigate('/gestion/planificaciones');
      }, 1500);

    } catch (error) {
      console.error('Error al crear planificación:', error);
      mostrarNotificacion(
        'error',
        'Error al crear',
        error.message || 'Ocurrió un error al crear la planificación',
        6000
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiaChange = (dia) => {
    const newDias = formData.diasPorSemana.includes(dia)
      ? formData.diasPorSemana.filter(d => d !== dia)
      : [...formData.diasPorSemana, dia];
    
    setFormData({...formData, diasPorSemana: newDias});
  };

  return (
    <>
      {notificacion && (
        <Notificacion
          tipo={notificacion.tipo}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          tiempo={notificacion.tiempo}
          onClose={() => setNotificacion(null)}
        />
      )}

      <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Crear Nueva Planificación
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Completa los campos para crear una nueva planificación de entrenamiento
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
              Información Básica
            </h2>

            <div>
              <label 
                htmlFor="titulo" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Título *
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600"
                placeholder="Ej: Plan de Hipertrofia Avanzado"
                required
                minLength="3"
                maxLength="60"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Mínimo 3 caracteres, máximo 60
              </p>
            </div>

            <div>
              <label 
                htmlFor="tipo" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tipo de Planificación *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600"
                required
              >
                <option value="fuerza">Fuerza</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="crossfit">Crossfit</option>
                <option value="running">Running</option>
                <option value="hibrido">Híbrido</option>
                <option value="gap">GAP (Glúteos, Abdomen, Piernas)</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="descripcion" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Descripción (Opcional)
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600"
                rows="3"
                placeholder="Describe los objetivos y características de esta planificación"
                maxLength="500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Máximo 500 caracteres
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-b pb-2">
              Configuración
            </h2>

            <div>
              <label 
                htmlFor="semanas" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Cantidad de semanas (1-12)
              </label>
              <input
                id="semanas"
                name="semanas"
                type="number"
                min="1"
                max="12"
                value={formData.cantidadSemanas}
                onChange={(e) => setFormData({
                  ...formData, 
                  cantidadSemanas: Math.min(12, Math.max(1, parseInt(e.target.value) || 1))
                })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Días de entrenamiento por semana *
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => (
                  <label 
                    key={dia}
                    className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors
                              ${formData.diasPorSemana.includes(dia) 
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}`}
                  >
                    <input
                      id={`dia-${dia}`}
                      name="diasPorSemana"
                      type="checkbox"
                      checked={formData.diasPorSemana.includes(dia)}
                      onChange={() => handleDiaChange(dia)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 
                                border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                      {dia}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/gestion/planificaciones')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                        text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.diasPorSemana.length === 0}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                        text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        dark:bg-blue-700 dark:hover:bg-blue-800
                        ${(isSubmitting || formData.diasPorSemana.length === 0) 
                          ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : 'Crear Planificación'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CrearPlanificacion;