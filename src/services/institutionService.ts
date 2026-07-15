
'use client';

import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Institution } from '@/lib/types';

/**
 * Servicio para gestionar las instituciones académicas.
 */
export const institutionService = {
  /**
   * Obtiene la lista de instituciones activas ordenadas por nombre.
   */
  getInstitutions: async (): Promise<Institution[]> => {
    try {
      const q = query(
        collection(db, 'institutions'), 
        where('active', '==', true)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Institution))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error("Error fetching institutions:", e);
      return [];
    }
  },

  /**
   * Busca una institución por su nombre normalizado para evitar duplicados.
   */
  findByName: async (name: string): Promise<Institution | null> => {
    const normalized = name.trim().toLowerCase();
    const q = query(collection(db, 'institutions'), where('normalizedName', '==', normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Institution;
  },

  /**
   * Crea una nueva institución en Firestore.
   */
  createInstitution: async (name: string, userId: string): Promise<{ id: string, name: string }> => {
    const trimmedName = name.trim();
    const normalized = trimmedName.toLowerCase();
    
    const docRef = await addDoc(collection(db, 'institutions'), {
      name: trimmedName,
      normalizedName: normalized,
      createdAt: serverTimestamp(),
      createdBy: userId,
      active: true
    });

    return { id: docRef.id, name: trimmedName };
  }
};
