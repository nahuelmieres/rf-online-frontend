import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { FloatingChatButton } from '@/features/chat'; 

const App = () => {
  const user = localStorage.getItem('usuario');
  return (
    <>
      <Navbar />
      <main className="p-4">
        <AppRoutes />
        {user && <FloatingChatButton userId={user.id} />}
      </main>
    </>
  );
};

export default App;