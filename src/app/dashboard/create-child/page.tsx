
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppHeader, AppCard, SelectChip } from '@/components/app-components';
import { mockDb, ChildProfile } from '@/lib/mock-db';
import { Textarea } from '@/components/ui/textarea';

const INTERESTS = ['animales', 'música', 'colores', 'números', 'cuentos', 'rutinas', 'rompecabezas'];
const LEARNING_STYLES = ['visual', 'auditivo', 'kinestésico', 'mixto'];

export default function CreateChildPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<ChildProfile>>({
    name: '',
    birth_date: '',
    tea_level: 'leve',
    interests: [],
    learning_style: 'visual',
    medical_notes: '',
  });

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const handleSave = () => {
    if (!formData.name) return;
    const newChild: ChildProfile = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      parent_id: 'parent1',
      avatar_url: `https://picsum.photos/seed/${formData.name}/200/200`,
      points: 0,
      stars: 0,
    } as ChildProfile;
    
    mockDb.saveChild(newChild);
    router.push('/dashboard');
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
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Fecha de Nacimiento</label>
            <AppInput 
              type="date" 
              value={formData.birth_date}
              onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-muted-foreground block">Nivel de TEA</label>
            <div className="flex gap-2">
              {['leve', 'moderado', 'severo'].map((level) => (
                <SelectChip
                  key={level}
                  label={level.toUpperCase()}
                  selected={formData.tea_level === level}
                  onClick={() => setFormData({ ...formData, tea_level: level as any })}
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
                  selected={formData.interests?.includes(interest) || false}
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
                  selected={formData.learning_style === style}
                  onClick={() => setFormData({ ...formData, learning_style: style as any })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Notas Médicas (Opcional)</label>
            <Textarea 
              placeholder="Alergias, medicamentos, detonantes..." 
              className="rounded-xl border-2 min-h-[100px]"
              value={formData.medical_notes}
              onChange={e => setFormData({ ...formData, medical_notes: e.target.value })}
            />
          </div>

          <AppButton className="w-full h-14 text-lg" onClick={handleSave}>
            Guardar Perfil
          </AppButton>
        </AppCard>
      </div>
    </div>
  );
}
