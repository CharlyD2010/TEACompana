'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState, EmptyState } from '@/components/app-components';
import { generateLearningPlan, GenerateLearningPlanOutput } from '@/ai/flows/generate-personalized-learning-plan';
import { Sparkles, LayoutDashboard, RotateCcw, Target, BookOpen, Lightbulb, GraduationCap, Users } from 'lucide-react';
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

  // Fallback plan in case AI fails
  const generateFallbackPlan = useCallback((childData: any, assessmentScores: any): GenerateLearningPlanOutput => {
    const areas = [
      { id: 'emociones', label: 'Emociones', score: assessmentScores.emociones || 3 },
      { id: 'comunicacion', label: 'Comunicación', score: assessmentScores.comunicacion || 3 },
      { id: 'social', label: 'Social', score: assessmentScores.social || 3 },
      { id: 'cognitivo', label: 'Cognitivo', score: assessmentScores.cognitivo || 3 },
      { id: 'motricidad', label: 'Motricidad', score: assessmentScores.motricidad || 3 },
      { id: 'rutinas', label: 'Rutinas', score: assessmentScores.rutinas || 3 },
    ];

    const sortedAreas = [...areas].sort((a, b) => a.score - b.score);
    const priorityAreas = sortedAreas.slice(0, 3).map(a => a.label);

    return {
      priorityAreas,
      weeklyGoals: [
        `Fortalecer el área de ${priorityAreas[0]} mediante juegos diarios.`,
        `Fomentar la interacción positiva centrada en ${childData.interests?.[0] || 'sus intereses'}.`,
        "Establecer una rutina visual consistente para las mañanas."
      ],
      recommendedActivities: [
        `Actividad de ${priorityAreas[0]}: Sesión visual de 15 minutos.`,
        `Juego compartido basado en ${childData.interests?.[1] || 'música'}.`,
        "Uso de pictogramas para comunicar necesidades básicas."
      ],
      suggestionsForParents: [
        "Mantener contacto visual durante las instrucciones breves.",
        "Reforzar positivamente cada pequeño avance con elogios.",
        "Limitar el tiempo de pantalla antes de dormir."
      ],
      suggestionsForTeachers: [
        "Proporcionar un espacio tranquilo para descansos sensoriales.",
        "Utilizar apoyos visuales para las transiciones entre materias.",
        "Simplificar las instrucciones a pasos individuales."
      ]
    };
  }, []);

  const handleGeneratePlan = useCallback(async () => {
    if (!child || !assessments || assessments.length === 0 || !db || !user) return;
    
    setGenerating(true);
    try {
      let result: GenerateLearningPlanOutput;
      
      try {
        result = await generateLearningPlan({
          childName: child.name,
          teaLevel: child.teaLevel,
          interests: child.interests || [],
          learningStyle: child.learningStyle,
          assessmentResults: assessments[0].scores,
        });
        toast({ title: "Plan generado con IA" });
      } catch (aiErr) {
        console.warn("AI Plan failed, using local fallback", aiErr);
        result = generateFallbackPlan(child, assessments[0].scores);
        toast({ title: "Plan generado (Modo compatible)" });
      }
      
      const planId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'children', childId as string, 'learning_plans', planId), {
        ...result,
        id: planId,
        childId,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });
      
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el plan." });
    } finally {
      setGenerating(false);
    }
  }, [child, assessments, db, user, childId, generateFallbackPlan]);

  if (childLoading || assessmentLoading || planLoading || generating) {
    return <LoadingState message={generating ? "Analizando evaluación..." : "Cargando plan..."} onRetry={() => window.location.reload()} />;
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Plan de Aprendizaje" showBackToDashboard={true} childId={childId as string} />
        <div className="p-6">
          <EmptyState 
            title="Evaluación necesaria" 
            description="Para generar un plan personalizado, primero debemos realizar la evaluación inicial del niño." 
            actionLabel="Ir a Evaluación"
            onAction={() => router.push(`/child/${childId}/assessment`)}
          />
        </div>
      </div>
    );
  }

  const localPlan = plans?.[0] as any;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader 
        title="Plan de Aprendizaje" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />
      <div className="p-4 md:p-6 space-y-6">
        {localPlan ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <AppCard className="p-6 bg-primary text-white space-y-2 border-l-8 border-l-accent/50 shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-accent text-accent" />
                <h3 className="text-lg font-black uppercase tracking-wider truncate">Plan para {child?.name}</h3>
              </div>
              <p className="text-xs md:text-sm opacity-90 font-medium italic">"Actualizado el {new Date(localPlan.createdAt).toLocaleDateString()}"</p>
            </AppCard>

            <section className="space-y-3">
              <h4 className="flex items-center gap-2 font-black text-primary uppercase text-[9px] md:text-[10px] tracking-widest">
                <Target className="w-3 h-3" /> Áreas Prioritarias
              </h4>
              <div className="flex flex-wrap gap-2">
                {localPlan.priorityAreas.map((area: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-[9px] md:text-[10px] font-black uppercase border-2 border-primary/20 text-primary whitespace-nowrap">{area}</span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-[9px] md:text-[10px] tracking-widest">
                <BookOpen className="w-3 h-3" /> Objetivos Semanales
              </h4>
              <div className="grid gap-3">
                {localPlan.weeklyGoals.map((goal: string, i: number) => (
                  <AppCard key={i} className="p-4 bg-white/60 border-l-8 border-l-secondary shadow-sm">
                    <p className="text-xs md:text-sm font-bold text-secondary-foreground leading-relaxed">{goal}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-accent-foreground uppercase text-[9px] md:text-[10px] tracking-widest">
                <Lightbulb className="w-3 h-3" /> Actividades Sugeridas
              </h4>
              <div className="grid gap-3">
                {localPlan.recommendedActivities.map((activity: string, i: number) => (
                  <AppCard key={i} className="p-4 bg-accent/10 border-none flex items-center gap-3 shadow-sm">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 text-accent-foreground font-black text-xs">{i+1}</div>
                    <p className="text-xs md:text-sm font-bold leading-relaxed">{activity}</p>
                  </AppCard>
                ))}
              </div>
            </section>

            <AppCard className="p-6 bg-white space-y-8 shadow-md">
               <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-black text-primary uppercase text-[9px] md:text-[10px] tracking-widest">
                  <Users className="w-3 h-3" /> Para Padres
                </h4>
                <ul className="space-y-3">
                  {localPlan.suggestionsForParents.map((s: string, i: number) => (
                    <li key={i} className="text-xs md:text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary font-black flex-shrink-0">•</span> <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="h-px bg-muted"></div>
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-[9px] md:text-[10px] tracking-widest">
                  <GraduationCap className="w-3 h-3" /> Para Docentes
                </h4>
                <ul className="space-y-3">
                  {localPlan.suggestionsForTeachers.map((s: string, i: number) => (
                    <li key={i} className="text-xs md:text-sm text-muted-foreground flex gap-2">
                      <span className="text-secondary-foreground font-black flex-shrink-0">•</span> <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AppCard>

            <div className="grid gap-3 pt-4">
              <AppButton className="w-full h-16 text-lg shadow-lg" onClick={() => router.push(`/child/${childId}/child-mode`)}>
                EMPEZAR ACTIVIDADES
              </AppButton>
              <div className="flex flex-col gap-2">
                <AppButton variant="outline" className="w-full h-12 text-[10px] font-black uppercase gap-2" onClick={handleGeneratePlan}>
                  <RotateCcw className="w-3 h-3" /> Regenerar Plan
                </AppButton>
                <AppButton variant="ghost" className="w-full h-12 text-muted-foreground font-black text-[10px] uppercase gap-2" onClick={() => router.push(`/child/${childId}/dashboard`)}>
                  <LayoutDashboard className="w-4 h-4" /> Volver al Dashboard
                </AppButton>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState 
            title="Analizar resultados" 
            description="Hemos analizado la evaluación. Haz clic abajo para generar el plan de desarrollo." 
            actionLabel="Generar Plan ahora"
            onAction={handleGeneratePlan}
          />
        )}
      </div>
    </div>
  );
}