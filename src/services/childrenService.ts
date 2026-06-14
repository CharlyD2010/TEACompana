
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
import { db } from '@/config/firebase';

export const childrenService = {
  createChild: async (userId: string, childData: any) => {
    const childId = Math.random().toString(36).substr(2, 9);
    const childRef = doc(db, 'children', childId);
    
    // Asegurar que siempre tenga institución y grupo
    const newChild = {
      ...childData,
      id: childId,
      createdBy: userId,
      institutionId: childData.institutionId || 'la-uni',
      institutionName: childData.institutionName || 'LA-UNI',
      groupId: childData.groupId || 'PED_1',
      groupName: childData.groupId || 'PED_1',
      createdAt: new Date().toISOString(),
      points: childData.points || 0,
      stars: childData.stars || 0,
    };

    // 1. Crear el perfil del niño
    await setDoc(childRef, newChild);

    // 2. Crear relación de acceso DETERMINISTA (userId_childId)
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

  getChildrenForUser: async (userId: string) => {
    // 1. Obtener perfil del usuario para saber su rol e institución
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data();
    
    if (userData.role === 'teacher') {
      // 2a. Si es docente, buscar por institución y grupos asignados
      // Esto permite ver niños creados por padres en la misma institución
      const institutionId = userData.institutionId || 'la-uni';
      const assignedGroups = userData.assignedGroups || ['PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

      const childrenQuery = query(
        collection(db, 'children'),
        where('institutionId', '==', institutionId),
        where('groupId', 'in', assignedGroups)
      );
      
      const childrenSnap = await getDocs(childrenQuery);
      return childrenSnap.docs.map(d => d.data());
    } else {
      // 2b. Si es padre, buscar por relaciones de acceso específicas
      const accessQuery = query(
        collection(db, 'child_access'), 
        where('userId', '==', userId), 
        where('isActive', '==', true)
      );
      const accessSnap = await getDocs(accessQuery);
      const childIds = accessSnap.docs.map(d => d.data().childId);

      if (childIds.length === 0) return [];

      // Obtener perfiles de niños relacionados
      const children: any[] = [];
      for (const id of childIds) {
        const childDoc = await getDoc(doc(db, 'children', id));
        if (childDoc.exists()) {
          children.push(childDoc.data());
        }
      }
      return children;
    }
  },

  getChildById: async (childId: string) => {
    if (!childId) return null;
    const snap = await getDoc(doc(db, 'children', childId));
    return snap.exists() ? snap.data() : null;
  }
};
