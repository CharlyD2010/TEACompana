'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton, LoadingState } from '@/components/app-components';
import { CheckCircle2, XCircle, Loader2, X, Star, Trophy, RefreshCcw } from 'lucide-react';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
      { id: 3, text: 'Selecciona el color VERDE', options: ['🔴', '🔵', '🟢', '🟡'], correct: 2 },
    ]
  },
  g3: {
    name: 'Conteo 1-5',
    area: 'Conteo',
    questions: [
      { id: 1, text: '¿Cuántas manzanas hay? 🍎 🍎', options: ['1', '2', '3', '4'], correct: 1 },
      { id: 2, text: '¿Cuántas estrellas hay? ⭐ ⭐ ⭐', options: ['2', '3', '4', '5'], correct: 1 },
      { id: 3, text: '¿Cuántos lápices hay? ✏️ ✏️ ✏️ ✏️', options: ['3', '4', '5', '6'], correct: 1 },
    ]
  },
  g4: {
    name: 'Pasos de la Mañana',
    area: 'Rutinas',
    questions: [
      { id: 1, text: '¿Qué hacemos PRIMERO?', options: ['🛌 Despertar', '🦷 Lavar dientes', '👕 Vestirse', '🥣 Desayunar'], correct: 0 },
      { id: 2, text: '¿Qué hacemos antes de SALIR?', options: ['👟 Poner zapatos', '🛌 Dormir', '🚿 Bañarse', '🍎 Cenar'], correct: 0 },
    ]
  },
  g5: {
    name: 'Palabra e Imagen',
    area: 'Comunicación',
    questions: [
      { id: 1, text: '¿Cuál es el PERRO?', options: ['🐶', '🐱', '🐮', '🐷'], correct: 0 },
      { id: 2, text: '¿Cuál es la MANZANA?', options: ['🍌', '🍎', '🍇', '🍉'], correct: 1 },
    ]
  },
  g6: {
    name: 'Sonidos de Animales',
    area: 'Animales',
    questions: [
      { id: 1, text: '¿Quién hace "GUAU GUAU"?', options: ['🐶', '🐱', '🐮', '🐔'], correct: 0 },
      { id: 2, text: '¿Quién hace "MUUUU"?', options: ['🐷', '🐮', '🐴', '🐑'], correct: 1 },
    ]
  },
  g7: {
    name: 'Identificar Objetos',
    area: 'Comunicación',
    questions: [
      { id: 1, text: '¿Cuál se usa para BEBER?', options: ['🪑', '🥤', '📱', '🚲'], correct: 1 },
      { id: 2, text: '¿Cuál se usa para SENTARSE?', options: ['🛌', '🪑', '📚', '🥣'], correct: 1 },
    ]
  },
  g8: {
    name: 'Memoria Visual',
    area: 'Memoria',
    questions: [
      { id: 1, text: '¿Qué animal vimos hace un momento? (🐶)', options: ['🐱', '🐷', '🐶', '🐮'], correct: 2 },
      { id: 2, text: '¿De qué color era el globo? (🎈)', options: ['🔵', '🟢', '🔴', '🟡'], correct: 2 },
    ]
  },
  g14: {
    name: 'Hábitos de Higiene',
    area: 'Higiene',
    questions: [
      { id: 1, text: '¿Qué usamos para lavarnos las MANOS?', options: ['🧼 Jabón', '🪮 Peine', '👟 Zapato', '🥄 Cuchara'], correct: 0 },
      { id: 2, text: '¿Qué usamos para lavarnos los DIENTES?', options: ['🧼 Jabón', '🦷 Cepillo', '🧴 Crema', '🧻 Papel'], correct: 1 },
    ]
  },
  g15: {
    name: 'Seguridad Básica',
    area: 'Seguridad',
    questions: [
      { id: 1, text: '¿Qué color del semáforo significa PARAR?', options: ['🔴', '🟡', '🟢', '⚪'], correct: 0 },
      { id: 2, text: '¿Qué color significa que podemos CRUZAR?', options: ['🔴', '🟡', '🟢', '⚪'], correct: 2 },
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

  const game = useMemo(() => GAME_DATA[gameId as string] || GAME_DATA.g1, [gameId]);
  const currentQ = game.questions[currentIdx];

  const finishGame = useCallback(async (finalCorrect: number) => {
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

    const sessionRef = doc(db, 'children', childId as string, 'game_sessions', sessionId);
    
    try {
      await setDoc(sessionRef, sessionData);

      const progressId = `${childId}_${gameId}`;
      const progressRef = doc(db, 'children', childId as string, 'game_progress', progressId);
      await setDoc(progressRef, {
        id: progressId,
        childId,
        gameId,
        gameName: game.name,
        stars: stars,
        points: increment(finalCorrect * 10),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const childRef = doc(db, 'children', childId as string);
      await updateDoc(childRef, {
        points: increment(finalCorrect * 10),
        stars: increment(stars)
      });

      router.push(`/child/${childId}/results/${sessionId}`);
    } catch (e: any) {
      setIsFinishing(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: sessionRef.path,
        operation: 'create',
        requestResourceData: sessionData
      }));
    }
  }, [db, user, childId, game, results.startTime, gameId, router]);

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

  if (isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-6 p-6">
        <Trophy className="w-16 h-16 md:w-20 md:h-20 text-accent animate-bounce" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter">¡Lo lograste!</h2>
          <p className="font-bold text-muted-foreground uppercase text-[10px] md:text-xs tracking-widest">Guardando tus resultados...</p>
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Game Header */}
      <div className="p-4 md:p-6 flex items-center justify-between bg-white border-b-2 border-muted/50 safe-area-top">
        <div className="flex items-center gap-3 md:gap-4 max-w-[70%]">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-xl md:rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-none max-w-[90vw] md:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl md:text-2xl font-black text-primary uppercase tracking-tighter">¿Seguro que deseas salir?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-medium text-sm">
                  Si sales ahora no se guardarán tus puntos de esta partida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-3 mt-4">
                <AppButton className="w-full h-14 text-lg" onClick={() => router.push(`/child/${childId}/activities`)}>
                  Sí, quiero salir
                </AppButton>
                <AlertDialogCancel className="w-full h-12 rounded-2xl font-black uppercase text-[10px] border-2">
                  Seguir jugando
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="space-y-0.5 min-w-0">
            <h2 className="font-black text-primary uppercase tracking-tight leading-none text-base md:text-lg truncate">{game.name}</h2>
            <p className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] truncate">{game.area}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-[10px] md:text-xs font-black bg-primary/10 text-primary px-3 md:px-4 py-1.5 md:py-2 rounded-full border-2 border-primary/10 whitespace-nowrap">
            {currentIdx + 1} / {game.questions.length}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center space-y-8 md:space-y-12 overflow-y-auto">
        <div className="text-center space-y-4 md:space-y-6 max-w-xl w-full">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[1.8rem] md:rounded-[2rem] shadow-xl flex items-center justify-center mx-auto border-4 border-primary/20">
            <span className="text-4xl md:text-5xl">{currentQ.options[currentQ.correct]}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-primary tracking-tight px-2">
            {currentQ.text}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl px-2">
          {currentQ.options.map((opt: string, i: number) => (
            <button 
              key={i} 
              onClick={() => handleOption(i)} 
              className={`min-h-[140px] md:h-60 text-5xl md:text-8xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border-8 border-transparent active:scale-95 transition-all hover:bg-muted/30 flex items-center justify-center
                ${feedback === 'correct' && i === currentQ.correct ? 'border-secondary bg-secondary/10 scale-105' : ''}
                ${feedback === 'wrong' && i !== currentQ.correct ? 'opacity-50 grayscale' : ''}
              `}
              disabled={!!feedback}
            >
              <span className="select-none">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Feedback Overlay */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[100] animate-in fade-in duration-300 p-6">
          <div className="flex flex-col items-center gap-6 md:gap-8 bg-white/90 p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl border-4 border-white w-full max-w-sm md:max-w-md text-center">
            <div className={`p-8 md:p-10 rounded-full shadow-2xl ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? (
                <CheckCircle2 className="w-16 h-16 md:w-24 md:h-24 text-white animate-bounce" />
              ) : (
                <XCircle className="w-16 h-16 md:w-24 md:h-24 text-white animate-pulse" />
              )}
            </div>
            <h3 className={`text-4xl md:text-6xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡Muy Bien!' : '¡Casi!'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}