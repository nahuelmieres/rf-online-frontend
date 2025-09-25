import React, { useEffect, useState } from 'react';
import { MessageCircle, SquareArrowOutUpRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ChatPage from '../pages/ChatPage';
import SmartLink from '../../../components/SmartLink/SmartLink';
import { useAuthContext } from '@/context/AuthContext';

export default function FloatingChatButton() {
  const { isAuthenticated, user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Si estás en /chat (o subrutas), no muestres el floating
  const onChatRoute = location.pathname.startsWith('/chat');

  // Si navegás a /chat, asegurate de cerrar el floating
  useEffect(() => {
    if (onChatRoute && open) setOpen(false);
  }, [onChatRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated || onChatRoute) return null;

  const handleExpandClick = (e) => {
    // cerramos el floating antes de que SmartLink navegue
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      {/* FAB toggle */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        title={open ? 'Cerrar chat' : 'Abrir chat'}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full
                   border-2 border-black dark:border-gray-600
                   bg-white dark:bg-black text-black dark:text-white
                   shadow-hard hover:shadow-none
                   hover:translate-x-0.5 hover:translate-y-0.5 transition-all
                   flex items-center justify-center"
      >
        <MessageCircle size={22} className="pointer-events-none" />
      </button>

      {/* Ventana flotante */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 w-[95vw] md:w-[28rem] h-[70vh]
                     bg-white dark:bg-black border-2 border-black dark:border-gray-600
                     rounded-2xl shadow-hard overflow-hidden"
        >
          {/* Botón expandir a /chat, usando SmartLink para web/nativo */}
          <SmartLink
            to="/chat"
            onClick={handleExpandClick}
            aria-label="Abrir chat en pantalla completa"
            title="Abrir chat en pantalla completa"
            className="absolute top-2 right-2 h-9 w-9 inline-flex items-center justify-center
                       border-2 border-black dark:border-gray-600 rounded-full
                       bg-white dark:bg-black text-black dark:text-white
                       shadow-hard hover:shadow-none
                       hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <SquareArrowOutUpRight size={16} />
          </SmartLink>

          <ChatPage userId={user.id} userRole={user.rol} />
        </div>
      )}
    </>
  );
}