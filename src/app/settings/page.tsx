
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState } from '@/components/app-components';
import { useUser, useAuth } from '@/firebase';
import { LogOut, User, Shield, Info, ChevronRight, Bell } from 'lucide-react';
import { authService } from '@/services/authService';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Configuración" />

      <div className="p-6 space-y-6">
        <AppCard className="p-6 bg-white flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary uppercase leading-none">{user?.displayName || 'Usuario'}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </AppCard>

        <div className="space-y-3">
          <h3 className="text-xs font-black text-muted-foreground uppercase px-2">Preferencias</h3>
          <AppCard className="bg-white divide-y divide-muted">
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary-foreground">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Notificaciones</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent-foreground">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Privacidad y Seguridad</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <Info className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Acerca de TEACompaña</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </AppCard>
        </div>

        <AppButton 
          variant="destructive" 
          className="w-full h-14 text-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none shadow-none"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          CERRAR SESIÓN
        </AppButton>
      </div>
    </div>
  );
}
