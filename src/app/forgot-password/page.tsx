'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard, AppLogo, AppHeader } from '@/components/app-components';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ variant: "destructive", title: "Atención", description: "Ingresa tu correo electrónico." });
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSent(true);
      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada o spam." });
    } catch (error: any) {
      console.error(error);
      let message = "No se pudo enviar el correo. Intenta nuevamente.";
      if (error.code === 'auth/user-not-found') {
        message = "No existe una cuenta con este correo.";
      } else if (error.code === 'auth/invalid-email') {
        message = "El correo no es válido.";
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <AppLogo className="mb-6" />
        <h1 className="text-4xl font-black text-primary tracking-tight uppercase leading-none">Recuperar Acceso</h1>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mt-3">Te ayudaremos a volver</p>
      </div>

      <AppCard className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border-t-4 border-primary shadow-2xl relative">
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Mail className="w-8 h-8" />
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña de forma segura.
              </p>
            </div>

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

            <AppButton type="submit" className="w-full h-14 text-lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Enviar Instrucciones"}
            </AppButton>
          </form>
        ) : (
          <div className="space-y-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Mail className="w-10 h-10 text-secondary-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-primary uppercase">¡Correo Enviado!</h2>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">
                Hemos enviado las instrucciones a <strong>{email}</strong>. Por favor, revisa tu correo para continuar.
              </p>
            </div>
            <AppButton onClick={() => router.push('/')} className="w-full h-14 bg-secondary text-secondary-foreground">
              Volver al Inicio de Sesión
            </AppButton>
          </div>
        )}

        {!sent && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 w-full text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Volver al Inicio
            </button>
          </div>
        )}
      </AppCard>
    </div>
  );
}
