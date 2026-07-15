'use client';

/**
 * @fileOverview Punto único oficial de acceso a Firebase para TEACompaña.
 * Centraliza la inicialización y proporciona tanto hooks para componentes 
 * como instancias directas para servicios.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// Inicialización Singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Exportación de Providers y Hooks
export * from './provider';
export * from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useAuth, useFirestore, useFirebaseApp } from './provider';
