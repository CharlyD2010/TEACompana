'use client';

import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export const progressService = {
  updateProgress: async (childId: string, gameId: string, stats: any) => {
    const progressId = `${childId}_${gameId}`;
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
