
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader, AppCard, AppButton, ProgressBar } from '@/components/app-components';
import { mockDb, ChildProfile } from '@/lib/mock-db';
import { Slider } from '@/components/ui/slider';

const AREAS = [
  { id: 'emociones', label: 'Emociones', desc: 'Capacidad para reconocer y expresar sentimientos.' },
  { id: 'comunicacion', label: 'Comunicación', desc: 'Uso de lenguaje verbal o no verbal para expresarse.' },
  { id: 'social', label: 'Social', desc: 'Interacción con otras personas y juego compartido.' },
  { id: 'cognitivo', label: 'Cognitivo', desc: 'Atención, memoria y resolución de problemas.' },
  { id: 'motricidad', label: 'Motricidad', desc: 'Coordinación de movimientos finos y gruesos.' },
  { id: 'rutinas', label: 'Rutinas', desc: 'Seguimiento de horarios y actividades diarias.' },
];

const SCALE_LABELS: Record<number, string> = {
  1: 'Requiere mucho apoyo',
  2: 'Requiere apoyo frecuente',
  3: 'Requiere apoyo moderado',
  4: 'Lo realiza con poco apoyo',
  5: 'Independiente',
};

export default function AssessmentPage() {
  const router = useRouter();
  const { id } = useParams();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    emociones: 3,
    comunicacion: 3,
    social: 3,
    cognitivo: 3,
    motricidad: 3,
    rutinas: 3,
  });

  useEffect(() => {
    if (id) {
      const c = mockDb.getChild(id as string);
      if (c) setChild(c);
    }
  }, [id]);

  const currentArea = AREAS[step];
  const progress = ((step + 1) / AREAS.length) * 100;

  const handleNext = () => {
    if (step < AREAS.length - 1) {
      setStep(step + 1);
    } else {
      mockDb.saveAssessment({
        id: Math.random().toString(),
        child_id: id as string,
        scores: scores as any,
        created_at: new Date().toISOString(),
      });
      router.push(`/dashboard/child/${id}/plan`);
    }
  };

  if (!child) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Evaluación Inicial" />
      
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
            <span>Paso {step + 1} de {AREAS.length}</span>
            <span>{currentArea.label}</span>
          </div>
          <ProgressBar value={progress} color="bg-primary" />
        </div>

        <AppCard className="p-8 space-y-8 bg-white min-h-[400px] flex flex-col justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-primary">{currentArea.label}</h2>
            <p className="text-muted-foreground">{currentArea.desc}</p>
          </div>

          <div className="space-y-12 py-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-secondary-foreground">{scores[currentArea.id]}</div>
              <div className="text-lg font-bold text-primary">{SCALE_LABELS[scores[currentArea.id]]}</div>
            </div>

            <Slider
              value={[scores[currentArea.id]]}
              onValueChange={([val]) => setScores({ ...scores, [currentArea.id]: val })}
              min={1}
              max={5}
              step={1}
              className="py-4"
            />
            
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase px-2">
              <span>Nivel 1</span>
              <span>Nivel 5</span>
            </div>
          </div>
        </AppCard>

        <div className="flex gap-4">
          {step > 0 && (
            <AppButton variant="outline" className="flex-1 h-14" onClick={() => setStep(step - 1)}>
              Anterior
            </AppButton>
          )}
          <AppButton className="flex-1 h-14" onClick={handleNext}>
            {step === AREAS.length - 1 ? 'Finalizar' : 'Siguiente'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
