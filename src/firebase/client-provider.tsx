'use client';

import React from 'react';
import { app, db, auth } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * Provider principal que envuelve la aplicación asegurando que Firebase
 * se inicialice correctamente desde el punto único oficial.
 */
export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirebaseProvider firebaseApp={app} firestore={db} auth={auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
