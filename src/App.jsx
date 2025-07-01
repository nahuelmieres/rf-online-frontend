import React from 'react';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
