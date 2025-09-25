import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { FloatingChatButton } from '@/features/chat';
import { useAuthContext } from '@/context/AuthContext';

const App = () => {
  const { user, isAuthenticated, loading } = useAuthContext();

  return (
    <>
      <Navbar />
      <main className="p-4">
        <AppRoutes />
      </main>

      {!loading && isAuthenticated && (
        <FloatingChatButton userId={user.id} />
      )}
    </>
  );
};

export default App;