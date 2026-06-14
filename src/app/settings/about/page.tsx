
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, AppLogo } from '@/components/app-components';
import { GraduationCap, Code, School, Heart } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Acerca de la App" />

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <AppLogo className="mb-4" />
          <h2 className="text-3xl font-black text-primary tracking-tighter uppercase">TEACompaña</h2>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
            TEACompaña es una aplicación educativa y de acompañamiento creada para apoyar el aprendizaje, 
            seguimiento y desarrollo de niños con Trastorno del Espectro Autista (TEA).
          </p>
        </div>

        <AppCard className="p-8 space-y-6 bg-white">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La aplicación permite a padres, tutores y docentes llevar un control del progreso del niño mediante 
              evaluaciones iniciales, planes de aprendizaje, juegos educativos, recompensas, reportes y 
              comunicación fluida entre familia y escuela.
            </p>
          </div>
        </AppCard>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest px-2">Equipo del Proyecto</h3>
          
          <div className="grid gap-4">
            <AppCard className="p-6 bg-white border-l-8 border-l-secondary">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary-foreground">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-primary text-sm uppercase">Responsable Pedagógica</h4>
                  <p className="text-lg font-black text-secondary-foreground leading-tight">Albores Moreno Stephany Vianey</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Pedagogía, 9.º Cuatrimestre • LA-UNI</p>
                </div>
              </div>
            </AppCard>

            <AppCard className="p-6 bg-white border-l-8 border-l-primary">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                  <Code className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-primary text-sm uppercase">Desarrollo de Aplicación</h4>
                  <p className="text-lg font-black text-primary leading-tight">Martínez Sánchez Carlos David</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Ing. en Sistemas, 9.º Cuatrimestre • LA-UNI</p>
                </div>
              </div>
            </AppCard>
          </div>
        </div>

        <AppCard className="p-6 bg-muted/30 border-none">
          <div className="flex gap-4 items-center">
            <School className="w-10 h-10 text-muted-foreground opacity-40" />
            <p className="text-xs text-muted-foreground font-medium italic">
              Este proyecto se desarrolla con fines académicos, buscando crear una herramienta útil, visual, 
              accesible y amigable para niños con TEA y su entorno educativo.
            </p>
          </div>
        </AppCard>

        <div className="pt-4">
          <AppButton className="w-full h-14" onClick={() => router.push('/settings')}>
            Volver a Configuración
          </AppButton>
        </div>
      </div>
    </div>
  );
}
