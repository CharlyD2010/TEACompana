
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppHeader, AppCard, SelectChip } from '@/components/app-components';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AvatarSelector } from '@/components/AvatarSelector';

const INTERESTS = ['animales', 'música', 'colores', 'números', 'cuentos', 'rutinas', 'rompecabezas'];
const LEARNING_STYLES = ['visual', 'auditivo', 'kinestésico', 'mixto'];
const GROUPS = ['PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

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
    institutionId: 'la-uni',
    institutionName: 'LA-UNI',
    groupId: '',
    avatarKey: 'cat',
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
    if (!formData.name || !formData.groupId || !user || !db) {
      toast({ variant: "destructive", title: "Campos incompletos", description: "Por favor completa el nombre y selecciona un grupo." });
      return;
    }
    
    setLoading(true);
    const childId = Math.random().toString(36).substr(2, 9);
    const childRef = doc(db, 'children', childId);

    try {
      await setDoc(childRef, {
        ...formData,
        id: childId,
        createdBy: user.uid,
        groupName: formData.groupId,
        avatarUrl: `https://picsum.photos/seed/${formData.name}/200/200`,
        points: 0,
        stars: 0,
        createdAt: new Date().toISOString(),
      });

      const accessId = `${user.uid}_${childId}`;
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
      
      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <AppCard className="p-6 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Elige un Avatar</label>
            <AvatarSelector 
              selectedKey={formData.avatarKey} 
              onSelect={(key) => setFormData({ ...formData, avatarKey: key })} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Institución</label>
            <AppInput 
              value="LA-UNI" 
              disabled={true}
              className="bg-muted opacity-80"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Grupo Académico</label>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((group) => (
                <SelectChip
                  key={group}
                  label={group}
                  selected={formData.groupId === group}
                  onClick={() => setFormData({ ...formData, groupId: group })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Nombre Completo</label>
            <AppInput 
              placeholder="Ej. Juan Pérez" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Fecha de Nacimiento</label>
            <AppInput 
              type="date" 
              value={formData.birthDate}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Nivel de TEA</label>
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
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Intereses</label>
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
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Estilo de Aprendizaje</label>
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
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Notas Médicas</label>
            <Textarea 
              placeholder="Alergias, medicamentos, detonantes..." 
              className="rounded-2xl border-2 min-h-[100px] font-bold text-sm"
              value={formData.medicalNotes}
              onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
              disabled={loading}
            />
          </div>

          <AppButton className="w-full h-16 text-lg" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Guardar Perfil"}
          </AppButton>
        </AppCard>
      </div>
    </div>
  );
}
