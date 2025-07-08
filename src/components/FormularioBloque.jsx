import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';

const FormularioBloque = ({ bloque, onSubmit, onCancel, onDelete }) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('ejercicios');
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [ejercicios, setEjercicios] = useState([
    { nombre: '', series: 3, repeticiones: '8-10', peso: '', linkVideo: '' }
  ]);

  // Inicializar con datos del bloque si estamos editando
  useEffect(() => {
    if (bloque) {
      setNombre(bloque.nombre);
      setTipo(bloque.tipo);
      if (bloque.tipo === 'texto') {
        setContenidoTexto(bloque.contenidoTexto);
      } else {
        setEjercicios(bloque.ejercicios || []);
      }
    }
  }, [bloque]);

  const handleEjercicioChange = (index, field, value) => {
    const newEjercicios = [...ejercicios];
    newEjercicios[index][field] = value;
    setEjercicios(newEjercicios);
  };

  const agregarEjercicio = () => {
    setEjercicios([
      ...ejercicios,
      { nombre: '', series: 3, repeticiones: '8-10', peso: '', linkVideo: '' }
    ]);
  };

  const eliminarEjercicio = (index) => {
    if (ejercicios.length <= 1) return;
    const newEjercicios = [...ejercicios];
    newEjercicios.splice(index, 1);
    setEjercicios(newEjercicios);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const bloqueData = {
      nombre,
      tipo,
      ...(tipo === 'texto' 
        ? { contenidoTexto } 
        : { ejercicios: ejercicios.filter(e => e.nombre.trim() !== '') })
    };

    if (bloque) {
      bloqueData._id = bloque._id;
    }

    onSubmit(bloqueData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre del bloque */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre del bloque
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Tipo de bloque */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de bloque
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="ejercicios">Ejercicios</option>
          <option value="texto">Texto/Instrucciones</option>
        </select>
      </div>

      {/* Contenido según tipo */}
      {tipo === 'texto' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenido
          </label>
          <textarea
            value={contenidoTexto}
            onChange={(e) => setContenidoTexto(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ejercicios
          </label>
          
          {ejercicios.map((ejercicio, index) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Ejercicio {index + 1}</h4>
                {ejercicios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarEjercicio(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={ejercicio.nombre}
                    onChange={(e) => handleEjercicioChange(index, 'nombre', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Series</label>
                  <input
                    type="number"
                    min="1"
                    value={ejercicio.series}
                    onChange={(e) => handleEjercicioChange(index, 'series', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Repeticiones</label>
                  <input
                    type="text"
                    value={ejercicio.repeticiones}
                    onChange={(e) => handleEjercicioChange(index, 'repeticiones', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Peso (opcional)</label>
                  <input
                    type="text"
                    value={ejercicio.peso}
                    onChange={(e) => handleEjercicioChange(index, 'peso', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Link de video (opcional)</label>
                  <input
                    type="url"
                    value={ejercicio.linkVideo}
                    onChange={(e) => handleEjercicioChange(index, 'linkVideo', e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={agregarEjercicio}
            className="flex items-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300"
          >
            <Plus size={16} className="mr-1" />
            Agregar otro ejercicio
          </button>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar
            </button>
          )}
        </div>
        
        <div className="space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {bloque ? 'Guardar cambios' : 'Crear bloque'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormularioBloque;