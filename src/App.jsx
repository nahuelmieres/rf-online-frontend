import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <>
      <Navbar />
      <div className="bg-black text-orange-500 p-4">
        ¡Tailwind debería funcionar ahora!
      </div>
      <main className="p-4">
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
