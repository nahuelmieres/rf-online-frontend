import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

const iconos = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colores = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-100',
    icon: 'text-green-500 dark:text-green-400',
    bar: 'bg-green-500 dark:bg-green-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-100',
    icon: 'text-red-500 dark:text-red-400',
    bar: 'bg-red-500 dark:bg-red-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-100',
    icon: 'text-yellow-500 dark:text-yellow-400',
    bar: 'bg-yellow-500 dark:bg-yellow-400',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-100',
    icon: 'text-blue-500 dark:text-blue-400',
    bar: 'bg-blue-500 dark:bg-blue-400',
  },
};

const Notificacion = ({ 
  tipo = 'success',
  titulo = '',
  mensaje,
  onClose,
  tiempo = 5000,
  mostrarBarra = true,
  mostrarCerrar = true
}) => {
  const Icono = iconos[tipo] || iconos.info;
  const color = colores[tipo] || colores.info;

  useEffect(() => {
    if (tiempo > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, tiempo);

      return () => clearTimeout(timer);
    }
  }, [onClose, tiempo]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`${color.bg} ${color.border} rounded-lg shadow-lg overflow-hidden w-full max-w-md border pointer-events-auto animate-fade-in-up`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icono className={`h-6 w-6 ${color.icon}`} />
            </div>
            <div className="ml-3 flex-1">
              {titulo && (
                <p className={`text-sm font-medium ${color.text}`}>
                  {titulo}
                </p>
              )}
              <p className={`mt-1 text-sm ${titulo ? color.text : color.text.replace('800', '700')} whitespace-pre-line`}>
                {mensaje}
              </p>
            </div>
            {mostrarCerrar && (
              <button
                onClick={onClose}
                className={`ml-4 flex-shrink-0 rounded-md inline-flex ${color.icon} hover:opacity-80 focus:outline-none`}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        {mostrarBarra && tiempo > 0 && (
          <div className={`${color.bg.replace('50', '200')} h-1 w-full`}>
            <div 
              className={`${color.bar} h-1 animate-[progress_5s_linear]`}
              style={{ animationDuration: `${tiempo}ms` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notificacion;