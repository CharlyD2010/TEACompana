'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton } from '@/components/app-components';
import { generateLearningPlan, GenerateLearningPlanOutput } from '@/ai/flows/generate-personalized-learning-plan';
import { Loader2, Sparkles, CheckCircle2, Lightbulb, Users, GraduationCap, Target, AlertCircle } from 'lucide-react';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, setDoc } from 'firebase/firestore';

export default function LearningPlanPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const { data: child, loading: childLoading } = useDoc(db && childId ? doc(db, 'children', childId as string) : null);
  
  const assessmentsQuery = db && childId ? query(
    collection(db, 'children', childId as string, 'assessments'),
    orderBy('createdAt', 'desc'),
    limit(1)
  ) : null;
  
  const { data: assessments, loading: assessmentLoading } = useCollection(assessmentsQuery);
  
  const plansQuery = db && childId ? query(
    collection(db, 'children', childId as string, 'learning_plans'),
    orderBy('createdAt', 'desc'),
    limit(1)
  ) : null;
  
  const { data: plans, loading: planLoading } = useCollection(plansQuery);

  const [localPlan, setLocalPlan] = useState<GenerateLearningPlanOutput | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (plans && plans.length > 0) {
      setLocalPlan(plans[0] as unknown as GenerateLearningPlanOutput);
    }
  }, [plans]);

  async function handleGenerateNewPlan() {
    if (!child || !assessments || assessments.length === 0 || !db) return;
    
    setGenerating(true);
    try {
      const result = await generateLearningPlan({
        childName: child.name,
        teaLevel: child.teaLevel,
        interests: child.interests || [],
        learningStyle: child.learningStyle,
        assessmentResults: assessments[0].scores,
      });
      
      const planId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'children', childId as string, 'learning_plans', planId), {
        ...result,
        id: planId,
        childId,
        createdAt: new Date().toISOString(),
      });
      
      setLocalPlan(result);
      toast({ title: "Plan generado", description: "El plan de aprendizaje ha sido actualizado." });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  if (childLoading || assessmentLoading || planLoading || generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-bold text-primary">Procesando información...</p>
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Plan de Aprendizaje" />
        <div className="p-6">
          <AppCard className="p-12 text-center space-y-6 bg-white">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-bold">Evaluación requerida</h3>
            <p className="text-muted-foreground">Para generar un plan impulsado por IA, primero debemos realizar la evaluación inicial.</p>
            <AppButton onClick={() => router.push(`/child/${childId}/assessment`)}>Ir a Evaluación</AppButton>
          </AppCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Plan de Aprendizaje" />
      <div className="p-6 space-y-6">
        {localPlan ? (
          <div className="space-y-6">
            <AppCard className="p-6 bg-primary text-white space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-accent text-accent" />
                <h3 className="text-lg font-black uppercase tracking-wider">Plan Personalizado</h3>
              </div>
              <p className="text-sm opacity-90">Estrategias recomendadas para {child?.name}.</p>
            </AppCard>

            <section className="space-y-3">
              <h4 className="flex items-center gap-2 font-black text-primary uppercase text-xs">
                <Target className="w-4 h-4" /> Áreas Prioritarias
              </h4>
              <div className="flex flex-wrap gap-2">
                {localPlan.priorityAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-[10px] font-bold border border-primary/20">{area}</span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-xs">
                <CheckCircle2 className="w-4 h-4" /> Objetivos Semanales
              </h4>
              <div className="grid gap-3">
                {localPlan.weeklyGoals.map((goal, i) => (
                  <AppCard key={i} className="p-4 bg-white/60 border-l-4 border-l-secondary shadow-sm">
                    <p className="text-sm font-medium">{goal}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <AppButton className="w-full h-14" onClick={() => router.push(`/child/${childId}/child-mode`)}>
              Comenzar Actividades
            </AppButton>
            
            <AppButton variant="ghost" className="w-full text-muted-foreground" onClick={handleGenerateNewPlan}>
              Regenerar Plan con IA
            </AppButton>
          </div>
        ) : (
          <AppCard className="p-12 text-center space-y-6 bg-white">
            <Sparkles className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <h3 className="text-xl font-bold">Plan no generado</h3>
            <p className="text-muted-foreground">Haz clic abajo para crear el primer plan basado en la evaluación reciente.</p>
            <AppButton onClick={handleGenerateNewPlan}>Generar Plan ahora</AppButton>
          </AppCard>
        )}
      </div>
    </div>
  );
}

const Target = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
