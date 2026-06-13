'use client';

import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const progressService = {
  updateProgress: async (childId: string, gameId: string, stats: any) => {
    const progressId = `${childId}_${gameId}`;
    const ref = doc(db, 'game_progress', progressId);
    
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        id: progressId,
        childId,
        gameId,
        level: stats.level || 1,
        stars: stats.stars || 0,
        points: stats.points || 0,
        attempts: 1,
        isCompleted: stats.isCompleted || false,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(ref, {
        stars: Math.max(snap.data().stars, stats.stars || 0),
        points: increment(stats.points || 0),
        attempts: increment(1),
        isCompleted: stats.isCompleted || snap.data().isCompleted,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  getChildProgress: async (childId: string) => {
    // Note: for simpler listing, we might want to query by childId
    // But for MVP, we'll fetch individual progress docs
  }
};
