
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard, AppHeader } from '@/components/app-components';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RegisterTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    inviteCode: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.inviteCode !== 'TEA2024') {
      toast({ variant: "destructive", title: "Código inválido", description: "El código de docente no es válido." });
      return;
    }

    setLoading(true);
    try {
      await authService.registerTeacher(formData.email, formData.password, formData.fullName);
      toast({ title: "Registro exitoso", description: "Bienvenido, profesor" });
      router.push('/children');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error en el registro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <AppHeader title="Registro Docente" />
      <AppCard className="max-w-md mx-auto p-8 mt-10">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Código de Invitación</label>
            <AppInput placeholder="Ej. TEA2024" required value={formData.inviteCode} onChange={e => setFormData({...formData, inviteCode: e.target.value})} disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Nombre Completo</label>
            <AppInput placeholder="Prof. Ana García" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Email</label>
            <AppInput type="email" placeholder="docente@escuela.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Contraseña</label>
            <AppInput type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={loading} />
          </div>
          <AppButton type="submit" className="w-full h-14" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Registrarse como Docente"}
          </AppButton>
        </form>
      </AppCard>
    </div>
  );
}
