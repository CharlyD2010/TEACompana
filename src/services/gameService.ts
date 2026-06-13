'use client';

import { doc, setDoc, updateDoc, increment, Firestore } from 'firebase/firestore';

export const gameService = {
  saveSession: async (db: Firestore, childId: string, userId: string, sessionData: any) => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    // Ruta correcta según las reglas: /children/{childId}/game_sessions/{id}
    const ref = doc(db, 'children', childId, 'game_sessions', sessionId);
    
    const session = {
      ...sessionData,
      id: sessionId,
      childId,
      userId,
      createdAt: new Date().toISOString(),
    };

    // Usar setDoc para guardar en la subcolección
    await setDoc(ref, session);

    // Actualizar los totales del niño
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, {
      points: increment(sessionData.score || 0),
      stars: increment(sessionData.stars || 0)
    });

    return sessionId;
  }
};