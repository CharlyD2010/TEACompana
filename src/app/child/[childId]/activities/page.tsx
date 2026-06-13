
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, StarRating } from '@/components/app-components';
import { ArrowLeft, Smile, Shapes, Hash, CalendarDays, Book, Lock, Loader2 } from 'lucide-react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'emociones', name: 'Emociones', color: 'bg-primary', icon: Smile },
  { id: 'colores', name: 'Colores y Formas', color: 'bg-secondary', icon: Shapes },
  { id: 'conteo', name: 'Conteo', color: 'bg-accent', icon: Hash },
];

const GAMES = [
  { id: 'g1', name: 'Reconocer Emociones', cat: 'emociones', level: 1, locked: false, desc: 'Identifica cómo se siente el personaje.' },
  { id: 'g2', name: 'Colores Básicos', cat: 'colores', level: 1, locked: false, desc: 'Une los objetos con su color.' },
  { id: 'g3', name: 'Conteo del 1 al 5', cat: 'conteo', level: 1, locked: false, desc: 'Cuenta cuántos objetos hay en pantalla.' },
];

export default function ActivitiesPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { data: child, loading } = useDoc(doc(db!, 'children', childId as string));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6 bg-white flex items-center justify-between shadow-sm rounded-b-[2rem] sticky top-0 z-50">
        <AppButton variant="ghost" size="icon" onClick={() => router.push(`/child/${childId}/child-mode`)} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </AppButton>
        <h1 className="text-xl font-black text-primary uppercase tracking-tight">Actividades</h1>
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-black text-xs">
          {child?.points || 0}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-6">
          {GAMES.map((game) => {
            const CatIcon = CATEGORIES.find(c => c.id === game.cat)?.icon || Book;
            return (
              <AppCard 
                key={game.id} 
                className={`p-0 overflow-hidden relative ${game.locked ? 'opacity-70' : 'hover:scale-[1.02] cursor-pointer'} transition-all`}
                onClick={() => !game.locked && router.push(`/child/${childId}/game/${game.id}`)}
              >
                <div className="flex">
                  <div className={`w-32 h-32 flex items-center justify-center ${CATEGORIES.find(c => c.id === game.cat)?.color || 'bg-muted'}`}>
                    <CatIcon className="w-16 h-16 text-white" />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-black text-lg uppercase text-primary">{game.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{game.desc}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <StarRating rating={0} max={3} />
                      <AppButton size="sm" className="h-7 px-3 text-[10px] font-black">Jugar</AppButton>
                    </div>
                  </div>
                </div>
              </AppCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
