
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppHeader, AppCard, SelectChip } from '@/components/app-components';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const INTERESTS = ['animales', 'música', 'colores', 'números', 'cuentos', 'rutinas', 'rompecabezas'];
const LEARNING_STYLES = ['visual', 'auditivo', 'kinestésico', 'mixto'];

export default function CreateChildPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    teaLevel: 'leve' as 'leve' | 'moderado' | 'severo',
    interests: [] as string[],
    learningStyle: 'visual' as any,
    medicalNotes: '',
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !user || !db) return;
    
    setLoading(true);
    const childId = Math.random().toString(36).substr(2, 9);
    const childRef = doc(db, 'children', childId);

    try {
      await setDoc(childRef, {
        ...formData,
        id: childId,
        createdBy: user.uid,
        avatarUrl: `https://picsum.photos/seed/${formData.name}/200/200`,
        points: 0,
        stars: 0,
        createdAt: new Date().toISOString(),
      });

      // Crear registro de acceso
      const accessId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'child_access', accessId), {
        id: accessId,
        childId,
        userId: user.uid,
        role: 'owner',
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      toast({ title: "Perfil creado con éxito" });
      router.push(`/child/${childId}/dashboard`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error al guardar", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Registrar Niño" />
      
      <div className="p-6 space-y-8">
        <AppCard className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Nombre Completo</label>
            <AppInput 
              placeholder="Ej. Juan Pérez" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Fecha de Nacimiento</label>
            <AppInput 
              type="date" 
              value={formData.birthDate}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-muted-foreground block">Nivel de TEA</label>
            <div className="flex gap-2">
              {['leve', 'moderado', 'severo'].map((level) => (
                <SelectChip
                  key={level}
                  label={level.toUpperCase()}
                  selected={formData.teaLevel === level}
                  onClick={() => setFormData({ ...formData, teaLevel: level as any })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-muted-foreground block">Intereses</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <SelectChip
                  key={interest}
                  label={interest}
                  selected={formData.interests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-muted-foreground block">Estilo de Aprendizaje</label>
            <div className="flex flex-wrap gap-2">
              {LEARNING_STYLES.map((style) => (
                <SelectChip
                  key={style}
                  label={style.toUpperCase()}
                  selected={formData.learningStyle === style}
                  onClick={() => setFormData({ ...formData, learningStyle: style as any })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Notas Médicas (Opcional)</label>
            <Textarea 
              placeholder="Alergias, medicamentos, detonantes..." 
              className="rounded-xl border-2 min-h-[100px]"
              value={formData.medicalNotes}
              onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
              disabled={loading}
            />
          </div>

          <AppButton className="w-full h-14 text-lg" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Guardar Perfil"}
          </AppButton>
        </AppCard>
      </div>
    </div>
  );
}
