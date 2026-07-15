'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, ProgressBar, LoadingState, EmptyState, AppButton } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { TrendingUp, Star, Clock, Target, LayoutDashboard, Users, Sparkles, AlertCircle, Calendar, BookOpen, Lightbulb } from 'lucide-react';

export default function ReportsPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();

  const childRef = useMemo(() => 
    db && childId ? doc(db, 'children', childId as string) : null
  , [db, childId]);

  const sessionsQuery = useMemo(() => 
    db && childId ? query(
      collection(db, 'children', childId as string, 'game_sessions'),
      orderBy('createdAt', 'desc'),
      limit(50)
    ) : null
  , [db, childId]);

  const { data: child, loading: childLoading } = useDoc(childRef);
  const { data: sessions, loading: sessionsLoading } = useCollection(sessionsQuery);

  const stats = useMemo(() => {
    if (!sessions?.length) return { totalPoints: 0, avgAccuracy: 0, totalStars: 0, favoriteGame: '-' };
    
    const totalPoints = sessions.reduce((acc, s: any) => acc + (s.score || 0), 0);
    const avgAccuracy = sessions.reduce((acc, s: any) => acc + (s.accuracy || 0), 0) / sessions.length;
    const totalStars = sessions.reduce((acc, s: any) => acc + (s.stars || 0), 0);
    
    const gameCounts: Record<string, number> = {};
    sessions.forEach((s: any) => {
      gameCounts[s.gameName] = (gameCounts[s.gameName] || 0) + 1;
    });
    const favoriteGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return { totalPoints, avgAccuracy, totalStars, favoriteGame };
  }, [sessions]);

  // Recomendaciones Pedagógicas Basadas en Datos (Resiliente a falta de datos)
  const recommendations = useMemo(() => {
    if (!sessions?.length) {
      return [
        "Inicia con el juego de 'Emociones' para evaluar el reconocimiento visual.",
        "Te recomendamos realizar la Evaluación Inicial para un plan más preciso.",
        "Establece una rutina de juego de 15 minutos diarios."
      ];
    }
    
    const recs = [];
    const lowAccuracySessions = sessions.filter((s: any) => s.accuracy < 60);
    const highAccuracySessions = sessions.filter((s: any) => s.accuracy >= 90);

    if (highAccuracySessions.length > 3) {
      recs.push(`¡Excelente avance! ${child?.name} domina con éxito varias áreas. Es momento de probar niveles Avanzados.`);
    }

    if (lowAccuracySessions.length > 2) {
      const problematicGame = lowAccuracySessions[0].gameName;
      recs.push(`Se recomienda reforzar el área de "${problematicGame}" con apoyo de un adulto.`);
    }

    if (stats.avgAccuracy > 80) {
      recs.push("La precisión general es muy alta, lo que indica un gran enfoque y comprensión.");
    }

    return recs.length > 0 ? recs : ["Continúa con el plan de actividades diario para mantener el progreso."];
  }, [sessions, child, stats]);

  if (childLoading || sessionsLoading) {
    return <LoadingState message="Analizando datos pedagógicos..." onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader 
        title="Reporte Pedagógico" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />

      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
        {/* Resumen de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AppCard className="p-6 bg-primary text-white space-y-2 shadow-2xl shadow-primary/20">
            <TrendingUp className="w-8 h-8 opacity-50" />
            <div className="text-3xl font-black">{stats.totalPoints}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Puntos Acumulados</div>
          </AppCard>

          <AppCard className="p-6 bg-secondary text-secondary-foreground space-y-2 shadow-2xl shadow-secondary/20">
            <Target className="w-8 h-8 opacity-50" />
            <div className="text-3xl font-black">{stats.avgAccuracy.toFixed(0)}%</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Precisión Media</div>
          </AppCard>

          <AppCard className="p-6 bg-accent text-accent-foreground space-y-2 shadow-2xl shadow-accent/20">
            <Star className="w-8 h-8 opacity-50 fill-current" />
            <div className="text-3xl font-black">{stats.totalStars}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Estrellas Ganadas</div>
          </AppCard>
        </div>

        {/* Modo sin datos / Recomendaciones Iniciales */}
        {!sessions?.length && (
          <AppCard className="p-8 bg-white border-2 border-dashed border-primary/20 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary uppercase">¡Bienvenido al Reporte!</h3>
                <p className="text-sm text-muted-foreground font-medium">Aquí verás el progreso de {child?.name} conforme juegue.</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-3 h-3" /> Pasos sugeridos para hoy
              </h4>
              <div className="grid gap-3">
                <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between group hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/child/${childId}/activities`)}>
                  <span className="text-sm font-bold text-foreground">1. Completar un juego de Emociones</span>
                  <AppButton size="sm" variant="ghost" className="h-8 text-[9px]">IR</AppButton>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between group hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/child/${childId}/assessment`)}>
                  <span className="text-sm font-bold text-foreground">2. Realizar Evaluación Inicial</span>
                  <AppButton size="sm" variant="ghost" className="h-8 text-[9px]">IR</AppButton>
                </div>
              </div>
            </div>
          </AppCard>
        )}

        {/* Recomendaciones Pedagógicas (Visibles siempre para guiar) */}
        <section className="space-y-4">
          <h3 className="px-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent fill-accent" /> Sugerencias del Sistema
          </h3>
          <AppCard className="p-6 bg-white border-l-8 border-l-primary space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <p className="text-sm font-bold text-foreground leading-relaxed">{rec}</p>
              </div>
            ))}
          </AppCard>
        </section>

        {/* Historial Detallado */}
        {sessions && sessions.length > 0 && (
          <section className="space-y-4">
            <h3 className="px-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Historial de Sesiones
            </h3>
            <div className="grid gap-3">
              {sessions.map((s: any) => (
                <AppCard key={s.id} className="p-4 md:p-6 bg-white flex items-center justify-between group hover:border-primary/20 border-2 border-transparent transition-all shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-primary font-black text-lg shadow-inner flex-shrink-0">
                      {s.gameName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-sm md:text-base text-primary uppercase leading-none truncate">{s.gameName}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">{new Date(s.createdAt).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black text-secondary-foreground uppercase bg-secondary/10 px-2 py-0.5 rounded-full">Nivel {s.levelId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-4 space-y-1">
                    <div className="text-sm md:text-lg font-black text-primary">+{s.score} pts</div>
                    <div className="flex gap-0.5 justify-end">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < s.stars ? "fill-accent text-accent" : "text-muted fill-muted opacity-20"}`} />
                      ))}
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          </section>
        )}

        <div className="pt-10 flex flex-col md:flex-row gap-4 justify-center">
          <AppButton className="h-16 md:w-64" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <LayoutDashboard className="w-5 h-5 mr-2" /> Panel del Niño
          </AppButton>
          <AppButton variant="outline" className="h-16 md:w-64" onClick={() => router.push('/children')}>
            <Users className="w-5 h-5 mr-2" /> Mis Alumnos
          </AppButton>
        </div>
      </div>
    </div>
  );
}
