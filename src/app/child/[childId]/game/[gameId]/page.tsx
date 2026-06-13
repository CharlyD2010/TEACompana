
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton } from '@/components/app-components';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';

const GAME_DATA: Record<string, any> = {
  g1: {
    name: 'Reconocer Emociones',
    area: 'Emociones',
    questions: [
      { id: 1, text: '¿Cuál personaje está FELIZ?', options: ['😊', '😢', '😠', '😲'], correct: 0 },
      { id: 2, text: '¿Cuál personaje está TRISTE?', options: ['😊', '😢', '😠', '😲'], correct: 1 },
    ]
  },
  g2: {
    name: 'Colores Básicos',
    area: 'Colores y Formas',
    questions: [
      { id: 1, text: 'Selecciona el color ROJO', options: ['🔴', '🔵', '🟢', '🟡'], correct: 0 },
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

  const game = GAME_DATA[gameId as string] || GAME_DATA.g1;
  const currentQ = game.questions[currentIdx];

  const handleOption = async (idx: number) => {
    if (feedback) return;
    const isCorrect = idx === currentQ.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    setTimeout(async () => {
      const newCorrect = isCorrect ? results.correct + 1 : results.correct;
      setFeedback(null);

      if (currentIdx < game.questions.length - 1) {
        setResults({ ...results, correct: newCorrect });
        setCurrentIdx(currentIdx + 1);
      } else {
        await finishGame(newCorrect);
      }
    }, 1500);
  };

  const finishGame = async (finalCorrect: number) => {
    if (!db || !user) return;
    
    const accuracy = (finalCorrect / game.questions.length) * 100;
    const stars = accuracy >= 100 ? 3 : accuracy >= 60 ? 2 : accuracy >= 30 ? 1 : 0;
    const duration = Math.floor((Date.now() - results.startTime) / 1000);
    const sessionId = Math.random().toString(36).substr(2, 9);

    const sessionRef = doc(db, 'children', childId as string, 'game_sessions', sessionId);
    await setDoc(sessionRef, {
      id: sessionId,
      childId,
      gameId,
      userId: user.uid,
      gameName: game.name,
      area: game.area,
      score: finalCorrect * 10,
      stars,
      correctAnswers: finalCorrect,
      incorrectAnswers: game.questions.length - finalCorrect,
      accuracy,
      durationSeconds: duration,
      createdAt: new Date().toISOString(),
    });

    // Update totals
    const childRef = doc(db, 'children', childId as string);
    await updateDoc(childRef, {
      points: increment(finalCorrect * 10),
      stars: increment(stars)
    });

    router.push(`/child/${childId}/results/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h2 className="font-black text-primary uppercase">{game.name}</h2>
        <div className="text-sm font-black bg-white px-4 py-1 rounded-full">{currentIdx + 1} / {game.questions.length}</div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-12">
        <h1 className="text-4xl font-black text-center">{currentQ.text}</h1>
        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
          {currentQ.options.map((opt: string, i: number) => (
            <button key={i} onClick={() => handleOption(i)} className="h-40 text-6xl bg-white rounded-[2rem] shadow-xl border-4 border-transparent active:scale-95 transition-all">
              {opt}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-[100]">
          {feedback === 'correct' ? <CheckCircle2 className="w-32 h-32 text-secondary" /> : <XCircle className="w-32 h-32 text-destructive" />}
        </div>
      )}
    </div>
  );
}
