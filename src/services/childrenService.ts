'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Child, UserProfile } from '@/lib/types';

/**
 * Servicio para la gestión de perfiles de niños y permisos de acceso.
 */
export const childrenService = {
  createChild: async (userId: string, childData: Partial<Child>): Promise<string> => {
    const childId = Math.random().toString(36).substr(2, 9);
    const childRef = doc(db, 'children', childId);
    
    const newChild: Child = {
      id: childId,
      createdBy: userId,
      name: childData.name || '',
      birthDate: childData.birthDate || '',
      teaLevel: childData.teaLevel || 'leve',
      interests: childData.interests || [],
      learningStyle: childData.learningStyle || 'visual',
      avatarUrl: childData.avatarUrl || '',
      avatarKey: childData.avatarKey || 'cat',
      medicalNotes: childData.medicalNotes || '',
      institutionId: childData.institutionId || 'la-uni',
      institutionName: childData.institutionName || 'LA-UNI',
      groupId: childData.groupId || 'PED_1',
      groupName: childData.groupId || 'PED_1',
      createdAt: new Date().toISOString(),
      points: 0,
      stars: 0,
      summary: {
        totalSessions: 0,
        totalPoints: 0,
        totalStars: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        totalQuestions: 0,
        totalDurationSeconds: 0,
      }
    };

    await setDoc(childRef, newChild);

    const accessId = `${userId}_${childId}`;
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

  getChildrenForUser: async (userId: string): Promise<Child[]> => {
    if (!db) return [];
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data() as UserProfile;
    
    if (userData.role === 'teacher') {
      const institutionId = userData.institutionId || 'la-uni';
      const assignedGroups = userData.assignedGroups || ['PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

      const childrenQuery = query(
        collection(db, 'children'),
        where('institutionId', '==', institutionId)
      );
      
      const childrenSnap = await getDocs(childrenQuery);
      const allInstitutionalChildren = childrenSnap.docs.map(d => d.data() as Child);
      
      return allInstitutionalChildren.filter(child => 
        assignedGroups.includes(child.groupId)
      );
    } else {
      const accessQuery = query(
        collection(db, 'child_access'), 
        where('userId', '==', userId), 
        where('isActive', '==', true)
      );
      const accessSnap = await getDocs(accessQuery);
      const childIds = accessSnap.docs.map(d => d.data().childId);

      if (childIds.length === 0) return [];

      const children: Child[] = [];
      for (const id of childIds) {
        const childDoc = await getDoc(doc(db, 'children', id));
        if (childDoc.exists()) {
          children.push(childDoc.data() as Child);
        }
      }
      return children;
    }
  },

  getChildById: async (childId: string): Promise<Child | null> => {
    if (!db || !childId) return null;
    const snap = await getDoc(doc(db, 'children', childId));
    return snap.exists() ? (snap.data() as Child) : null;
  }
};
