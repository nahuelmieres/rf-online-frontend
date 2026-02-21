import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';
import SmartLink from '../../components/SmartLink/SmartLink';

const PLANES = {
  basico: {
    nombre: 'Plan Básico',
    precio: 31.99,
    descripcion: 'Acceso a planificaciones predefinidas',
    beneficios: [
      'Acceso a todas las planificaciones básicas',
      'Seguimiento de progreso',
      'Videos demostrativos',
      'Soporte por email'
    ]
  },
  personalizado: {
    nombre: 'Plan Personalizado',
    precio: 99.99,
    descripcion: 'Plan diseñado específicamente para vos',
    beneficios: [
      'Todo lo del plan básico',
      'Planificación 100% personalizada',
      'Ajustes mensuales según progreso',
      'Soporte prioritario',
      'Consultas ilimitadas con tu coach'
    ]
  }
};

const Suscripcion = () => {
  const { user, loading, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [notificacion, setNotificacion] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (loading) return <Loader className="h-64" />;

  if (!user) {
    navigate('/login');
    return null;
  }

  const mostrarNotificacion = (tipo, titulo, mensaje, tiempo = 5000) => {
    setNotificacion({ tipo, titulo, mensaje, tiempo });
    setTimeout(() => setNotificacion(null), tiempo);
  };

  const handlePayPalSubscription = async (plan) => {
    setIsProcessing(true);
    setMetodoPago('paypal');
    setPlanSeleccionado(plan);

    try {
      const endpoint = plan === 'basico'
        ? '/api/pagos/paypal/suscripcion/basico'
        : '/api/pagos/paypal/suscripcion/personalizado';

      // ACTUALIZADO: Cuestionario completo con valores por defecto
      const body = plan === 'personalizado'
        ? {
          questionnaire: {
            objetivo: 'Mejorar condición física general',
            experiencia: 'intermedio',
            frecuencia: 4,
            duracion: 60,
            equipo: ['mancuernas', 'bandas'],
            lesiones: 'Ninguna',
            preferencias: 'Sin preferencias específicas'
          }
        }
        : {};

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'SUBSCRIPTION_ALREADY_EXISTS') {
          mostrarNotificacion(
            'warning',
            'Suscripción existente',
            'Ya tenés una suscripción activa o en proceso'
          );
          return;
        }
        throw new Error(data.mensaje || 'Error al crear suscripción');
      }

      // Redirigir a PayPal
      window.location.href = data.approvalUrl;

    } catch (error) {
      console.error('Error en PayPal:', error);
      mostrarNotificacion(
        'error',
        'Error en pago',
        error.message || 'Ocurrió un error al procesar el pago con PayPal'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMercadoPagoSubscription = async (plan) => {
    setIsProcessing(true);
    setMetodoPago('mercadopago');
    setPlanSeleccionado(plan);

    try {
      const precioUSD = PLANES[plan].precio;
      const tasaCambio = 42; // Ajustar según tasa real
      const montoUYU = Math.round(precioUSD * tasaCambio);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pagos/mercadopago/preferencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          monto: montoUYU,
          plan: plan,
          tipo: 'suscripcion'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar link de pago');
      }

      // Redirigir a MercadoPago
      window.location.href = data.init_point || data.sandbox_init_point;

    } catch (error) {
      console.error('Error en MercadoPago:', error);
      mostrarNotificacion(
        'error',
        'Error en pago',
        error.message || 'Ocurrió un error al procesar el pago con MercadoPago'
      );
    } finally {
      setIsProcessing(false);
    }
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold mb-4">ELEGÍ TU PLAN</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Seleccioná el plan que mejor se adapte a tus objetivos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {Object.entries(PLANES).map(([key, plan]) => (
            <div
              key={key}
              className={`border-4 p-8 ${key === 'personalizado'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-black dark:border-gray-600 bg-white dark:bg-black'
                } shadow-hard`}
            >
              {key === 'personalizado' && (
                <div className="bg-orange-500 text-white px-4 py-2 -mt-8 -mx-8 mb-6 text-center font-bold">
                  MÁS POPULAR
                </div>
              )}

              <h2 className="text-2xl font-bold mb-2">{plan.nombre}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.descripcion}</p>

              <div className="text-4xl font-extrabold mb-6">
                ${plan.precio}
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400">/mes USD</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.beneficios.map((beneficio, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{beneficio}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handlePayPalSubscription(key)}
                  disabled={isProcessing && !(planSeleccionado === key && metodoPago === 'paypal')}
                  className={`w-full flex items-center justify-center px-6 py-3 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${isProcessing && !(planSeleccionado === key && metodoPago === 'paypal')
                      ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                      : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                    }`}
                >
                  {isProcessing && planSeleccionado === key && metodoPago === 'paypal' ? (
                    <Loader2 className="animate-spin mr-3 w-5 h-5" />
                  ) : (
                    <img
                      src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                      alt="PayPal"
                      className="h-6 mr-3"
                    />
                  )}
                  PAGAR CON PAYPAL
                </button>

                <button
                  onClick={() => handleMercadoPagoSubscription(key)}
                  disabled={isProcessing && !(planSeleccionado === key && metodoPago === 'mercadopago')}
                  className={`w-full flex items-center justify-center px-6 py-3 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${isProcessing && !(planSeleccionado === key && metodoPago === 'mercadopago')
                      ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                      : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
                    }`}
                >
                  {isProcessing && planSeleccionado === key && metodoPago === 'mercadopago' ? (
                    <Loader2 className="animate-spin mr-3 w-5 h-5" />
                  ) : (
                    <img
                      src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__small@2x.png"
                      alt="MercadoPago"
                      className="h-6 mr-3"
                    />
                  )}
                  PAGAR CON MERCADOPAGO
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <SmartLink
            to="/cuenta"
            className="inline-block px-6 py-3 border-2 border-black dark:border-gray-600 font-bold hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 transition-colors"
          >
            VOLVER A MI PERFIL
          </SmartLink>
        </div>
      </div>
    </>
  );
};

export default Suscripcion;