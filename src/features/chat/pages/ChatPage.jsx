import React from 'react';
import { ChatProvider } from '../context/ChatContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage({ userId, userRole }) {
  return (
    <ChatProvider userId={userId}>
      <section className="h-full flex flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-3
                        border-b-2 border-black dark:border-gray-600 bg-white dark:bg-black">
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Chat</h1>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[20rem_1fr] h-full bg-white dark:bg-black">
          <ConversationList userRole={userRole} />
          <ChatWindow />
        </div>
      </section>
    </ChatProvider>
  );
}