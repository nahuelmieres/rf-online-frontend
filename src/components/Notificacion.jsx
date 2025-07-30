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
    bg: 'bg-green-100 dark:bg-green-900',
    border: 'border-2 border-green-500 dark:border-green-400',
    text: 'text-green-900 dark:text-green-100',
    icon: 'text-green-500 dark:text-green-400',
    bar: 'bg-green-500 dark:bg-green-400',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900',
    border: 'border-2 border-red-500 dark:border-red-400',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-500 dark:text-red-400',
    bar: 'bg-red-500 dark:bg-red-400',
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    border: 'border-2 border-yellow-500 dark:border-yellow-400',
    text: 'text-yellow-900 dark:text-yellow-100',
    icon: 'text-yellow-500 dark:text-yellow-400',
    bar: 'bg-yellow-500 dark:bg-yellow-400',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    border: 'border-2 border-blue-500 dark:border-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
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
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
      <div className={`${color.bg} ${color.border} shadow-hard w-full max-w-md pointer-events-auto animate-fade-in-up`}>
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 border-2 border-black dark:border-gray-600 ${color.bg.includes('green') ? 'bg-green-100 dark:bg-green-900' : color.bg.includes('red') ? 'bg-red-100 dark:bg-red-900' : color.bg.includes('yellow') ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
              <Icono className={`h-6 w-6 ${color.icon}`} />
            </div>
            <div className="flex-1">
              {titulo && (
                <h3 className={`text-lg font-bold ${color.text}`}>
                  {titulo.toUpperCase()}
                </h3>
              )}
              <p className={`mt-1 text-lg ${color.text} whitespace-pre-line`}>
                {mensaje}
              </p>
            </div>
            {mostrarCerrar && (
              <button
                onClick={onClose}
                className="p-1 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        {mostrarBarra && tiempo > 0 && (
          <div className="h-1 w-full bg-gray-300 dark:bg-gray-600">
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