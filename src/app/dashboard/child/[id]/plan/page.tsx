
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton } from '@/components/app-components';
import { mockDb, ChildProfile, Assessment } from '@/lib/mock-db';
import { generateLearningPlan, GenerateLearningPlanOutput } from '@/ai/flows/generate-personalized-learning-plan';
import { Loader2, Sparkles, CheckCircle2, Lightbulb, Users, GraduationCap } from 'lucide-react';

export default function LearningPlanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<GenerateLearningPlanOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const c = mockDb.getChild(id as string);
      const a = mockDb.getAssessment(id as string);
      setChild(c || null);
      setAssessment(a || null);
      
      if (c && a) {
        generatePlan(c, a);
      }
    }
  }, [id]);

  async function generatePlan(childData: ChildProfile, assessmentData: Assessment) {
    setLoading(true);
    try {
      const result = await generateLearningPlan({
        childName: childData.name,
        teaLevel: childData.tea_level,
        interests: childData.interests,
        learningStyle: childData.learning_style,
        assessmentResults: assessmentData.scores,
      });
      setPlan(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!child) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Plan de Aprendizaje" />

      <div className="p-6 space-y-6">
        {!assessment ? (
          <AppCard className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No hay plan de aprendizaje</h3>
            <p className="text-muted-foreground">Completa la evaluación inicial para generar un plan personalizado impulsado por IA.</p>
            <AppButton onClick={() => router.push(`/dashboard/child/${id}/assessment`)}>
              Realizar Evaluación
            </AppButton>
          </AppCard>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-primary">Generando plan personalizado...</p>
            <p className="text-xs text-muted-foreground px-12 text-center">Nuestra IA está analizando los resultados de la evaluación de {child.name}.</p>
          </div>
        ) : plan ? (
          <div className="space-y-6">
            <AppCard className="p-6 bg-primary text-white space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-accent text-accent" />
                <h3 className="text-lg font-black uppercase tracking-wider">Perfil Analizado</h3>
              </div>
              <p className="text-sm opacity-90">Basado en la evaluación de {child.name}, hemos priorizado las siguientes áreas de desarrollo.</p>
            </AppCard>

            <section className="space-y-3">
              <h4 className="flex items-center gap-2 font-black text-primary uppercase text-sm">
                <Target className="w-4 h-4" /> Áreas Prioritarias
              </h4>
              <div className="flex flex-wrap gap-2">
                {plan.priorityAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-xs font-bold border border-primary/20">{area}</span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-sm">
                <CheckCircle2 className="w-4 h-4" /> Objetivos Semanales
              </h4>
              <div className="grid gap-3">
                {plan.weeklyGoals.map((goal, i) => (
                  <AppCard key={i} className="p-4 bg-white/60 border-l-4 border-l-secondary shadow-sm">
                    <p className="text-sm font-medium">{goal}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-accent-foreground uppercase text-sm">
                <Lightbulb className="w-4 h-4" /> Actividades Recomendadas
              </h4>
              <div className="grid gap-3">
                {plan.recommendedActivities.map((activity, i) => (
                  <AppCard key={i} className="p-4 bg-accent/10 border-none shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-black text-xs">{i+1}</span>
                    </div>
                    <p className="text-sm font-medium">{activity}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <AppCard className="p-6 bg-white space-y-6">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-black text-primary uppercase text-sm">
                  <Users className="w-4 h-4" /> Para Padres
                </h4>
                <ul className="space-y-2">
                  {plan.suggestionsForParents.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-muted"></div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-sm">
                  <GraduationCap className="w-4 h-4" /> Para Docentes
                </h4>
                <ul className="space-y-2">
                  {plan.suggestionsForTeachers.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-secondary-foreground">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </AppCard>

            <AppButton className="w-full h-14" onClick={() => router.push(`/dashboard/child/${id}/kid-mode`)}>
              Comenzar Actividades
            </AppButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Hallucinated icons needed
const Target = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
