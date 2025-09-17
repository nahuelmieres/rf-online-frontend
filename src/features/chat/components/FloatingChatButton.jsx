import React, { useState } from 'react';
import ChatPage from '../pages/ChatPage';
import { useAuthContext } from '@/context/AuthContext';

export default function FloatingChatButton() {
  const { isAuthenticated, user } = useAuthContext();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 border-2 border-black dark:border-gray-600
                   bg-white dark:bg-black text-black dark:text-white font-bold
                   rounded-full px-4 py-2 shadow-hard hover:shadow-none
                   hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
      >
        {open ? 'CERRAR CHAT' : 'ABRIR CHAT'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[95vw] md:w-[28rem] h-[70vh]
                        bg-white dark:bg-black border-2 border-black dark:border-gray-600
                        rounded-2xl shadow-hard overflow-hidden">
          <ChatPage userId={user.id} userRole={user.rol} />
        </div>
      )}
    </>
  );
}