
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState, EmptyState } from '@/components/app-components';
import { generateLearningPlan, GenerateLearningPlanOutput } from '@/ai/flows/generate-personalized-learning-plan';
import { Sparkles, CheckCircle2, Lightbulb, Users, GraduationCap, Target } from 'lucide-react';
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

  // Fallback local plan generator if AI fails
  function generateLocalFallbackPlan(childData: any, assessmentData: any): GenerateLearningPlanOutput {
    const scores = assessmentData.scores;
    const areas = Object.entries(scores)
      .sort((a: any, b: any) => a[1] - b[1])
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    const priorityAreas = areas.slice(0, 3);
    
    const fallbackPlans: Record<string, any> = {
      Emociones: { goals: ["Identificar 3 emociones básicas", "Uso de pictogramas"], activities: ["Espejo de emociones", "Cuentos con caras"], parents: ["Validar sentimientos", "Usar tarjetas visuales"], teachers: ["Zona de calma en el aula"] },
      Comunicacion: { goals: ["Expresar necesidades básicas", "Contacto visual"], activities: ["Juegos de imitación", "Tarjetas PEKS"], parents: ["Narrar rutinas diarias", "Paciencia en respuestas"], teachers: ["Uso de apoyos visuales"] },
      Social: { goals: ["Turnos de juego", "Saludo inicial"], activities: ["Juegos de mesa simples", "Roleplay"], parents: ["Visitas controladas al parque", "Modelado de conducta"], teachers: ["Compañero guía en clase"] },
      Cognitivo: { goals: ["Clasificar por color", "Atención 5 min"], activities: ["Sorting de objetos", "Rompecabezas"], parents: ["Juegos de memoria", "Rutinas consistentes"], teachers: ["Instrucciones paso a paso"] },
      Motricidad: { goals: ["Pinza fina", "Equilibrio"], activities: ["Plastilina", "Circuito de obstáculos"], parents: ["Actividades de dibujo", "Juegos de pelota"], teachers: ["Adaptación de útiles escolares"] },
      Rutinas: { goals: ["Secuencia mañana", "Transiciones suaves"], activities: ["Panel visual de día", "Canciones de cambio"], parents: ["Anticipar cambios", "Horarios fijos"], teachers: ["Timbre visual de cambio"] }
    };

    const result: GenerateLearningPlanOutput = {
      priorityAreas,
      weeklyGoals: priorityAreas.flatMap(a => fallbackPlans[a]?.goals || ["Mejorar autonomía"]),
      recommendedActivities: priorityAreas.flatMap(a => fallbackPlans[a]?.activities || ["Juego libre"]),
      suggestionsForParents: priorityAreas.flatMap(a => fallbackPlans[a]?.parents || ["Mantener paciencia"]),
      suggestionsForTeachers: priorityAreas.flatMap(a => fallbackPlans[a]?.teachers || ["Adaptar materiales"])
    };

    return result;
  }

  async function handleGeneratePlan(isRetry = false) {
    if (!child || !assessments || assessments.length === 0 || !db) return;
    
    setGenerating(true);
    try {
      let result: GenerateLearningPlanOutput;
      
      try {
        // Intentar con IA
        result = await generateLearningPlan({
          childName: child.name,
          teaLevel: child.teaLevel,
          interests: child.interests || [],
          learningStyle: child.learningStyle,
          assessmentResults: assessments[0].scores,
        });
        toast({ title: "Plan generado con IA", description: "Hemos optimizado el plan con inteligencia artificial." });
      } catch (aiErr) {
        console.warn("AI Plan failed, using local fallback", aiErr);
        // Fallback local
        result = generateLocalFallbackPlan(child, assessments[0]);
        toast({ title: "Plan generado localmente", description: "Usando recomendaciones basadas en evaluación estándar." });
      }
      
      const planId = Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'children', childId as string, 'learning_plans', planId), {
        ...result,
        id: planId,
        childId,
        createdAt: new Date().toISOString(),
      });
      
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el plan." });
    } finally {
      setGenerating(false);
    }
  }

  if (childLoading || assessmentLoading || planLoading || generating) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingState message={generating ? "Analizando evaluación..." : "Cargando plan..."} /></div>;
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Plan de Aprendizaje" />
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

  const localPlan = plans?.[0] as unknown as GenerateLearningPlanOutput | undefined;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Plan de Aprendizaje" />
      <div className="p-6 space-y-6">
        {localPlan ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <AppCard className="p-6 bg-primary text-white space-y-2 border-l-8 border-l-accent/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-accent text-accent" />
                <h3 className="text-lg font-black uppercase tracking-wider">Plan para {child?.name}</h3>
              </div>
              <p className="text-sm opacity-90 font-medium italic">"Recomendaciones personalizadas basadas en el perfil actual."</p>
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
              <AppButton variant="ghost" className="w-full text-muted-foreground font-black text-xs uppercase" onClick={() => handleGeneratePlan(true)}>
                Actualizar Plan
              </AppButton>
            </div>
          </div>
        ) : (
          <EmptyState 
            title="Analizar resultados" 
            description="Hemos analizado la evaluación. Haz clic abajo para generar el plan de desarrollo." 
            actionLabel="Generar Plan ahora"
            onAction={() => handleGeneratePlan()}
          />
        )}
      </div>
    </div>
  );
}
