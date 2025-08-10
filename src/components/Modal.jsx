import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const sizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  footer = null,         // contenido opcional para el pie (botones, etc.)
  closeOnBackdrop = true // cerrar al clickear fuera
}) => {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) onClose?.();
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKey);
    // bloquear scroll del body detrás del modal
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Contenedor centrado */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className={`
            w-full ${sizes[size] || sizes.md}
            bg-white dark:bg-black
            border-2 border-black dark:border-gray-600
            shadow-hard
            animate-scale-in
            flex flex-col
            max-h-[90vh]        /* límite de altura del modal */
          `}
          role="dialog"
          aria-modal="true"
        >
          {/* Header (fijo) */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black dark:border-gray-600 flex-shrink-0">
            <h3 className="text-xl font-extrabold tracking-tight">
              {title || ''}
            </h3>
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 border-2 border-black dark:border-gray-600 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Body (scrolleable) */}
          <div className="px-4 py-5 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer (fijo y opcional) */}
          {footer && (
            <div className="px-4 py-3 border-t-2 border-black dark:border-gray-600 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Estilos locales */}
      <style>{`
        .shadow-hard { box-shadow: 4px 4px 0 0 rgba(0,0,0,1); }
        @keyframes scale-in {
          0% { transform: translateY(8px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 120ms ease-out both; }
      `}</style>
    </div>
  );
};

export default Modal;