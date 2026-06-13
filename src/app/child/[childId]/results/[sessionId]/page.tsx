
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, AppHeader } from '@/components/app-components';
import { Trophy, Star, RotateCcw, Home, Loader2 } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ResultsPage() {
  const { childId, sessionId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const { data: session, loading } = useDoc(doc(db!, 'children', childId as string, 'game_sessions', sessionId as string));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!session) return <div>No se encontró la sesión.</div>;

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-8 text-white">
      <AppCard className="w-full max-w-md p-8 bg-white text-foreground text-center space-y-6">
        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-xl">
          <Trophy className="w-12 h-12 text-accent-foreground" />
        </div>
        <h2 className="text-4xl font-black text-primary uppercase">¡Muy Bien!</h2>
        <p className="font-bold text-muted-foreground uppercase">{session.gameName}</p>
        
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <Star key={i} className={`w-12 h-12 ${i < session.stars ? "fill-accent text-accent" : "text-muted fill-muted"}`} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-2xl">
            <div className="text-2xl font-black">{session.score}</div>
            <div className="text-[10px] font-bold uppercase opacity-60">Puntos</div>
          </div>
          <div className="p-3 bg-muted rounded-2xl">
            <div className="text-2xl font-black">{session.accuracy.toFixed(0)}%</div>
            <div className="text-[10px] font-bold uppercase opacity-60">Precisión</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <AppButton className="h-14 text-lg" onClick={() => router.push(`/child/${childId}/activities`)}>
            OTRO JUEGO
          </AppButton>
          <AppButton variant="outline" className="h-14 text-lg" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <Home className="mr-2" /> DASHBOARD
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
