import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import Notificacion from '../../components/Notificacion';

const Suscripcion = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notificacion, setNotificacion] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const monto = 2700; // Monto fijo según tu backend

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

      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Pago de Suscripción
        </h1>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-center text-blue-700 dark:text-blue-300 mb-2">
            UYU ${monto.toLocaleString('es-UY')} / mes
          </h2>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Acceso a todas las planificaciones
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Soporte prioritario
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Contenido exclusivo
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleMercadoPago}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isProcessing && metodoPago !== 'mercadopago' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing && metodoPago === 'mercadopago' ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <img 
                src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__small@2x.png" 
                alt="MercadoPago" 
                className="h-6 mr-3"
              />
            )}
            Pagar con MercadoPago
          </button>

          <button
            onClick={handlePayPal}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${
              isProcessing && metodoPago !== 'paypal' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing && metodoPago === 'paypal' ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <img 
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                alt="PayPal" 
                className="h-6 mr-3"
              />
            )}
            Pagar con PayPal
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/cuenta')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Volver a mi perfil
          </button>
        </div>
      </div>
    </>
  );
};

export default Suscripcion;