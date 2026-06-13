'use client';

import { collection, doc, setDoc, query, orderBy, limit, getDocs, Firestore } from 'firebase/firestore';

export const assessmentService = {
  saveAssessment: async (db: Firestore, childId: string, conductedBy: string, scores: any, notes: string = '') => {
    const id = Math.random().toString(36).substr(2, 9);
    // Ruta corregida a subcolección según reglas
    const ref = doc(db, 'children', childId, 'assessments', id);
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

  getLatestAssessment: async (db: Firestore, childId: string) => {
    const q = query(
      collection(db, 'children', childId, 'assessments'), 
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  }
};