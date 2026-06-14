'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState, EmptyState, ProgressBar } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Trophy, Star, Medal, Award, Lock, LayoutDashboard, Users, Brain, Heart, Shield, Sparkles, AlertCircle } from 'lucide-react';

/**
 * Lista base de recompensas del sistema.
 * Se muestra tanto las ganadas como las bloqueadas.
 */
const BASE_REWARDS = [
  { id: 'first_game', name: 'Primer Logro', desc: '¡Has completado tu primera actividad!', icon: Medal, color: 'text-blue-500' },
  { id: 'accuracy_master', name: 'Maestro de Precisión', desc: 'Consigue 100% de precisión en un juego.', icon: Trophy, color: 'text-yellow-500' },
  { id: 'star_collector', name: 'Coleccionista', desc: 'Consigue tus primeras 10 estrellas.', icon: Star, color: 'text-accent' },
  { id: 'emotions_explorer', name: 'Explorador Emocional', desc: 'Identifica correctamente las emociones básicas.', icon: Heart, color: 'text-red-500' },
  { id: 'counting_hero', name: 'Héroe de Números', desc: 'Domina el conteo básico de objetos.', icon: Sparkles, color: 'text-emerald-500' },
  { id: 'memory_master', name: 'Súper Memoria', desc: 'Completa un nivel de memoria sin errores.', icon: Brain, color: 'text-purple-500' },
  { id: 'safety_guardian', name: 'Guardián Seguro', desc: 'Aprende las señales básicas de seguridad.', icon: Shield, color: 'text-indigo-500' },
  { id: 'constant_learner', name: 'Aprendiz Constante', desc: 'Completa 5 actividades en un solo día.', icon: Award, color: 'text-orange-500' },
  { id: 'hygiene_hero', name: 'Héroe de Higiene', desc: 'Aprende los hábitos de limpieza diaria.', icon: Award, color: 'text-cyan-500' },
  { id: 'animal_friend', name: 'Amigo Animal', desc: 'Reconoce todos los sonidos de animales.', icon: Award, color: 'text-lime-500' },
];

export default function RewardsPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();

  // Referencia al documento del niño
  const childRef = useMemo(() => 
    db && childId ? doc(db, 'children', childId as string) : null
  , [db, childId]);

  // Colección de recompensas ganadas
  const rewardsQuery = useMemo(() => 
    db && childId ? collection(db, 'children', childId as string, 'child_rewards') : null
  , [db, childId]);

  const { data: child, loading: childLoading, error: childError } = useDoc(childRef);
  const { data: earnedRewards, loading: rewardsLoading, error: rewardsError } = useCollection(rewardsQuery);

  // Manejo de carga
  if (childLoading || (rewardsLoading && !earnedRewards)) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingState message="Cargando tus medallas..." /></div>;
  }

  // Manejo de errores o ID faltante
  if (!childId || childError || (!child && !childLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-black text-primary uppercase">Niño no encontrado</h2>
        <p className="text-muted-foreground">Hubo un problema al cargar el perfil o no tienes acceso.</p>
        <AppButton onClick={() => router.push('/children')}>Volver a Mis Niños</AppButton>
      </div>
    );
  }

  const earnedCount = earnedRewards?.length || 0;
  const totalCount = BASE_REWARDS.length;
  const progressPercent = (earnedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader 
        title="Tus Medallas" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />
      
      <div className="p-6 space-y-10 animate-in fade-in duration-500">
        {/* Cabecera de Recompensas */}
        <AppCard className="p-10 bg-primary text-white text-center space-y-6 relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10 space-y-4">
            <Trophy className="w-24 h-24 mx-auto text-accent animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight leading-none">¡Vas increíble, {child?.name}!</h2>
              <p className="text-[10px] font-black opacity-90 uppercase tracking-[0.2em]">Has ganado {earnedCount} de {totalCount} medallas</p>
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <ProgressBar value={progressPercent} color="bg-accent" />
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-70">
                <span>Comienzo</span>
                <span>Objetivo: {totalCount}</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
        </AppCard>

        {/* Listado de Medallas */}
        <div className="space-y-4">
          <h3 className="px-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <Medal className="w-3.5 h-3.5" /> Colección de Insignias
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {BASE_REWARDS.map((reward) => {
              const earnedInfo = earnedRewards?.find((r: any) => r.rewardId === reward.id);
              const isEarned = !!earnedInfo;
              const Icon = reward.icon;
              
              return (
                <AppCard 
                  key={reward.id} 
                  className={`p-6 flex flex-col items-center text-center space-y-4 border-4 transition-all duration-500 ${!isEarned ? 'opacity-40 grayscale bg-muted/20 border-transparent' : 'border-accent bg-white shadow-2xl scale-105 ring-4 ring-accent/10'}`}
                >
                  <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-inner ${isEarned ? 'bg-accent/20' : 'bg-muted'}`}>
                    {isEarned ? (
                      <Icon className={`w-12 h-12 ${reward.color}`} />
                    ) : (
                      <Lock className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-black text-[11px] uppercase tracking-wider text-primary leading-tight">{reward.name}</h4>
                    <p className="text-[9px] text-muted-foreground font-bold leading-relaxed line-clamp-2">{reward.desc}</p>
                  </div>

                  {isEarned ? (
                    <div className="bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-in zoom-in-50 duration-500">
                      ¡CONSEGUIDO!
                    </div>
                  ) : (
                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest bg-muted rounded-full px-3 py-1">
                      BLOQUEADO
                    </div>
                  )}
                </AppCard>
              );
            })}
          </div>
        </div>

        {/* Mensaje de motivación si no hay nada */}
        {earnedCount === 0 && (
          <EmptyState 
            title="¡Es hora de explorar!" 
            description="Completa tu primer juego para ganar tu primera medalla. ¡Tú puedes hacerlo!"
            actionLabel="Ir a Actividades"
            onAction={() => router.push(`/child/${childId}/activities`)}
          />
        )}

        {/* Navegación Inferior */}
        <div className="pt-10 flex flex-col md:flex-row gap-4 justify-center">
          <AppButton 
            className="h-16 md:w-64 gap-2 bg-secondary text-secondary-foreground" 
            onClick={() => router.push(`/child/${childId}/activities`)}
          >
            <LayoutDashboard className="w-5 h-5" /> Jugar y Aprender
          </AppButton>
          <AppButton 
            variant="outline" 
            className="h-16 md:w-64 gap-2 border-2 border-primary/20 text-primary" 
            onClick={() => router.push(`/child/${childId}/dashboard`)}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </AppButton>
          <AppButton 
            variant="ghost" 
            className="h-16 text-muted-foreground gap-2 font-black uppercase text-xs" 
            onClick={() => router.push('/children')}
          >
            <Users className="w-5 h-5" /> Mis Niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}
