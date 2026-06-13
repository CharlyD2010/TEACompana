'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const childrenService = {
  createChild: async (userId: string, childData: any) => {
    const childId = Math.random().toString(36).substr(2, 9);
    const childRef = doc(db, 'children', childId);
    
    const newChild = {
      ...childData,
      id: childId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      points: 0,
      stars: 0,
    };

    await setDoc(childRef, newChild);

    // Create access record
    const accessId = Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'child_access', accessId), {
      id: accessId,
      childId,
      userId,
      role: 'owner',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return childId;
  },

  getChildrenForUser: async (userId: string) => {
    const accessQuery = query(collection(db, 'child_access'), where('userId', '==', userId));
    const accessSnap = await getDocs(accessQuery);
    const childIds = accessSnap.docs.map(d => d.data().childId);

    if (childIds.length === 0) return [];

    const children: any[] = [];
    for (const id of childIds) {
      const childDoc = await getDoc(doc(db, 'children', id));
      if (childDoc.exists()) {
        children.push(childDoc.data());
      }
    }
    return children;
  },

  getChildById: async (childId: string) => {
    const snap = await getDoc(doc(db, 'children', childId));
    return snap.exists() ? snap.data() : null;
  }
};
