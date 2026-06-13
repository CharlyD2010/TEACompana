'use client';

import { collection, doc, setDoc, query, orderBy, limit, getDocs, Firestore } from 'firebase/firestore';

export const learningPlanService = {
  saveLearningPlan: async (db: Firestore, childId: string, createdBy: string, planData: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    // Ruta corregida a subcolección según reglas
    const ref = doc(db, 'children', childId, 'learning_plans', id);
    const plan = {
      ...planData,
      id,
      childId,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, plan);
    return plan;
  },

  getLatestPlan: async (db: Firestore, childId: string) => {
    const q = query(
      collection(db, 'children', childId, 'learning_plans'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  }
};