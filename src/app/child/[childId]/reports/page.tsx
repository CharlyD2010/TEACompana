'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, ProgressBar, LoadingState, EmptyState, AppButton } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { TrendingUp, Star, Clock, Target, LayoutDashboard, Users } from 'lucide-react';

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
    if (!sessions?.length) return { totalPoints: 0, avgAccuracy: 0, totalStars: 0 };
    const totalPoints = sessions.reduce((acc, s: any) => acc + (s.score || 0), 0);
    const avgAccuracy = sessions.reduce((acc, s: any) => acc + (s.accuracy || 0), 0) / sessions.length;
    const totalStars = sessions.reduce((acc, s: any) => acc + (s.stars || 0), 0);
    return { totalPoints, avgAccuracy, totalStars };
  }, [sessions]);

  if (childLoading || sessionsLoading) {
    return <LoadingState message="Cargando reportes..." onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader 
        title="Reportes de Avance" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />

      <div className="p-4 md:p-6 space-y-6">
        <AppCard className="p-6 bg-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3 max-w-[60%]">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-primary uppercase text-[10px] md:text-sm truncate">Resumen de {child?.name}</h3>
              <p className="text-[9px] md:text-xs text-muted-foreground whitespace-nowrap">Últimas {sessions?.length || 0} sesiones</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl md:text-2xl font-black text-primary leading-none">{stats.totalPoints}</div>
            <div className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pts Totales</div>
          </div>
        </AppCard>

        <div className="grid grid-cols-2 gap-4">
          <AppCard className="p-4 md:p-6 bg-white space-y-3 md:space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-secondary-foreground uppercase tracking-widest truncate">
              <Target className="w-3 h-3 flex-shrink-0" /> Precisión Media
            </div>
            <div className="text-2xl md:text-3xl font-black text-secondary-foreground">{stats.avgAccuracy.toFixed(0)}%</div>
            <ProgressBar value={stats.avgAccuracy} color="bg-secondary" />
          </AppCard>
          <AppCard className="p-4 md:p-6 bg-white space-y-3 md:space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-accent-foreground uppercase tracking-widest truncate">
              <Star className="w-3 h-3 flex-shrink-0" /> Estrellas
            </div>
            <div className="text-2xl md:text-3xl font-black text-accent-foreground">{stats.totalStars}</div>
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-accent text-accent" />
              ))}
            </div>
          </AppCard>
        </div>

        <section className="space-y-4 pt-2">
          <h3 className="font-black text-primary uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2 px-2">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> Historial de Actividad
          </h3>
          
          {!sessions || sessions.length === 0 ? (
            <EmptyState 
              title="Sin actividad" 
              description="El niño aún no ha completado actividades. Inicia el modo niño para ver el progreso aquí." 
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <AppCard key={s.id} className="p-4 bg-white flex items-center justify-between border-2 border-transparent hover:border-primary/10 active:scale-[0.98] transition-all shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center font-black text-xs text-muted-foreground flex-shrink-0 uppercase">
                      {s.gameName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs md:text-sm text-primary uppercase leading-none truncate">{s.gameName}</h4>
                      <div className="text-[8px] md:text-[9px] text-muted-foreground font-bold mt-1.5 uppercase tracking-tighter truncate">
                        {new Date(s.createdAt).toLocaleDateString()} • {s.area}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-[10px] md:text-xs font-black text-secondary-foreground">{s.accuracy?.toFixed(0)}%</div>
                    <div className="flex gap-0.5 justify-end">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 md:w-3 md:h-3 ${i < s.stars ? "fill-accent text-accent" : "text-muted fill-muted opacity-30"}`} />
                      ))}
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </section>

        <div className="pt-8 flex flex-col gap-3">
          <AppButton className="w-full h-14 font-black uppercase shadow-lg" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <LayoutDashboard className="w-4 h-4 mr-2" /> Volver al Dashboard
          </AppButton>
          <AppButton variant="ghost" className="w-full h-12 text-muted-foreground font-black uppercase text-[9px] md:text-[10px]" onClick={() => router.push('/children')}>
            <Users className="w-3 h-3 mr-2" /> Ver otros niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}