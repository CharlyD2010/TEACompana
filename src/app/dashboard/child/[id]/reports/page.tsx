
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader, AppCard, ProgressBar } from '@/components/app-components';
import { mockDb, ChildProfile, GameSession } from '@/lib/mock-db';
import { generateProgressRecommendations, GenerateProgressRecommendationsOutput } from '@/ai/flows/generate-progress-recommendations-flow';
import { Loader2, Sparkles, TrendingUp, Calendar, Info } from 'lucide-react';

export default function ReportsPage() {
  const { id } = useParams();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [recommendations, setRecommendations] = useState<GenerateProgressRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const c = mockDb.getChild(id as string);
      const s = mockDb.getSessions(id as string);
      setChild(c || null);
      setSessions(s);
      
      if (c && s.length > 0) {
        getAiRecommendations(c, s);
      }
    }
  }, [id]);

  async function getAiRecommendations(childData: ChildProfile, sessionsData: GameSession[]) {
    setLoading(true);
    try {
      const summary = sessionsData.map(s => ({
        gameName: s.game_name,
        area: s.area,
        level: 1,
        score: s.score,
        stars: s.stars,
        correctAnswers: s.correct_answers,
        incorrectAnswers: s.incorrect_answers,
        accuracy: (s.correct_answers / (s.correct_answers + s.incorrect_answers)) * 100,
        durationSeconds: s.duration_seconds,
        isCompleted: true
      }));

      const res = await generateProgressRecommendations({
        childId: childData.id,
        childName: childData.name,
        teaLevel: childData.tea_level,
        interests: childData.interests,
        learningStyle: childData.learning_style,
        reportPeriod: 'semanal',
        performanceSummary: summary,
        priorityAreas: ['Comunicación', 'Emociones'],
        weeklyGoals: ['Reconocer 3 emociones básicas', 'Contar hasta 5 objetos']
      });
      setRecommendations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!child) return null;

  const totalCorrect = sessions.reduce((acc, s) => acc + s.correct_answers, 0);
  const totalAnswers = sessions.reduce((acc, s) => acc + s.correct_answers + s.incorrect_answers, 0);
  const avgAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Reportes y Progreso" />

      <div className="p-6 space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-2 gap-4">
          <AppCard className="p-4 bg-white text-center space-y-1">
            <div className="text-3xl font-black text-primary">{sessions.length}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Sesiones</div>
          </AppCard>
          <AppCard className="p-4 bg-white text-center space-y-1">
            <div className="text-3xl font-black text-secondary-foreground">{avgAccuracy.toFixed(0)}%</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Precisión</div>
          </AppCard>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-primary uppercase text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 fill-accent text-accent" /> Recomendaciones IA
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground bg-white px-2 py-0.5 rounded-full shadow-sm">Semanal</span>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="text-xs font-bold text-muted-foreground uppercase">Analizando progreso...</p>
            </div>
          ) : recommendations ? (
            <div className="space-y-4">
              <AppCard className="p-6 bg-white space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-secondary-foreground uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Fortalezas
                  </h4>
                  <p className="text-sm text-muted-foreground">{recommendations.strengths}</p>
                </div>
                <div className="h-px bg-muted"></div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-destructive uppercase flex items-center gap-2">
                    <Info className="w-4 h-4" /> Áreas de Mejora
                  </h4>
                  <p className="text-sm text-muted-foreground">{recommendations.areasForImprovement}</p>
                </div>
                <div className="h-px bg-muted"></div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Estrategias
                  </h4>
                  <p className="text-sm text-muted-foreground italic">"{recommendations.personalizedStrategies}"</p>
                </div>
              </AppCard>
            </div>
          ) : (
            <AppCard className="p-8 text-center text-muted-foreground bg-white/50 border-dashed border-2">
              Inicia algunas actividades para generar recomendaciones.
            </AppCard>
          )}
        </div>

        {/* Sessions History */}
        <div className="space-y-4">
          <h3 className="font-black text-primary uppercase text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Historial de Sesiones
          </h3>
          <div className="grid gap-3">
            {sessions.slice().reverse().map((s) => (
              <AppCard key={s.id} className="p-4 bg-white flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{s.game_name}</h4>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">
                    {new Date(s.created_at).toLocaleDateString()} • {s.area}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-0.5 justify-end">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < s.stars ? "fill-accent text-accent" : "text-muted fill-muted"}`} />
                    ))}
                  </div>
                  <div className="text-xs font-black text-primary">+{s.score} pts</div>
                </div>
              </AppCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
