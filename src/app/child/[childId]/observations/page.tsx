'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState, AppInput, EmptyState } from '@/components/app-components';
import { useDoc, useFirestore, useCollection, useUser } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { MessageSquare, Send, Calendar, User, LayoutDashboard, Users, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ObservationsPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  
  const [message, setMessage] = useState('');
  const [type, setType] = useState('progreso');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [user, db]);

  const childRef = useMemo(() => db && childId ? doc(db, 'children', childId as string) : null, [db, childId]);
  const { data: child, loading: childLoading } = useDoc(childRef);

  const observationsQuery = useMemo(() => db && childId ? query(
    collection(db, 'children', childId as string, 'teacher_observations'),
    orderBy('createdAt', 'desc')
  ) : null, [db, childId]);

  const { data: observations, loading: obsLoading } = useCollection(observationsQuery);

  const isTeacher = userData?.role === 'teacher';

  const handleSend = async () => {
    if (!message.trim() || !db || !user || !userData) return;
    setSending(true);
    try {
      const obsRef = collection(db, 'children', childId as string, 'teacher_observations');
      await addDoc(obsRef, {
        childId,
        teacherId: user.uid,
        teacherName: userData.fullName || 'Docente',
        message: message.trim(),
        recommendationType: type,
        createdAt: new Date().toISOString(),
        visibleToParent: true
      });
      setMessage('');
      toast({ title: "Observación enviada" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSending(false);
    }
  };

  if (childLoading || obsLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader 
        title="Observaciones" 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />

      <div className="p-6 space-y-6">
        {isTeacher && (
          <AppCard className="p-6 space-y-4 border-2 border-secondary/20 shadow-lg">
            <div className="flex items-center gap-2 font-black text-secondary-foreground uppercase text-xs tracking-widest">
              <MessageSquare className="w-4 h-4" /> Nueva Recomendación
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Tipo de observación</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="progreso">Progreso Académico</SelectItem>
                  <SelectItem value="conducta">Conducta y Emociones</SelectItem>
                  <SelectItem value="actividad">Sugerencia de Actividad</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento Médico/Terapia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase">Mensaje para el padre</label>
              <Textarea 
                placeholder="Escribe aquí tus observaciones..." 
                className="rounded-xl border-2 min-h-[120px]"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <AppButton 
              className="w-full h-14 bg-secondary text-secondary-foreground gap-2" 
              onClick={handleSend}
              disabled={sending || !message.trim()}
            >
              <Send className="w-4 h-4" /> {sending ? 'Enviando...' : 'Enviar Observación'}
            </AppButton>
          </AppCard>
        )}

        <div className="space-y-4">
          <h3 className="font-black text-primary uppercase text-xs tracking-widest px-2">Historial de Comunicación</h3>
          
          {!observations || observations.length === 0 ? (
            <EmptyState 
              title="Sin observaciones" 
              description={isTeacher ? "Aún no has enviado recomendaciones para este niño." : "El docente aún no ha registrado observaciones."} 
            />
          ) : (
            <div className="space-y-4">
              {observations.map((obs: any) => (
                <AppCard key={obs.id} className="p-6 bg-white shadow-sm border-l-4 border-l-secondary relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-primary uppercase">{obs.teacherName}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" /> {new Date(obs.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] font-black bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {obs.recommendationType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{obs.message}</p>
                </AppCard>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8 flex flex-col gap-3">
          <AppButton variant="outline" className="w-full h-14 font-black uppercase text-xs gap-2" onClick={() => router.push(`/child/${childId}/dashboard`)}>
            <LayoutDashboard className="w-4 h-4" /> Volver al Dashboard
          </AppButton>
          <AppButton variant="ghost" className="w-full h-12 text-muted-foreground font-black uppercase text-[10px]" onClick={() => router.push('/children')}>
            <Users className="w-3 h-3 mr-1" /> Mis Niños
          </AppButton>
        </div>
      </div>
    </div>
  );
}