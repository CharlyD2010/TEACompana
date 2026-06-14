
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState } from '@/components/app-components';
import { useUser, useFirestore } from '@/firebase';
import { LogOut, User, Shield, Info, ChevronRight, Bell, Save, Loader2, Star } from 'lucide-react';
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

  const showPlaceholderToast = (title: string) => {
    toast({
      title: title,
      description: "Esta funcionalidad estará disponible en la próxima actualización.",
    });
  };

  if (loading || userLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Configuración" />

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <AppCard className="p-8 bg-white flex flex-col items-center text-center space-y-6 shadow-2xl shadow-primary/5">
          <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary text-6xl shadow-inner relative group border-4 border-white">
            {profile?.avatarKey ? getAvatarEmoji(profile.avatarKey) : <User className="w-12 h-12" />}
            {saving && <div className="absolute inset-0 bg-white/50 rounded-[2rem] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-primary uppercase leading-none tracking-tighter">
              {profile?.fullName || 'Usuario'}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[10px] font-black bg-secondary/20 text-secondary-foreground px-4 py-1 rounded-full uppercase tracking-widest">
                {profile?.role === 'teacher' ? 'Docente' : 'Padre / Tutor'}
              </span>
              <span className="text-[10px] font-black bg-primary/10 text-primary px-4 py-1 rounded-full uppercase tracking-widest">
                {profile?.institutionName || 'LA-UNI'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase opacity-60">{user?.email}</p>
          </div>
        </AppCard>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest px-2 flex items-center gap-2">
             <Star className="w-3 h-3 fill-primary" /> Personaliza tu Avatar
          </h3>
          <AppCard className="p-6 bg-white shadow-xl shadow-black/5">
            <AvatarSelector 
              selectedKey={profile?.avatarKey} 
              onSelect={handleUpdateAvatar} 
            />
          </AppCard>
        </section>

        <div className="space-y-3">
          <h3 className="text-xs font-black text-muted-foreground uppercase px-2">Preferencias y App</h3>
          <AppCard className="bg-white divide-y divide-muted shadow-xl shadow-black/5">
            <button 
              onClick={() => showPlaceholderToast("Notificaciones")}
              className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary-foreground shadow-sm">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="block font-black text-sm uppercase tracking-wider text-primary">Notificaciones</span>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Configurar avisos y alertas</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </button>

            <button 
              onClick={() => showPlaceholderToast("Privacidad")}
              className="w-full p-6 flex items-center justify-between hover:bg-accent/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent-foreground shadow-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="block font-black text-sm uppercase tracking-wider text-primary">Privacidad y Seguridad</span>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Tus datos están seguros</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </button>

            <button 
              onClick={() => router.push('/settings/about')}
              className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Info className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <span className="block font-black text-sm uppercase tracking-wider text-primary">Acerca de TEACompaña</span>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase">Misión y responsables del proyecto</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </button>
          </AppCard>
        </div>

        <div className="pt-8 space-y-4">
          <AppButton 
            variant="destructive" 
            className="w-full h-16 text-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none shadow-none rounded-[2rem]"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            CERRAR SESIÓN
          </AppButton>
          
          <p className="text-[10px] text-center font-black text-muted-foreground uppercase tracking-widest opacity-40">
            TEACompaña v1.0 • LA-UNI 2026
          </p>
        </div>
      </div>
    </div>
  );
}
