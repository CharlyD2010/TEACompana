
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader, AppCard, AppButton, ProgressBar } from '@/components/app-components';
import { mockDb, ChildProfile, Assessment } from '@/lib/mock-db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, ClipboardList, BookOpen, BarChart3, Trophy, Clock, Star, Target } from 'lucide-react';

export default function ChildDashboardPage() {
  const router = useRouter();
  const { id } = useParams();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    if (id) {
      const c = mockDb.getChild(id as string);
      if (c) setChild(c);
      const a = mockDb.getAssessment(id as string);
      if (a) setAssessment(a);
    }
  }, [id]);

  if (!child) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={`Dashboard: ${child.name}`} />

      <div className="p-6 space-y-6">
        {/* Child Summary Profile */}
        <AppCard className="p-6 bg-primary text-white relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
              <AvatarImage src={child.avatar_url} />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{child.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-black">{child.name}</h2>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold uppercase">Nivel {child.tea_level}</span>
                <span className="px-2 py-0.5 bg-accent/30 rounded-full text-xs font-bold uppercase">{child.learning_style}</span>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
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
              <div className="text-[10px] opacity-80 uppercase font-bold">Sesiones</div>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </AppCard>

        {/* Call to Action: Start Mode Kid */}
        <AppButton 
          className="w-full h-20 text-xl gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
          onClick={() => router.push(`/dashboard/child/${id}/kid-mode`)}
        >
          <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
            <Play className="fill-current ml-1" />
          </div>
          INICIAR MODO NIÑO
        </AppButton>

        {/* Progress Summary Section */}
        <div className="grid grid-cols-2 gap-4">
          <AppCard className="p-4 bg-white space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase">
              <Target className="w-4 h-4" /> Progreso
            </div>
            <ProgressBar value={15} />
            <div className="text-xs text-muted-foreground font-bold">15% Completado</div>
          </AppCard>
          <AppCard className="p-4 bg-white space-y-3">
            <div className="flex items-center gap-2 text-accent-foreground font-bold text-sm uppercase">
              <Trophy className="w-4 h-4" /> Logros
            </div>
            <div className="flex gap-1">
              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
            </div>
          </AppCard>
        </div>

        {/* Menu Options */}
        <div className="grid gap-3">
          <AppButton 
            variant="outline" 
            className="justify-between h-16 bg-white border-none shadow-sm"
            onClick={() => router.push(`/dashboard/child/${id}/assessment`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent-foreground">
                <ClipboardList />
              </div>
              <span className="font-bold">Evaluación Inicial</span>
            </div>
            {assessment && <span className="text-[10px] px-2 py-1 bg-secondary text-secondary-foreground rounded-full">HECHO</span>}
          </AppButton>

          <AppButton 
            variant="outline" 
            className="justify-between h-16 bg-white border-none shadow-sm"
            onClick={() => router.push(`/dashboard/child/${id}/plan`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <BookOpen />
              </div>
              <span className="font-bold">Plan de Aprendizaje</span>
            </div>
          </AppButton>

          <AppButton 
            variant="outline" 
            className="justify-between h-16 bg-white border-none shadow-sm"
            onClick={() => router.push(`/dashboard/child/${id}/reports`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary-foreground">
                <BarChart3 />
              </div>
              <span className="font-bold">Reportes y Progreso</span>
            </div>
          </AppButton>
        </div>

        {/* Last session info */}
        <AppCard className="p-4 flex items-center gap-4 bg-white/50 border-dashed border-2">
          <Clock className="w-8 h-8 text-muted-foreground opacity-30" />
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Última sesión</div>
            <div className="text-sm font-medium">Aún no hay actividad registrada.</div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
