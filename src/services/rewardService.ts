'use client';

import { collection, doc, setDoc, getDocs, getDoc, Firestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Servicio para gestionar las recompensas y medallas de los niños.
 */
export const rewardService = {
  /**
   * Obtiene las recompensas ganadas por un niño específico.
   * @param db Instancia de Firestore
   * @param childId ID del niño
   */
  getChildRewards: async (db: Firestore, childId: string) => {
    try {
      const rewardsRef = collection(db, 'children', childId, 'child_rewards');
      const snap = await getDocs(rewardsRef);
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (e: any) {
      console.error("Error fetching child rewards:", e);
      return [];
    }
  },

  /**
   * Otorga una recompensa a un niño si no la tiene ya.
   * @param db Instancia de Firestore
   * @param childId ID del niño
   * @param rewardId ID de la recompensa (ej: 'first_game')
   */
  awardReward: async (db: Firestore, childId: string, rewardId: string) => {
    const docId = `${childId}_${rewardId}`;
    const rewardRef = doc(db, 'children', childId, 'child_rewards', docId);
    
    try {
      const snap = await getDoc(rewardRef);
      if (!snap.exists()) {
        const rewardData = {
          id: docId,
          childId,
          rewardId,
          earnedAt: new Date().toISOString(),
          createdAt: serverTimestamp(),
        };
        
        // No usamos await aquí para seguir el patrón de mutaciones no bloqueantes
        setDoc(rewardRef, rewardData)
          .catch(async (err) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: rewardRef.path,
              operation: 'create',
              requestResourceData: rewardData
            }));
          });
      }
    } catch (e: any) {
      console.error("Error awarding reward:", e);
    }
  }
};
