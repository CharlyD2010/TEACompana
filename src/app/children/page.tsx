'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppCard, AppHeader } from '@/components/app-components';
import { Plus, User, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authService } from '@/services/authService';
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

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Mis Niños" showBack={false}>
        <AppButton variant="ghost" size="icon" className="rounded-full text-destructive" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </AppButton>
      </AppHeader>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground font-medium">Selecciona un perfil</p>
          <AppButton size="sm" onClick={() => router.push('/children/create')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Nuevo
          </AppButton>
        </div>

        {children.length === 0 ? (
          <AppCard className="p-12 text-center border-2 border-dashed border-muted bg-transparent shadow-none">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground mb-4">No tienes niños registrados</h3>
            <AppButton onClick={() => router.push('/children/create')}>
              Agregar mi primer niño
            </AppButton>
          </AppCard>
        ) : (
          <div className="grid gap-4">
            {children.map((child: any) => (
              <AppCard 
                key={child.id} 
                className="p-4 flex items-center gap-4 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer bg-white"
                onClick={() => router.push(`/child/${child.id}/dashboard`)}
              >
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarImage src={child.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {child.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{child.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full uppercase tracking-wider">
                      TEA {child.teaLevel}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground font-bold rounded-full">
                      {child.points || 0} pts
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </AppCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
