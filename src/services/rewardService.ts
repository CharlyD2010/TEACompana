'use client';

import { collection, doc, setDoc, getDocs, query, getDoc, Firestore } from 'firebase/firestore';

export const rewardService = {
  getChildRewards: async (db: Firestore, childId: string) => {
    // Ruta corregida a subcolección según reglas
    const q = collection(db, 'children', childId, 'child_rewards');
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },

  awardReward: async (db: Firestore, childId: string, rewardId: string) => {
    const id = `${childId}_${rewardId}`;
    // Ruta corregida a subcolección según reglas
    const ref = doc(db, 'children', childId, 'child_rewards', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        id,
        childId,
        rewardId,
        earnedAt: new Date().toISOString(),
      });
    }
  }
};