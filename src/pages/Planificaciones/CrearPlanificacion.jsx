import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Loader2, ArrowLeft } from 'lucide-react';
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark" />
    </div>
  );

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
        'DÍAS NO SELECCIONADOS',
        'DEBES SELECCIONAR AL MENOS UN DÍA DE ENTRENAMIENTO',
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
        '¡PLANIFICACIÓN CREADA!',
        'LA PLANIFICACIÓN SE HA CREADO CORRECTAMENTE',
        4000
      );

      setTimeout(() => {
        navigate('/gestion/planificaciones');
      }, 1500);

    } catch (error) {
      console.error('Error al crear planificación:', error);
      mostrarNotificacion(
        'error',
        'ERROR AL CREAR',
        error.message || 'OCURRIÓ UN ERROR AL CREAR LA PLANIFICACIÓN',
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

      <div className="max-w-3xl mx-auto border-2 border-black dark:border-gray-600 p-6 bg-white dark:bg-black shadow-hard">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/gestion/planificaciones')}
              className="p-2 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                CREAR PLANIFICACIÓN
              </h1>
              <p className="mt-1 text-lg">
                COMPLETA LOS CAMPOS PARA CREAR UNA NUEVA PLANIFICACIÓN
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold border-b-2 border-black dark:border-gray-600 pb-2">
              INFORMACIÓN BÁSICA
            </h2>

            <div>
              <label htmlFor="titulo" className="block text-lg font-bold mb-2">
                TÍTULO *
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
                placeholder="EJ: PLAN DE HIPERTROFIA AVANZADO"
                required
                minLength="3"
                maxLength="60"
              />
              <p className="mt-2 text-sm">
                MÍNIMO 3 CARACTERES, MÁXIMO 60
              </p>
            </div>

            <div>
              <label htmlFor="tipo" className="block text-lg font-bold mb-2">
                TIPO DE PLANIFICACIÓN *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
                required
              >
                <option value="fuerza">FUERZA</option>
                <option value="hipertrofia">HIPERTROFIA</option>
                <option value="crossfit">CROSSFIT</option>
                <option value="running">RUNNING</option>
                <option value="hibrido">HÍBRIDO</option>
                <option value="gap">GAP (GLÚTEOS, ABDOMEN, PIERNAS)</option>
              </select>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-lg font-bold mb-2">
                DESCRIPCIÓN (OPCIONAL)
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
                rows="3"
                placeholder="DESCRIBE LOS OBJETIVOS DE ESTA PLANIFICACIÓN"
                maxLength="500"
              />
              <p className="mt-2 text-sm">
                MÁXIMO 500 CARACTERES
              </p>
            </div>
          </section>

          {/* Configuración */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold border-b-2 border-black dark:border-gray-600 pb-2">
              CONFIGURACIÓN
            </h2>

            <div>
              <label htmlFor="semanas" className="block text-lg font-bold mb-2">
                CANTIDAD DE SEMANAS (1-12)
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
                className="w-24 p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-lg focus:outline-none"
              />
            </div>

            <div>
              <p className="block text-lg font-bold mb-3">
                DÍAS DE ENTRENAMIENTO POR SEMANA *
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => (
                  <label 
                    key={dia}
                    className={`flex items-center p-3 border-2 cursor-pointer transition-all
                              ${formData.diasPorSemana.includes(dia) 
                                ? 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                                : 'border-black dark:border-gray-600'}`}
                  >
                    <input
                      id={`dia-${dia}`}
                      name="diasPorSemana"
                      type="checkbox"
                      checked={formData.diasPorSemana.includes(dia)}
                      onChange={() => handleDiaChange(dia)}
                      className="hidden"
                    />
                    <span className="text-lg">
                      {dia.toUpperCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/gestion/planificaciones')}
              className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.diasPorSemana.length === 0}
              className={`px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all
                        ${(isSubmitting || formData.diasPorSemana.length === 0) 
                          ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  CREANDO...
                </div>
              ) : 'CREAR PLANIFICACIÓN'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CrearPlanificacion;