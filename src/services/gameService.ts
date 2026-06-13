'use client';

import { collection, doc, setDoc, updateDoc, increment, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const gameService = {
  saveSession: async (childId: string, userId: string, sessionData: any) => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const ref = doc(db, 'game_sessions', sessionId);
    
    const session = {
      ...sessionData,
      id: sessionId,
      childId,
      userId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(ref, session);

    // Update child totals
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, {
      points: increment(session.score || 0),
      stars: increment(session.stars || 0)
    });

    return session;
  },

  getSessions: async (childId: string) => {
    const q = query(
      collection(db, 'game_sessions'),
      where('childId', '==', childId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }
};
