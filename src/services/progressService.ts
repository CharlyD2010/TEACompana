'use client';

import { doc, setDoc, getDoc, updateDoc, increment, Firestore, serverTimestamp } from 'firebase/firestore';

export const progressService = {
  updateProgress: async (db: Firestore, childId: string, gameId: string, stats: any) => {
    const progressId = `${childId}_${gameId}`;
    // Ruta correcta según las reglas: /children/{childId}/game_progress/{id}
    // Nota: El backend.json usa game_progress como subcolección
    const ref = doc(db, 'children', childId, 'game_progress', progressId);
    
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        id: progressId,
        childId,
        gameId,
        gameName: stats.gameName,
        stars: stats.stars || 0,
        points: stats.points || 0,
        attempts: 1,
        updatedAt: serverTimestamp(),
      });
    } else {
      const currentData = snap.data();
      await updateDoc(ref, {
        stars: Math.max(currentData.stars || 0, stats.stars || 0),
        points: increment(stats.points || 0),
        attempts: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
  }
};