'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, AppHeader, LoadingState } from '@/components/app-components';
import { Smile, Shapes, Hash, Book, Clock, Star, Volume2, Search, Brain, ShieldAlert, Lock, ChevronRight, Type, Puzzle } from 'lucide-react';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'all', name: 'Todos', color: 'bg-muted', icon: Book },
  { id: 'emociones', name: 'Emociones', color: 'bg-primary', icon: Smile },
  { id: 'letras', name: 'Letras', color: 'bg-secondary', icon: Type },
  { id: 'numeros', name: 'Números', color: 'bg-accent', icon: Hash },
  { id: 'formas', name: 'Formas', color: 'bg-secondary', icon: Shapes },
  { id: 'sonidos', name: 'Sonidos', color: 'bg-accent', icon: Volume2 },
  { id: 'rutinas', name: 'Rutinas', color: 'bg-primary', icon: Clock },
];

const GAMES = [
  { id: 'g1', name: 'Emociones', cat: 'emociones', desc: 'Identifica cómo se siente el personaje.', emoji: '😊' },
  { id: 'g3', name: 'Las Letras', cat: 'letras', desc: 'Aprende las vocales y palabras.', emoji: 'ABC' },
  { id: 'g2', name: 'Los Colores', cat: 'formas', desc: 'Busca objetos por su color.', emoji: '🎨' },
  { id: 'g7', name: 'Las Formas', cat: 'formas', desc: 'Reconoce círculos y cuadrados.', emoji: '📐' },
  { id: 'g8', name: 'Contemos', cat: 'numeros', desc: 'Aprende a contar objetos reales.', emoji: '🔢' },
  { id: 'g6', name: '¿Qué suena?', cat: 'sonidos', desc: 'Identifica sonidos de animales.', emoji: '🔊' },
  { id: 'g4', name: 'Mis Rutinas', cat: 'rutinas', desc: 'Ordena tus acciones diarias.', emoji: '☀️' },
  { id: 'g5', name: 'Palabras', cat: 'letras', desc: 'Une palabras con sus dibujos.', emoji: '🖼️' },
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
        <div className="flex items-center gap-2 bg-accent/20 px-4 py-1.5 rounded-full border-2 border-accent shadow-sm">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="font-black text-xs md:text-sm text-accent-foreground">{child?.points || 0}</span>
        </div>
      </AppHeader>

      <div className="p-4 md:p-8 space-y-10">
        {/* Categorías Visuales */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5" /> Áreas de Aprendizaje
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-1">
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

        {/* Rejilla de Actividades Progresivas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredGames.map((game) => {
            const catColor = CATEGORIES.find(c => c.id === game.cat)?.color || 'bg-muted';
            
            return (
              <AppCard key={game.id} className="p-0 border-none shadow-2xl shadow-primary/5 hover:translate-y-[-4px] transition-all">
                <div className={`h-32 ${catColor} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-7xl z-10 drop-shadow-xl">{game.emoji}</span>
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                    {CATEGORIES.find(c => c.id === game.cat)?.name}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary uppercase leading-tight">{game.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{game.desc}</p>
                  </div>

                  {/* Selector de Niveles 1-3 */}
                  <div className="space-y-3">
                    {[1, 2, 3].map(lvl => {
                      const levelProgress = progress?.find((p: any) => p.gameId === game.id && p.levelId === lvl);
                      const prevLevelProgress = progress?.find((p: any) => p.gameId === game.id && p.levelId === lvl - 1);
                      
                      const isUnlocked = lvl === 1 || (prevLevelProgress && prevLevelProgress.stars >= 2) || levelProgress?.unlocked;

                      return (
                        <button
                          key={lvl}
                          disabled={!isUnlocked}
                          onClick={() => router.push(`/child/${childId}/game/${game.id}?lvl=${lvl}`)}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-95 ${isUnlocked ? 'bg-white border-muted hover:border-primary/30 cursor-pointer shadow-sm' : 'bg-muted/30 border-transparent opacity-60 cursor-not-allowed'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {lvl}
                            </div>
                            <div className="text-left">
                              <span className={`block font-black text-[11px] uppercase tracking-wider ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {lvl === 1 ? 'Exploración' : lvl === 2 ? 'Intermedio' : 'Maestría'}
                              </span>
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3].map(i => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i <= (levelProgress?.stars || 0) ? 'fill-accent text-accent' : 'text-muted/20 fill-muted/10'}`} />
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

        {filteredGames.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[3rem] border-4 border-dashed">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Aún no hay juegos en esta categoría</p>
            <AppButton variant="outline" onClick={() => setSelectedCat('all')}>Ver todos los juegos</AppButton>
          </div>
        )}
      </div>
    </div>
  );
}
