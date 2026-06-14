
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppCard, AppButton } from '@/components/app-components';
import { ShieldCheck, ArrowRight, X, Loader2, LayoutDashboard, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ChildModeGateway() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const { data: child, loading } = useDoc(doc(db!, 'children', childId as string));

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-primary"><Loader2 className="animate-spin" /></div>;
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
        <AppButton variant="ghost" size="icon" className="rounded-full text-white" onClick={() => router.push(`/child/${childId}/dashboard`)}>
          <X className="w-6 h-6" />
        </AppButton>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        <div className="text-center space-y-6">
          <Avatar className="h-40 w-40 border-8 border-white/20 shadow-2xl mx-auto">
            <AvatarImage src={child.avatarUrl} />
            <AvatarFallback className="bg-white/10 text-4xl">{child.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-4xl font-black mb-2">¡Hola, {child.name}!</h2>
            <p className="text-white/80 font-bold">¿Listo para jugar y aprender?</p>
          </div>
        </div>

        <AppCard className="p-6 bg-white/10 border-2 border-white/20 backdrop-blur-md w-full max-w-sm">
          <p className="text-sm font-bold text-center">
            Se recomienda el acompañamiento de un adulto durante las actividades.
          </p>
        </AppCard>

        <AppButton 
          className="w-full max-w-sm h-16 text-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl rounded-2xl gap-3 animate-pulse"
          onClick={() => router.push(`/child/${childId}/activities`)}
        >
          COMENZAR ACTIVIDADES
          <ArrowRight className="w-6 h-6" />
        </AppButton>

        <div className="flex flex-col gap-2 w-full max-w-sm">
          <AppButton variant="ghost" className="text-white/70 font-black uppercase text-xs gap-2" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <LayoutDashboard className="w-4 h-4" /> Volver al Dashboard
          </AppButton>
          <AppButton variant="ghost" className="text-white/70 font-black uppercase text-xs gap-2" onClick={() => router.push('/children')}>
            <Users className="w-4 h-4" /> Volver a Mis Niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}
