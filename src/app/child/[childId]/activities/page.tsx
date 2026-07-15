'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton, AppHeader, LoadingState, ProgressBar } from '@/components/app-components';
import { Smile, Shapes, Hash, Book, LayoutDashboard, Users, Clock, Star, MessageSquare, Volume2, Search, Brain, HandMetal, ShieldAlert } from 'lucide-react';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'all', name: 'Todos', color: 'bg-muted', icon: Book },
  { id: 'emociones', name: 'Emociones', color: 'bg-primary', icon: Smile },
  { id: 'colores', name: 'Colores y Formas', color: 'bg-secondary', icon: Shapes },
  { id: 'numeros', name: 'Números', color: 'bg-accent', icon: Hash },
  { id: 'comunicacion', name: 'Comunicación', color: 'bg-primary', icon: MessageSquare },
  { id: 'rutinas', name: 'Rutinas', color: 'bg-secondary', icon: Clock },
  { id: 'memoria', name: 'Memoria', color: 'bg-accent', icon: Brain },
  { id: 'higiene', name: 'Higiene', color: 'bg-primary', icon: HandMetal },
  { id: 'seguridad', name: 'Seguridad', color: 'bg-destructive', icon: ShieldAlert },
  { id: 'animales', name: 'Animales', color: 'bg-secondary', icon: Volume2 },
];

const GAMES = [
  { id: 'g1', name: 'Reconocer Emociones', cat: 'emociones', level: 1, desc: 'Identifica cómo se siente el personaje.', emoji: '😊' },
  { id: 'g2', name: 'Colores Básicos', cat: 'colores', level: 1, desc: 'Une los objetos con su color.', emoji: '🔴' },
  { id: 'g3', name: 'Conteo del 1 al 5', cat: 'numeros', level: 1, desc: 'Cuenta cuántos objetos hay.', emoji: '🔢' },
  { id: 'g4', name: 'Pasos de la Mañana', cat: 'rutinas', level: 1, desc: 'Ordena las acciones diarias.', emoji: '☀️' },
  { id: 'g5', name: 'Palabra e Imagen', cat: 'comunicacion', level: 2, desc: 'Relaciona palabras con imágenes.', emoji: '📖' },
  { id: 'g6', name: 'Sonidos de Animales', cat: 'animales', level: 1, desc: '¿Qué animal hace este sonido?', emoji: '🐶' },
  { id: 'g7', name: 'Identificar Objetos', cat: 'comunicacion', level: 1, desc: 'Busca el objeto solicitado.', emoji: '🔍' },
  { id: 'g8', name: 'Memoria Visual', cat: 'memoria', level: 2, desc: 'Encuentra las parejas iguales.', emoji: '🃏' },
  { id: 'g9', name: 'Ordenar Secuencias', cat: 'rutinas', level: 3, desc: '¿Qué pasa primero y qué después?', emoji: '🧩' },
  { id: 'g10', name: 'Comunicación Básica', cat: 'comunicacion', level: 2, desc: 'Expresa necesidades simples.', emoji: '💬' },
  { id: 'g11', name: 'Clasificar Colores', cat: 'colores', level: 2, desc: 'Agrupa objetos por su color.', emoji: '🎨' },
  { id: 'g12', name: 'Clasificar Tamaños', cat: 'colores', level: 2, desc: 'Ordena de mayor a menor.', emoji: '📏' },
  { id: 'g13', name: 'Partes del Cuerpo', cat: 'comunicacion', level: 1, desc: 'Señala la parte indicada.', emoji: '👤' },
  { id: 'g14', name: 'Hábitos de Higiene', cat: 'higiene', level: 2, desc: 'Pasos para lavarse las manos.', emoji: '🧼' },
  { id: 'g15', name: 'Seguridad Básica', cat: 'seguridad', level: 3, desc: 'Situaciones seguras vs peligrosas.', emoji: '🚦' },
];

