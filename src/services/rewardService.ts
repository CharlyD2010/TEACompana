'use client';

import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const rewardService = {
  getChildRewards: async (childId: string) => {
    const q = query(collection(db, 'child_rewards'), where('childId', '==', childId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  },

  awardReward: async (childId: string, rewardId: string) => {
    const id = `${childId}_${rewardId}`;
    const ref = doc(db, 'child_rewards', id);
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
