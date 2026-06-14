'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader, AppCard, AppButton, ProgressBar } from '@/components/app-components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, ClipboardList, BookOpen, BarChart3, Trophy, Target, Loader2, AlertCircle, School, Users } from 'lucide-react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ChildDashboardPage() {
  const router = useRouter();
  const { childId } = useParams();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const { data: child, loading: childLoading, error } = useDoc(
    db && childId ? doc(db, 'children', childId as string) : null
  );

  if (userLoading || childLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  if (error || !child) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-black">Niño no encontrado</h2>
        <p className="text-muted-foreground">No pudimos encontrar el perfil solicitado o no tienes acceso.</p>
        <AppButton onClick={() => router.push('/children')}>Volver a Mis Niños</AppButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={`Dashboard: ${child.name}`} />

      <div className="p-6 space-y-6">
        <AppCard className="p-6 bg-primary text-white relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
              <AvatarImage src={child.avatarUrl} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{child.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-black">{child.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-tight">TEA {child.teaLevel}</span>
                <span className="px-2 py-0.5 bg-accent/30 rounded-full text-[10px] font-black uppercase tracking-tight">{child.learningStyle}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-2 relative z-10 text-[10px] font-black uppercase tracking-widest opacity-90">
            <div className="flex items-center gap-2">
              <School className="w-3 h-3" /> {child.institutionName || 'Sin Institución'}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3" /> {child.groupName || 'Sin Grupo'}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
            <div className="text-center">
              <div className="text-2xl font-black">{child.points || 0}</div>
              <div className="text-[10px] opacity-80 uppercase font-bold">Puntos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black">{child.stars || 0}</div>
              <div className="text-[10px] opacity-80 uppercase font-bold">Estrellas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black">0</div>
              <div className="text-[10px] opacity-80 uppercase font-bold">Logros</div>
            </div>
          </div>
        </AppCard>

        <AppButton 
          className="w-full h-20 text-xl gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
          onClick={() => router.push(`/child/${childId}/child-mode`)}
        >
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
            <Play className="fill-current ml-1" />
          </div>
          INICIAR MODO NIÑO
        </AppButton>

        <div className="grid grid-cols-2 gap-4">
          <AppCard className="p-4 bg-white space-y-3" onClick={() => router.push(`/child/${childId}/reports`)}>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
              <Target className="w-4 h-4" /> Progreso
            </div>
            <ProgressBar value={10} />
            <div className="text-xs text-muted-foreground font-bold">10% Completado</div>
          </AppCard>
          <AppCard className="p-4 bg-white space-y-3" onClick={() => router.push(`/child/${childId}/rewards`)}>
            <div className="flex items-center gap-2 text-accent-foreground font-bold text-sm uppercase">
              <Trophy className="w-4 h-4" /> Recompensas
            </div>
            <div className="text-xs text-muted-foreground font-bold">Ver medallas</div>
          </AppCard>
        </div>

        <div className="grid gap-3">
          <AppButton variant="outline" className="justify-between h-16 bg-white border-none shadow-sm" onClick={() => router.push(`/child/${childId}/assessment`)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent-foreground">
                <ClipboardList />
              </div>
              <span className="font-bold">Evaluación Inicial</span>
            </div>
          </AppButton>

          <AppButton variant="outline" className="justify-between h-16 bg-white border-none shadow-sm" onClick={() => router.push(`/child/${childId}/learning-plan`)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <BookOpen />
              </div>
              <span className="font-bold">Plan de Aprendizaje</span>
            </div>
          </AppButton>

          <AppButton variant="outline" className="justify-between h-16 bg-white border-none shadow-sm" onClick={() => router.push(`/child/${childId}/reports`)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary-foreground">
                <BarChart3 />
              </div>
              <span className="font-bold">Reportes de Avance</span>
            </div>
          </AppButton>
        </div>
      </div>
    </div>
  );
}