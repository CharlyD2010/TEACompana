'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton, LoadingState, AppCard } from '@/components/app-components';
import { CheckCircle2, XCircle, Loader2, X, Star, Trophy, Volume2, PlayCircle, HelpCircle } from 'lucide-react';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { rewardService } from '@/services/rewardService';
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

// DATA ESTRUCTURADA POR NIVELES MEJORADA (FASE 3)
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
    3: { name: 'Nivel 3: Clasificación', questions: [
      { id: 1, text: '¿De qué color es el SOL?', options: ['🟡', '🔵', '🔴', '🟢'], correct: 0 },
      { id: 2, text: '¿De qué color es una MANZANA?', options: ['🔵', '🔴', '🟣', '⚫'], correct: 1 },
    ]}
  },
  g6: { // Sonidos
    1: { name: 'Nivel 1: Animales', type: 'sound', questions: [
      { id: 1, text: '¿Qué animal suena así?', audio: '/audio/dog.mp3', options: ['🐶', '🐱'], correct: 0 },
      { id: 2, text: '¿Qué animal suena así?', audio: '/audio/cow.mp3', options: ['🐷', '🐮'], correct: 1 },
    ]},
    2: { name: 'Nivel 2: Ciudad', type: 'sound', questions: [
      { id: 1, text: '¿Qué suena así?', audio: '/audio/car.mp3', options: ['🚗', '🚲'], correct: 0 },
      { id: 2, text: '¿Qué suena así?', audio: '/audio/bell.mp3', options: ['🔔', '🚪'], correct: 0 },
    ]},
    3: { name: 'Nivel 3: Casa', type: 'sound', questions: [
      { id: 1, text: '¿Qué objeto suena así?', audio: '/audio/phone.mp3', options: ['☎️', '🚗', '🔔', '🚪'], correct: 0 },
    ]}
  },
  g4: { // Rutinas
    1: { name: 'Nivel 1: Hábitos', questions: [
      { id: 1, text: '¿Qué usamos para LAVAR las manos?', options: ['🧼', '👟', '📱', '🍎'], correct: 0 },
      { id: 2, text: '¿Qué usamos para CEPILLAR los dientes?', options: ['🦷', '🥪', '🧸', '🚿'], correct: 0 },
    ]},
    2: { name: 'Nivel 2: Secuencias', questions: [
      { id: 1, text: '¿Qué hacemos PRIMERO?', options: ['🛌 Despertar', '🦷 Lavar dientes'], correct: 0 },
      { id: 2, text: '¿Qué hacemos ANTES de dormir?', options: ['👟 Jugar', '🛌 Acostarse'], correct: 1 },
    ]},
    3: { name: 'Nivel 3: Compleción', questions: [
      { id: 1, text: 'MOJAR MANOS -> [?] -> FROTAR', options: ['🧼 Jabón', '🛌 Dormir', '👟 Zapatos'], correct: 0 },
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

  const gameData = useMemo(() => GAME_LEVELS[gameId as string] || GAME_LEVELS.g1, [gameId]);
  const levelData = useMemo(() => gameData[currentLevel] || gameData[1], [gameData, currentLevel]);
  const currentQ = useMemo(() => levelData.questions[currentIdx], [levelData, currentIdx]);

  const playQuestionAudio = useCallback(() => {
    if (currentQ?.audio) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(true);
      const audio = new Audio(currentQ.audio);
      audioRef.current = audio;
      audio.play().catch(e => console.warn("Audio no disponible", e));
      audio.onended = () => setIsPlayingAudio(false);
    }
  }, [currentQ]);

  useEffect(() => {
    if (levelData.type === 'sound') playQuestionAudio();
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
      gameName: `${GAME_LEVELS[gameId as string]?.name || 'Juego'}`,
      score: finalCorrect * 15,
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

      // Actualizar progreso
      const progressId = `${childId}_${gameId}_lvl${currentLevel}`;
      const progressRef = doc(db, 'children', childId as string, 'game_progress', progressId);
      
      await setDoc(progressRef, {
        id: progressId,
        childId,
        gameId,
        levelId: currentLevel,
        stars,
        points: increment(finalCorrect * 15),
        completed: stars > 0,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Desbloqueo de nivel superior
      if (stars >= 2 && currentLevel < 3) {
        const nextLevelId = `${childId}_${gameId}_lvl${currentLevel + 1}`;
        await setDoc(doc(db, 'children', childId as string, 'game_progress', nextLevelId), {
          unlocked: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Totales globales
      await updateDoc(doc(db, 'children', childId as string), {
        points: increment(finalCorrect * 15),
        stars: increment(stars)
      });

      // Verificar y otorgar insignias pedagógicas (Fase 3)
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
    }, 1000);
  };

  if (isFinishing) return <div className="min-h-screen flex flex-col items-center justify-center bg-background"><Trophy className="w-24 h-24 text-accent animate-bounce" /><h2 className="text-2xl font-black mt-4 uppercase">¡Analizando progreso!</h2></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Cabecera del Juego */}
      <div className="p-4 md:p-6 flex items-center justify-between bg-white border-b-2">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground"><X className="w-6 h-6" /></button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black uppercase">¿Quieres salir?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold">No se guardará el progreso de este nivel.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AppButton className="w-full" onClick={() => router.push(`/child/${childId}/activities`)}>Sí, salir</AppButton>
                <AlertDialogCancel className="w-full rounded-2xl">Seguir jugando</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="min-w-0">
            <h2 className="font-black text-primary uppercase text-sm truncate">{levelData.name}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pregunta {currentIdx + 1}</p>
          </div>
        </div>
        <div className="font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full text-xs">
          {currentIdx + 1} / {levelData.questions.length}
        </div>
      </div>

      {/* Área de Juego */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-10">
        <div className="text-center space-y-6 max-w-xl w-full">
          {levelData.type === 'sound' ? (
            <button 
              onClick={playQuestionAudio}
              className={`w-40 h-40 rounded-[2.5rem] bg-white shadow-xl flex flex-col items-center justify-center border-4 border-primary/20 transition-all ${isPlayingAudio ? 'scale-110 border-primary animate-pulse' : ''}`}
            >
              <Volume2 className={`w-16 h-16 ${isPlayingAudio ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-[10px] font-black text-primary uppercase mt-2">{isPlayingAudio ? 'Escuchando...' : 'Tocar para oír'}</span>
            </button>
          ) : (
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-lg flex items-center justify-center mx-auto border-2 border-primary/10">
               <span className="text-5xl">{currentQ.options[currentQ.correct]}</span>
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-foreground">{currentQ.text}</h1>
        </div>

        {/* Opciones con Feedback Pedagógico */}
        <div className={`grid gap-4 w-full max-w-2xl ${currentQ.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {currentQ.options.map((opt: string, i: number) => (
            <button 
              key={i} 
              onClick={() => handleOption(i)} 
              className={`min-h-[140px] text-5xl md:text-7xl bg-white rounded-[2.5rem] shadow-md border-4 border-transparent transition-all active:scale-95 flex items-center justify-center
                ${feedback === 'correct' && i === currentQ.correct ? 'border-secondary bg-secondary/10' : ''}
                ${feedback === 'wrong' && i !== currentQ.correct ? 'opacity-40 grayscale blur-[1px]' : ''}
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white/95 p-10 rounded-[3rem] shadow-2xl border-4 border-white text-center animate-in zoom-in-50 duration-300">
            <div className={`p-6 rounded-full mb-4 ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? <CheckCircle2 className="w-16 h-16 text-white" /> : <XCircle className="w-16 h-16 text-white" />}
            </div>
            <h3 className={`text-4xl font-black uppercase ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡GENIAL!' : '¡CASI!'}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
