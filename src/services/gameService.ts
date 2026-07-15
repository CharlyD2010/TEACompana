'use client';

import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { GameSession } from '@/lib/types';

/**
 * Servicio para registrar sesiones de juego y actualizar sumarios pedagógicos.
 */
export const gameService = {
  saveSession: async (childId: string, userId: string, sessionData: Partial<GameSession>) => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const ref = doc(db, 'children', childId, 'game_sessions', sessionId);
    
    const session = {
      ...sessionData,
      id: sessionId,
      childId,
      userId,
      createdAt: new Date().toISOString(),
    };

    // Guardar sesión individual (historial)
    await setDoc(ref, session);

    // Actualizar totales y sumario en el documento principal del niño
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, {
      points: increment(sessionData.score || 0),
      stars: increment(sessionData.stars || 0),
      // Sistema de Sumario para Reportes Optimizado
      'summary.totalSessions': increment(1),
      'summary.totalPoints': increment(sessionData.score || 0),
      'summary.totalStars': increment(sessionData.stars || 0),
      'summary.totalCorrectAnswers': increment(sessionData.correctAnswers || 0),
      'summary.totalIncorrectAnswers': increment(sessionData.incorrectAnswers || 0),
      'summary.totalQuestions': increment(sessionData.totalQuestions || 0),
      'summary.totalDurationSeconds': increment(sessionData.durationSeconds || 0),
      'summary.lastActivityAt': new Date().toISOString(),
      'summary.updatedAt': serverTimestamp(),
    });

    return sessionId;
  }
};
