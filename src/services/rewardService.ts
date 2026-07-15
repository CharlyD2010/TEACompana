'use client';

import { collection, doc, setDoc, getDocs, getDoc, Firestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Servicio para gestionar las recompensas y medallas de los niños.
 * Implementa lógica para otorgar insignias basadas en el desempeño pedagógico.
 */
export const rewardService = {
  /**
   * Obtiene las recompensas ganadas por un niño específico.
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
   * Revisa si el niño califica para nuevas insignias basadas en su última sesión.
   */
  checkAndAwardBadges: async (db: Firestore, childId: string, sessionData: any) => {
    const { gameId, accuracy, stars, totalQuestions } = sessionData;
    
    // Lógica de insignias por categoría
    if (accuracy >= 100) {
      await rewardService.awardReward(db, childId, 'accuracy_master');
    }

    if (gameId === 'g1' && stars >= 2) await rewardService.awardReward(db, childId, 'emotions_explorer');
    if (gameId === 'g2' && stars >= 2) await rewardService.awardReward(db, childId, 'master_colors');
    if (gameId === 'g6' && stars >= 2) await rewardService.awardReward(db, childId, 'animal_friend');
    if (gameId === 'g4' && stars >= 2) await rewardService.awardReward(db, childId, 'routine_expert');

    // Insignia de primer juego
    await rewardService.awardReward(db, childId, 'first_game');
  },

  /**
   * Otorga una recompensa a un niño si no la tiene ya.
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
