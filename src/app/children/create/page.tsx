
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppInput, AppHeader, AppCard, SelectChip } from '@/components/app-components';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Building2 } from 'lucide-react';
import { AvatarSelector } from '@/components/AvatarSelector';
import { institutionService } from '@/services/institutionService';
import { Institution } from '@/lib/types';

const INTERESTS = ['animales', 'música', 'colores', 'números', 'cuentos', 'rutinas', 'rompecabezas'];
const LEARNING_STYLES = ['visual', 'auditivo', 'kinestésico', 'mixto'];
const GROUPS = ['PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

export default function CreateChildPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  
  // Estados para Instituciones
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInst, setLoadingInst] = useState(true);
  const [showNewInst, setShowNewInst] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [savingInst, setSavingInst] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    teaLevel: 'leve' as 'leve' | 'moderado' | 'severo',
    interests: [] as string[],
    learningStyle: 'visual' as any,
    medicalNotes: '',
    institutionId: '',
    institutionName: '',
    groupId: '',
    avatarKey: 'cat',
  });

  // Cargar instituciones al inicio
  useEffect(() => {
    const loadInstitutions = async () => {
      setLoadingInst(true);
      try {
        const data = await institutionService.getInstitutions();
        setInstitutions(data);
        
        // Seleccionar LA-UNI por defecto si existe
        const laUni = data.find(i => i.normalizedName === 'la-uni');
        if (laUni) {
          setFormData(prev => ({ 
            ...prev, 
            institutionId: laUni.id, 
            institutionName: laUni.name 
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInst(false);
      }
    };
    loadInstitutions();
  }, []);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSaveNewInst = async () => {
    const name = newInstName.trim();
    if (name.length < 3) {
      toast({ variant: "destructive", title: "Nombre inválido", description: "La institución debe tener al menos 3 caracteres." });
      return;
    }
    if (name.length > 100) {
      toast({ variant: "destructive", title: "Nombre muy largo", description: "Máximo 100 caracteres." });
      return;
    }

    setSavingInst(true);
    try {
      // Verificar duplicados
      const existing = await institutionService.findByName(name);
      if (existing) {
        // Si existe pero no estaba en la lista cargada (raro), la agregamos localmente
        if (!institutions.find(i => i.id === existing.id)) {
          setInstitutions(prev => [...prev, existing].sort((a, b) => a.name.localeCompare(b.name)));
        }
        setFormData({ ...formData, institutionId: existing.id, institutionName: existing.name });
        toast({ title: "Institución seleccionada", description: "Esta institución ya estaba registrada." });
      } else {
        const created = await institutionService.createInstitution(name, user?.uid || '');
        const newInst: Institution = {
          id: created.id,
          name: created.name,
          normalizedName: name.toLowerCase(),
          active: true,
          createdAt: new Date().toISOString(),
          createdBy: user?.uid || ''
        };
        setInstitutions(prev => [...prev, newInst].sort((a, b) => a.name.localeCompare(b.name)));
        setFormData({ ...formData, institutionId: created.id, institutionName: created.name });
        toast({ title: "Institución agregada correctamente" });
      }
      setShowNewInst(false);
      setNewInstName('');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la institución. Intenta nuevamente." });
    } finally {
      setSavingInst(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.groupId || !formData.institutionId || !user || !db) {
      toast({ 
        variant: "destructive", 
        title: "Campos incompletos", 
        description: "Por favor completa el nombre, institución y selecciona un grupo." 
      });
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
        institution: formData.institutionName, // Compatibilidad
        avatarUrl: `https://picsum.photos/seed/${formData.name}/200/200`,
        points: 0,
        stars: 0,
        createdAt: new Date().toISOString(),
        summary: {
          totalSessions: 0,
          totalPoints: 0,
          totalStars: 0,
          totalCorrectAnswers: 0,
          totalIncorrectAnswers: 0,
          totalQuestions: 0,
          totalDurationSeconds: 0,
        }
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

          <div className="space-y-3">
            <label className="text-xs font-black text-primary uppercase tracking-widest block ml-2">Institución</label>
            {!showNewInst ? (
              <div className="space-y-3">
                <div className="relative group">
                  <select 
                    className="w-full h-14 rounded-2xl border-2 border-muted bg-white px-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-all disabled:opacity-50"
                    value={formData.institutionId}
                    onChange={e => {
                      if (e.target.value === 'new') {
                        setShowNewInst(true);
                      } else {
                        const inst = institutions.find(i => i.id === e.target.value);
                        if (inst) setFormData({ ...formData, institutionId: inst.id, institutionName: inst.name });
                      }
                    }}
                    disabled={loadingInst || loading}
                    aria-label="Selecciona una institución"
                  >
                    <option value="" disabled>Selecciona una institución</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                    <option value="new" className="text-primary font-black">+ Agregar otra institución</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                {loadingInst && <p className="text-[10px] font-bold text-muted-foreground ml-2 animate-pulse uppercase tracking-widest">Obteniendo lista de instituciones...</p>}
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-muted/20 p-4 rounded-[2rem] border-2 border-dashed border-primary/20">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-2">Nueva Institución</p>
                  <AppInput 
                    placeholder="Escribe el nombre de la institución" 
                    value={newInstName}
                    onChange={e => setNewInstName(e.target.value)}
                    disabled={savingInst}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <AppButton 
                    className="flex-1 h-12 bg-secondary text-secondary-foreground" 
                    onClick={handleSaveNewInst}
                    disabled={savingInst}
                  >
                    {savingInst ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar"}
                  </AppButton>
                  <AppButton 
                    variant="ghost" 
                    className="flex-1 h-12 text-muted-foreground font-black uppercase text-[10px]" 
                    onClick={() => { setShowNewInst(false); setNewInstName(''); }}
                    disabled={savingInst}
                  >
                    Cancelar
                  </AppButton>
                </div>
              </div>
            )}
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

          <AppButton className="w-full h-16 text-lg" onClick={handleSave} disabled={loading || savingInst}>
            {loading ? <Loader2 className="animate-spin" /> : "Guardar Perfil"}
          </AppButton>
        </AppCard>
      </div>
    </div>
  );
}
