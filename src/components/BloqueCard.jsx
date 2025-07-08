import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const BloqueCard = ({ bloque, seleccionado, onToggle, esCreador }) => (
  <div 
    className={`card p-3 cursor-pointer transition-colors ${
      seleccionado ? 'bg-orange-50 border-orange-300' : 'hover:bg-gray-50'
    }`}
    onClick={onToggle}
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">{bloque.nombre}</h3>
        <p className="text-sm text-gray-600">
          {bloque.tipo === 'ejercicios' 
            ? `${bloque.ejercicios?.length || 0} ejercicios` 
            : 'Notas/Instrucciones'}
        </p>

        {/* Mostrar tags */}
        {bloque.tags?.length > 0 && (
          <div className="flex flex-wrap mt-1 gap-1">
            {bloque.tags.map((tag, i) => (
              <span 
                key={i}
                className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {!esCreador && bloque.creadoPor?.nombre && (
          <span className="text-xs text-blue-500">Creado por: {bloque.creadoPor.nombre}</span>
        )}
      </div>
      {esCreador && (
        <div className="flex gap-2">
          <button className="btn btn-icon btn-sm btn-ghost">
            <Edit size={16} />
          </button>
          <button className="btn btn-icon btn-sm btn-ghost text-red-500 hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  </div>
);

export default BloqueCard;