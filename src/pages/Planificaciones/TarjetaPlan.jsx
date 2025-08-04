import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const TarjetaPlan = ({ planificacion, esPersonalizada }) => {
  return (
    <div className={`border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 mb-6 transition-all ${
      esPersonalizada ? 'border-purple-500 dark:border-purple-400 relative' : ''
    }`}>
      {esPersonalizada && (
        <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 font-bold flex items-center">
          <Star size={16} className="mr-1" /> PERSONALIZADA
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-2">{planificacion.titulo}</h3>
          <p className="mb-4">{planificacion.descripcion}</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 border border-black dark:border-gray-600 text-xs">
              {planificacion.tipo.toUpperCase()}
            </span>
            <span className="px-2 py-1 border border-black dark:border-gray-600 text-xs">
              {planificacion.categoria.toUpperCase()}
            </span>
          </div>
        </div>
        
        <Link 
          to={`/planificacion/${planificacion._id}`}
          className="px-4 py-2 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          VER DETALLE
        </Link>
      </div>
      
      <div className="mt-4 pt-4 border-t border-black dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold mb-1">DURACIÓN:</h4>
            <p>{planificacion.semanas.length} semanas</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">DÍAS POR SEMANA:</h4>
            <p>{planificacion.semanas[0]?.dias.filter(d => !d.descanso).length || 0} días activos</p>
          </div>
          <div className="flex items-center">
            <Check className="text-green-500 mr-1" size={20} />
            <span>Activa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaPlan;