'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard, AppLogo } from '@/components/app-components';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/children');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email, password);
      toast({ title: "Bienvenido", description: "Sesión iniciada correctamente." });
      router.push('/children');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "Correo o contraseña incorrectos.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <AppLogo className="mb-6" />
        <h1 className="text-4xl font-black text-primary tracking-tight uppercase">TEACompaña</h1>
        <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-2">Juntos en el camino del aprendizaje</p>
      </div>

      <AppCard className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border-t-4 border-primary shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Correo Electrónico</label>
            <AppInput 
              type="email" 
              placeholder="nombre@ejemplo.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contraseña</label>
              <button 
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <AppInput 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <AppButton type="submit" className="w-full h-14 text-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Iniciar Sesión"}
          </AppButton>
        </form>

        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col gap-2">
            <AppButton variant="outline" className="w-full h-12 text-xs font-black uppercase" onClick={() => router.push('/register-parent')} disabled={loading}>
              Registrar como Padre/Tutor
            </AppButton>
            <AppButton variant="ghost" className="w-full h-12 text-xs font-black uppercase text-muted-foreground" onClick={() => router.push('/register-teacher')} disabled={loading}>
              Registrar como Docente
            </AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
