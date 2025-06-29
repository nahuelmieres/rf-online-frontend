import React, { useState } from 'react';
import '../index.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  if (!usuario) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-black text-white">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-orange-500">
          <Link to="/">RF Online</Link>
        </h1>

        {/* Menú hamburguesa para mobile */}
        <button
          className="md:hidden"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Navegación desktop */}
        <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/planes">Planes</Link></li>
          <li><Link to="/entrenadores">Entrenadores</Link></li>
          <li><Link to="/cuenta">Mi cuenta</Link></li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* Navegación mobile */}
      {menuAbierto && (
        <ul className="md:hidden px-4 pb-4 flex flex-col gap-2 text-sm font-medium bg-black">
          <li><Link to="/" onClick={() => setMenuAbierto(false)}>Inicio</Link></li>
          <li><Link to="/planes" onClick={() => setMenuAbierto(false)}>Planes</Link></li>
          <li><Link to="/entrenadores" onClick={() => setMenuAbierto(false)}>Entrenadores</Link></li>
          <li><Link to="/cuenta" onClick={() => setMenuAbierto(false)}>Mi cuenta</Link></li>
          <li>
            <button
              onClick={() => {
                handleLogout();
                setMenuAbierto(false);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}
    </header>
  );
};

export default Navbar;