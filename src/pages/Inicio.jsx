import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Dumbbell, User, Clock, X, Video } from 'lucide-react';
import SmartLink from '../components/SmartLink/SmartLink';
import { Preferences } from '@capacitor/preferences';

const Inicio = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    checkIntroStatus();
  }, []);

  const checkIntroStatus = async () => {
    try {
      const { value } = await Preferences.get({ key: 'hasSeenIntro' });
      
      if (!value || value !== 'true') {
        setShowIntro(true);
      }
    } catch (error) {
      console.error('Error checking intro status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setProgress(100);
    setTimeout(async () => {
      setShowIntro(false);
      setVideoEnded(false);
      setProgress(0);
      try {
        await Preferences.set({
          key: 'hasSeenIntro',
          value: 'true'
        });
      } catch (error) {
        console.error('Error saving intro status:', error);
      }
    }, 500);
  };

  const handleSkipIntro = async () => {
    setShowIntro(false);
    setVideoEnded(false);
    setProgress(0);
    try {
      await Preferences.set({
        key: 'hasSeenIntro',
        value: 'true'
      });
    } catch (error) {
      console.error('Error saving intro status:', error);
    }
  };

  const handleReplayIntro = () => {
    setVideoEnded(false);
    setProgress(0);
    setShowIntro(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-xl font-bold">CARGANDO...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Video Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              key={showIntro ? 'playing' : 'stopped'}
              ref={videoRef}
              autoPlay
              playsInline
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}
              className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                videoEnded ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <source src="/videos/intro.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>

            {/* Skip Button */}
            <button
              onClick={handleSkipIntro}
              className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all z-10"
              aria-label="Saltar introducción"
            >
              <span className="hidden sm:inline">SALTAR</span>
              <X className="w-5 h-5" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            REAL FORCE <span className="text-primary-light dark:text-primary-dark">PROGRAMS</span>
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-medium">
            TU ENTRENAMIENTO COMIENZA ACÁ. ACCEDÉ A TUS RUTINAS, CONECTÁ CON ENTRENADORES Y GESTIONÁ TU PROGRESO.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 md:px-0 mb-12">
          {/* Card Planes */}
          <SmartLink
            to="/planes"
            className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                <Calendar className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h3 className="text-xl font-bold">
                PLANES
              </h3>
            </div>
            <p className="text-base mb-4">
              MIRÁ TU PLANIFICACIÓN ACTIVA Y PRÓXIMAS RUTINAS.
            </p>
            <div className="flex items-center gap-2 mt-auto text-sm font-bold">
              <span>VER MÁS</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </SmartLink>

          {/* Card Entrenadores */}
          <SmartLink
            to="/entrenadores"
            className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                <User className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h3 className="text-xl font-bold">
                PROFES
              </h3>
            </div>
            <p className="text-base mb-4">
              CONOCÉ QUIÉN TE GUÍA Y CÓMO CONTACTARLO.
            </p>
            <div className="flex items-center gap-2 mt-auto text-sm font-bold">
              <span>VER MÁS</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </SmartLink>

          {/* Card Cuenta */}
          <SmartLink
            to="/cuenta"
            className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                <Dumbbell className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h3 className="text-xl font-bold">
                MI CUENTA
              </h3>
            </div>
            <p className="text-base mb-4">
              GESTIONÁ TUS DATOS Y EL ESTADO DE TU SUSCRIPCIÓN.
            </p>
            <div className="flex items-center gap-2 mt-auto text-sm font-bold">
              <span>VER MÁS</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </SmartLink>

          {/* Card Reservas */}
          <SmartLink
            to="/reservar"
            className="card p-6 group border-2 border-black dark:border-gray-600 bg-white dark:bg-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shadow-hard"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-black dark:bg-white p-3 border-2 border-black dark:border-gray-600">
                <Clock className="w-6 h-6 text-white dark:text-black" />
              </div>
              <h3 className="text-xl font-bold">
                RESERVAS
              </h3>
            </div>
            <p className="text-base mb-4">
              RESERVÁ TU CLASE O ENTRENAMIENTO EN EL GIMNASIO.
            </p>
            <div className="flex items-center gap-2 mt-auto text-sm font-bold">
              <span>VER MÁS</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </SmartLink>
        </div>

        {/* Botón Ver Intro - Al final */}
        <div className="text-center px-4 pt-8 border-t-2 border-black dark:border-gray-600">
          <button
            onClick={handleReplayIntro}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-gray-600 bg-white dark:bg-black font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Video className="w-5 h-5" />
            <span>VER VIDEO DE INTRODUCCIÓN</span>
          </button>
        </div>
      </section>
    </>
  );
};

export default Inicio;