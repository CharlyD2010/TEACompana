
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton } from '@/components/app-components';
import { mockDb, ChildProfile } from '@/lib/mock-db';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function KidModeGateway() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);

  useEffect(() => {
    if (id) {
      const c = mockDb.getChild(id as string);
      setChild(c || null);
    }
  }, [id]);

  if (!child) return null;

  return (
    <div className="min-h-screen bg-primary flex flex-col text-white">
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-black tracking-tight text-sm uppercase">Modo Supervisado</span>
        </div>
        <AppButton variant="ghost" size="icon" className="rounded-full text-white" onClick={() => router.back()}>
          <X className="w-6 h-6" />
        </AppButton>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        <div className="text-center space-y-6">
          <Avatar className="h-40 w-40 border-8 border-white/20 shadow-2xl mx-auto">
            <AvatarImage src={child.avatar_url} />
            <AvatarFallback className="bg-white/10 text-4xl">{child.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-4xl font-black mb-2">¡Hola, {child.name}!</h2>
            <p className="text-white/80 font-bold">¿Listo para jugar y aprender?</p>
          </div>
        </div>

        <AppCard className="p-6 bg-white/10 border-2 border-white/20 backdrop-blur-md w-full max-w-sm">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground shadow-lg flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold leading-tight">
              Se recomienda el acompañamiento de un adulto durante las actividades.
            </p>
          </div>
        </AppCard>

        <AppButton 
          className="w-full max-w-sm h-16 text-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl rounded-2xl gap-3 animate-pulse"
          onClick={() => router.push(`/dashboard/child/${id}/games`)}
        >
          COMENZAR ACTIVIDADES
          <ArrowRight className="w-6 h-6" />
        </AppButton>
      </div>
      
      <div className="p-8 text-center">
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest">TEACompaña Kids</p>
      </div>
    </div>
  );
}
