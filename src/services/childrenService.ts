
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

    await setDoc(childRef, newChild);

    // Relación determinista
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
    if (!db) return [];
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data();
    
    if (userData.role === 'teacher') {
      // DOCENTE: Consulta institucional
      const institutionId = userData.institutionId || 'la-uni';
      const assignedGroups = userData.assignedGroups || ['PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

      console.log(`[DOCENTE] Consultando alumnos para institución: ${institutionId}, grupos: ${assignedGroups.join(', ')}`);

      // Consulta directa por institución
      const childrenQuery = query(
        collection(db, 'children'),
        where('institutionId', '==', institutionId)
      );
      
      const childrenSnap = await getDocs(childrenQuery);
      const allInstitutionalChildren = childrenSnap.docs.map(d => d.data());
      
      // Filtrado por grupos asignados en cliente para mayor fiabilidad
      const filtered = allInstitutionalChildren.filter(child => 
        assignedGroups.includes(child.groupId)
      );

      console.log(`[DOCENTE] Encontrados: ${allInstitutionalChildren.length}, Filtrados por grupo: ${filtered.length}`);
      return filtered;
    } else {
      // PADRE: Consulta por child_access
      const accessQuery = query(
        collection(db, 'child_access'), 
        where('userId', '==', userId), 
        where('isActive', '==', true)
      );
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
    }
  },

  getChildById: async (childId: string) => {
    if (!db || !childId) return null;
    const snap = await getDoc(doc(db, 'children', childId));
    return snap.exists() ? snap.data() : null;
  }
};
