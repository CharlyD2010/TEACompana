
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, StarRating } from '@/components/app-components';
import { mockDb, ChildProfile } from '@/lib/mock-db';
import { ArrowLeft, Smile, Shapes, Hash, CalendarDays, Book, MessageSquare, Lock } from 'lucide-react';

const CATEGORIES = [
  { id: 'emociones', name: 'Emociones', color: 'bg-primary', icon: Smile },
  { id: 'colores', name: 'Colores y Formas', color: 'bg-secondary', icon: Shapes },
  { id: 'conteo', name: 'Conteo', color: 'bg-accent', icon: Hash },
  { id: 'rutinas', name: 'Rutinas', color: 'pastel-lilac', icon: CalendarDays },
];

const GAMES = [
  { 
    id: 'g1', 
    name: 'Reconocer Emociones', 
    cat: 'emociones', 
    level: 1, 
    locked: false, 
    stars: 0,
    desc: 'Identifica cómo se siente el personaje.'
  },
  { 
    id: 'g2', 
    name: 'Colores Básicos', 
    cat: 'colores', 
    level: 1, 
    locked: false, 
    stars: 0,
    desc: 'Une los objetos con su color.'
  },
  { 
    id: 'g3', 
    name: 'Conteo del 1 al 5', 
    cat: 'conteo', 
    level: 1, 
    locked: false, 
    stars: 0,
    desc: 'Cuenta cuántos objetos hay en pantalla.'
  },
  { 
    id: 'g4', 
    name: 'Pasos de la Mañana', 
    cat: 'rutinas', 
    level: 1, 
    locked: false, 
    stars: 0,
    desc: 'Ordena las acciones diarias.'
  },
  { 
    id: 'g5', 
    name: 'Asociación de Palabras', 
    cat: 'emociones', 
    level: 2, 
    locked: true, 
    stars: 0,
    desc: 'Relaciona palabras con imágenes.'
  },
];

export default function GameSelectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);

  useEffect(() => {
    if (id) {
      setChild(mockDb.getChild(id as string) || null);
    }
  }, [id]);

  if (!child) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6 bg-white flex items-center justify-between shadow-sm rounded-b-[2rem] sticky top-0 z-50">
        <AppButton variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </AppButton>
        <h1 className="text-xl font-black text-primary uppercase tracking-tight">Actividades</h1>
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-black text-xs">
          {child.points || 0}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Categories Horizontal */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center shadow-lg text-white`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black uppercase text-muted-foreground">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Game Cards */}
        <div className="grid gap-6">
          {GAMES.map((game) => (
            <AppCard 
              key={game.id} 
              className={`p-0 overflow-hidden relative ${game.locked ? 'opacity-70' : 'hover:scale-[1.02] active:scale-95 cursor-pointer'} transition-all`}
              onClick={() => !game.locked && router.push(`/dashboard/child/${id}/games/${game.id}`)}
            >
              <div className="flex">
                <div className={`w-32 h-32 flex items-center justify-center ${CATEGORIES.find(c => c.id === game.cat)?.color || 'bg-muted'}`}>
                  {React.createElement(CATEGORIES.find(c => c.id === game.cat)?.icon || Book, { className: "w-16 h-16 text-white" })}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-lg leading-tight uppercase text-primary">{game.name}</h3>
                      {game.locked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">NIVEL {game.level}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{game.desc}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <StarRating rating={game.stars} max={3} />
                    {!game.locked && (
                      <AppButton size="sm" className="h-7 px-3 bg-accent text-accent-foreground text-[10px] font-black uppercase">Jugar</AppButton>
                    )}
                  </div>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      </div>
    </div>
  );
}
