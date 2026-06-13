
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton } from '@/components/app-components';
import { generateLearningPlan, GenerateLearningPlanOutput } from '@/ai/flows/generate-personalized-learning-plan';
import { Loader2, Sparkles, CheckCircle2, Lightbulb, Users, GraduationCap, Target } from 'lucide-react';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, setDoc } from 'firebase/firestore';

export default function LearningPlanPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const { data: child } = useDoc(doc(db!, 'children', childId as string));
  const assessmentsQuery = query(
    collection(db!, 'children', childId as string, 'assessments'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const { data: assessments, loading: assessmentLoading } = useCollection(assessmentsQuery);
  const [plan, setPlan] = useState<GenerateLearningPlanOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (child && assessments?.length > 0) {
      // Check if we already have a plan for this assessment or generate new one
      generatePlan(child, assessments[0]);
    }
  }, [child, assessments]);

  async function generatePlan(childData: any, assessmentData: any) {
    setLoading(true);
    try {
      const result = await generateLearningPlan({
        childName: childData.name,
        teaLevel: childData.teaLevel,
        interests: childData.interests,
        learningStyle: childData.learningStyle,
        assessmentResults: assessmentData.scores,
      });
      setPlan(result);
      
      // Save plan to Firestore
      const planId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db!, 'children', childId as string, 'learning_plans', planId), {
        ...result,
        id: planId,
        childId,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (assessmentLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="font-bold text-primary">Generando plan personalizado...</p>
      </div>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AppHeader title="Plan de Aprendizaje" />
        <AppCard className="p-12 text-center space-y-6">
          <Sparkles className="w-16 h-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-bold">Sin evaluación previa</h3>
          <p className="text-muted-foreground">Debes completar la evaluación inicial primero.</p>
          <AppButton onClick={() => router.push(`/child/${childId}/assessment`)}>Ir a Evaluación</AppButton>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Plan de Aprendizaje" />
      <div className="p-6 space-y-6">
        {plan && (
          <div className="space-y-6">
            <AppCard className="p-6 bg-primary text-white space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-accent text-accent" />
                <h3 className="text-lg font-black uppercase tracking-wider">Perfil Analizado</h3>
              </div>
              <p className="text-sm opacity-90">Basado en la evaluación de {child?.name}, hemos priorizado las siguientes áreas.</p>
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

            <AppButton className="w-full h-14" onClick={() => router.push(`/child/${childId}/child-mode`)}>
              Comenzar Actividades
            </AppButton>
          </div>
        )}
      </div>
    </div>
  );
}
