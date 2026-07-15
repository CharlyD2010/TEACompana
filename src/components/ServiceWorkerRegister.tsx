'use client';

import { useEffect } from 'react';

/**
 * Componente cliente encargado de registrar el Service Worker de forma segura.
 * Se ejecuta únicamente en el navegador después del montaje inicial, 
 * evitando discrepancias de hidratación en el servidor.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Verificar disponibilidad de Service Worker en el navegador
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar el worker ubicado en /public/sw.js
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Registro silencioso exitoso
        })
        .catch((error) => {
          // Manejo silencioso de errores para no interrumpir la experiencia del usuario
          console.error('Error al registrar el Service Worker:', error);
        });
    }
  }, []);

  return null;
}
