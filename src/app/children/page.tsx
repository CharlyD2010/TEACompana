
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppCard, AppHeader, LoadingState, EmptyState, SelectChip } from '@/components/app-components';
import { Plus, ChevronRight, Settings, Filter, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { childrenService } from '@/services/childrenService';
import { authService } from '@/services/authService';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const GROUPS = ['Todos', 'PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

export default function MyChildrenPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [children, setChildren] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  useEffect(() => {
    async function loadData() {
      if (user && db) {
        try {
          console.log(`[AUTH] Usuario autenticado: ${user.uid}`);
          let profile = await authService.getUserProfile(user.uid);
          
          // Verificación y actualización automática de perfil docente
          if (profile?.role === 'teacher' && (!profile.institutionId || !profile.assignedGroups)) {
            console.log("[AUTH] Actualizando perfil docente incompleto...");
            const teacherUpdate = {
              institutionId: "la-uni",
              institutionName: "LA-UNI",
              assignedGroups: ["PED_1", "PED_2", "PED_3", "PED_4", "PED_5"]
            };
            await updateDoc(doc(db, 'users', user.uid), teacherUpdate);
            profile = { ...profile, ...teacherUpdate };
          }
          
          setUserProfile(profile);
          console.log(`[PROFILE] Rol: ${profile?.role}, Nombre: ${profile?.fullName}`);

          const data = await childrenService.getChildrenForUser(user.uid);
          setChildren(data);
        } catch (e) {
          console.error("[ERROR] Error loading children", e);
        } finally {
          setLoading(false);
        }
      } else if (!userLoading && !user) {
        router.push('/');
      }
    }
    loadData();
  }, [user, userLoading, db, router]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  if (loading || userLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingState /></div>;
  }

  const isTeacher = userProfile?.role === 'teacher';
  const displayName = userProfile?.fullName || user?.displayName || 'Usuario';
  
  const filteredChildren = children.filter(child => {
    if (selectedGroup === 'Todos') return true;
    return child.groupId === selectedGroup;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Mis Niños" showBack={false}>
        <div className="flex gap-2">
          <AppButton variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/settings')}>
            <Settings className="h-5 w-5" />
          </AppButton>
          <AppButton variant="ghost" size="icon" className="rounded-full text-destructive" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </AppButton>
        </div>
      </AppHeader>

      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                {isTeacher ? `Docente: ${userProfile?.institutionName || 'LA-UNI'}` : 'Padre / Tutor'}
              </p>
              <h2 className="text-2xl font-black text-primary leading-none">{displayName}</h2>
              {isTeacher && <p className="text-[9px] font-bold text-muted-foreground uppercase">Grupos asignados: {userProfile?.assignedGroups?.join(', ')}</p>}
            </div>
            <AppButton size="sm" onClick={() => router.push('/children/create')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-10 px-4 text-[10px] uppercase font-black">
              <Plus className="w-4 h-4 mr-1" /> Nuevo Niño
            </AppButton>
          </div>

          {isTeacher && (
            <div className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border border-primary/5">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                <Filter className="w-3 h-3" /> Filtrar por Grupo
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {GROUPS.map(group => (
                  <SelectChip
                    key={group}
                    label={group}
                    selected={selectedGroup === group}
                    onClick={() => setSelectedGroup(group)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {filteredChildren.length === 0 ? (
          <EmptyState 
            title={selectedGroup !== 'Todos' ? `Sin alumnos en ${selectedGroup}` : "Sin perfiles"} 
            description={isTeacher ? `No hay niños registrados en el grupo ${selectedGroup} de la institución.` : "Aún no has registrado ningún niño. Crea un perfil para comenzar el seguimiento."} 
            actionLabel={!isTeacher ? "Agregar mi primer niño" : undefined}
            onAction={!isTeacher ? () => router.push('/children/create') : undefined}
          />
        ) : (
          <div className="grid gap-4">
            {filteredChildren.map((child: any) => (
              <AppCard 
                key={child.id} 
                className="p-5 flex items-center gap-4 hover:ring-4 hover:ring-primary/10 transition-all cursor-pointer bg-white group border border-primary/5"
                onClick={() => router.push(`/child/${child.id}/dashboard`)}
              >
                <Avatar className="h-16 w-16 border-4 border-primary/10 group-hover:border-primary/30 transition-colors">
                  <AvatarImage src={child.avatarUrl} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">
                    {child.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-primary group-hover:translate-x-1 transition-transform">{child.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] px-2 py-0.5 bg-secondary/20 text-secondary-foreground font-black rounded-full uppercase tracking-tight">
                      {child.groupId || 'Sin Grupo'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-accent text-accent-foreground font-black rounded-full uppercase tracking-tight">
                      {child.points || 0} pts
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground w-6 h-6 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </AppCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
