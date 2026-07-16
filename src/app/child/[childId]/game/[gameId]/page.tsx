'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppButton, LoadingState } from '@/components/app-components';
import { CheckCircle2, XCircle, Volume2, X, Star, AlertCircle } from 'lucide-react';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { rewardService } from '@/services/rewardService';
import { GameLevelData, GameQuestion, GameSession } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
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
      { id: 4, text: 'Escuché un ruidito extraño', options: ['😨', '😋', '😎'], correct: 0 },
    ]}
  },
  g2: { // Colores
    1: { name: 'Colores Primarios', instruction: 'Toca el color correcto', questions: [
      { id: 1, text: 'Busca el color ROJO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
      { id: 2, text: 'Busca el color AZUL', options: ['🔴', '🔵', '🟢', '🟡'], correct: 1 },
      { id: 3, text: 'Busca el color VERDE', options: ['🔴', '🔵', '🟢', '🟡'], correct: 2 },
      { id: 4, text: 'Busca el color AMARILLO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 3 },
    ]},
    2: { name: 'Colores Secundarios', instruction: '¿Conoces estos otros colores?', questions: [
      { id: 1, text: 'Busca el color NARANJA', options: ['🟠', '🟣', '🌸', '🟤'], correct: 0 },
      { id: 2, text: 'Busca el color MORADO', options: ['🟠', '🟣', '🌸', '🟤'], correct: 1 },
      { id: 3, text: 'Busca el color ROSA', options: ['🟠', '🟣', '🌸', '🟤'], correct: 2 },
      { id: 4, text: 'Busca el color CAFÉ', options: ['🟠', '🟣', '🌸', '🟤'], correct: 3 },
    ]},
    3: { name: 'Objetos y Colores', instruction: '¿De qué color es el objeto?', questions: [
      { id: 1, text: 'El SOL es de color...', options: ['Amarillo', 'Azul', 'Rojo'], correct: 0 },
      { id: 2, text: 'El CIELO es de color...', options: ['Verde', 'Azul', 'Morado'], correct: 1 },
      { id: 3, text: 'Una MANZANA es...', options: ['Azul', 'Roja', 'Café'], correct: 1 },
      { id: 4, text: 'Las HOJAS son...', options: ['Rojas', 'Verdes', 'Amarillas'], correct: 1 },
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
  g4: { // Rutinas
    1: { name: 'Hábitos Buenos', instruction: '¿Cuál es el hábito correcto?', questions: [
      { id: 1, text: 'Antes de comer debemos...', options: ['🧼 Lavar manos', '🎮 Jugar'], correct: 0 },
      { id: 2, text: 'Después de comer debemos...', options: ['😴 Dormir', '🪥 Cepillar dientes'], correct: 1 },
      { id: 3, text: 'Para dormir bien debemos...', options: ['👕 Poner pijama', '🏃 Correr'], correct: 0 },
      { id: 4, text: 'Al terminar de jugar...', options: ['🧸 Guardar juguetes', '🚪 Salir'], correct: 0 },
    ]},
    2: { name: '¿Qué sigue?', instruction: 'Completa la secuencia', questions: [
      { id: 1, text: '1. Mojar manos, 2. Poner jabón, 3. ...', options: ['🧤 Secar', '🧼 Tallar'], correct: 1 },
      { id: 2, text: 'Ya tallamos las manos, ahora toca...', options: ['🚿 Enjuagar', '🍎 Comer'], correct: 0 },
      { id: 3, text: 'Puse pasta en el cepillo, ahora voy a...', options: ['🦷 Cepillar', '👅 Comer'], correct: 0 },
      { id: 4, text: 'Terminé de bañarme, ahora me voy a...', options: ['🚿 Mojar', '👕 Vestir'], correct: 1 },
    ]},
    3: { name: 'Mi Rutina Diaria', instruction: 'Ordena la mañana', questions: [
      { id: 1, text: '¿Qué haces PRIMERO al despertar?', options: ['🥣 Desayunar', '🛌 Salir de cama'], correct: 1 },
      { id: 2, text: '¿Qué haces después de vestirte?', options: ['🎒 Ir a la escuela', '🛌 Dormir'], correct: 0 },
      { id: 3, text: '¿Qué haces antes de comer?', options: ['🧼 Lavar manos', '😴 Dormir'], correct: 0 },
      { id: 4, text: '¿Qué haces antes de dormir?', options: ['🌅 Despertar', '📖 Leer cuento'], correct: 1 },
    ]}
  },
  g5: { // Palabras
    1: { name: 'Objetos de Casa', instruction: 'Mira la imagen y elige la palabra', questions: [
      { id: 1, text: '🍎', options: ['Manzana', 'Pera', 'Uva'], correct: 0 },
      { id: 2, text: '🐶', options: ['Gato', 'Perro', 'Pato'], correct: 1 },
      { id: 3, text: '🚗', options: ['Auto', 'Bici', 'Tren'], correct: 0 },
      { id: 4, text: '🏠', options: ['Casa', 'Escuela', 'Parque'], correct: 0 },
    ]},
    2: { name: '¿Dónde está?', instruction: '¿Qué palabra describe el dibujo?', questions: [
      { id: 1, text: '🥛', options: ['Agua', 'Leche', 'Jugo'], correct: 1 },
      { id: 2, text: '👟', options: ['Zapato', 'Bota', 'Tenis'], correct: 0 },
      { id: 3, text: '🪑', options: ['Silla', 'Mesa', 'Cama'], correct: 0 },
      { id: 4, text: '☀️', options: ['Luna', 'Nube', 'Sol'], correct: 2 },
    ]},
    3: { name: 'Categorías', instruction: '¿A qué grupo pertenece?', questions: [
      { id: 1, text: 'Un PLÁTANO es una...', options: ['Fruta', 'Juguete', 'Ropa'], correct: 0 },
      { id: 2, text: 'Un CALCETÍN es...', options: ['Comida', 'Ropa', 'Animal'], correct: 1 },
      { id: 3, text: 'Un LEÓN es un...', options: ['Vehículo', 'Instrumento', 'Animal'], correct: 2 },
      { id: 4, text: 'Una GUITARRA es...', options: ['Comida', 'Instrumento', 'Mueble'], correct: 1 },
    ]}
  },
  g6: { // Sonidos
    1: { name: 'Animales de Granja', instruction: 'Escucha el sonido y elige el animal', questions: [
      { id: 1, text: '¿Qué animal suena así?', options: ['🐶 Perro', '🐱 Gato'], correct: 0, audio: '/audio/animals/perro.mp3' },
      { id: 2, text: '¿Qué animal suena así?', options: ['🐔 Gallo', '🐮 Vaca'], correct: 1, audio: '/audio/animals/vaca.mp3' },
      { id: 3, text: '¿Qué animal suena así?', options: ['🐱 Gato', '🐷 Cerdito'], correct: 0, audio: '/audio/animals/gato.mp3' },
      { id: 4, text: '¿Qué animal suena así?', options: ['🐑 Oveja', '🐴 Caballo'], correct: 1, audio: '/audio/animals/caballo.mp3' },
    ]},
    2: { name: 'Cosas que Suenan', instruction: '¿Sabes qué objeto es?', questions: [
      { id: 1, text: 'Escucha con atención...', options: ['🚗 Auto', '🚆 Tren', '🔔 Campana'], correct: 0, audio: '/audio/objects/auto.mp3' },
      { id: 2, text: 'Escucha con atención...', options: ['🚆 Tren', '🚗 Auto', '🔔 Campana'], correct: 0, audio: '/audio/objects/tren.mp3' },
      { id: 3, text: 'Escucha con atención...', options: ['🔔 Campana', '🚆 Tren', '🚗 Auto'], correct: 0, audio: '/audio/objects/campana.mp3' },
      { id: 4, text: 'Escucha con atención...', options: ['📞 Teléfono', '🚪 Puerta'], correct: 0, audio: '/audio/objects/telefono.mp3' },
    ]},
    3: { name: 'Sonidos del Mundo', instruction: 'Identifica el sonido correcto', questions: [
      { id: 1, text: '¿Qué es esto?', options: ['🌧️ Lluvia', '📞 Teléfono', '🚪 Puerta', '🦁 León'], correct: 0, audio: '/audio/objects/lluvia.mp3' },
      { id: 2, text: '¿Qué es esto?', options: ['🦁 León', '🌧️ Lluvia', '📞 Teléfono', '🚪 Puerta'], correct: 0, audio: '/audio/animals/leon.mp3' },
      { id: 3, text: '¿Qué es esto?', options: ['🚪 Puerta', '🌧️ Lluvia', '📞 Teléfono', '🦁 León'], correct: 0, audio: '/audio/objects/puerta.mp3' },
      { id: 4, text: '¿Qué es esto?', options: ['🐦 Pájaro', '🌊 Mar', '🌪️ Viento'], correct: 0, audio: '/audio/animals/pajaro.mp3' },
    ]}
  },
  g7: { // Formas
    1: { name: 'Formas Básicas', instruction: 'Busca la forma geométrica', questions: [
      { id: 1, text: 'CÍRCULO', options: ['⭕', '⬜', '🔺'], correct: 0 },
      { id: 2, text: 'CUADRADO', options: ['⭕', '⬜', '🔺'], correct: 1 },
      { id: 3, text: 'TRIÁNGULO', options: ['⭕', '⬜', '🔺'], correct: 2 },
      { id: 4, text: 'RECTÁNGULO', options: ['⬜', '📏', '⭕'], correct: 0 },
    ]},
    2: { name: 'Nuevas Formas', instruction: 'Identifica estas figuras', questions: [
      { id: 1, text: 'ESTRELLA', options: ['⭐', '❤️', '💎'], correct: 0 },
      { id: 2, text: 'CORAZÓN', options: ['⭐', '❤️', '💎'], correct: 1 },
      { id: 3, text: 'ROMBO', options: ['⭐', '❤️', '💎'], correct: 2 },
      { id: 4, text: 'ÓVALO', options: ['🥚', '⬜', '🔺'], correct: 0 },
    ]},
    3: { name: 'Objetos y Formas', instruction: '¿Qué forma tiene?', questions: [
      { id: 1, text: 'Una VENTANA es...', options: ['Círculo', 'Cuadrado'], correct: 1 },
      { id: 2, text: 'Una PELOTA es...', options: ['Círculo', 'Cuadrado'], correct: 0 },
      { id: 3, text: 'Un TECHO es...', options: ['Triángulo', 'Rectángulo'], correct: 0 },
      { id: 4, text: 'Un HUEVO es un...', options: ['Óvalo', 'Cuadrado'], correct: 0 },
    ]}
  },
  g8: { // Conteo
    1: { name: 'Contar 1 a 5', instruction: '¿Cuántos hay?', questions: [
      { id: 1, text: '🍎 🍎', options: ['1', '2', '3'], correct: 1 },
      { id: 2, text: '⭐', options: ['1', '2', '3'], correct: 0 },
      { id: 3, text: '🧸 🧸 🧸', options: ['2', '3', '4'], correct: 1 },
      { id: 4, text: '⚽ ⚽ ⚽ ⚽', options: ['3', '4', '5'], correct: 1 },
    ]},
    2: { name: 'Contar hasta 10', instruction: 'Cuenta con cuidado', questions: [
      { id: 1, text: '🍎 🍎 🍎 🍎 🍎 🍎', options: ['5', '6', '7'], correct: 1 },
      { id: 2, text: '🧤 🧤 🧤 🧤', options: ['3', '4', '5'], correct: 1 },
      { id: 3, text: '🚗 🚗 🚗 🚗 🚗 🚗 🚗 🚗', options: ['7', '8', '9'], correct: 1 },
      { id: 4, text: '⭐ ⭐ 10 estrellas', options: ['8', '9', '10'], correct: 2 },
    ]},
    3: { name: 'Más o Menos', instruction: '¿Dónde hay más?', questions: [
      { id: 1, text: 'A: 🍎🍎 | B: 🍎', options: ['A', 'B'], correct: 0 },
      { id: 2, text: 'A: ⭐ | B: ⭐⭐⭐', options: ['A', 'B'], correct: 1 },
      { id: 3, text: 'A: ⚽⚽ | B: ⚽⚽⚽', options: ['A', 'B'], correct: 1 },
      { id: 4, text: 'A: 🧸🧸🧸 | B: 🧸', options: ['A', 'B'], correct: 0 },
    ]}
  }
};

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const childId = params?.childId as string;
  const gameId = params?.gameId as string;
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  // Validar existencia del niño
  const childRef = useMemo(() => db && childId ? doc(db, 'children', childId) : null, [db, childId]);
  const { data: child, loading: childLoading } = useDoc(childRef);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState({ correct: 0, startTime: Date.now() });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar nivel desde URL si existe
  useEffect(() => {
    const lvl = searchParams.get('lvl');
    if (lvl) {
      const l = parseInt(lvl);
      if (!isNaN(l) && l >= 1 && l <= 3) {
        setCurrentLevel(l);
      }
    }
  }, [searchParams]);

  const gameData = useMemo(() => {
    if (!gameId) return null;
    return GAME_LEVELS[gameId] || null;
  }, [gameId]);

  const levelData = useMemo(() => {
    if (!gameData) return null;
    return gameData[currentLevel] || null;
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

  const playLocalAudio = useCallback((src: string) => {
    stopAudio();
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.volume = 0.7;
    audio.onplay = () => setIsPlayingAudio(true);
    audio.onended = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      if (process.env.NODE_ENV === 'development') {
        console.warn("Audio local no encontrado o bloqueado:", src);
      }
      toast({ 
        variant: "destructive", 
        title: "Audio no disponible", 
        description: "El sonido todavía no está disponible físicamente." 
      });
    };
    audio.play().catch(err => {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Reproducción bloqueada por el navegador:", err);
      }
      setIsPlayingAudio(false);
    });
  }, [stopAudio]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    stopAudio();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  }, [stopAudio]);

  const playInstruction = useCallback(() => {
    if (!currentQ) return;
    if (currentQ.audio) {
      playLocalAudio(currentQ.audio);
    } else {
      speak(currentQ.text);
    }
  }, [currentQ, playLocalAudio, speak]);

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
      childId: childId,
      gameId: gameId,
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
      await setDoc(doc(db, 'children', childId, 'game_sessions', sessionId), sessionData);

      const progressId = `${childId}_${gameId}_lvl${currentLevel}`;
      await setDoc(doc(db, 'children', childId, 'game_progress', progressId), {
        id: progressId,
        childId,
        gameId,
        levelId: currentLevel,
        stars,
        completed: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Desbloqueo de siguiente nivel si obtuvo 2 estrellas o más
      if (stars >= 2 && currentLevel < 3) {
        const nextLvlId = `${childId}_${gameId}_lvl${currentLevel + 1}`;
        await setDoc(doc(db, 'children', childId, 'game_progress', nextLvlId), {
          id: nextLvlId,
          childId,
          gameId,
          levelId: currentLevel + 1,
          unlocked: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await updateDoc(doc(db, 'children', childId), {
        points: increment(finalCorrect * 20),
        stars: increment(stars)
      });

      await rewardService.checkAndAwardBadges(db, childId, sessionData);

      router.push(`/child/${childId}/results/${sessionId}`);
    } catch (e: any) {
      setIsFinishing(false);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `/children/${childId}/game_sessions/${sessionId}`,
        operation: 'create',
        requestResourceData: sessionData
      } as any));
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

  if (childLoading) return <LoadingState message="Preparando actividad..." />;

  if (!child || !gameData || !levelData || !currentQ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive opacity-50" />
        <h2 className="text-2xl font-black text-primary uppercase">Actividad no encontrada</h2>
        <p className="text-muted-foreground font-medium">Lo sentimos, no pudimos cargar los datos de esta actividad, nivel o el perfil del niño es inválido.</p>
        <AppButton onClick={() => router.push(`/child/${childId}/activities`)} aria-label="Volver a Actividades">Volver a Actividades</AppButton>
      </div>
    );
  }

  if (isFinishing) return <LoadingState message="Guardando tu progreso académico..." />;

  const isSoundGame = gameId === 'g6';

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
                <AlertDialogDescription className="font-bold text-base text-muted-foreground">Si sales ahora, no se guardará el progreso de este nivel.</AlertDialogDescription>
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
          aria-label={isPlayingAudio ? 'Escuchando' : (isSoundGame ? 'Escuchar sonido' : 'Escuchar instrucción')}
        >
          <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] font-black uppercase tracking-widest">
            {isPlayingAudio ? 'Escuchando...' : (isSoundGame ? 'Escuchar sonido' : 'Escuchar instrucción')}
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
             const isTextOnly = opt.length > 3 || (opt.length > 1 && !opt.match(/\p{Emoji}/u));
             
             return (
              <button 
                key={i} 
                onClick={() => handleOption(i)} 
                className={`min-h-[140px] md:min-h-[180px] p-4 bg-white rounded-[2.5rem] shadow-xl border-4 border-transparent transition-all active:scale-95 flex items-center justify-center relative overflow-hidden group
                  ${feedback === 'correct' && isCorrect ? 'border-secondary bg-secondary/10 scale-105' : ''}
                  ${feedback === 'wrong' && feedback !== null && !isCorrect ? 'opacity-40 grayscale blur-[1px]' : ''}
                `}
                disabled={!!feedback}
                aria-label={`Opción ${i + 1}: ${opt}`}
              >
                <span className={`select-none font-black text-center leading-tight ${isTextOnly ? 'text-xl md:text-3xl lg:text-4xl' : 'text-5xl md:text-7xl lg:text-8xl'}`}>
                  {opt}
                </span>
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
