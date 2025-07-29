import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';

const Suscripcion = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notificacion, setNotificacion] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const monto = 2700; // Monto fijo según backend

  if (loading) return <Loader className="h-64" />;

  // Redirigir si no está autenticado
  if (!user) {
    navigate('/login');
    return null;
  }

  const mostrarNotificacion = (tipo, titulo, mensaje, tiempo = 5000) => {
    setNotificacion({ tipo, titulo, mensaje, tiempo });
    setTimeout(() => setNotificacion(null), tiempo);
  };

  const handleMercadoPago = async () => {
    setIsProcessing(true);
    setMetodoPago('mercadopago');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pagos/mercadopago/preferencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ monto })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar link de pago');
      }

      // Redirigir al checkout de MercadoPago
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

  const handlePayPal = async () => {
    setIsProcessing(true);
    setMetodoPago('paypal');
    
    try {
      // 1. Crear la orden
      const ordenResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pagos/paypal/orden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ monto })
      });

      const ordenData = await ordenResponse.json();

      if (!ordenResponse.ok) {
        throw new Error(ordenData.message || 'Error al crear orden de pago');
      }

      // 2. Abrir ventana de PayPal
      const paypalWindow = window.open(
        ordenData.links.find(link => link.rel === 'approve').href,
        'PayPal',
        'width=600,height=700'
      );

      // 3. Verificar periodicamente si se completó el pago
      const checkPayment = setInterval(async () => {
        if (paypalWindow.closed) {
          clearInterval(checkPayment);
          
          // 4. Capturar el pago
          const capturaResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pagos/paypal/captura`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ orderId: ordenData.id })
          });

          const capturaData = await capturaResponse.json();

          if (capturaResponse.ok) {
            mostrarNotificacion(
              'success',
              'Pago completado',
              'Tu suscripción ha sido activada correctamente'
            );
            // Aquí podrías actualizar el estado del usuario si es necesario
          } else {
            throw new Error(capturaData.message || 'Error al capturar el pago');
          }
        }
      }, 1000);

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

    <div className="max-w-md mx-auto border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6">
      <div className="flex items-center justify-center gap-3 mb-6 border-b-2 border-black dark:border-gray-600 pb-4">
        <div className="bg-black dark:bg-white p-2 border-2 border-black dark:border-gray-600">
          <svg className="w-6 h-6 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          PAGO DE SUSCRIPCIÓN
        </h1>
      </div>

      <div className="border-2 border-black dark:border-gray-600 p-4 mb-6">
        <h2 className="text-xl font-bold text-center mb-3">
          UYU ${monto.toLocaleString('es-UY')} / MES
        </h2>
        <ul className="space-y-3">
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-bold">ACCESO A TODAS LAS PLANIFICACIONES</span>
          </li>
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-bold">SOPORTE PRIORITARIO</span>
          </li>
          <li className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-bold">CONTENIDO EXCLUSIVO</span>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleMercadoPago}
          disabled={isProcessing}
          className={`w-full flex items-center justify-center px-6 py-3 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
            isProcessing && metodoPago !== 'mercadopago' 
              ? 'border-gray-400 text-gray-400 cursor-not-allowed' 
              : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
          }`}
        >
          {isProcessing && metodoPago === 'mercadopago' ? (
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

        <button
          onClick={handlePayPal}
          disabled={isProcessing}
          className={`w-full flex items-center justify-center px-6 py-3 border-2 font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
            isProcessing && metodoPago !== 'paypal' 
              ? 'border-gray-400 text-gray-400 cursor-not-allowed' 
              : 'border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black'
          }`}
        >
          {isProcessing && metodoPago === 'paypal' ? (
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
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/cuenta')}
          className="px-4 py-2 border-2 border-black dark:border-gray-600 font-bold hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 transition-colors"
        >
          VOLVER A MI PERFIL
        </button>
      </div>
    </div>
  </>
  );
}

export default Suscripcion;