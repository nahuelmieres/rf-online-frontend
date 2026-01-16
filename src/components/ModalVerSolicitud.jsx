// components/ModalVerSolicitud.jsx
import React from 'react';
import { X, User, Calendar, Dumbbell, Target, AlertCircle, Heart } from 'lucide-react';

const ModalVerSolicitud = ({ isOpen, onClose, planRequest, usuario, onAsignarPlanificacion }) => {
  if (!isOpen || !planRequest) return null;

  const { questionnaire } = planRequest;
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAsignar = () => {
    if (onAsignarPlanificacion && usuario) {
      onAsignarPlanificacion(usuario._id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-hard">
        {/* Header */}
        <div className="border-b-2 border-black dark:border-gray-600 p-6 flex justify-between items-center sticky top-0 bg-white dark:bg-black z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-black dark:border-gray-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">SOLICITUD DE PLAN PERSONALIZADO</h2>
              <p className="text-sm mt-1">
                {usuario?.nombre?.toUpperCase()} • {formatearFecha(planRequest.createdAt)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del Usuario */}
          <div className="border-2 border-black dark:border-gray-600 p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <User size={20} />
              INFORMACIÓN DEL USUARIO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold">NOMBRE</p>
                <p className="border-2 border-black dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-900">
                  {usuario?.nombre || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="font-bold">EMAIL</p>
                <p className="border-2 border-black dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-900">
                  {usuario?.email || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Objetivo y Nivel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-black dark:border-gray-600 p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Target size={20} />
                OBJETIVO
              </h3>
              <p className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 min-h-[80px]">
                {questionnaire.objetivo}
              </p>
            </div>

            <div className="border-2 border-black dark:border-gray-600 p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Dumbbell size={20} />
                NIVEL
              </h3>
              <div className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                <span className="font-bold text-lg capitalize">{questionnaire.nivel}</span>
              </div>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="border-2 border-black dark:border-gray-600 p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Calendar size={20} />
              DISPONIBILIDAD
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-bold">DÍAS POR SEMANA</p>
                <div className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 text-center">
                  <span className="text-2xl font-bold">{questionnaire.disponibilidad.diasPorSemana}</span>
                  <p className="text-sm">días</p>
                </div>
              </div>
              
              <div>
                <p className="font-bold">MINUTOS POR DÍA</p>
                <div className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 text-center">
                  <span className="text-2xl font-bold">{questionnaire.disponibilidad.minutosPorDia}</span>
                  <p className="text-sm">minutos</p>
                </div>
              </div>

              <div>
                <p className="font-bold">DÍAS PREFERIDOS</p>
                <div className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {diasSemana.map(dia => (
                      <span
                        key={dia}
                        className={`px-2 py-1 border-2 text-xs font-bold ${
                          questionnaire.disponibilidad.diasPreferidos.includes(dia)
                            ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                            : 'border-gray-400 text-gray-400'
                        }`}
                      >
                        {dia.slice(0, 3).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipamiento */}
          <div className="border-2 border-black dark:border-gray-600 p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Dumbbell size={20} />
              EQUIPAMIENTO DISPONIBLE
            </h3>
            <p className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 min-h-[80px]">
              {questionnaire.equipamiento}
            </p>
          </div>

          {/* Lesiones y Limitaciones */}
          <div className="border-2 border-black dark:border-gray-600 p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <AlertCircle size={20} />
              LESIONES Y LIMITACIONES
            </h3>
            <p className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 min-h-[80px]">
              {questionnaire.lesiones}
            </p>
          </div>

          {/* Preferencias Adicionales */}
          <div className="border-2 border-black dark:border-gray-600 p-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Heart size={20} />
              PREFERENCIAS ADICIONALES
            </h3>
            <p className="border-2 border-black dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-900 min-h-[100px]">
              {questionnaire.preferencias}
            </p>
          </div>

          {/* Información de la Solicitud */}
          <div className="border-2 border-black dark:border-gray-600 p-4 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20">
            <h3 className="font-bold text-lg mb-3">INFORMACIÓN DE LA SOLICITUD</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold">ESTADO</p>
                <div className="border-2 border-black dark:border-gray-600 p-2 bg-white dark:bg-black font-bold">
                  {planRequest.estado.toUpperCase()}
                </div>
              </div>
              <div>
                <p className="font-bold">FECHA DE CREACIÓN</p>
                <div className="border-2 border-black dark:border-gray-600 p-2 bg-white dark:bg-black">
                  {formatearFecha(planRequest.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              CERRAR
            </button>
            <button
              onClick={handleAsignar}
              className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              ASIGNAR PLANIFICACIÓN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalVerSolicitud;