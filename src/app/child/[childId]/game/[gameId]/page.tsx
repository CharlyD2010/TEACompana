'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton } from '@/components/app-components';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const GAME_DATA: Record<string, any> = {
  g1: {
    name: 'Reconocer Emociones',
    area: 'Emociones',
    questions: [
      { id: 1, text: '¿Cuál personaje está FELIZ?', options: ['😊', '😢', '😠', '😲'], correct: 0 },
      { id: 2, text: '¿Cuál personaje está TRISTE?', options: ['😊', '😢', '😠', '😲'], correct: 1 },
      { id: 3, text: '¿Cuál personaje está ENOJADO?', options: ['😊', '😢', '😠', '😲'], correct: 2 },
    ]
  },
  g2: {
    name: 'Colores Básicos',
    area: 'Colores y Formas',
    questions: [
      { id: 1, text: 'Selecciona el color ROJO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
      { id: 2, text: 'Selecciona el color AZUL', options: ['🔴', '🔵', '🟢', '🟡'], correct: 1 },
    ]
  },
  g3: {
    name: 'Conteo 1-5',
    area: 'Conteo',
    questions: [
      { id: 1, text: '¿Cuántas manzanas hay? 🍎 🍎', options: ['1', '2', '3', '4'], correct: 1 },
      { id: 2, text: '¿Cuántas estrellas hay? ⭐ ⭐ ⭐', options: ['2', '3', '4', '5'], correct: 1 },
    ]
  }
};

export default function GamePlayPage() {
  const { childId, gameId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState({ correct: 0, startTime: Date.now() });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const game = GAME_DATA[gameId as string] || GAME_DATA.g1;
  const currentQ = game.questions[currentIdx];

  const handleOption = (idx: number) => {
    if (feedback || isFinishing) return;
    
    const isCorrect = idx === currentQ.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    const newCorrectCount = isCorrect ? results.correct + 1 : results.correct;
    
    setTimeout(() => {
      setFeedback(null);
      if (currentIdx < game.questions.length - 1) {
        setResults(prev => ({ ...prev, correct: newCorrectCount }));
        setCurrentIdx(prev => prev + 1);
      } else {
        finishGame(newCorrectCount);
      }
    }, 1200);
  };

  const finishGame = async (finalCorrect: number) => {
    if (!db || !user || !childId) return;
    setIsFinishing(true);
    
    const totalQuestions = game.questions.length;
    const accuracy = (finalCorrect / totalQuestions) * 100;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : accuracy >= 30 ? 1 : 0;
    const duration = Math.floor((Date.now() - results.startTime) / 1000);
    const sessionId = Math.random().toString(36).substring(2, 11);

    const sessionData = {
      id: sessionId,
      childId: childId as string,
      gameId: gameId as string,
      userId: user.uid,
      gameName: game.name,
      area: game.area,
      score: finalCorrect * 10,
      stars,
      correctAnswers: finalCorrect,
      incorrectAnswers: totalQuestions - finalCorrect,
      totalQuestions,
      accuracy,
      durationSeconds: duration,
      createdAt: new Date().toISOString(),
    };

    // 1. Guardar Sesión en subcolección
    const sessionRef = doc(db, 'children', childId as string, 'game_sessions', sessionId);
    
    try {
      await setDoc(sessionRef, sessionData);

      // 2. Actualizar Progreso (game_progress como subcolección)
      const progressId = `${childId}_${gameId}`;
      const progressRef = doc(db, 'children', childId as string, 'game_progress', progressId);
      await setDoc(progressRef, {
        id: progressId,
        childId,
        gameId,
        gameName: game.name,
        stars: stars,
        points: finalCorrect * 10,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 3. Actualizar Totales del Niño
      const childRef = doc(db, 'children', childId as string);
      await updateDoc(childRef, {
        points: increment(finalCorrect * 10),
        stars: increment(stars)
      });

      // Navegar a resultados
      router.push(`/child/${childId}/results/${sessionId}`);
    } catch (e: any) {
      setIsFinishing(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: sessionRef.path,
        operation: 'create',
        requestResourceData: sessionData
      }));
    }
  };

  if (isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-black text-primary uppercase animate-pulse">Guardando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-black text-primary uppercase tracking-tight leading-none">{game.name}</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{game.area}</p>
        </div>
        <div className="text-sm font-black bg-white px-4 py-1 rounded-full shadow-sm border-2 border-primary/10">
          {currentIdx + 1} / {game.questions.length}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-black leading-tight text-primary">{currentQ.text}</h1>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
          {currentQ.options.map((opt: string, i: number) => (
            <button 
              key={i} 
              onClick={() => handleOption(i)} 
              className={`h-44 text-7xl bg-white rounded-[3rem] shadow-xl border-4 border-transparent active:scale-95 transition-all hover:bg-muted/50 flex items-center justify-center
                ${feedback === 'correct' && i === currentQ.correct ? 'border-secondary bg-secondary/10 scale-105' : ''}
                ${feedback === 'wrong' && i !== currentQ.correct ? 'opacity-50 grayscale' : ''}
              `}
              disabled={!!feedback}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[100] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className={`p-8 rounded-full shadow-2xl ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? (
                <CheckCircle2 className="w-24 h-24 text-white animate-bounce" />
              ) : (
                <XCircle className="w-24 h-24 text-white" />
              )}
            </div>
            <h3 className={`text-5xl font-black uppercase tracking-widest ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡Muy Bien!' : '¡Casi!'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}