const LEVELS = [
  { id: 1, name: 'Nivel 1: Exploración' },
  { id: 2, name: 'Nivel 2: Asociación' },
  { id: 3, name: 'Nivel 3: Comunicación' },
  { id: 4, name: 'Nivel 4: Secuencias' },
  { id: 5, name: 'Nivel 5: Consolidación' },
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
        <div className="flex items-center gap-2 bg-accent/20 px-3 md:px-4 py-1.5 rounded-full border-2 border-accent shadow-sm">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="font-black text-[10px] md:text-sm text-accent-foreground">{child?.points || 0}</span>
        </div>
      </AppHeader>

      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Categories Scroller */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <Search className="w-3.5 h-3.5" /> Categorías de Aprendizaje
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 mask-linear-fade">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex flex-col items-center gap-2 flex-shrink-0 transition-all ${selectedCat === cat.id ? 'scale-105 md:scale-110' : 'opacity-70 hover:opacity-100'}`}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg ${cat.color} text-white border-4 ${selectedCat === cat.id ? 'border-white' : 'border-transparent'}`}>
                  {React.createElement(cat.icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                </div>
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${selectedCat === cat.id ? 'text-primary' : 'text-muted-foreground'} max-w-[80px] text-center leading-tight`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Level Legend */}
        <div className="bg-white/50 p-4 md:p-6 rounded-[2rem] border-2 border-dashed border-muted shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest">Tu Progreso Actual</span>
            <span className="text-[9px] md:text-[10px] font-black bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full uppercase">
              {progress?.length || 0} / {GAMES.length} Completados
            </span>
          </div>
          <ProgressBar value={((progress?.length || 0) / GAMES.length) * 100} color="bg-secondary" />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredGames.map((game) => {
            const gameProgress = progress?.find((p: any) => p.gameId === game.id);
            const isCompleted = (gameProgress?.stars || 0) > 0;
            const CatIcon = CATEGORIES.find(c => c.id === game.cat)?.icon || Book;
            const catColor = CATEGORIES.find(c => c.id === game.cat)?.color || 'bg-muted';
            const levelInfo = LEVELS.find(l => l.id === game.level);

            return (
              <AppCard 
                key={game.id} 
                className={`p-0 flex flex-col hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group relative shadow-2xl shadow-primary/5 h-full`}
                onClick={() => router.push(`/child/${childId}/game/${game.id}`)}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-10 bg-accent text-accent-foreground p-2 rounded-full shadow-lg rotate-12">
                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </div>
                )}
                
                <div className={`h-32 md:h-40 ${catColor} flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-6xl md:text-8xl group-hover:scale-125 transition-transform duration-500 z-10">
                    {game.emoji}
                  </div>
                  <CatIcon className="absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 text-white/20 -rotate-12" />
                  <div className="absolute top-4 left-4 bg-black/10 backdrop-blur-md px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest">
                    {levelInfo?.name.split(':')[0]}
                  </div>
                </div>

                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-primary uppercase tracking-tight leading-none mb-2 truncate">{game.name}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2">{game.desc}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-muted/50">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 md:w-4 md:h-4 ${i <= (gameProgress?.stars || 0) ? 'fill-accent text-accent' : 'text-muted fill-muted opacity-30'}`} 
                        />
                      ))}
                    </div>
                    <AppButton size="sm" className="h-8 px-4 text-[8px] md:text-[9px]">Jugar</AppButton>
                  </div>
                </div>
              </AppCard>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 md:pt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <AppButton variant="outline" className="h-14 sm:w-64 gap-2 w-full" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <LayoutDashboard className="w-4 h-4" /> Volver al Dashboard
          </AppButton>
          <AppButton variant="ghost" className="h-14 text-muted-foreground gap-2 w-full sm:w-auto" onClick={() => router.push('/children')}>
            <Users className="w-4 h-4" /> Ver otros niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}