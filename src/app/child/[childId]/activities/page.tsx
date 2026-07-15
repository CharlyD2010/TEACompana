'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, AppHeader, LoadingState, ProgressBar } from '@/components/app-components';
import { Smile, Shapes, Hash, Book, LayoutDashboard, Users, Clock, Star, MessageSquare, Volume2, Search, Brain, HandMetal, ShieldAlert, Lock, ChevronRight } from 'lucide-react';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'all', name: 'Todos', color: 'bg-muted', icon: Book },
  { id: 'emociones', name: 'Emociones', color: 'bg-primary', icon: Smile },
  { id: 'colores', name: 'Colores y Formas', color: 'bg-secondary', icon: Shapes },
  { id: 'sonidos', name: 'Sonidos', color: 'bg-accent', icon: Volume2 },
  { id: 'rutinas', name: 'Rutinas', color: 'bg-secondary', icon: Clock },
];

const GAMES = [
  { id: 'g1', name: 'Emociones', cat: 'emociones', desc: 'Identifica cómo se siente el personaje.', emoji: '😊' },
  { id: 'g2', name: 'Colores', cat: 'colores', desc: 'Une los objetos con su color.', emoji: '🎨' },
  { id: 'g6', name: '¿Qué suena?', cat: 'sonidos', desc: 'Identifica sonidos de animales y casa.', emoji: '🔊' },
  { id: 'g4', name: 'Mis Rutinas', cat: 'rutinas', desc: 'Ordena y completa tus acciones diarias.', emoji: '☀️' },
];

export default function ActivitiesPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [selectedCat, setSelectedCat] = useState('all');

  const childRef = useMemo(() => 
    db && childId ? doc(db, 'children', childId as string) : null
  , [db, childId]);

  const progressColl = useMemo(() => 
    db && childId ? collection(db, 'children', childId as string, 'game_progress') : null
  , [db, childId]);

  const { data: child, loading: childLoading } = useDoc(childRef);
  const { data: progress, loading: progressLoading } = useCollection(progressColl);

  const filteredGames = useMemo(() => {
    if (selectedCat === 'all') return GAMES;
    return GAMES.filter(g => g.cat === selectedCat);
  }, [selectedCat]);

  const loadData = useCallback(() => {
    window.location.reload();
  }, []);

  if (childLoading || progressLoading) return <LoadingState message="Cargando actividades..." onRetry={loadData} />;

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader 
        title="Juegos y Actividades" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      >
        <div className="flex items-center gap-2 bg-accent/20 px-4 py-1.5 rounded-full border-2 border-accent">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="font-black text-xs md:text-sm text-accent-foreground">{child?.points || 0}</span>
        </div>
      </AppHeader>

      <div className="p-4 md:p-8 space-y-10">
        {/* Categorías */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5" /> Categorías de Aprendizaje
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex flex-col items-center gap-3 flex-shrink-0 transition-all ${selectedCat === cat.id ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shadow-lg ${cat.color} text-white border-4 ${selectedCat === cat.id ? 'border-white ring-4 ring-primary/20' : 'border-transparent'}`}>
                  {React.createElement(cat.icon, { className: "w-8 h-8" })}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedCat === cat.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Rejilla de Juegos con Niveles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filteredGames.map((game) => {
            const catColor = CATEGORIES.find(c => c.id === game.cat)?.color || 'bg-muted';
            
            return (
              <AppCard key={game.id} className="p-0 border-none shadow-2xl shadow-primary/5">
                <div className={`h-32 ${catColor} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-7xl z-10">{game.emoji}</span>
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                    {CATEGORIES.find(c => c.id === game.cat)?.name}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary uppercase leading-tight">{game.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{game.desc}</p>
                  </div>

                  {/* Niveles por Juego */}
                  <div className="space-y-3">
                    {[1, 2, 3].map(lvl => {
                      const levelProgress = progress?.find((p: any) => p.gameId === game.id && p.levelId === lvl);
                      const isUnlocked = lvl === 1 || progress?.some((p: any) => p.gameId === game.id && p.levelId === lvl - 1 && p.stars >= 2) || progress?.find((p: any) => p.gameId === game.id && p.levelId === lvl)?.unlocked;
                      const isCompleted = (levelProgress?.stars || 0) > 0;

                      return (
                        <button
                          key={lvl}
                          disabled={!isUnlocked}
                          onClick={() => router.push(`/child/${childId}/game/${game.id}?lvl=${lvl}`)}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-95 ${isUnlocked ? 'bg-white border-muted hover:border-primary/30 cursor-pointer' : 'bg-muted/50 border-transparent opacity-60 cursor-not-allowed'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {lvl}
                            </div>
                            <div className="text-left">
                              <span className={`block font-black text-[11px] uppercase tracking-wider ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {lvl === 1 ? 'Básico' : lvl === 2 ? 'Intermedio' : 'Avanzado'}
                              </span>
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3].map(i => (
                                  <Star key={i} className={`w-3 h-3 ${i <= (levelProgress?.stars || 0) ? 'fill-accent text-accent' : 'text-muted-foreground/20 fill-muted-foreground/10'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {isUnlocked ? (
                            <ChevronRight className="w-5 h-5 text-primary/50" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground/30" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </AppCard>
            );
          })}
        </div>

        {/* Footer */}
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
