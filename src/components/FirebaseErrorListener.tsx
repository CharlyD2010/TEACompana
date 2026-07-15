'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';

/**
 * Escucha errores globales de Firebase y los presenta de forma amigable.
 * Evita mostrar mensajes técnicos confusos para el usuario.
 */
export const FirebaseErrorListener = () => {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      console.error('Firebase Contextual Error:', error);
      
      let title = 'Acceso Restringido';
      let description = 'No tienes permisos para realizar esta acción o ver estos datos.';

      if (error.context?.operation === 'list' || error.context?.operation === 'get') {
        description = 'Hubo un problema al cargar los datos. Verifica tu conexión e inténtalo de nuevo.';
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
};
