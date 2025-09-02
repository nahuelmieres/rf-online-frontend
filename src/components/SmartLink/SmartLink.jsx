import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import useSecureStorage from '../../hooks/useSecureStorage';

const SmartLink = ({ 
  to, 
  children, 
  className = '', 
  onClick, 
  target,
  rel,
  ...props 
}) => {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();
  const { setItem } = useSecureStorage();

  const handleClick = async (e) => {
    if (onClick) {
      onClick(e);
    }

    // Guardar estado de navegación antes de redirigir
    if (isNative) {
      await setItem('lastNavigation', window.location.pathname);
    }

    if (isNative) {
      e.preventDefault();
      
      // Enlaces externos en apps nativas
      if (to.startsWith('http')) {
        await Browser.open({ url: to });
      } else {
        // Rutas internas en apps nativas
        navigate(to);
      }
    }
    // En web, el Link de react-router se encargará de la navegación
  };

  // Para enlaces externos en apps nativas
  if (isNative && to.startsWith('http')) {
    return (
      <a 
        href={to} 
        className={className} 
        onClick={handleClick}
        target={target}
        rel={rel}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Para enlaces externos en web con target="_blank"
  if (!isNative && to.startsWith('http') && target === '_blank') {
    return (
      <a 
        href={to} 
        className={className} 
        onClick={handleClick}
        target={target}
        rel={rel || 'noopener noreferrer'}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Para rutas internas (tanto web como nativo)
  return (
    <Link 
      to={to} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default SmartLink;