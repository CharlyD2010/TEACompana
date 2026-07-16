'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppButton, LoadingState } from '@/components/app-components';
import { CheckCircle2, XCircle, Volume2, X, Star, AlertCircle, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { gameService } from '@/services/gameService';
import { GameLevelData, GameSession } from '@/lib/types';
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
    2: { name: 'Situaciones Simples', instruction: '¿Cómo se siente el personaje?', questions: [
      { id: 1, text: '¡Tengo un helado nuevo!', options: ['😊', '😢'], correct: 0 },
      { id: 2, text: 'Perdí mi pelota favorita', options: ['😊', '😢'], correct: 1 },
      { id: 3, text: '¡Hay una fiesta!', options: ['🤩', '😴'], correct: 0 },
      { id: 4, text: 'Es hora de dormir', options: ['🥱', '😡'], correct: 0 },
    ]},
    3: { name: 'Inferencia Social', instruction: '¿Qué siente la persona?', questions: [
      { id: 1, text: 'Alguien me empujó fuerte', options: ['😠', '😊', '😴'], correct: 0 },
      { id: 2, text: 'Mi mamá me dio un abrazo', options: ['😌', '😢', '😰'], correct: 0 },
      { id: 3, text: 'No encuentro mi juguete', options: ['😰', '🤩', '😡'], correct: 0 },
      { id: 4, text: 'Escuché un ruido extraño', options: ['😨', '😋', '😎'], correct: 0 },
    ]}
  },
  g2: { // Colores
    1: { name: 'Colores Primarios', instruction: 'Toca el color correcto', questions: [
      { id: 1, text: 'Busca el color ROJO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
      { id: 2, text: 'Busca el color AZUL', options: ['🔴', '🔵', '🟢', '🟡'], correct: 1 },
      { id: 3, text: 'Busca el color VERDE', options: ['🔴', '🔵', '🟢', '🟡'], correct: 2 },
      { id: 4, text: 'Busca el color AMARILLO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 3 },
    ]},
    2: { name: 'Colores Secundarios', instruction: '¿Conoces estos colores?', questions: [
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
    3: { name: 'Armar Palabras', instruction: '¿Qué letra falta?', questions: [
      { id: 1, text: 'G _ T O', options: ['A', 'O', 'I'], correct: 0 },
      { id: 2, text: 'M _ M Á', options: ['A', 'E', 'U'], correct: 0 },
      { id: 3, text: 'C _ S A', options: ['A', 'O', 'I'], correct: 0 },
      { id: 4, text: 'P _ P Á', options: ['A', 'O', 'E'], correct: 0 },
    ]}
  },
  g4: { // Rutinas
    1: { name: 'Buenos Hábitos', instruction: '¿Cuál es correcto?', questions: [
      { id: 1, text: 'Antes de comer debemos...', options: ['🧼 Lavar manos', '🎮 Jugar'], correct: 0 },
      { id: 2, text: 'Después de comer debemos...', options: ['😴 Dormir', '🪥 Cepillar dientes'], correct: 1 },
      { id: 3, text: 'Para dormir bien...', options: ['👕 Poner pijama', '🏃 Correr'], correct: 0 },
      { id: 4, text: 'Al terminar de jugar...', options: ['🧸 Guardar juguetes', '🚪 Salir'], correct: 0 },
    ]},
    2: { name: '¿Qué sigue?', instruction: 'Completa la secuencia', questions: [
      { id: 1, text: '1. Mojar manos, 2. Jabón, 3. ...', options: ['🧤 Secar', '🧼 Tallar'], correct: 1 },
      { id: 2, text: 'Ya tallamos las manos, ahora toca...', options: ['🚿 Enjuagar', '🍎 Comer'], correct: 0 },
      { id: 3, text: 'Puse pasta en el cepillo, ahora...', options: ['🦷 Cepillar', '👅 Comer'], correct: 0 },
      { id: 4, text: 'Terminé de bañarme, ahora toca...', options: ['🚿 Mojar', '👕 Vestir'], correct: 1 },
    ]},
    3: { name: 'Mi Rutina Diaria', instruction: 'Ordena tu mañana', questions: [
      { id: 1, text: '¿Qué haces PRIMERO al despertar?', options: ['🥣 Desayunar', '🛌 Salir de cama'], correct: 1 },
      { id: 2, text: '¿Qué haces después de vestirte?', options: ['🎒 Ir a la escuela', '🛌 Dormir'], correct: 0 },
      { id: 3, text: '¿Qué haces antes de comer?', options: ['🧼 Lavar manos', '😴 Dormir'], correct: 0 },
      { id: 4, text: '¿Qué haces antes de dormir?', options: ['🌅 Despertar', '📖 Leer cuento'], correct: 1 },
    ]}
  },
  g5: { // Palabras
    1: { name: 'Cosas de Casa', instruction: 'Elige la palabra correcta', questions: [
      { id: 1, text: '🍎', options: ['Manzana', 'Pera', 'Uva'], correct: 0 },
      { id: 2, text: '🐶', options: ['Gato', 'Perro', 'Pato'], correct: 1 },
      { id: 3, text: '🚗', options: ['Auto', 'Bici', 'Tren'], correct: 0 },
      { id: 4, text: '🏠', options: ['Casa', 'Escuela', 'Parque'], correct: 0 },
    ]},
    2: { name: '¿Qué es esto?', instruction: 'Identifica el objeto', questions: [
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
    1: { name: 'Granja', instruction: '¿Qué animal suena así?', questions: [
      { id: 1, text: '¿Quién suena así?', options: ['🐶 Perro', '🐱 Gato'], correct: 0, audio: '/audio/animals/perro.mp3' },
      { id: 2, text: '¿Quién suena así?', options: ['🐔 Gallo', '🐮 Vaca'], correct: 1, audio: '/audio/animals/vaca.mp3' },
      { id: 3, text: '¿Quién suena así?', options: ['🐱 Gato', '🐷 Cerdito'], correct: 0, audio: '/audio/animals/gato.mp3' },
    ]},
    2: { name: 'Objetos', instruction: '¿Qué objeto suena así?', questions: [
      { id: 1, text: 'Escucha...', options: ['🚗 Auto', '🚆 Tren', '🔔 Campana'], correct: 0, audio: '/audio/objects/auto.mp3' },
      { id: 2, text: 'Escucha...', options: ['🚆 Tren', '🚗 Auto', '🔔 Campana'], correct: 0, audio: '/audio/objects/tren.mp3' },
    ]},
    3: { name: 'El Mundo', instruction: 'Identifica el sonido', questions: [
      { id: 1, text: '¿Qué es?', options: ['🌧️ Lluvia', '📞 Teléfono', '🦁 León'], correct: 0, audio: '/audio/objects/lluvia.mp3' },
      { id: 2, text: '¿Qué es?', options: ['🦁 León', '🌧️ Lluvia', '🚪 Puerta'], correct: 0, audio: '/audio/animals/leon.mp3' },
    ]}
  },
  g7: { // Formas
    1: { name: 'Básicas', instruction: 'Busca la forma', questions: [
      { id: 1, text: 'CÍRCULO', options: ['⭕', '⬜', '🔺'], correct: 0 },
      { id: 2, text: 'CUADRADO', options: ['⭕', '⬜', '🔺'], correct: 1 },
      { id: 3, text: 'TRIÁNGULO', options: ['⭕', '⬜', '🔺'], correct: 2 },
    ]},
    2: { name: 'Complejas', instruction: 'Identifica figuras', questions: [
      { id: 1, text: 'ESTRELLA', options: ['⭐', '❤️', '💎'], correct: 0 },
      { id: 2, text: 'CORAZÓN', options: ['⭐', '❤️', '💎'], correct: 1 },
    ]},
    3: { name: 'Objetos', instruction: '¿Qué forma tiene?', questions: [
      { id: 1, text: 'Una VENTANA es...', options: ['Círculo', 'Cuadrado'], correct: 1 },
      { id: 2, text: 'Una PELOTA es...', options: ['Círculo', 'Cuadrado'], correct: 0 },
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
    ]},
    3: { name: 'Más o Menos', instruction: '¿Dónde hay más?', questions: [
      { id: 1, text: 'A: 🍎🍎 | B: 🍎', options: ['A', 'B'], correct: 0 },
      { id: 2, text: 'A: ⭐ | B: ⭐⭐⭐', options: ['A', 'B'], correct: 1 },
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
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState({ correct: 0, startTime: Date.now() });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Validación de nivel desbloqueado y existencia del niño
  const childRef = useMemo(() => db && childId ? doc(db, 'children', childId) : null, [db, childId]);
  const { data: child, loading: childLoading } = useDoc(childRef);

  useEffect(() => {
    async function checkAccess() {
      if (!childId || !gameId) return;
      const lvlStr = searchParams.get('lvl');
      const lvl = parseInt(lvlStr || '1');
      const targetLvl = isNaN(lvl) || lvl < 1 || lvl > 3 ? 1 : lvl;
      
      setCurrentLevel(targetLvl);

      if (targetLvl > 1) {
        const unlocked = await gameService.isLevelUnlocked(childId, gameId, targetLvl);
        if (!unlocked) {
          setIsLocked(true);
          toast({ variant: "destructive", title: "Nivel Bloqueado", description: "Completa el nivel anterior con 2 estrellas." });
        }
      }
      setVerifying(false);
    }
    checkAccess();
  }, [childId, gameId, searchParams]);

  const gameData = useMemo(() => gameId ? GAME_LEVELS[gameId] : null, [gameId]);
  const levelData = useMemo(() => (gameData && currentLevel) ? gameData[currentLevel] : null, [gameData, currentLevel]);
  const currentQ = useMemo(() => levelData ? levelData.questions[currentIdx] : null, [levelData, currentIdx]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const playLocalAudio = useCallback((src: string) => {
    stopAudio();
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.volume = 0.7;
    audio.onplay = () => setIsPlayingAudio(true);
    audio.onended = () => { setIsPlayingAudio(false); audioRef.current = null; };
    audio.onerror = () => {
      setIsPlayingAudio(false);
      audioRef.current = null;
      toast({ variant: "destructive", title: "Audio no disponible", description: "El archivo de sonido aún no se ha cargado." });
    };
    audio.play().catch(() => setIsPlayingAudio(false));
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
    if (currentQ.audio) playLocalAudio(currentQ.audio);
    else speak(currentQ.text);
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
      childId,
      gameId,
      levelId: currentLevel,
      userId: user.uid,
      gameName: levelData.name,
      score: finalCorrect * 25,
      stars,
      correctAnswers: finalCorrect,
      incorrectAnswers: totalQuestions - finalCorrect,
      totalQuestions,
      accuracy,
      durationSeconds: duration,
      createdAt: new Date().toISOString(),
    };

    try {
      await gameService.saveSession(childId, user.uid, sessionData);
      router.push(`/child/${childId}/results/${sessionId}`);
    } catch (e: any) {
      setIsFinishing(false);
      toast({ variant: "destructive", title: "Error al guardar", description: "No se pudo sincronizar tu progreso académico." });
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

  if (childLoading || verifying) return <LoadingState message="Validando acceso..." />;

  if (isLocked || !child || !gameData || !levelData || !currentQ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive opacity-50" />
        <h2 className="text-2xl font-black text-primary uppercase">{isLocked ? "Nivel Bloqueado" : "Actividad no encontrada"}</h2>
        <p className="text-muted-foreground font-medium max-w-xs mx-auto">
          {isLocked ? "Debes completar el nivel anterior con al menos 2 estrellas para entrar aquí." : "No pudimos cargar la actividad solicitada."}
        </p>
        <AppButton onClick={() => router.push(`/child/${childId}/activities`)}>Volver a Actividades</AppButton>
      </div>
    );
  }

  if (isFinishing) return <LoadingState message="Guardando progreso pedagógico..." />;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between bg-white border-b-4 border-muted/30">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-12 h-12 bg-muted rounded-[1.2rem] flex items-center justify-center text-muted-foreground hover:bg-destructive/10 transition-colors" aria-label="Salir">
                <X className="w-6 h-6" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem]">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black text-2xl uppercase text-primary">¿Quieres salir?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold text-muted-foreground">Si sales ahora, perderás el avance de este nivel.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AppButton className="w-full bg-destructive text-white" onClick={() => router.push(`/child/${childId}/activities`)}>SÍ, SALIR</AppButton>
                <AlertDialogCancel className="w-full rounded-2xl font-black uppercase text-xs">SEGUIR JUGANDO</AlertDialogCancel>
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

      {/* Audio Control */}
      <div className="bg-white/50 py-3 px-6 flex justify-center border-b-2 border-muted/10">
        <button 
          onClick={playInstruction}
          className={`flex items-center gap-3 px-8 py-3 rounded-full border-2 transition-all active:scale-95 ${isPlayingAudio ? 'bg-primary border-primary text-white scale-105' : 'bg-white border-primary/20 text-primary hover:border-primary/50'}`}
          disabled={isPlayingAudio}
          aria-label={isPlayingAudio ? 'Escuchando' : 'Escuchar instrucción'}
        >
          {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
          <span className="text-[11px] font-black uppercase tracking-widest">
            {isPlayingAudio ? 'Escuchando...' : 'Escuchar instrucción'}
          </span>
        </button>
      </div>

      {/* Game Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-8 md:space-y-12 max-w-4xl mx-auto w-full overflow-y-auto">
        <div className="text-center space-y-6 w-full animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary/10"></div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight text-foreground break-words">{currentQ.text}</h1>
          </div>
        </div>

        <div className={`grid gap-4 md:gap-6 w-full ${currentQ.options.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {currentQ.options.map((opt, i) => {
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
                <span className={`select-none font-black text-center leading-tight transition-all ${isTextOnly ? 'text-xl md:text-3xl lg:text-4xl px-2' : 'text-6xl md:text-8xl'}`}>
                  {opt}
                </span>
                {feedback === 'correct' && isCorrect && <div className="absolute inset-0 bg-secondary/20 animate-ping" />}
              </button>
             );
          })}
        </div>
      </div>

      {/* Feedback Overlay */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50 animate-in fade-in">
          <div className="bg-white/95 p-12 rounded-[4rem] shadow-2xl border-8 border-white text-center animate-in zoom-in-50 max-w-xs w-full mx-4">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg ${feedback === 'correct' ? 'bg-secondary' : 'bg-destructive'}`}>
              {feedback === 'correct' ? <CheckCircle2 className="w-16 h-16 text-white" /> : <XCircle className="w-16 h-16 text-white" />}
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
