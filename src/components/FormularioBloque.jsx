import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';

const FormularioBloque = ({ bloque, onSubmit, onCancel, onDelete }) => {
  const [nombre, setNombre] = useState('');
  const [tags, setTags] = useState([]);
  const [inputTagValue, setInputTagValue] = useState('');
  const [tipo, setTipo] = useState('ejercicios');
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [ejercicios, setEjercicios] = useState([
    { nombre: '', series: 3, repeticiones: '8-10', peso: '', linkVideo: '' }
  ]);

  // Precargar datos si estamos editando
  useEffect(() => {
    if (bloque) {
      setNombre(bloque.nombre);
      setTags(bloque.tags || []);
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
    setEjercicios([...ejercicios, { nombre: '', series: 3, repeticiones: '8-10', peso: '', linkVideo: '' }]);
  };

  const eliminarEjercicio = (index) => {
    const newEjercicios = [...ejercicios];
    newEjercicios.splice(index, 1);
    setEjercicios(newEjercicios);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && inputTagValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputTagValue.trim())) {
        setTags([...tags, inputTagValue.trim()]);
      }
      setInputTagValue('');
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bloqueData = {
      nombre: nombre,
      tipo: tipo,
      contenidoTexto: tipo === 'texto' ? contenidoTexto : '',
      ejercicios: tipo === 'ejercicios' ? ejercicios : [],
      etiquetas: tags
    };
    if (bloque) bloqueData._id = bloque._id;
    onSubmit(bloqueData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del bloque */}
      <div>
        <label className="block text-lg font-bold mb-2">
          TÍTULO DEL BLOQUE
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
          required
        />
      </div>

      {/* Etiquetas - Versión personalizada */}
      <div>
        <label className="block text-lg font-bold mb-2">
          ETIQUETAS
        </label>
        <div className="border-2 border-black dark:border-gray-600 p-3 bg-white dark:bg-black">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center gap-1 px-3 py-1 border-2 border-black dark:border-gray-600 bg-white dark:bg-black"
              >
                <span className="text-sm font-bold">#{tag.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-black dark:text-white hover:text-red-500 dark:hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={inputTagValue}
            onChange={(e) => setInputTagValue(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="ESCRIBÍ Y PRESIONÁ ENTER..."
            className="w-full p-2 border-none bg-transparent focus:outline-none text-base"
          />
        </div>
      </div>

      {/* Tipo de bloque */}
      <div>
        <label className="block text-lg font-bold mb-2">
          TIPO DE BLOQUE
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
        >
          <option value="ejercicios">EJERCICIOS</option>
          <option value="texto">TEXTO/INSTRUCCIONES</option>
        </select>
      </div>

      {/* Contenido según tipo */}
      {tipo === 'texto' ? (
        <div>
          <label className="block text-lg font-bold mb-2">
            CONTENIDO
          </label>
          <textarea
            value={contenidoTexto}
            onChange={(e) => setContenidoTexto(e.target.value)}
            rows={6}
            className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
            required
          />
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block text-lg font-bold">
            EJERCICIOS
          </label>

          {ejercicios.map((ejercicio, index) => (
            <div key={index} className="p-4 border-2 border-black dark:border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold">EJERCICIO {index + 1}</h4>
                {ejercicios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarEjercicio(index)}
                    className="p-1 border-2 border-black dark:border-gray-600 hover:bg-red-500 hover:bg-opacity-20"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">NOMBRE</label>
                  <input
                    type="text"
                    value={ejercicio.nombre}
                    onChange={(e) => handleEjercicioChange(index, 'nombre', e.target.value)}
                    className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">SERIES</label>
                  <input
                    type="number"
                    min="1"
                    value={ejercicio.series}
                    onChange={(e) => handleEjercicioChange(index, 'series', parseInt(e.target.value) || 1)}
                    className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">REPETICIONES</label>
                  <input
                    type="text"
                    value={ejercicio.repeticiones}
                    onChange={(e) => handleEjercicioChange(index, 'repeticiones', e.target.value)}
                    className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">PESO (OPCIONAL)</label>
                  <input
                    type="text"
                    value={ejercicio.peso}
                    onChange={(e) => handleEjercicioChange(index, 'peso', e.target.value)}
                    className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">LINK DE VIDEO (OPCIONAL)</label>
                  <input
                    type="url"
                    value={ejercicio.linkVideo}
                    onChange={(e) => handleEjercicioChange(index, 'linkVideo', e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarEjercicio}
            className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 font-bold hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
          >
            <Plus size={16} />
            AGREGAR OTRO EJERCICIO
          </button>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-between pt-6 border-t-2 border-black dark:border-gray-600">
        <div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:bg-opacity-10"
            >
              <Trash2 size={16} />
              ELIMINAR
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-black dark:border-gray-600 font-bold hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
          >
            CANCELAR
          </button>
          <button
            type="submit"
            className="px-6 py-3 border-2 border-black dark:border-gray-600 bg-black dark:bg-white text-white dark:text-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            {bloque ? 'GUARDAR CAMBIOS' : 'CREAR BLOQUE'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormularioBloque;