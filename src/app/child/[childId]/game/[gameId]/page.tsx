'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton, LoadingState, AppCard } from '@/components/app-components';
import { CheckCircle2, XCircle, Loader2, X, Star, Trophy, Volume2, PlayCircle, HelpCircle } from 'lucide-react';
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

// DATA ESTRUCTURADA POR NIVELES
const GAME_LEVELS: Record<string, Record<number, any>> = {
  g1: { // Emociones
    1: { name: 'Nivel 1: Básicas', questions: [
      { id: 1, text: '¿Cuál personaje está FELIZ?', options: ['😊', '😢', '😠', '😲'], correct: 0 },
      { id: 2, text: '¿Cuál personaje está TRISTE?', options: ['😊', '😢', '😠', '😲'], correct: 1 },
    ]},
    2: { name: 'Nivel 2: Intermedias', questions: [
      { id: 1, text: '¿Quién se siente ASUSTADO?', options: ['😰', '😎', '😴', '😋'], correct: 0 },
      { id: 2, text: '¿Quién se siente SORPRENDIDO?', options: ['😰', '😲', '😴', '😋'], correct: 1 },
    ]},
    3: { name: 'Nivel 3: Situaciones', questions: [
      { id: 1, text: '¡Hoy es mi CUMPLEAÑOS! ¿Cómo me siento?', options: ['😢', '😊', '😠', '🤢'], correct: 1 },
      { id: 2, text: '¡Perdí mi JUGUETE favorito! ¿Cómo me siento?', options: ['😊', '😢', '🤪', '😴'], correct: 1 },
    ]}
  },
  g2: { // Colores
    1: { name: 'Nivel 1: Primarios', questions: [
      { id: 1, text: 'Selecciona el color ROJO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
      { id: 2, text: 'Selecciona el color AZUL', options: ['🔴', '🔵', '🟢', '🟡'], correct: 1 },
    ]},
    2: { name: 'Nivel 2: Secundarios', questions: [
      { id: 1, text: 'Selecciona el color NARANJA', options: ['🟠', '🟣', '🟤', '⚫'], correct: 0 },
      { id: 2, text: 'Selecciona el color MORADO', options: ['🟠', '🟣', '🟤', '⚫'], correct: 1 },
    ]},
    3: { name: 'Nivel 3: Objetos', questions: [
      { id: 1, text: '¿De qué color es el SOL?', options: ['🟡', '🔵', '🔴', '🟢'], correct: 0 },
      { id: 2, text: '¿De qué color es una MANZANA?', options: ['🔵', '🔴', '🟣', '⚫'], correct: 1 },
    ]}
  },
  g6: { // Sonidos
    1: { name: 'Nivel 1: Animales Granja', type: 'sound', questions: [
      { id: 1, text: '¿Qué animal suena así?', audio: '/audio/dog.mp3', options: ['🐶', '🐱'], correct: 0 },
      { id: 2, text: '¿Qué animal suena así?', audio: '/audio/cow.mp3', options: ['🐷', '🐮'], correct: 1 },
    ]},
    2: { name: 'Nivel 2: Animales Selva', type: 'sound', questions: [
      { id: 1, text: '¿Quién ruge así?', audio: '/audio/lion.mp3', options: ['🦁', '🐵', '🐘', '🦒'], correct: 0 },
      { id: 2, text: '¿Quién suena así?', audio: '/audio/monkey.mp3', options: ['🦁', '🐵', '🐘', '🦒'], correct: 1 },
    ]},
    3: { name: 'Nivel 3: Objetos Casa', type: 'sound', questions: [
      { id: 1, text: '¿Qué objeto suena así?', audio: '/audio/phone.mp3', options: ['☎️', '🚗', '🔔', '🚪'], correct: 0 },
      { id: 2, text: '¿Qué objeto suena así?', audio: '/audio/car.mp3', options: ['☎️', '🚗', '🔔', '🚪'], correct: 1 },
    ]}
  },
  g4: { // Rutinas
    1: { name: 'Nivel 1: Hábitos', questions: [
      { id: 1, text: '¿Qué usamos para LAVAR las manos?', options: ['🧼', '👟', '📱', '🍎'], correct: 0 },
      { id: 2, text: '¿Qué usamos para CEPILLAR los dientes?', options: ['🦷', '🥪', '🧸', '🚿'], correct: 0 },
    ]},
    2: { name: 'Nivel 2: Ordenar', questions: [
      { id: 1, text: '¿Qué hacemos PRIMERO?', options: ['🛌 Despertar', '🦷 Lavar dientes'], correct: 0 },
      { id: 2, text: '¿Qué hacemos ANTES de dormir?', options: ['👟 Jugar', '🛌 Acostarse'], correct: 1 },
    ]},
    3: { name: 'Nivel 3: Completar', questions: [
      { id: 1, text: 'FALTA UN PASO: Mojar manos -> [?] -> Frotar', options: ['🧼 Jabón', '🛌 Dormir', '👟 Zapatos', '🥪 Comer'], correct: 0 },
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

  // Obtener datos del juego y nivel
  const gameData = useMemo(() => GAME_LEVELS[gameId as string] || GAME_LEVELS.g1, [gameId]);
  const levelData = useMemo(() => gameData[currentLevel] || gameData[1], [gameData, currentLevel]);
  const currentQ = useMemo(() => levelData.questions[currentIdx], [levelData, currentIdx]);

  const playQuestionAudio = useCallback(() => {
    if (currentQ?.audio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(true);
      const audio = new Audio(currentQ.audio);
      audioRef.current = audio;
      audio.play().catch(e => console.warn("Audio no encontrado, usando fallback visual", e));
      audio.onended = () => setIsPlayingAudio(false);
    }
  }, [currentQ]);

  useEffect(() => {
    if (levelData.type === 'sound') {
      playQuestionAudio();
    }
  }, [currentIdx, currentLevel, levelData.type, playQuestionAudio]);

  const finishGame = useCallback(async (finalCorrect: number) => {
    if (!db || !user || !childId) return;
    setIsFinishing(true);
    
    const totalQuestions = levelData.questions.length;
    const accuracy = (finalCorrect / totalQuestions) * 100;
    const stars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : accuracy >= 30 ? 1 : 0;
    const duration = Math.floor((Date.now() - results.startTime) / 1000);
    const sessionId = Math.random().toString(36).substring(2, 11);

    const sessionData = {
      id: sessionId,
      childId: childId as string,
      gameId: gameId as string,
      levelId: currentLevel,
      userId: user.uid,
      gameName: `${GAME_LEVELS[gameId as string]?.name || 'Juego'} - ${levelData.name}`,
      score: finalCorrect * 10,
      stars,
      correctAnswers: finalCorrect,
      incorrectAnswers: totalQuestions - finalCorrect,
      totalQuestions,
      accuracy,
      durationSeconds: duration,
      createdAt: new Date().toISOString(),
    };

    try {
      // Guardar sesión
      await setDoc(doc(db, 'children', childId as string, 'game_sessions', sessionId), sessionData);

      // Actualizar progreso por nivel
      const progressId = `${childId}_${gameId}_lvl${currentLevel}`;
      const progressRef = doc(db, 'children', childId as string, 'game_progress', progressId);
      
      await setDoc(progressRef, {
        id: progressId,
        childId,
        gameId,
        levelId: currentLevel,
        stars: stars,
        points: increment(finalCorrect * 10),
        completed: stars > 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Desbloquear siguiente nivel si aplica (2 o más estrellas)
      if (stars >= 2 && currentLevel < 3) {
        const nextLevelId = `${childId}_${gameId}_lvl${currentLevel + 1}`;
        await setDoc(doc(db, 'children', childId as string, 'game_progress', nextLevelId), {
          unlocked: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Totales globales del niño
      await updateDoc(doc(db, 'children', childId as string), {
        points: increment(finalCorrect * 10),
        stars: increment(stars)
      });

      router.push(`/child/${childId}/results/${sessionId}`);
    } catch (e: any) {
      setIsFinishing(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `/children/${childId}/game_sessions/${sessionId}`,
        operation: 'create',
        requestResourceData: sessionData
      }));
    }
  }, [db, user, childId, levelData, results.startTime, gameId, currentLevel, router]);

  const handleOption = (idx: number) => {
    if (feedback || isFinishing) return;
    
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

  if (isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-8 p-10">
        <Trophy className="w-24 h-24 text-accent animate-bounce" />
        <h2 className="text-4xl font-black text-primary uppercase text-center">¡Buen Trabajo!</h2>
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header Juego */}
      <div className="p-4 md:p-8 flex items-center justify-between bg-white/50 backdrop-blur-md border-b-4 border-muted/30">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-muted-foreground shadow-md border-2 border-muted/50">
                <X className="w-7 h-7" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[3rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-primary uppercase text-center">¿Quieres salir?</AlertDialogTitle>
                <AlertDialogDescription className="text-center font-bold">Si sales ahora no guardaremos tus estrellas.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-3">
                <AppButton className="w-full" onClick={() => router.push(`/child/${childId}/activities`)}>Sí, salir</AppButton>
                <AlertDialogCancel className="w-full rounded-2xl">Seguir jugando</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="min-w-0">
            <h2 className="font-black text-primary uppercase text-lg leading-tight truncate">{levelData.name}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nivel {currentLevel}</p>
          </div>
        </div>
        <div className="font-black bg-primary/10 text-primary px-5 py-2 rounded-2xl">
          {currentIdx + 1} / {levelData.questions.length}
        </div>
      </div>

      {/* Area Central */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-12 overflow-y-auto">
        <div className="text-center space-y-8 max-w-2xl w-full">
          {levelData.type === 'sound' ? (
            <button 
              onClick={playQuestionAudio}
              className={`w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-white shadow-2xl flex flex-col items-center justify-center border-8 border-primary/20 transition-all ${isPlayingAudio ? 'scale-110 border-primary' : 'hover:scale-105'}`}
            >
              <Volume2 className={`w-16 h-16 md:w-24 md:h-24 ${isPlayingAudio ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-[10px] font-black text-primary uppercase mt-2">{isPlayingAudio ? 'Escuchando...' : 'Toca para oír'}</span>
            </button>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto border-4 border-primary/20 animate-in zoom-in duration-500">
               <span className="text-5xl md:text-7xl">{currentQ.options[currentQ.correct]}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black leading-tight text-primary px-4">
            {currentQ.text}
          </h1>
        </div>

        {/* Opciones */}
        <div className={`grid gap-6 w-full max-w-3xl px-4 ${currentQ.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {currentQ.options.map((opt: string, i: number) => (
            <button 
              key={i} 
              onClick={() => handleOption(i)} 
              className={`min-h-[160px] md:min-h-[200px] text-6xl md:text-8xl bg-white rounded-[3rem] shadow-xl border-8 border-transparent transition-all hover:bg-muted/10 flex items-center justify-center relative overflow-hidden group
                ${feedback === 'correct' && i === currentQ.correct ? 'border-secondary bg-secondary/10 scale-105 z-10' : ''}
                ${feedback === 'wrong' && i !== currentQ.correct ? 'opacity-30 grayscale blur-[1px]' : ''}
                ${feedback === 'wrong' && i === idx ? 'border-destructive' : ''}
              `}
              disabled={!!feedback}
            >
              <span className="select-none">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Overlay */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[100] animate-in fade-in duration-300">
          <div className="bg-white/95 p-12 md:p-20 rounded-[4rem] shadow-2xl border-8 border-white text-center flex flex-col items-center gap-6">
            <div className={`p-8 rounded-full ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'} border-8 border-white/20 shadow-xl`}>
              {feedback === 'correct' ? (
                <CheckCircle2 className="w-20 h-20 md:w-32 md:h-32 text-white animate-bounce" />
              ) : (
                <XCircle className="w-20 h-20 md:w-32 md:h-32 text-white animate-pulse" />
              )}
            </div>
            <h3 className={`text-4xl md:text-7xl font-black uppercase tracking-widest ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡GENIAL!' : '¡CASI!'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
