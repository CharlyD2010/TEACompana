
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState, EmptyState } from '@/components/app-components';
import { generateLearningPlan, GenerateLearningPlanOutput } from '@/ai/flows/generate-personalized-learning-plan';
import { Sparkles, CheckCircle2, Lightbulb, Users, GraduationCap, AlertCircle } from 'lucide-react';
import { useDoc, useFirestore, useCollection, useUser } from '@/firebase';
import { doc, collection, query, orderBy, limit, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function LearningPlanPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  
  const childRef = useMemo(() => db && childId ? doc(db, 'children', childId as string) : null, [db, childId]);
  const { data: child, loading: childLoading } = useDoc(childRef);
  
  const assessmentsQuery = useMemo(() => db && childId ? query(
    collection(db, 'children', childId as string, 'assessments'),
    orderBy('createdAt', 'desc'),
    limit(1)
  ) : null, [db, childId]);
  
  const { data: assessments, loading: assessmentLoading } = useCollection(assessmentsQuery);
  
  const plansQuery = useMemo(() => db && childId ? query(
    collection(db, 'children', childId as string, 'learning_plans'),
    orderBy('createdAt', 'desc'),
    limit(1)
  ) : null, [db, childId]);
  
  const { data: plans, loading: planLoading } = useCollection(plansQuery);

  const [generating, setGenerating] = useState(false);

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
      
      toast({ title: "Plan generado", description: "El plan de aprendizaje ha sido actualizado." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error de IA", description: "No se pudo generar el plan en este momento." });
    } finally {
      setGenerating(false);
    }
  }

  if (childLoading || assessmentLoading || planLoading || generating) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingState message={generating ? "Nuestra IA está trabajando..." : "Cargando plan..."} /></div>;
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Plan de Aprendizaje" />
        <div className="p-6">
          <EmptyState 
            title="Evaluación necesaria" 
            description="Para generar un plan personalizado impulsado por IA, primero debemos realizar la evaluación inicial del niño." 
            actionLabel="Ir a Evaluación"
            onAction={() => router.push(`/child/${childId}/assessment`)}
          />
        </div>
      </div>
    );
  }

  const localPlan = plans?.[0] as unknown as GenerateLearningPlanOutput | undefined;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Plan de Aprendizaje" />
      <div className="p-6 space-y-6">
        {localPlan ? (
          <div className="space-y-6">
            <AppCard className="p-6 bg-primary text-white space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-accent text-accent" />
                <h3 className="text-lg font-black uppercase tracking-wider">Plan para {child?.name}</h3>
              </div>
              <p className="text-sm opacity-90 font-medium italic">"IA generada basándose en las necesidades actuales."</p>
            </AppCard>

            <section className="space-y-3">
              <h4 className="flex items-center gap-2 font-black text-primary uppercase text-[10px] tracking-widest">Áreas Prioritarias</h4>
              <div className="flex flex-wrap gap-2">
                {localPlan.priorityAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase border-2 border-primary/20 text-primary">{area}</span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-[10px] tracking-widest">Objetivos Semanales</h4>
              <div className="grid gap-3">
                {localPlan.weeklyGoals.map((goal, i) => (
                  <AppCard key={i} className="p-4 bg-white/60 border-l-8 border-l-secondary shadow-sm">
                    <p className="text-sm font-bold text-secondary-foreground">{goal}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-accent-foreground uppercase text-[10px] tracking-widest">Actividades Sugeridas</h4>
              <div className="grid gap-3">
                {localPlan.recommendedActivities.map((activity, i) => (
                  <AppCard key={i} className="p-4 bg-accent/10 border-none flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-accent-foreground font-black text-xs">{i+1}</div>
                    <p className="text-sm font-bold">{activity}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <div className="grid gap-4">
              <AppButton className="w-full h-16 text-lg" onClick={() => router.push(`/child/${childId}/child-mode`)}>
                EMPEZAR ACTIVIDADES
              </AppButton>
              <AppButton variant="ghost" className="w-full text-muted-foreground font-black text-xs" onClick={handleGenerateNewPlan}>
                REGENERAR PLAN CON IA
              </AppButton>
            </div>
          </div>
        ) : (
          <EmptyState 
            title="Plan no generado" 
            description="Hemos analizado la evaluación. Haz clic abajo para generar el primer plan impulsado por inteligencia artificial." 
            actionLabel="Generar Plan ahora"
            onAction={handleGenerateNewPlan}
          />
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
