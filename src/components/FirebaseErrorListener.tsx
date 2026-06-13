'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { toast } from '@/hooks/use-toast';

export const FirebaseErrorListener = () => {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      console.error('Firebase Permission Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Permisos',
        description: 'No tienes permisos suficientes para realizar esta acción.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
};
