
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppCard, AppHeader, LoadingState, EmptyState } from '@/components/app-components';
import { Plus, User, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { childrenService } from '@/services/childrenService';
import { useUser } from '@/firebase';

export default function MyChildrenPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChildren() {
      if (user) {
        try {
          const data = await childrenService.getChildrenForUser(user.uid);
          setChildren(data);
        } catch (e) {
          console.error("Error loading children", e);
        } finally {
          setLoading(false);
        }
      } else if (!userLoading) {
        router.push('/');
      }
    }
    loadChildren();
  }, [user, userLoading, router]);

  if (loading || userLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingState /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Mis Niños" showBack={false}>
        <AppButton variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/settings')}>
          <Settings className="h-5 w-5" />
        </AppButton>
      </AppHeader>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground font-bold text-xs uppercase">Perfiles registrados</p>
          <AppButton size="sm" onClick={() => router.push('/children/create')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-8 px-4 text-[10px] uppercase font-black">
            <Plus className="w-3 h-3 mr-1" /> Nuevo Niño
          </AppButton>
        </div>

        {children.length === 0 ? (
          <EmptyState 
            title="Sin perfiles" 
            description="Aún no has registrado ningún niño. Crea un perfil para comenzar el seguimiento." 
            actionLabel="Agregar mi primer niño"
            onAction={() => router.push('/children/create')}
          />
        ) : (
          <div className="grid gap-4">
            {children.map((child: any) => (
              <AppCard 
                key={child.id} 
                className="p-5 flex items-center gap-4 hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer bg-white"
                onClick={() => router.push(`/child/${child.id}/dashboard`)}
              >
                <Avatar className="h-16 w-16 border-4 border-primary/10">
                  <AvatarImage src={child.avatarUrl} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">
                    {child.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-primary">{child.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-secondary/20 text-secondary-foreground font-black rounded-full uppercase tracking-tight">
                      TEA {child.teaLevel}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-accent text-accent-foreground font-black rounded-full uppercase tracking-tight">
                      {child.points || 0} pts
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground w-5 h-5" />
              </AppCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
