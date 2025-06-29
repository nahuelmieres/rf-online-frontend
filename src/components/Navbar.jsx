import React from 'react';
import '../index.css'; // Import your global styles

const Navbar = () => {
  return (
    <header className="bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-orange-500 font-bold text-2xl tracking-tight">RF</span>
          <span className="text-sm font-light">Online</span>
        </div>

        {/* Menú */}
        <nav className="space-x-4 text-sm">
          <a href="#" className="hover:text-orange-500 transition">Inicio</a>
          <a href="#" className="hover:text-orange-500 transition">Planes</a>
          <a href="#" className="hover:text-orange-500 transition">Entrenadores</a>
          <a href="#" className="hover:text-orange-500 transition">Mi cuenta</a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;