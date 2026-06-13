
'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader, AppCard, ProgressBar, LoadingState, EmptyState } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { TrendingUp, Calendar, Star, BarChart3, Clock, Target } from 'lucide-react';

export default function ReportsPage() {
  const { childId } = useParams();
  const db = useFirestore();

  const childRef = useMemo(() => db && childId ? doc(db, 'children', childId as string) : null, [db, childId]);
  const { data: child, loading: childLoading } = useDoc(childRef);
  
  const sessionsQuery = useMemo(() => db && childId ? query(
    collection(db, 'children', childId as string, 'game_sessions'),
    orderBy('createdAt', 'desc'),
    limit(50)
  ) : null, [db, childId]);
  
  const { data: sessions, loading: sessionsLoading } = useCollection(sessionsQuery);

  if (childLoading || sessionsLoading) return <LoadingState />;

  const totalPoints = sessions?.reduce((acc, s: any) => acc + (s.score || 0), 0) || 0;
  const avgAccuracy = sessions?.length ? sessions.reduce((acc, s: any) => acc + (s.accuracy || 0), 0) / sessions.length : 0;
  const totalStars = sessions?.reduce((acc, s: any) => acc + (s.stars || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Reportes de Avance" />

      <div className="p-6 space-y-6">
        <AppCard className="p-6 bg-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-primary uppercase text-sm">Resumen de {child?.name}</h3>
              <p className="text-xs text-muted-foreground">Últimas {sessions?.length || 0} sesiones</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">{totalPoints}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Pts Totales</div>
          </div>
        </AppCard>

        <div className="grid grid-cols-2 gap-4">
          <AppCard className="p-4 bg-white space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-secondary-foreground uppercase">
              <Target className="w-3 h-3" /> Precisión Media
            </div>
            <div className="text-3xl font-black text-secondary-foreground">{avgAccuracy.toFixed(0)}%</div>
            <ProgressBar value={avgAccuracy} color="bg-secondary" />
          </AppCard>
          <AppCard className="p-4 bg-white space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-accent-foreground uppercase">
              <Star className="w-3 h-3" /> Estrellas
            </div>
            <div className="text-3xl font-black text-accent-foreground">{totalStars}</div>
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-accent text-accent" />
              ))}
            </div>
          </AppCard>
        </div>

        <section className="space-y-4">
          <h3 className="font-black text-primary uppercase text-xs tracking-widest flex items-center gap-2 px-2">
            <Clock className="w-4 h-4" /> Historial de Actividad
          </h3>
          
          {!sessions || sessions.length === 0 ? (
            <EmptyState 
              title="Sin actividad" 
              description="El niño aún no ha completado actividades. Inicia el modo niño para ver el progreso aquí." 
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <AppCard key={s.id} className="p-4 bg-white flex items-center justify-between border-2 border-transparent hover:border-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-black text-xs text-muted-foreground">
                      {s.gameName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-primary uppercase leading-none">{s.gameName}</h4>
                      <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">
                        {new Date(s.createdAt).toLocaleDateString()} • {s.area}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-secondary-foreground">{s.accuracy.toFixed(0)}%</div>
                    <div className="flex gap-0.5 justify-end">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < s.stars ? "fill-accent text-accent" : "text-muted fill-muted"}`} />
                      ))}
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
