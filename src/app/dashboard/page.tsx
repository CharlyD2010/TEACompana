
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppCard, AppHeader } from '@/components/app-components';
import { mockDb, ChildProfile } from '@/lib/mock-db';
import { Plus, User, ChevronRight, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MyChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);

  useEffect(() => {
    setChildren(mockDb.getChildren());
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Mis Niños" showBack={false}>
        <div className="flex gap-2">
          <AppButton variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </AppButton>
          <AppButton variant="ghost" size="icon" className="rounded-full text-destructive" onClick={() => router.push('/')}>
            <LogOut className="h-5 w-5" />
          </AppButton>
        </div>
      </AppHeader>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground font-medium">Selecciona un perfil para continuar</p>
          <AppButton size="sm" onClick={() => router.push('/dashboard/create-child')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Nuevo
          </AppButton>
        </div>

        {children.length === 0 ? (
          <AppCard className="p-12 text-center border-2 border-dashed border-muted bg-transparent shadow-none">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground mb-2">No tienes niños registrados</h3>
            <p className="text-muted-foreground mb-6">Agrega el perfil de un niño para comenzar su plan de aprendizaje.</p>
            <AppButton onClick={() => router.push('/dashboard/create-child')}>
              Agregar mi primer niño
            </AppButton>
          </AppCard>
        ) : (
          <div className="grid gap-4">
            {children.map((child) => (
              <AppCard 
                key={child.id} 
                className="p-4 flex items-center gap-4 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer bg-white"
                onClick={() => router.push(`/dashboard/child/${child.id}`)}
              >
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarImage src={child.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {child.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{child.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full uppercase tracking-wider">
                      TEA {child.tea_level}
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
