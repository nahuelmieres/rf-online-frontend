import React from 'react';
import { ChatProvider } from '../context/ChatContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
// si querés botón VOLVER como en Términos, descomentá y ajustá ruta:
// import SmartLink from '@/components/SmartLink/SmartLink';
// import { ChevronLeft } from 'lucide-react';

export default function ChatPage({ userId }) {
  return (
    <ChatProvider userId={userId}>
      <section className="h-full flex flex-col">
        {/* Header compacto estilo RF */}
        <div className="flex items-center justify-between gap-4 px-4 py-3
                        border-b-2 border-black dark:border-gray-600 bg-white dark:bg-black">
          {/* <SmartLink to="/" className="flex items-center gap-2 px-3 py-1 border-2 border-black dark:border-gray-600
                                        bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard
                                        hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <ChevronLeft size={18} /> VOLVER
          </SmartLink> */}
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Chat</h1>
          <div className="text-xs opacity-0">.</div>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[20rem_1fr] h-full
                        bg-white dark:bg-black">
          <ConversationList />
          <ChatWindow />
        </div>
      </section>
    </ChatProvider>
  );
}