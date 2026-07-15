'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppButton, LoadingState, AppCard } from '@/components/app-components';
import { CheckCircle2, XCircle, Trophy, Volume2, X, Star, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
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

// BANCO DE DATOS EDUCATIVOS EXTENDIDO (FASE 4)
const GAME_LEVELS: Record<string, Record<number, any>> = {
  g1: { // Emociones
    1: { name: 'Emociones Básicas', instruction: 'Toca el personaje que se siente así', questions: [
      { id: 1, text: '¿Quién está FELIZ?', options: ['😊', '😢', '😠', '😰'], correct: 0 },
      { id: 2, text: '¿Quién está TRISTE?', options: ['😊', '😢', '😠', '😰'], correct: 1 },
      { id: 3, text: '¿Quién está ENOJADO?', options: ['😊', '😢', '😠', '😰'], correct: 2 },
      { id: 4, text: '¿Quién tiene MIEDO?', options: ['😊', '😢', '😠', '😰'], correct: 3 },
    ]},
    2: { name: 'Nuevas Emociones', instruction: 'Identifica estas nuevas expresiones', questions: [
      { id: 1, text: '¿Quién está SORPRENDIDO?', options: ['😲', '😴', '😋', '😎'], correct: 0 },
      { id: 2, text: '¿Quién tiene SUEÑO?', options: ['😲', '😴', '😋', '😎'], correct: 1 },
      { id: 3, text: '¿Quién está CALMADO?', options: ['😲', '😴', '😌', '😎'], correct: 2 },
      { id: 4, text: '¿Quién tiene HAMBRE?', options: ['😋', '😴', '😌', '😎'], correct: 0 },
    ]},
    3: { name: 'Situaciones Reales', instruction: '¿Cómo se sentirían ellos?', questions: [
      { id: 1, text: '¡Me dieron un REGALO!', options: ['😊', '😢', '😠'], correct: 0 },
      { id: 2, text: 'Se me rompió un JUGUETE', options: ['😊', '😢', '😠'], correct: 1 },
      { id: 3, text: 'Alguien me GRITÓ', options: ['😊', '😢', '😠'], correct: 2 },
      { id: 4, text: 'Mañana voy al PARQUE', options: ['🤩', '😢', '😴'], correct: 0 },
    ]}
  },
  g2: { // Colores
    1: { name: 'Colores Primarios', instruction: 'Busca el color que se pide', questions: [
      { id: 1, text: 'Toca el color ROJO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
      { id: 2, text: 'Toca el color AZUL', options: ['🔴', '🔵', '🟢', '🟡'], correct: 1 },
      { id: 3, text: 'Toca el color VERDE', options: ['🔴', '🔵', '🟢', '🟡'], correct: 2 },
      { id: 4, text: 'Toca el color AMARILLO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 3 },
    ]},
    2: { name: 'Más Colores', instruction: 'Identifica estos colores especiales', questions: [
      { id: 1, text: 'Toca el color NARANJA', options: ['🟠', '🟣', '🟤', '⚫'], correct: 0 },
      { id: 2, text: 'Toca el color MORADO', options: ['🟠', '🟣', '🟤', '⚫'], correct: 1 },
      { id: 3, text: 'Toca el color CAFÉ', options: ['🟠', '🟣', '🟤', '⚫'], correct: 2 },
      { id: 4, text: 'Toca el color NEGRO', options: ['🟠', '🟣', '🟤', '⚫'], correct: 3 },
    ]},
    3: { name: 'Colores en Objetos', instruction: '¿De qué color son estas cosas?', questions: [
      { id: 1, text: '¿De qué color es el SOL?', options: ['🟡', '🔵', '🔴'], correct: 0 },
      { id: 2, text: '¿De qué color es el CIELO?', options: ['🟢', '🔵', '🔴'], correct: 1 },
      { id: 3, text: '¿De qué color es el PASTO?', options: ['🟢', '🟡', '⚫'], correct: 0 },
      { id: 4, text: '¿De qué color es una FRESA?', options: ['🔴', '🟣', '🟠'], correct: 0 },
    ]}
  },
  g3: { // Letras
    1: { name: 'Las Vocales', instruction: 'Busca la vocal correcta', questions: [
      { id: 1, text: 'Letra A de AVION', options: ['A', 'E', 'I', 'O'], correct: 0 },
      { id: 2, text: 'Letra E de ELEFANTE', options: ['A', 'E', 'I', 'O'], correct: 1 },
      { id: 3, text: 'Letra I de IGLESIA', options: ['A', 'E', 'I', 'O'], correct: 2 },
      { id: 4, text: 'Letra O de OSO', options: ['A', 'E', 'I', 'O'], correct: 3 },
    ]},
    2: { name: 'Primeras Letras', instruction: '¿Con qué letra empieza?', questions: [
      { id: 1, text: 'M de MAMÁ', options: ['M', 'P', 'S', 'L'], correct: 0 },
      { id: 2, text: 'P de PAPÁ', options: ['M', 'P', 'S', 'L'], correct: 1 },
      { id: 3, text: 'S de SOL', options: ['M', 'P', 'S', 'L'], correct: 2 },
      { id: 4, text: 'L de LUNA', options: ['M', 'P', 'S', 'L'], correct: 3 },
    ]},
    3: { name: 'Completa la Palabra', instruction: '¿Qué letra falta?', questions: [
      { id: 1, text: 'C A S _', options: ['A', 'O', 'I'], correct: 0 },
      { id: 2, text: 'G A T _', options: ['A', 'O', 'E'], correct: 1 },
      { id: 3, text: 'M E S _', options: ['A', 'U', 'I'], correct: 0 },
      { id: 4, text: 'P E R R _', options: ['A', 'O', 'I'], correct: 1 },
    ]}
  },
  g5: { // Palabra-Imagen
    1: { name: 'Objetos de Casa', instruction: 'Toca el dibujo de la palabra', questions: [
      { id: 1, text: 'CAMA', options: ['🛏️', '🪑', '🚿'], correct: 0 },
      { id: 2, text: 'SILLA', options: ['🛏️', '🪑', '🚿'], correct: 1 },
      { id: 3, text: 'MESA', options: ['🍽️', '🪑', '🧺'], correct: 1 },
      { id: 4, text: 'AGUA', options: ['🥛', '🍎', '🥪'], correct: 0 },
    ]},
    2: { name: 'Comida y Frutas', instruction: 'Busca lo que se pide', questions: [
      { id: 1, text: 'MANZANA', options: ['🍎', '🍌', '🍐'], correct: 0 },
      { id: 2, text: 'PLÁTANO', options: ['🍎', '🍌', '🍐'], correct: 1 },
      { id: 3, text: 'LECHE', options: ['🥛', '🍳', '🍞'], correct: 0 },
      { id: 4, text: 'PAN', options: ['🥛', '🍳', '🍞'], correct: 2 },
    ]},
    3: { name: 'Categorías', instruction: '¿Cuál es un ANIMAL?', questions: [
      { id: 1, text: 'Busca un ANIMAL', options: ['🐶', '🍎', '🚗'], correct: 0 },
      { id: 2, text: 'Busca algo de COMER', options: ['🐶', '🍎', '🚗'], correct: 1 },
      { id: 3, text: 'Busca un TRANSPORTE', options: ['🐶', '🍎', '🚗'], correct: 2 },
      { id: 4, text: 'Busca una FRUTA', options: ['🍉', '🥛', '🧸'], correct: 0 },
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
    3: { name: 'Formas en la Realidad', instruction: '¿Qué forma tiene esto?', questions: [
      { id: 1, text: 'Una PELOTA es...', options: ['Círculo', 'Cuadrado'], correct: 0 },
      { id: 2, text: 'Una VENTANA es...', options: ['Círculo', 'Cuadrado'], correct: 1 },
      { id: 3, text: 'Un TECHO de casa...', options: ['Triángulo', 'Círculo'], correct: 0 },
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
    3: { name: '¿Quién tiene MÁS?', instruction: 'Compara las cantidades', questions: [
      { id: 1, text: 'Grupo A: 🍎🍎 | Grupo B: 🍎', options: ['A tiene más', 'B tiene más'], correct: 0 },
      { id: 2, text: 'Grupo A: ⭐ | Grupo B: ⭐⭐⭐', options: ['A tiene más', 'B tiene más'], correct: 1 },
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

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
  }, []);

  const playInstruction = useCallback(() => {
    stopAudio();
    // En una app real usaríamos síntesis de voz o audios locales
    // Aquí simulamos el estado visual
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 2000);
  }, [stopAudio]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

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
      // Guardar sesión histórica
      await setDoc(doc(db, 'children', childId as string, 'game_sessions', sessionId), sessionData);

      // Actualizar progreso por nivel
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

      // Desbloqueo de siguiente nivel si obtuvo al menos 2 estrellas
      if (stars >= 2 && currentLevel < 3) {
        const nextLvlId = `${childId}_${gameId}_lvl${currentLevel + 1}`;
        await setDoc(doc(db, 'children', childId as string, 'game_progress', nextLvlId), {
          unlocked: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Totales del niño
      await updateDoc(doc(db, 'children', childId as string), {
        points: increment(finalCorrect * 20),
        stars: increment(stars)
      });

      // Revisar insignias
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
    }, 1200);
  };

  if (isFinishing) return <LoadingState message="Guardando tu progreso..." />;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Cabecera del Juego */}
      <div className="p-4 md:p-6 flex items-center justify-between bg-white border-b-4 border-muted/30">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-12 h-12 bg-muted rounded-[1.2rem] flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <X className="w-6 h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black text-2xl uppercase text-primary">¿Quieres salir?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold text-base">Si sales ahora, no se guardará el puntaje de este nivel.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AppButton className="w-full bg-destructive text-white" onClick={() => router.push(`/child/${childId}/activities`)}>Sí, salir</AppButton>
                <AlertDialogCancel className="w-full rounded-2xl border-2 font-black uppercase text-xs">Seguir jugando</AlertDialogCancel>
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
          PREGUNTA {currentIdx + 1} / {levelData.questions.length}
        </div>
      </div>

      {/* Instrucción con Audio */}
      <div className="bg-white/50 py-3 px-6 flex justify-center border-b-2 border-muted/10">
        <button 
          onClick={playInstruction}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-full border-2 transition-all ${isPlayingAudio ? 'bg-primary border-primary text-white scale-105' : 'bg-white border-primary/20 text-primary hover:border-primary/50'}`}
        >
          <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] font-black uppercase tracking-widest">
            {isPlayingAudio ? 'Escuchando...' : 'Escuchar instrucción'}
          </span>
        </button>
      </div>

      {/* Área de Juego Central */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8 md:space-y-12">
        <div className="text-center space-y-6 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-4 border-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary/10"></div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-foreground break-words">{currentQ.text}</h1>
          </div>
        </div>

        {/* Opciones Adaptables */}
        <div className={`grid gap-4 md:gap-6 w-full max-w-3xl ${currentQ.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {currentQ.options.map((opt: string, i: number) => {
             const isCorrect = i === currentQ.correct;
             return (
              <button 
                key={i} 
                onClick={() => handleOption(i)} 
                className={`min-h-[140px] md:min-h-[180px] p-4 text-4xl md:text-7xl bg-white rounded-[2.5rem] shadow-xl border-4 border-transparent transition-all active:scale-95 flex items-center justify-center relative overflow-hidden group
                  ${feedback === 'correct' && isCorrect ? 'border-secondary bg-secondary/10 scale-105' : ''}
                  ${feedback === 'wrong' && !isCorrect && feedback === 'wrong' ? 'opacity-40 grayscale blur-[1px]' : ''}
                  ${feedback === 'wrong' && i !== currentQ.correct && i === i ? '' : '' /* Placeholder para lógica futura */}
                `}
                disabled={!!feedback}
              >
                <span className="select-none font-black text-center leading-none">{opt}</span>
                {feedback === 'correct' && isCorrect && <div className="absolute inset-0 bg-secondary/20 animate-ping" />}
              </button>
             );
          })}
        </div>
      </div>

      {/* Feedback Overlay Sensorialmente Amigable */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50 animate-in fade-in duration-300">
          <div className="bg-white/95 p-12 rounded-[4rem] shadow-2xl border-8 border-white text-center animate-in zoom-in-50 duration-500 max-w-xs w-full mx-4">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-white" /> : <XCircle className="w-16 h-16 md:w-20 md:h-20 text-white" />}
            </div>
            <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${feedback === 'correct' ? 'text-secondary' : 'text-destructive'}`}>
              {feedback === 'correct' ? '¡GENIAL!' : '¡CASI!'}
            </h3>
            <p className="mt-4 font-bold text-muted-foreground uppercase text-xs tracking-widest">
              {feedback === 'correct' ? '¡Lo lograste!' : '¡Sigue intentando!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
