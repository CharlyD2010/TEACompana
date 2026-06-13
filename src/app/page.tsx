
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard } from '@/components/app-components';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, handle auth. For now, just redirect to dashboard
    router.push('/dashboard');
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
            />
          </div>

          <AppButton type="submit" className="w-full h-14 text-lg">
            Iniciar Sesión
          </AppButton>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button className="text-sm font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</button>
          <div className="flex flex-col gap-2">
            <AppButton variant="outline" className="w-full" onClick={() => router.push('/register/parent')}>
              Registrar como Padre/Tutor
            </AppButton>
            <AppButton variant="ghost" className="w-full" onClick={() => router.push('/register/teacher')}>
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
