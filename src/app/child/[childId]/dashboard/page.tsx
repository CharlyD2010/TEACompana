'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader, AppCard, AppButton, ProgressBar } from '@/components/app-components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, ClipboardList, BookOpen, BarChart3, Trophy, Target, Loader2, AlertCircle, School, Users, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { authService } from '@/services/authService';

export default function ChildDashboardPage() {
  const router = useRouter();
  const { childId } = useParams();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const { data: child, loading: childLoading, error } = useDoc(
    db && childId ? doc(db, 'children', childId as string) : null
  );

  if (userLoading || childLoading) {
    return <Loader2 className="w-12 h-12 text-primary animate-spin fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  if (error || !child) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter">Niño no encontrado</h2>
          <p className="text-muted-foreground text-sm max-w-xs">No pudimos encontrar el perfil solicitado o no tienes permisos de acceso.</p>
        </div>
        <AppButton onClick={() => router.push('/children')}>Volver a Mis Niños</AppButton>
      </div>
    );
  }

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-32">
      <AppHeader 
        title={`Dashboard: ${child.name}`} 
        showBackToChildren={true}
      >
        <div className="flex gap-2">
          <button className="p-2 hover:bg-muted rounded-xl transition-colors" onClick={() => router.push('/settings')}>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-destructive" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </AppHeader>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        {/* Profile Card */}
        <AppCard className="p-8 bg-primary text-white relative overflow-hidden group shadow-2xl shadow-primary/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <Avatar className="h-32 w-32 border-[6px] border-white/20 shadow-2xl ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-500">
              <AvatarImage src={child.avatarUrl} />
              <AvatarFallback className="bg-white/20 text-white text-4xl font-black">{child.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-4xl font-black tracking-tight leading-none mb-3">{child.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest">TEA {child.teaLevel}</span>
                  <span className="px-4 py-1.5 bg-accent/40 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-accent-foreground">{child.learningStyle}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest opacity-80 pt-4">
                <div className="flex items-center justify-center md:justify-start gap-2 bg-black/10 p-3 rounded-2xl">
                  <School className="w-4 h-4" /> {child.institutionName || 'Sin Institución'}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 bg-black/10 p-3 rounded-2xl">
                  <Users className="w-4 h-4" /> {child.groupName || 'Sin Grupo'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 relative z-10 border-t border-white/10 pt-8">
            <div className="text-center space-y-1">
              <div className="text-3xl font-black">{child.points || 0}</div>
              <div className="text-[10px] opacity-60 uppercase font-black tracking-widest">Puntos</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-black">{child.stars || 0}</div>
              <div className="text-[10px] opacity-60 uppercase font-black tracking-widest">Estrellas</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-black">0</div>
              <div className="text-[10px] opacity-60 uppercase font-black tracking-widest">Logros</div>
            </div>
          </div>
          
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </AppCard>

        {/* Action Button */}
        <AppButton 
          className="w-full h-24 text-2xl gap-5 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-2xl shadow-secondary/20 rounded-[2.5rem] group"
          onClick={() => router.push(`/child/${childId}/child-mode`)}
        >
          <div className="w-14 h-14 bg-white/40 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
            <Play className="fill-current ml-1 w-6 h-6" />
          </div>
          COMENZAR MODO NIÑO
        </AppButton>

        {/* Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppCard className="p-8 bg-white space-y-6 hover:translate-y-[-4px] transition-all cursor-pointer" onClick={() => router.push(`/child/${childId}/reports`)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
                <Target className="w-5 h-5" /> Progreso
              </div>
              <div className="text-xs font-black text-muted-foreground uppercase">10%</div>
            </div>
            <ProgressBar value={10} color="bg-primary" />
            <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest">¡Sigue así, vas muy bien!</p>
          </AppCard>
          <AppCard className="p-8 bg-white space-y-6 hover:translate-y-[-4px] transition-all cursor-pointer" onClick={() => router.push(`/child/${childId}/rewards`)}>
            <div className="flex items-center gap-3 text-accent-foreground font-black text-xs uppercase tracking-widest">
              <Trophy className="w-5 h-5" /> Recompensas
            </div>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <Trophy className="w-5 h-5" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest">Ver tus medallas ganadas</p>
          </AppCard>
        </div>

        {/* Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="flex items-center justify-between p-6 bg-white rounded-[2rem] hover:bg-accent/5 hover:scale-[1.02] transition-all text-left shadow-lg shadow-black/5" 
            onClick={() => router.push(`/child/${childId}/assessment`)}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-accent-foreground">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <span className="block font-black uppercase text-xs tracking-wider text-primary">Evaluación</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Analizar habilidades</span>
              </div>
            </div>
          </button>

          <button 
            className="flex items-center justify-between p-6 bg-white rounded-[2rem] hover:bg-primary/5 hover:scale-[1.02] transition-all text-left shadow-lg shadow-black/5" 
            onClick={() => router.push(`/child/${childId}/learning-plan`)}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <span className="block font-black uppercase text-xs tracking-wider text-primary">Plan Personal</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Guía de aprendizaje</span>
              </div>
            </div>
          </button>

          <button 
            className="flex items-center justify-between p-6 bg-white rounded-[2rem] hover:bg-secondary/5 hover:scale-[1.02] transition-all text-left shadow-lg shadow-black/5" 
            onClick={() => router.push(`/child/${childId}/observations`)}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary-foreground">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <span className="block font-black uppercase text-xs tracking-wider text-primary">Comunicación</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Chat con docente/padre</span>
              </div>
            </div>
          </button>

          <button 
            className="flex items-center justify-between p-6 bg-white rounded-[2rem] hover:bg-muted/5 hover:scale-[1.02] transition-all text-left shadow-lg shadow-black/5" 
            onClick={() => router.push(`/child/${childId}/reports`)}
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <span className="block font-black uppercase text-xs tracking-wider text-primary">Estadísticas</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Reportes detallados</span>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
          <AppButton variant="ghost" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest h-10" onClick={() => router.push('/children')}>
            <Users className="w-4 h-4 mr-2" /> Volver a Mis Niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}
