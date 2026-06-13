
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard, AppHeader } from '@/components/app-components';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RegisterParentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.registerParent(formData.email, formData.password, formData.fullName);
      toast({ title: "Registro exitoso", description: "Bienvenido a TEACompaña" });
      router.push('/children');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error en el registro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <AppHeader title="Registro Padre" />
      <AppCard className="max-w-md mx-auto p-8 mt-10">
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Nombre Completo</label>
            <AppInput placeholder="Juan Pérez" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Email</label>
            <AppInput type="email" placeholder="email@ejemplo.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Contraseña</label>
            <AppInput type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={loading} />
          </div>
          <AppButton type="submit" className="w-full h-14" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Registrarse"}
          </AppButton>
        </form>
      </AppCard>
    </div>
  );
}
