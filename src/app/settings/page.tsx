
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState } from '@/components/app-components';
import { useUser, useFirestore } from '@/firebase';
import { LogOut, User, Shield, Info, ChevronRight, Bell, Save, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { AvatarSelector } from '@/components/AvatarSelector';
import { toast } from '@/hooks/use-toast';
import { getAvatarEmoji } from '@/lib/avatars';

export default function SettingsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (user && db) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setProfile(snap.data());
        setLoading(false);
      }
    }
    loadProfile();
  }, [user, db]);

  const handleUpdateAvatar = async (key: string) => {
    if (!user || !db) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { avatarKey: key });
      setProfile(prev => ({ ...prev, avatarKey: key }));
      toast({ title: "Avatar actualizado", description: "Tu perfil se ha actualizado correctamente." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el avatar." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  if (loading || userLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Configuración" />

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <AppCard className="p-8 bg-white flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary text-6xl shadow-inner relative group">
            {profile?.avatarKey ? getAvatarEmoji(profile.avatarKey) : <User className="w-12 h-12" />}
            {saving && <div className="absolute inset-0 bg-white/50 rounded-[2rem] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary uppercase leading-none">{profile?.fullName || 'Usuario'}</h2>
            <p className="text-sm text-muted-foreground mt-2 font-bold uppercase tracking-widest">{profile?.role === 'teacher' ? 'Docente' : 'Padre / Tutor'}</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-70">{user?.email}</p>
          </div>
        </AppCard>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest px-2">Cambia tu Avatar</h3>
          <AppCard className="p-6 bg-white">
            <AvatarSelector 
              selectedKey={profile?.avatarKey} 
              onSelect={handleUpdateAvatar} 
            />
          </AppCard>
        </section>

        <div className="space-y-3">
          <h3 className="text-xs font-black text-muted-foreground uppercase px-2">Preferencias</h3>
          <AppCard className="bg-white divide-y divide-muted">
            <button className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary-foreground">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="font-black text-sm uppercase tracking-wider">Notificaciones</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent-foreground">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-black text-sm uppercase tracking-wider">Privacidad y Seguridad</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Info className="w-5 h-5" />
                </div>
                <span className="font-black text-sm uppercase tracking-wider">Acerca de TEACompaña</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </AppCard>
        </div>

        <AppButton 
          variant="destructive" 
          className="w-full h-16 text-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none shadow-none mt-8"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          CERRAR SESIÓN
        </AppButton>
      </div>
    </div>
  );
}
