
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard } from '@/components/app-components';
import { Heart, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
          <Heart className="w-12 h-12 text-white fill-white" />
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">TEACompaña</h1>
        <p className="text-muted-foreground font-medium">Juntos en el camino del aprendizaje</p>
      </div>

      <AppCard className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground ml-2">Correo Electrónico</label>
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
            <label className="text-sm font-bold text-muted-foreground ml-2">Contraseña</label>
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
            <AppButton variant="outline" className="w-full" onClick={() => router.push('/register-parent')} disabled={loading}>
              Registrar como Padre/Tutor
            </AppButton>
            <AppButton variant="ghost" className="w-full" onClick={() => router.push('/register-teacher')} disabled={loading}>
              Registrar como Docente
            </AppButton>
          </div>
        </div>
      </AppCard>

      <p className="mt-12 text-xs text-muted-foreground text-center max-w-xs">
        Al continuar, aceptas nuestros términos de servicio y políticas de privacidad.
      </p>
    </div>
  );
}
