import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import Notificacion from './Notificacion'; // ← ajustá la ruta si cambia

const urlEsYouTube = (v) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname);
  } catch {
    return false;
  }
};

const FormularioBloque = ({ bloque, onSubmit, onCancel, onDelete }) => {
  const [titulo, setTitulo] = useState('');
  const [etiquetas, setEtiquetas] = useState([]);
  const [inputTagValue, setInputTagValue] = useState('');
  const [tipo, setTipo] = useState('ejercicios');
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [ejercicios, setEjercicios] = useState([
    { nombre: '', series: 3, repeticiones: '8-10', escala: '', esfuerzoPercibido: '', linkVideo: '' }
  ]);

  // Notificación
  const [notif, setNotif] = useState({ open: false, tipo: 'error', titulo: '', mensaje: '', tiempo: 4000 });
  const notify = (mensaje, tipo = 'error', titulo = 'Atención', tiempo = 4000) =>
    setNotif({ open: true, tipo, titulo, mensaje, tiempo });

  // Precargar datos si estamos editando
  useEffect(() => {
    if (bloque) {
      setTitulo(bloque.titulo || '');
      setEtiquetas(bloque.etiquetas || []);
      setTipo(bloque.tipo || 'ejercicios');
      if (bloque.tipo === 'texto') {
        setContenidoTexto(bloque.contenidoTexto || '');
      } else {
        setEjercicios(
          (bloque.ejercicios || []).map(e => ({
            nombre: e.nombre || '',
            series: e.series ?? 3,
            repeticiones: e.repeticiones || '8-10',
            escala: (e.escala || '').toUpperCase(),
            esfuerzoPercibido: e.esfuerzoPercibido ?? '',
            linkVideo: e.linkVideo || ''
          }))
        );
      }
    }
  }, [bloque]);

  const handleEjercicioChange = (index, field, value) => {
    const newEjercicios = [...ejercicios];
    newEjercicios[index][field] = value;
    if (field === 'escala') {
      const s = (value || '').toUpperCase();
      const v = parseFloat(newEjercicios[index].esfuerzoPercibido);
      if (!Number.isNaN(v)) {
        const fueraRango =
          (s === 'RPE' && (v < 6 || v > 10)) ||
          (s === 'RIR' && (v < 0 || v > 5));
        if (fueraRango) newEjercicios[index].esfuerzoPercibido = '';
      }
    }
    setEjercicios(newEjercicios);
  };

  const agregarEjercicio = () => {
    setEjercicios([
      ...ejercicios,
      { nombre: '', series: 3, repeticiones: '8-10', escala: '', esfuerzoPercibido: '', linkVideo: '' }
    ]);
  };

  const eliminarEjercicio = (index) => {
    const newEjercicios = [...ejercicios];
    newEjercicios.splice(index, 1);
    setEjercicios(newEjercicios);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && inputTagValue.trim()) {
      e.preventDefault();
      const val = inputTagValue.trim().toLowerCase();
      if (!etiquetas.includes(val) && val.length <= 30) {
        setEtiquetas([...etiquetas, val]);
      } else if (val.length > 30) {
        notify('La etiqueta no puede superar los 30 caracteres.', 'warning', 'Etiqueta larga');
      }
      setInputTagValue('');
    }
  };

  const removeTag = (index) => {
    setEtiquetas(etiquetas.filter((_, i) => i !== index));
  };

  const validarEjercicios = () => {
    for (let i = 0; i < ejercicios.length; i++) {
      const e = ejercicios[i];
      if (!e.nombre.trim()) return `Ejercicio #${i + 1}: el nombre es requerido`;
      if (!e.repeticiones.trim()) return `Ejercicio #${i + 1}: repeticiones es requerido`;
      if (!Number.isInteger(Number(e.series)) || Number(e.series) < 1)
        return `Ejercicio #${i + 1}: series debe ser un entero ≥ 1`;
      if (e.linkVideo && !urlEsYouTube(e.linkVideo))
        return `Ejercicio #${i + 1}: el link de video debe ser de YouTube`;
      const tieneEscala = !!e.escala;
      const tieneEsfuerzo = e.esfuerzoPercibido !== '' && e.esfuerzoPercibido !== null && e.esfuerzoPercibido !== undefined;
      if (tieneEscala ^ tieneEsfuerzo)
        return `Ejercicio #${i + 1}: si definís esfuerzoPercibido también debés definir escala (y viceversa)`;
      if (tieneEscala && tieneEsfuerzo) {
        const escala = e.escala.toUpperCase();
        const v = Number(e.esfuerzoPercibido);
        if (Number.isNaN(v)) return `Ejercicio #${i + 1}: esfuerzoPercibido debe ser numérico`;
        if (escala === 'RPE' && (v < 6 || v > 10)) return `Ejercicio #${i + 1}: RPE va de 6 a 10`;
        if (escala === 'RIR' && (v < 0 || v > 5)) return `Ejercicio #${i + 1}: RIR va de 0 a 5`;
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      return notify('El título del bloque es obligatorio.');
    }

    if (tipo === 'texto') {
      if (!contenidoTexto.trim()) {
        return notify('El contenido es requerido para bloques de texto.');
      }
    } else {
      if (!ejercicios.length) {
        return notify('Debe incluir al menos un ejercicio.');
      }
      const error = validarEjercicios();
      if (error) return notify(error);
    }

    const bloqueData = {
      titulo: titulo.trim(),
      tipo,
      contenidoTexto: tipo === 'texto' ? contenidoTexto.trim() : '',
      ejercicios:
        tipo === 'ejercicios'
          ? ejercicios.map(e => ({
              nombre: e.nombre.trim(),
              series: Number(e.series),
              repeticiones: e.repeticiones.trim(),
              escala: e.escala ? e.escala.toUpperCase() : undefined,
              esfuerzoPercibido:
                e.esfuerzoPercibido !== '' && e.esfuerzoPercibido !== null && e.esfuerzoPercibido !== undefined
                  ? Number(e.esfuerzoPercibido)
                  : undefined,
              linkVideo: e.linkVideo?.trim() || ''
            }))
          : [],
      etiquetas
    };
    if (bloque?._id) bloqueData._id = bloque._id;

    onSubmit(bloqueData);
  };

  return (
    <>
      {notif.open && (
        <Notificacion
          tipo={notif.tipo}
          titulo={notif.titulo}
          mensaje={notif.mensaje}
          tiempo={notif.tiempo}
          onClose={() => setNotif(s => ({ ...s, open: false }))}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título del bloque */}
        <div>
          <label className="block text-lg font-bold mb-2">TÍTULO DEL BLOQUE</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-lg font-bold mb-2">ETIQUETAS</label>
          <div className="border-2 border-black dark:border-gray-600 p-3 bg-white dark:bg-black">
            <div className="flex flex-wrap gap-2 mb-2">
              {etiquetas.map((tag, index) => (
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
              placeholder="escribí y presioná Enter…"
              className="w-full p-2 border-none bg-transparent focus:outline-none text-base"
            />
          </div>
        </div>

        {/* Tipo de bloque */}
        <div>
          <label className="block text-lg font-bold mb-2">TIPO DE BLOQUE</label>
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
            <label className="block text-lg font-bold mb-2">CONTENIDO</label>
            <textarea
              value={contenidoTexto}
              onChange={(e) => setContenidoTexto(e.target.value)}
              rows={6}
              className="w-full p-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-lg font-bold">EJERCICIOS</label>

            {ejercicios.map((ejercicio, index) => {
              const escala = (ejercicio.escala || '').toUpperCase();
              const esRPE = escala === 'RPE';
              const esRIR = escala === 'RIR';
              const step = 0.5;

              return (
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1">SERIES</label>
                      <input
                        type="number"
                        min="1"
                        value={ejercicio.series}
                        onChange={(e) =>
                          handleEjercicioChange(index, 'series', parseInt(e.target.value) || 1)
                        }
                        className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1">REPETICIONES</label>
                      <input
                        type="text"
                        value={ejercicio.repeticiones}
                        onChange={(e) => handleEjercicioChange(index, 'repeticiones', e.target.value)}
                        className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1">ESCALA (OPCIONAL)</label>
                      <select
                        value={ejercicio.escala}
                        onChange={(e) => handleEjercicioChange(index, 'escala', e.target.value)}
                        className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                      >
                        <option value="">(ninguna)</option>
                        <option value="RPE">RPE</option>
                        <option value="RIR">RIR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-1">
                        {escala ? `ESFUERZO (${escala})` : 'ESFUERZO (OPCIONAL)'}
                      </label>
                      <input
                        type="number"
                        step={step}
                        value={ejercicio.esfuerzoPercibido}
                        onChange={(e) => handleEjercicioChange(index, 'esfuerzoPercibido', e.target.value)}
                        placeholder={esRPE ? '6–10' : esRIR ? '0–5' : '—'}
                        className="w-full p-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black focus:outline-none focus:border-orange-500"
                        disabled={!escala}
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
              );
            })}

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
    </>
  );
};

export default FormularioBloque;