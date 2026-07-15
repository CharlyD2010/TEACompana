'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, LoadingState } from '@/components/app-components';
import { Trophy, Star, RotateCcw, Clock, Target, AlertCircle, ArrowRight, LayoutDashboard, Users, ChevronRight } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ResultsPage() {
  const params = useParams();
  const childId = params?.childId as string;
  const sessionId = params?.sessionId as string;
  const router = useRouter();
  const db = useFirestore();
  
  const sessionRef = useMemo(() => 
    db && childId && sessionId ? doc(db, 'children', childId, 'game_sessions', sessionId) : null
  , [db, childId, sessionId]);
    
  const { data: session, loading, error } = useDoc(sessionRef);

  // Determinar si el siguiente nivel está disponible
  const canGoToNextLevel = useMemo(() => {
    if (!session) return false;
    return session.levelId < 3 && session.stars >= 2;
  }, [session]);

  if (loading) return <div className="min-h-screen bg-primary flex items-center justify-center"><LoadingState message="Cargando tus logros..." /></div>;
  
  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-black text-primary uppercase">¡Ups! No encontramos el resultado</h2>
        <p className="text-muted-foreground font-medium">Hubo un problema al cargar los datos o la sesión no existe.</p>
        <AppButton onClick={() => router.push(`/child/${childId}/activities`)}>Volver a Actividades</AppButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-10 duration-500 my-10">
        <AppCard className="p-8 bg-white text-foreground text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-accent opacity-50"></div>
          
          <div className="space-y-2">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-2xl mb-4 border-4 border-white">
              <Trophy className="w-12 h-12 text-accent-foreground" />
            </div>
            <h2 className="text-5xl font-black text-primary uppercase tracking-tighter">¡Muy Bien!</h2>
            <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">{session.gameName}</p>
          </div>
          
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <Star 
                key={i} 
                className={`w-14 h-14 transition-all duration-700 ${i <= session.stars ? "fill-accent text-accent scale-110 rotate-12" : "text-muted fill-muted opacity-30"}`} 
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
              <div className="text-3xl font-black text-primary">+{session.score}</div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Puntos</div>
            </div>
            <div className="p-4 bg-secondary/5 rounded-[2rem] border-2 border-secondary/10">
              <div className="text-3xl font-black text-secondary-foreground">{session.accuracy?.toFixed(0)}%</div>
              <div className="text-[10px] font-black uppercase text-muted-foreground">Precisión</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-muted-foreground uppercase bg-muted/30 p-4 rounded-2xl tracking-widest">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" /> {session.durationSeconds} SEG
            </div>
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4" /> {session.correctAnswers}/{session.totalQuestions}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {canGoToNextLevel && (
              <AppButton 
                className="h-16 text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg rounded-2xl group animate-pulse" 
                onClick={() => router.push(`/child/${childId}/game/${session.gameId}?lvl=${session.levelId + 1}`)}
              >
                SIGUIENTE NIVEL
                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </AppButton>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <AppButton 
                variant="outline" 
                className="h-16 text-[10px] border-2 border-secondary/30 text-secondary-foreground hover:bg-secondary/5 rounded-2xl gap-2 font-black uppercase tracking-widest" 
                onClick={() => router.push(`/child/${childId}/game/${session.gameId}?lvl=${session.levelId}`)}
              >
                <RotateCcw className="w-4 h-4" /> REPETIR NIVEL
              </AppButton>
              <AppButton 
                className="h-16 text-[10px] bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg rounded-2xl gap-2 font-black uppercase tracking-widest" 
                onClick={() => router.push(`/child/${childId}/activities`)}
              >
                <ArrowRight className="w-4 h-4" /> OTRO JUEGO
              </AppButton>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppButton 
                variant="ghost" 
                className="h-12 text-[9px] text-muted-foreground hover:text-primary rounded-2xl gap-2 font-black uppercase tracking-widest" 
                onClick={() => router.push(`/child/${childId}/dashboard`)}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> DASHBOARD
              </AppButton>
              <AppButton 
                variant="ghost" 
                className="h-12 text-[9px] text-muted-foreground hover:text-primary rounded-2xl gap-2 font-black uppercase tracking-widest" 
                onClick={() => router.push('/children')}
              >
                <Users className="w-3.5 h-3.5" /> MIS NIÑOS
              </AppButton>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
