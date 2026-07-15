'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton, LoadingState } from '@/components/app-components';
import { CheckCircle2, XCircle, Volume2, X, Star, AlertCircle } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { rewardService } from '@/services/rewardService';
import { GameLevelData, GameQuestion, GameSession } from '@/lib/types';
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

const GAME_LEVELS: Record<string, Record<number, GameLevelData>> = {
  g1: { // Emociones
    1: { name: 'Emociones Básicas', instruction: 'Toca el personaje que se siente así', questions: [
      { id: 1, text: '¿Quién está FELIZ?', options: ['😊', '😢', '😠', '😰'], correct: 0 },
      { id: 2, text: '¿Quién está TRISTE?', options: ['😊', '😢', '😠', '😰'], correct: 1 },
      { id: 3, text: '¿Quién está ENOJADO?', options: ['😊', '😢', '😠', '😰'], correct: 2 },
      { id: 4, text: '¿Quién tiene MIEDO?', options: ['😊', '😢', '😠', '😰'], correct: 3 },
    ]},
    2: { name: 'Situaciones Simples', instruction: '¿Cómo se siente el niño?', questions: [
      { id: 1, text: '¡Tengo un helado nuevo!', options: ['😊', '😢'], correct: 0 },
      { id: 2, text: 'Perdí mi pelota favorita', options: ['😊', '😢'], correct: 1 },
      { id: 3, text: '¡Hay una fiesta!', options: ['🤩', '😴'], correct: 0 },
      { id: 4, text: 'Es hora de dormir', options: ['🥱', '😡'], correct: 0 },
    ]},
    3: { name: 'Inferencia Social', instruction: '¿Qué siente el personaje?', questions: [
      { id: 1, text: 'Alguien me empujó fuerte', options: ['😠', '😊', '😴'], correct: 0 },
      { id: 2, text: 'Mi mamá me dio un abrazo', options: ['😌', '😢', '😰'], correct: 0 },
      { id: 3, text: 'No encuentro mi juguete', options: ['😰', '🤩', '😡'], correct: 0 },
      { id: 4, text: 'Escuché un ruido extraño', options: ['😨', '😋', '😎'], correct: 0 },
    ]}
  },
  g3: { // Letras
    1: { name: 'Las Vocales', instruction: 'Busca la vocal correcta', questions: [
      { id: 1, text: 'Letra A de AVION', options: ['A', 'E', 'I', 'O'], correct: 0 },
      { id: 2, text: 'Letra E de ESTRELLA', options: ['A', 'E', 'I', 'O'], correct: 1 },
      { id: 3, text: 'Letra I de IMAN', options: ['A', 'E', 'I', 'O'], correct: 2 },
      { id: 4, text: 'Letra O de OSO', options: ['A', 'E', 'I', 'O'], correct: 3 },
    ]},
    2: { name: 'Letras Iniciales', instruction: '¿Con qué letra empieza?', questions: [
      { id: 1, text: 'M de MESA', options: ['M', 'P', 'S', 'L'], correct: 0 },
      { id: 2, text: 'P de PERRO', options: ['M', 'P', 'S', 'L'], correct: 1 },
      { id: 3, text: 'S de SOL', options: ['M', 'P', 'S', 'L'], correct: 2 },
      { id: 4, text: 'L de LUNA', options: ['M', 'P', 'S', 'L'], correct: 3 },
    ]},
    3: { name: 'Armar Palabras', instruction: 'Completa la palabra', questions: [
      { id: 1, text: 'G _ T O', options: ['A', 'O', 'I'], correct: 0 },
      { id: 2, text: 'M _ M Á', options: ['A', 'E', 'U'], correct: 0 },
      { id: 3, text: 'C _ S A', options: ['A', 'O', 'I'], correct: 0 },
      { id: 4, text: 'P _ P Á', options: ['A', 'O', 'E'], correct: 0 },
    ]}
  },
  g7: { // Formas
    1: { name: 'Formas Básicas', instruction: 'Busca la forma geométrica', questions: [
      { id: 1, text: 'CÍRCULO', options: ['⭕', '⬜', '🔺'], correct: 0 },
      { id: 2, text: 'CUADRADO', options: ['⭕', '⬜', '🔺'], correct: 1 },
      { id: 3, text: 'TRIÁNGULO', options: ['⭕', '⬜', '🔺'], correct: 2 },
    ]},
    2: { name: 'Nuevas Formas', instruction: 'Identifica estas figuras', questions: [
      { id: 1, text: 'ESTRELLA', options: ['⭐', '❤️', '💎'], correct: 0 },
      { id: 2, text: 'CORAZÓN', options: ['⭐', '❤️', '💎'], correct: 1 },
      { id: 3, text: 'ROMBO', options: ['⭐', '❤️', '💎'], correct: 2 },
    ]},
    3: { name: 'Objetos y Formas', instruction: '¿Qué forma tiene?', questions: [
      { id: 1, text: 'Una VENTANA es...', options: ['Círculo', 'Cuadrado'], correct: 1 },
      { id: 2, text: 'Una PELOTA es...', options: ['Círculo', 'Cuadrado'], correct: 0 },
      { id: 3, text: 'Un TECHO es...', options: ['Triángulo', 'Rectángulo'], correct: 0 },
    ]}
  },
  g8: { // Conteo
    1: { name: 'Contar 1 a 5', instruction: '¿Cuántos hay?', questions: [
      { id: 1, text: '🍎 🍎', options: ['1', '2', '3'], correct: 1 },
      { id: 2, text: '⭐', options: ['1', '2', '3'], correct: 0 },
      { id: 3, text: '🧸 🧸 🧸', options: ['2', '3', '4'], correct: 1 },
    ]},
    2: { name: 'Contar hasta 10', instruction: 'Cuenta con cuidado', questions: [
      { id: 1, text: '🍎 🍎 🍎 🍎 🍎 🍎', options: ['5', '6', '7'], correct: 1 },
      { id: 2, text: '🧤 🧤 🧤 🧤', options: ['3', '4', '5'], correct: 1 },
      { id: 3, text: '🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗', options: ['7', '8', '9'], correct: 1 },
    ]},
    3: { name: 'Comparar Cantidades', instruction: '¿Dónde hay más?', questions: [
      { id: 1, text: 'A: 🍎🍎 | B: 🍎', options: ['A', 'B'], correct: 0 },
      { id: 2, text: 'A: ⭐ | B: ⭐⭐⭐', options: ['A', 'B'], correct: 1 },
    ]}
  }
};

