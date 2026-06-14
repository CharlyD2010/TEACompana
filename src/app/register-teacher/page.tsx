
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppCard, AppHeader } from '@/components/app-components';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';
import { Loader2, GraduationCap } from 'lucide-react';

/**
 * Pantalla de registro para docentes.
 * Valida un código de invitación específico para permitir la creación de cuentas con rol 'teacher'.
 */
export default function RegisterTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    inviteCode: '',
  });

  // Código de invitación autorizado
  const VALID_TEACHER_CODE = 'DOCENTE2026';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación del código de invitación
    if (formData.inviteCode !== VALID_TEACHER_CODE) {
      toast({ 
        variant: "destructive", 
        title: "Código inválido", 
        description: "El código de docente no es válido. Por favor, solicita el código actual a tu administrador." 
      });
      return;
    }

    setLoading(true);
    try {
      await authService.registerTeacher(formData.email, formData.password, formData.fullName);
      toast({ 
        title: "¡Bienvenido, Docente!", 
        description: "Tu cuenta ha sido creada exitosamente. Ahora puedes gestionar perfiles de alumnos." 
      });
      router.push('/children');
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error en el registro", 
        description: error.message || "No se pudo crear la cuenta." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <AppHeader title="Registro Docente" />
      
      <div className="w-full max-w-md mt-10">
        <AppCard className="p-8 space-y-8 bg-white/80 backdrop-blur-sm border-t-4 border-secondary shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto text-secondary">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-primary uppercase">Crea tu cuenta</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Exclusivo para profesionales de la educación</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Código de Invitación</label>
              <AppInput 
                placeholder="Ej. DOCENTE2026" 
                required 
                value={formData.inviteCode} 
                onChange={e => setFormData({...formData, inviteCode: e.target.value})} 
                disabled={loading}
                className="uppercase placeholder:normal-case"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Nombre Completo</label>
              <AppInput 
                placeholder="Prof. Ana García" 
                required 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                disabled={loading} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Email Institucional</label>
              <AppInput 
                type="email" 
                placeholder="docente@escuela.com" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                disabled={loading} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Contraseña</label>
              <AppInput 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                disabled={loading} 
              />
            </div>

            <AppButton type="submit" className="w-full h-14 text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Registrarse como Docente"}
            </AppButton>
          </form>

          <div className="text-center">
            <AppButton variant="ghost" className="text-xs font-black uppercase text-muted-foreground" onClick={() => router.push('/')} disabled={loading}>
              Volver al inicio
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
