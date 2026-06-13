'use client';

import { collection, doc, setDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const assessmentService = {
  saveAssessment: async (childId: string, conductedBy: string, scores: any, notes: string = '') => {
    const id = Math.random().toString(36).substr(2, 9);
    const ref = doc(db, 'initial_assessments', id);
    const assessment = {
      id,
      childId,
      conductedBy,
      scores,
      notes,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, assessment);
    return assessment;
  },

  getLatestAssessment: async (childId: string) => {
    const q = query(
      collection(db, 'initial_assessments'), 
      where('childId', '==', childId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  }
};
