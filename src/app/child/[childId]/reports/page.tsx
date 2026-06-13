'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AppHeader, AppCard, ProgressBar } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Loader2, TrendingUp, Calendar, Target, Star, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { childId } = useParams();
  const db = useFirestore();

  const { data: child, loading: childLoading } = useDoc(db && childId ? doc(db, 'children', childId as string) : null);
  
  const sessionsQuery = db && childId ? query(
    collection(db, 'children', childId as string, 'game_sessions'),
    orderBy('createdAt', 'desc'),
    limit(20)
  ) : null;
  
  const { data: sessions, loading: sessionsLoading } = useCollection(sessionsQuery);

  if (childLoading || sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  const totalPoints = sessions?.reduce((acc, s: any) => acc + (s.score || 0), 0) || 0;
  const avgAccuracy = sessions?.length ? sessions.reduce((acc, s: any) => acc + (s.accuracy || 0), 0) / sessions.length : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Reportes y Progreso" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <AppCard className="p-4 bg-white text-center space-y-1">
            <div className="text-3xl font-black text-primary">{sessions?.length || 0}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Sesiones</div>
          </AppCard>
          <AppCard className="p-4 bg-white text-center space-y-1">
            <div className="text-3xl font-black text-secondary-foreground">{avgAccuracy.toFixed(0)}%</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Precisión</div>
          </AppCard>
        </div>

        <section className="space-y-4">
          <h3 className="font-black text-primary uppercase text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Resumen General
          </h3>
          <AppCard className="p-6 bg-white space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span>Puntos Totales</span>
                <span>{totalPoints}</span>
              </div>
              <ProgressBar value={Math.min((totalPoints / 1000) * 100, 100)} color="bg-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span>Precisión Media</span>
                <span>{avgAccuracy.toFixed(1)}%</span>
              </div>
              <ProgressBar value={avgAccuracy} color="bg-secondary" />
            </div>
          </AppCard>
        </section>

        <section className="space-y-4">
          <h3 className="font-black text-primary uppercase text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Actividad Reciente
          </h3>
          <div className="space-y-3">
            {!sessions || sessions.length === 0 ? (
              <AppCard className="p-8 text-center text-muted-foreground bg-white/50 border-dashed border-2">
                No hay sesiones registradas aún.
              </AppCard>
            ) : (
              sessions.map((s: any) => (
                <AppCard key={s.id} className="p-4 bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{s.gameName}</h4>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {new Date(s.createdAt).toLocaleDateString()} • {s.area}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-0.5 justify-end mb-1">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < s.stars ? "fill-accent text-accent" : "text-muted fill-muted"}`} />
                      ))}
                    </div>
                    <div className="text-xs font-black text-primary">+{s.score} pts</div>
                  </div>
                </AppCard>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
