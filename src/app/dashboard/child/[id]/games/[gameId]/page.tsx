
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, AppHeader } from '@/components/app-components';
import { mockDb, ChildProfile } from '@/lib/mock-db';
import { CheckCircle2, XCircle, Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react';

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
      { id: 3, text: 'Selecciona el color AMARILLO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 3 },
    ]
  },
  g3: {
    name: 'Conteo 1-5',
    area: 'Conteo',
    questions: [
      { id: 1, text: '¿Cuántas manzanas hay? 🍎 🍎', options: ['1', '2', '3', '4'], correct: 1 },
      { id: 2, text: '¿Cuántas estrellas hay? ⭐ ⭐ ⭐', options: ['2', '3', '4', '5'], correct: 1 },
      { id: 3, text: '¿Cuántos lápices hay? ✏️', options: ['1', '2', '3', '0'], correct: 0 },
    ]
  }
};

export default function GamePlayPage() {
  const { id, gameId } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState({ correct: 0, total: 0, startTime: Date.now() });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const game = GAME_DATA[gameId as string] || GAME_DATA.g1;

  useEffect(() => {
    if (id) setChild(mockDb.getChild(id as string) || null);
  }, [id]);

  const handleOption = (idx: number) => {
    if (feedback) return;
    const isCorrect = idx === game.questions[currentIdx].correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
      if (isCorrect) setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
      setResults(prev => ({ ...prev, total: prev.total + 1 }));
      setFeedback(null);

      if (currentIdx < game.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        finishGame(isCorrect ? results.correct + 1 : results.correct);
      }
    }, 1500);
  };

  const finishGame = (finalCorrect: number) => {
    const accuracy = (finalCorrect / game.questions.length) * 100;
    const stars = accuracy >= 100 ? 3 : accuracy >= 60 ? 2 : accuracy >= 30 ? 1 : 0;
    const duration = Math.floor((Date.now() - results.startTime) / 1000);
    
    mockDb.saveSession({
      id: Math.random().toString(),
      child_id: id as string,
      game_id: gameId as string,
      game_name: game.name,
      area: game.area,
      score: finalCorrect * 10,
      stars,
      correct_answers: finalCorrect,
      incorrect_answers: game.questions.length - finalCorrect,
      duration_seconds: duration,
      created_at: new Date().toISOString(),
    });

    setGameState('result');
  };

  if (gameState === 'result') {
    const accuracy = (results.correct / game.questions.length) * 100;
    const stars = accuracy >= 100 ? 3 : accuracy >= 60 ? 2 : accuracy >= 30 ? 1 : 0;
    
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8 text-white">
        <AppCard className="w-full max-w-md p-8 bg-white text-foreground text-center space-y-6">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-xl">
            <Trophy className="w-12 h-12 text-accent-foreground" />
          </div>
          <h2 className="text-4xl font-black text-primary">¡COMPLETADO!</h2>
          <p className="font-bold text-muted-foreground uppercase">{game.name}</p>
          
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className={`w-12 h-12 ${i < stars ? "fill-accent text-accent" : "text-muted fill-muted"}`} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="p-3 bg-muted rounded-2xl">
              <div className="text-2xl font-black">{results.correct * 10}</div>
              <div className="text-[10px] font-bold uppercase opacity-60">Puntos</div>
            </div>
            <div className="p-3 bg-muted rounded-2xl">
              <div className="text-2xl font-black">{accuracy.toFixed(0)}%</div>
              <div className="text-[10px] font-bold uppercase opacity-60">Precisión</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <AppButton className="h-14 text-lg bg-secondary text-secondary-foreground" onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2" /> REPETIR
            </AppButton>
            <AppButton className="h-14 text-lg" onClick={() => router.push(`/dashboard/child/${id}/games`)}>
              VOLVER A JUEGOS
            </AppButton>
            <AppButton variant="ghost" className="text-muted-foreground" onClick={() => router.push(`/dashboard/child/${id}`)}>
              SALIR AL DASHBOARD
            </AppButton>
          </div>
        </AppCard>
      </div>
    );
  }

  const currentQ = game.questions[currentIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h2 className="font-black text-primary uppercase tracking-tight">{game.name}</h2>
        <div className="text-sm font-black bg-white px-4 py-1 rounded-full shadow-sm">
          {currentIdx + 1} / {game.questions.length}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black leading-tight">{currentQ.text}</h1>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
          {currentQ.options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => handleOption(i)}
              className={`h-40 text-6xl bg-white rounded-[2rem] shadow-xl border-4 transition-all flex items-center justify-center
                ${feedback === 'correct' && i === currentQ.correct ? 'border-secondary bg-secondary/10 scale-105' : 'border-transparent'}
                ${feedback === 'wrong' && i !== currentQ.correct ? 'border-destructive bg-destructive/5 scale-95 opacity-50' : ''}
                active:scale-95
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`fixed inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-[100] transition-opacity duration-300`}>
          <div className={`p-12 rounded-full flex flex-col items-center gap-4 animate-in zoom-in-50 duration-300`}>
            {feedback === 'correct' ? (
              <>
                <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle2 className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-4xl font-black text-secondary uppercase tracking-widest bg-white/80 px-8 py-2 rounded-full">¡Muy Bien!</h3>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-destructive rounded-full flex items-center justify-center shadow-2xl">
                  <XCircle className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-4xl font-black text-destructive uppercase tracking-widest bg-white/80 px-8 py-2 rounded-full">¡Casi!</h3>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
