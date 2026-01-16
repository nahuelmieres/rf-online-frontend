import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Notificacion from './Notificacion'; // Ajusta la ruta según tu estructura

const ModalCuestionario = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [formData, setFormData] = useState({
    objetivo: '',
    nivel: '',
    lesiones: '',
    equipamiento: '',
    disponibilidad: {
      diasPorSemana: '',
      minutosPorDia: '',
      diasPreferidos: []
    },
    preferencias: ''
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 5000);
  };

  const handleDiaToggle = (dia) => {
    const nuevos = formData.disponibilidad.diasPreferidos.includes(dia)
      ? formData.disponibilidad.diasPreferidos.filter(d => d !== dia)
      : [...formData.disponibilidad.diasPreferidos, dia];
    
    setFormData({
      ...formData,
      disponibilidad: { ...formData.disponibilidad, diasPreferidos: nuevos }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Llamar al endpoint de PayPal
      const res = await fetch('/api/pagos/paypal/suscripcion/personalizado', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questionnaire: formData })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'SUBSCRIPTION_ALREADY_EXISTS') {
          throw new Error('Ya tenés una suscripción activa');
        }
        throw new Error(data.mensaje || 'Error al crear suscripción');
      }

      // Redirigir a PayPal
      window.location.href = data.approvalUrl;
      
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      mostrarNotificacion('error', error.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black border-2 border-black dark:border-gray-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-hard">
        {/* Notificación */}
        {notificacion && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <Notificacion
              tipo={notificacion.tipo}
              mensaje={notificacion.mensaje}
              onClose={() => setNotificacion(null)}
            />
          </div>
        )}

        {/* Header */}
        <div className="border-b-2 border-black dark:border-gray-600 p-6 flex justify-between items-center sticky top-0 bg-white dark:bg-black z-10">
          <div>
            <h2 className="text-2xl font-bold">PLAN PERSONALIZADO</h2>
            <p className="text-sm mt-1">Paso {step} de 3</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* STEP 1: Información básica */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">¿CUÁL ES TU OBJETIVO?</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Ej: Perder peso, ganar masa muscular, mejorar resistencia..."
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">NIVEL DE ENTRENAMIENTO</label>
                <div className="grid grid-cols-3 gap-3">
                  {['principiante', 'intermedio', 'avanzado'].map(nivel => (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => setFormData({...formData, nivel})}
                      className={`p-3 border-2 font-bold transition-all ${
                        formData.nivel === nivel
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                          : 'border-black dark:border-gray-600'
                      }`}
                    >
                      {nivel.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">LESIONES O LIMITACIONES</label>
                <textarea
                  required
                  maxLength={500}
                  rows={3}
                  placeholder="Describí cualquier lesión, dolor o limitación física..."
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                  value={formData.lesiones}
                  onChange={(e) => setFormData({...formData, lesiones: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Disponibilidad */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">¿CUÁNTOS DÍAS POR SEMANA PODÉS ENTRENAR?</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={7}
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                  value={formData.disponibilidad.diasPorSemana}
                  onChange={(e) => setFormData({
                    ...formData,
                    disponibilidad: {...formData.disponibilidad, diasPorSemana: parseInt(e.target.value)}
                  })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">¿CUÁNTOS MINUTOS POR SESIÓN?</label>
                <input
                  type="number"
                  required
                  min={15}
                  max={180}
                  placeholder="Entre 15 y 180 minutos"
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                  value={formData.disponibilidad.minutosPorDia}
                  onChange={(e) => setFormData({
                    ...formData,
                    disponibilidad: {...formData.disponibilidad, minutosPorDia: parseInt(e.target.value)}
                  })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">DÍAS PREFERIDOS (SELECCIONÁ AL MENOS UNO)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {diasSemana.map(dia => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => handleDiaToggle(dia)}
                      className={`p-2 border-2 font-bold transition-all ${
                        formData.disponibilidad.diasPreferidos.includes(dia)
                          ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                          : 'border-black dark:border-gray-600'
                      }`}
                    >
                      {dia.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Equipamiento y preferencias */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block font-bold mb-2">EQUIPAMIENTO DISPONIBLE</label>
                <textarea
                  required
                  maxLength={200}
                  rows={3}
                  placeholder="Ej: Mancuernas, barra, banco, TRX, sin equipamiento..."
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                  value={formData.equipamiento}
                  onChange={(e) => setFormData({...formData, equipamiento: e.target.value})}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">PREFERENCIAS ADICIONALES</label>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  placeholder="Ejercicios que te gustan/disgustan, horarios preferidos, etc..."
                  className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
                  value={formData.preferencias}
                  onChange={(e) => setFormData({...formData, preferencias: e.target.value})}
                />
              </div>

              {/* Resumen del costo */}
              <div className="border-2 border-black dark:border-gray-600 p-4 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20">
                <h3 className="font-bold text-lg mb-2">RESUMEN</h3>
                <p className="mb-1">Plan Personalizado</p>
                <p className="text-2xl font-bold">$99.99 USD/mes</p>
                <p className="text-sm mt-2">UN COACH TE ASIGNARÁ UN PLAN EN LAS PRÓXIMAS 48 HORAS</p>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-600 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                ANTERIOR
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.objetivo || !formData.nivel || !formData.lesiones)) ||
                  (step === 2 && (!formData.disponibilidad.diasPorSemana || !formData.disponibilidad.minutosPorDia || formData.disponibilidad.diasPreferidos.length === 0))
                }
                className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-600 bg-orange-600 text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    PROCESANDO...
                  </>
                ) : (
                  'PROCEDER AL PAGO'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCuestionario;