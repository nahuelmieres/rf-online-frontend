import React from 'react';
import useAuth from '../../hooks/useAuth';
import EntrenadoresAdminCoach from './EntrenadoresAdminCoach';
import EntrenadoresCliente from './EntrenadoresCliente';
import Loader from '../../components/Loader';

const Entrenadores = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader className="h-64" />;
  }

  const esEntrenador = user && ['admin', 'coach'].includes(user.rol);

  return esEntrenador ? (
    <EntrenadoresAdminCoach />
  ) : (
    <EntrenadoresCliente />
  );
};

export default Entrenadores;