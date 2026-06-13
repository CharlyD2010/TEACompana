'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard } from '@/components/app-components';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Trophy, Star, Medal, Award, Loader2, Lock } from 'lucide-react';

const ALL_REWARDS = [
  { id: 'first_game', name: 'Primer Juego', desc: '¡Has completado tu primera actividad!', icon: Medal, color: 'text-blue-500' },
  { id: 'accuracy_master', name: 'Maestro de Precisión', desc: '100% de precisión en un juego.', icon: Trophy, color: 'text-yellow-500' },
  { id: 'star_collector', name: 'Coleccionista', desc: 'Consigue tus primeras 10 estrellas.', icon: Star, color: 'text-accent' },
  { id: 'constant_learner', name: 'Aprendiz Constante', desc: 'Completa 5 juegos en un día.', icon: Award, color: 'text-purple-500' },
];

export default function RewardsPage() {
  const { childId } = useParams();
  const db = useFirestore();
  const { data: child, loading: childLoading } = useDoc(db && childId ? doc(db, 'children', childId as string) : null);
  
  const rewardsQuery = db && childId ? collection(db, 'children', childId as string, 'child_rewards') : null;
  const { data: earnedRewards, loading: rewardsLoading } = useCollection(rewardsQuery as any);

  if (childLoading || rewardsLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Tus Logros" />
      
      <div className="p-6 space-y-8">
        <AppCard className="p-8 bg-primary text-white text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-accent animate-bounce" />
          <h2 className="text-2xl font-black">¡Sigue así, {child?.name}!</h2>
          <p className="text-sm opacity-90">Has ganado {earnedRewards?.length || 0} de {ALL_REWARDS.length} medallas disponibles.</p>
        </AppCard>

        <div className="grid grid-cols-2 gap-4">
          {ALL_REWARDS.map((reward) => {
            const isEarned = earnedRewards?.some((r: any) => r.rewardId === reward.id);
            const Icon = reward.icon;
            
            return (
              <AppCard 
                key={reward.id} 
                className={`p-6 flex flex-col items-center text-center space-y-3 ${!isEarned ? 'opacity-50 grayscale' : 'border-2 border-accent shadow-lg bg-white'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isEarned ? 'bg-accent/20' : 'bg-muted'}`}>
                  {isEarned ? <Icon className={`w-10 h-10 ${reward.color}`} /> : <Lock className="w-8 h-8 text-muted-foreground" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase">{reward.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">{reward.desc}</p>
                </div>
                {isEarned && <span className="text-[8px] font-black bg-accent text-accent-foreground px-2 py-0.5 rounded-full uppercase">Ganado</span>}
              </AppCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
