
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton, LoadingState } from '@/components/app-components';
import { CheckCircle2, XCircle, Loader2, X, LayoutDashboard, Users, BookOpen, Star, Trophy } from 'lucide-react';
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
  };

  if (isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-6">
        <Trophy className="w-20 h-20 text-accent animate-bounce" />
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">¡Lo lograste!</h2>
          <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">Guardando tus resultados...</p>
        </div>
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Game Header */}
      <div className="p-6 flex items-center justify-between bg-white border-b-2 border-muted/50">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <X className="w-6 h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] border-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-primary uppercase tracking-tighter">¿Seguro que deseas salir?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-medium">
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
          <div className="space-y-1">
            <h2 className="font-black text-primary uppercase tracking-tight leading-none text-lg">{game.name}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{game.area}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs font-black bg-primary/10 text-primary px-4 py-2 rounded-full border-2 border-primary/10">
            {currentIdx + 1} / {game.questions.length}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-6 max-w-xl">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto border-4 border-primary/20">
            <span className="text-5xl">{currentQ.options[currentQ.correct]}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight text-primary tracking-tight">
            {currentQ.text}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          {currentQ.options.map((opt: string, i: number) => (
            <button 
              key={i} 
              onClick={() => handleOption(i)} 
              className={`h-48 md:h-60 text-6xl md:text-8xl bg-white rounded-[3rem] shadow-xl border-8 border-transparent active:scale-95 transition-all hover:bg-muted/30 flex items-center justify-center
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

      {/* Visual Feedback Overlay */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[100] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-8 bg-white/80 p-16 rounded-[4rem] shadow-2xl border-4 border-white">
            <div className={`p-10 rounded-full shadow-2xl ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? (
                <CheckCircle2 className="w-24 h-24 text-white animate-bounce" />
              ) : (
                <XCircle className="w-24 h-24 text-white animate-pulse" />
              )}
            </div>
            <h3 className={`text-6xl font-black uppercase tracking-[0.2em] ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡Muy Bien!' : '¡Casi!'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
