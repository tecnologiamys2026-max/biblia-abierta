"use client";

import { useState, useEffect } from 'react';

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }

    // Escuchar el evento de instalación en Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Mostrar el mensaje nativo de Android
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Si es iOS o no soporta el prompt automático, mostramos las instrucciones manuales
      setShowModal(true);
    }
  };

  // Si ya está instalada, no mostramos el botón
  if (isInstalled) return null;

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-full shadow-md flex items-center gap-1 sm:gap-2 transition-transform transform hover:scale-105"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Descargar App
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-extrabold text-indigo-900 mb-4 text-center">Cómo instalar la App</h3>
            
            {isIOS ? (
              <div className="text-gray-700 space-y-4">
                <p>Para iPhone o iPad:</p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                  <span>Toca el ícono de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) en la parte inferior de tu pantalla.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                  <span>Desliza hacia abajo y selecciona <strong>"Agregar a inicio"</strong>.</span>
                </p>
              </div>
            ) : (
              <div className="text-gray-700 space-y-4">
                <p>Para Android:</p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                  <span>Toca los <strong>tres puntos</strong> en la esquina superior derecha de tu navegador.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                  <span>Selecciona <strong>"Instalar aplicación"</strong> o "Agregar a pantalla principal".</span>
                </p>
              </div>
            )}

            <button 
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
