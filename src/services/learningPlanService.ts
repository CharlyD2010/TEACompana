'use client';

import { collection, doc, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export const learningPlanService = {
  saveLearningPlan: async (childId: string, createdBy: string, planData: any) => {
    const id = Math.random().toString(36).substr(2, 9);
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

  getLatestPlan: async (childId: string) => {
    const q = query(
      collection(db, 'children', childId, 'learning_plans'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].data();
  }
};
