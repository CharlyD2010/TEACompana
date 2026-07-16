'use client';

import { doc, setDoc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { GameSession } from '@/lib/types';
import { rewardService } from './rewardService';

/**
 * Servicio unificado para registrar sesiones de juego, actualizar sumarios pedagógicos
 * y gestionar el desbloqueo de niveles.
 */
export const gameService = {
  /**
   * Registra una sesión finalizada y actualiza el progreso global del niño.
   */
  saveSession: async (childId: string, userId: string, sessionData: Partial<GameSession>) => {
    if (!db || !childId || !sessionData.id) throw new Error("Datos insuficientes para guardar sesión");

    const sessionId = sessionData.id;
    const gameId = sessionData.gameId as string;
    const currentLevel = sessionData.levelId as number;
    const stars = sessionData.stars || 0;

    // 1. Guardar la sesión individual (Historial)
    const sessionRef = doc(db, 'children', childId, 'game_sessions', sessionId);
    await setDoc(sessionRef, sessionData);

    // 2. Actualizar el progreso del nivel actual
    const progressId = `${childId}_${gameId}_lvl${currentLevel}`;
    const progressRef = doc(db, 'children', childId, 'game_progress', progressId);
    
    await setDoc(progressRef, {
      id: progressId,
      childId,
      gameId,
      levelId: currentLevel,
      stars: stars,
      completed: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 3. Lógica de Desbloqueo del Siguiente Nivel (si obtuvo 2+ estrellas)
    if (stars >= 2 && currentLevel < 3) {
      const nextLevel = currentLevel + 1;
      const nextProgressId = `${childId}_${gameId}_lvl${nextLevel}`;
      const nextProgressRef = doc(db, 'children', childId, 'game_progress', nextProgressId);
      
      await setDoc(nextProgressRef, {
        id: nextProgressId,
        childId,
        gameId,
        levelId: nextLevel,
        unlocked: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 4. Actualizar Sumario Pedagógico en el documento principal del niño
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, {
      points: increment(sessionData.score || 0),
      stars: increment(stars),
      'summary.totalSessions': increment(1),
      'summary.totalPoints': increment(sessionData.score || 0),
      'summary.totalStars': increment(stars),
      'summary.totalCorrectAnswers': increment(sessionData.correctAnswers || 0),
      'summary.totalIncorrectAnswers': increment(sessionData.incorrectAnswers || 0),
      'summary.totalQuestions': increment(sessionData.totalQuestions || 0),
      'summary.totalDurationSeconds': increment(sessionData.durationSeconds || 0),
      'summary.lastActivityAt': new Date().toISOString(),
      'summary.updatedAt': serverTimestamp(),
    });

    // 5. Comprobar e insignias nuevas
    await rewardService.checkAndAwardBadges(db, childId, sessionData);

    return sessionId;
  },

  /**
   * Verifica si un nivel específico está desbloqueado para un niño.
   */
  isLevelUnlocked: async (childId: string, gameId: string, levelId: number): Promise<boolean> => {
    if (levelId === 1) return true;
    
    const progressId = `${childId}_${gameId}_lvl${levelId}`;
    const snap = await getDoc(doc(db, 'children', childId, 'game_progress', progressId));
    
    if (snap.exists() && snap.data().unlocked) return true;
    
    // Verificación de respaldo: si el nivel anterior tiene 2+ estrellas
    const prevLvlId = `${childId}_${gameId}_lvl${levelId - 1}`;
    const prevSnap = await getDoc(doc(db, 'children', childId, 'game_progress', prevLvlId));
    return prevSnap.exists() && (prevSnap.data().stars || 0) >= 2;
  }
};