export default function GamePlayPage() {
  const { childId, gameId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState({ correct: 0, startTime: Date.now() });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const gameData = useMemo(() => {
    if (!gameId) return null;
    return GAME_LEVELS[gameId as string] || GAME_LEVELS.g1;
  }, [gameId]);

  const levelData = useMemo(() => {
    if (!gameData) return null;
    return gameData[currentLevel] || gameData[1];
  }, [gameData, currentLevel]);

  const currentQ = useMemo(() => {
    if (!levelData) return null;
    return levelData.questions[currentIdx];
  }, [levelData, currentIdx]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  useEffect(() => {
    stopAudio();
  }, [currentIdx, stopAudio]);

  const playInstruction = useCallback(() => {
    stopAudio();
    setIsPlayingAudio(true);
    const timer = setTimeout(() => setIsPlayingAudio(false), 2500);
    return () => clearTimeout(timer);
  }, [stopAudio]);

  const finishGame = useCallback(async (finalCorrect: number) => {
    if (!db || !user || !childId || !levelData) return;
    setIsFinishing(true);
    stopAudio();
    
    const totalQuestions = levelData.questions.length;
    const accuracy = (finalCorrect / totalQuestions) * 100;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : accuracy >= 30 ? 1 : 0;
    const duration = Math.floor((Date.now() - results.startTime) / 1000);
    const sessionId = Math.random().toString(36).substring(2, 11);

    const sessionData: Partial<GameSession> = {
      id: sessionId,
      childId: childId as string,
      gameId: gameId as string,
      levelId: currentLevel,
      userId: user.uid,
      gameName: `${levelData.name}`,
      score: finalCorrect * 20,
      stars,
      correctAnswers: finalCorrect,
      incorrectAnswers: totalQuestions - finalCorrect,
      totalQuestions,
      accuracy,
      durationSeconds: duration,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'children', childId as string, 'game_sessions', sessionId), sessionData);

      const progressId = `${childId}_${gameId}_lvl${currentLevel}`;
      await setDoc(doc(db, 'children', childId as string, 'game_progress', progressId), {
        id: progressId,
        childId,
        gameId,
        levelId: currentLevel,
        stars,
        completed: stars > 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      if (stars >= 2 && currentLevel < 3) {
        const nextLvlId = `${childId}_${gameId}_lvl${currentLevel + 1}`;
        await setDoc(doc(db, 'children', childId as string, 'game_progress', nextLvlId), {
          unlocked: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await updateDoc(doc(db, 'children', childId as string), {
        points: increment(finalCorrect * 20),
        stars: increment(stars)
      });

      await rewardService.checkAndAwardBadges(db, childId as string, sessionData);

      router.push(`/child/${childId}/results/${sessionId}`);
    } catch (e: any) {
      setIsFinishing(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `/children/${childId}/game_sessions/${sessionId}`,
        operation: 'create',
        requestResourceData: sessionData
      }));
    }
  }, [db, user, childId, levelData, results.startTime, gameId, currentLevel, router, stopAudio]);

  const handleOption = (idx: number) => {
    if (feedback || isFinishing || !levelData || !currentQ) return;
    const isCorrect = idx === currentQ.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    const newCorrectCount = isCorrect ? results.correct + 1 : results.correct;
    
    setTimeout(() => {
      setFeedback(null);
      if (currentIdx < levelData.questions.length - 1) {
        setResults(prev => ({ ...prev, correct: newCorrectCount }));
        setCurrentIdx(prev => prev + 1);
      } else {
        finishGame(newCorrectCount);
      }
    }, 1200);
  };

  if (!gameData || !levelData || !currentQ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive opacity-50" />
        <h2 className="text-2xl font-black text-primary uppercase">Juego no disponible</h2>
        <p className="text-muted-foreground font-medium">No pudimos cargar los datos de esta actividad.</p>
        <AppButton onClick={() => router.push(`/child/${childId}/activities`)} aria-label="Volver a Actividades">Volver a Actividades</AppButton>
      </div>
    );
  }

  if (isFinishing) return <LoadingState message="Guardando tu progreso..." />;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 flex items-center justify-between bg-white border-b-4 border-muted/30">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button 
                className="w-12 h-12 bg-muted rounded-[1.2rem] flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Salir del juego"
              >
                <X className="w-6 h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black text-2xl uppercase text-primary">¿Quieres salir?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold text-base">Si sales ahora, no se guardará el puntaje de este nivel.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AppButton className="w-full bg-destructive text-white" onClick={() => { stopAudio(); router.push(`/child/${childId}/activities`); }} aria-label="Confirmar salida">Sí, salir</AppButton>
                <AlertDialogCancel className="w-full rounded-2xl border-2 font-black uppercase text-xs" aria-label="Continuar jugando">Seguir jugando</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="min-w-0">
            <h2 className="font-black text-primary uppercase text-sm truncate">{levelData.name}</h2>
            <div className="flex gap-1 mt-0.5">
               {[...Array(currentLevel)].map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}
            </div>
          </div>
        </div>
        <div className="font-black text-primary bg-primary/10 px-4 py-2 rounded-2xl text-xs border-2 border-primary/20">
          {currentIdx + 1} / {levelData.questions.length}
        </div>
      </div>

      <div className="bg-white/50 py-3 px-6 flex justify-center border-b-2 border-muted/10">
        <button 
          onClick={playInstruction}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-full border-2 transition-all ${isPlayingAudio ? 'bg-primary border-primary text-white scale-105 shadow-lg' : 'bg-white border-primary/20 text-primary hover:border-primary/50'}`}
          disabled={isPlayingAudio}
          aria-label={isPlayingAudio ? 'Escuchando instrucción' : 'Escuchar instrucción'}
        >
          <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] font-black uppercase tracking-widest">
            {isPlayingAudio ? 'Escuchando...' : 'Escuchar instrucción'}
          </span>
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8 md:space-y-12 max-w-4xl mx-auto w-full overflow-y-auto">
        <div className="text-center space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-4 border-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary/10"></div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight text-foreground break-words">{currentQ.text}</h1>
          </div>
        </div>

        <div className={`grid gap-4 md:gap-6 w-full ${currentQ.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {currentQ.options.map((opt: string, i: number) => {
             const isCorrect = i === currentQ.correct;
             return (
              <button 
                key={i} 
                onClick={() => handleOption(i)} 
                className={`min-h-[140px] md:min-h-[180px] p-4 text-4xl md:text-7xl bg-white rounded-[2.5rem] shadow-xl border-4 border-transparent transition-all active:scale-95 flex items-center justify-center relative overflow-hidden group
                  ${feedback === 'correct' && isCorrect ? 'border-secondary bg-secondary/10 scale-105' : ''}
                  ${feedback === 'wrong' && !isCorrect && feedback === 'wrong' ? 'opacity-40 grayscale blur-[1px]' : ''}
                `}
                disabled={!!feedback}
                aria-label={`Opción ${i + 1}: ${opt}`}
              >
                <span className="select-none font-black text-center leading-none">{opt}</span>
                {feedback === 'correct' && isCorrect && <div className="absolute inset-0 bg-secondary/20 animate-ping" />}
              </button>
             );
          })}
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50 animate-in fade-in duration-300">
          <div className="bg-white/95 p-12 rounded-[4rem] shadow-2xl border-8 border-white text-center animate-in zoom-in-50 duration-500 max-w-xs w-full mx-4">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-white" /> : <XCircle className="w-16 h-16 md:w-20 md:h-20 text-white" />}
            </div>
            <h3 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡GENIAL!' : '¡CASI!'}
            </h3>
            <p className="mt-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
              {feedback === 'correct' ? '¡Lo lograste!' : '¡Sigue intentando!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
