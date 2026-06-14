
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Trophy, Star, Medal, Award, Loader2, Lock, LayoutDashboard, Users, Brain, Heart, Shield, Sparkles } from 'lucide-react';

const ALL_REWARDS = [
  { id: 'first_game', name: 'Primer Logro', desc: '¡Has completado tu primera actividad!', icon: Medal, color: 'text-blue-500' },
  { id: 'accuracy_master', name: 'Maestro de Precisión', desc: '100% de precisión en un juego.', icon: Trophy, color: 'text-yellow-500' },
  { id: 'star_collector', name: 'Coleccionista', desc: 'Consigue tus primeras 10 estrellas.', icon: Star, color: 'text-accent' },
  { id: 'emotions_explorer', name: 'Explorador Emocional', desc: 'Reconoce todas las emociones básicas.', icon: Heart, color: 'text-red-500' },
  { id: 'counting_hero', name: 'Héroe de Números', desc: 'Domina el conteo del 1 al 10.', icon: Sparkles, color: 'text-emerald-500' },
  { id: 'memory_master', name: 'Súper Memoria', desc: 'Completa un nivel de memoria sin errores.', icon: Brain, color: 'text-purple-500' },
  { id: 'safety_guardian', name: 'Guardián Seguro', desc: 'Aprende todas las señales de seguridad.', icon: Shield, color: 'text-indigo-500' },
  { id: 'constant_learner', name: 'Aprendiz Constante', desc: 'Completa 5 juegos en un día.', icon: Award, color: 'text-orange-500' },
];

export default function RewardsPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { data: child, loading: childLoading } = useDoc(db && childId ? doc(db, 'children', childId as string) : null);
  
  const rewardsQuery = db && childId ? collection(db, 'children', childId as string, 'child_rewards') : null;
  const { data: earnedRewards, loading: rewardsLoading } = useCollection(rewardsQuery as any);

  if (childLoading || rewardsLoading) return <LoadingState />;

  const earnedCount = earnedRewards?.length || 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader 
        title="Tus Medallas" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />
      
      <div className="p-6 space-y-10">
        <AppCard className="p-10 bg-primary text-white text-center space-y-6 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <Trophy className="w-24 h-24 mx-auto text-accent animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight">¡Vas increíble, {child?.name}!</h2>
              <p className="text-sm font-bold opacity-90 uppercase tracking-[0.2em]">Has ganado {earnedCount} de {ALL_REWARDS.length} medallas</p>
            </div>
            <div className="max-w-xs mx-auto">
              <div className="h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${(earnedCount / ALL_REWARDS.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </AppCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ALL_REWARDS.map((reward) => {
            const isEarned = earnedRewards?.some((r: any) => r.rewardId === reward.id);
            const Icon = reward.icon;
            
            return (
              <AppCard 
                key={reward.id} 
                className={`p-8 flex flex-col items-center text-center space-y-4 border-4 transition-all duration-500 ${!isEarned ? 'opacity-40 grayscale bg-muted/20 border-transparent' : 'border-accent bg-white shadow-2xl scale-105 rotate-1'}`}
              >
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${isEarned ? 'bg-accent/20' : 'bg-muted'}`}>
                  {isEarned ? <Icon className={`w-12 h-12 ${reward.color}`} /> : <Lock className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-primary">{reward.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold leading-relaxed">{reward.desc}</p>
                </div>
                {isEarned && (
                  <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                    ¡Conseguido!
                  </div>
                )}
              </AppCard>
            );
          })}
        </div>

        <div className="pt-10 flex flex-col md:flex-row gap-4 justify-center">
          <AppButton variant="outline" className="h-16 md:w-64 gap-2" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <LayoutDashboard className="w-5 h-5" /> Volver al Dashboard
          </AppButton>
          <AppButton variant="ghost" className="h-16 text-muted-foreground gap-2" onClick={() => router.push('/children')}>
            <Users className="w-5 h-5" /> Ver otros niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}
