'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppCard, AppHeader, LoadingState, EmptyState, SelectChip } from '@/components/app-components';
import { Plus, ChevronRight, Settings, Filter, LogOut, User as UserIcon, RefreshCcw } from 'lucide-react';
import { childrenService } from '@/services/childrenService';
import { authService } from '@/services/authService';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAvatarEmoji } from '@/lib/avatars';

const GROUPS = ['Todos', 'PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'];

export default function MyChildrenPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [children, setChildren] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  const loadData = useCallback(async () => {
    if (user && db) {
      setLoading(true);
      try {
        let profile = await authService.getUserProfile(user.uid);
        
        if (profile?.role === 'teacher' && (!profile.institutionId || !profile.assignedGroups)) {
          const teacherUpdate = {
            institutionId: "la-uni",
            institutionName: "LA-UNI",
            assignedGroups: ["PED_1", "PED_2", "PED_3", "PED_4", "PED_5"]
          };
          await updateDoc(doc(db, 'users', user.uid), teacherUpdate);
          profile = { ...profile, ...teacherUpdate };
        }
        
        setUserProfile(profile);
        const data = await childrenService.getChildrenForUser(user.uid);
        setChildren(data);
      } catch (e) {
        console.error("Error loading children", e);
      } finally {
        setLoading(false);
      }
    } else if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, db, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/');
  };

  const isTeacher = userProfile?.role === 'teacher';
  const displayName = userProfile?.fullName || user?.displayName || 'Usuario';
  
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      if (selectedGroup === 'Todos') return true;
      return child.groupId === selectedGroup;
    });
  }, [children, selectedGroup]);

  if (loading || userLoading) {
    return <LoadingState message="Cargando perfiles..." onRetry={loadData} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-32">
      <AppHeader title="Mis Niños" showBack={false}>
        <div className="flex gap-1 md:gap-2">
          <button className="p-2 hover:bg-muted rounded-xl transition-colors" onClick={() => router.push('/settings')} title="Configuración">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-destructive" onClick={handleLogout} title="Cerrar Sesión">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </AppHeader>

      <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 md:space-y-10">
        {/* Profile Summary Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-black/5">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-primary shadow-inner text-3xl md:text-4xl flex-shrink-0">
              {userProfile?.avatarKey ? getAvatarEmoji(userProfile.avatarKey) : <UserIcon className="w-8 h-8 md:w-10 md:h-10" />}
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-muted-foreground font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] truncate">
                {isTeacher ? `${userProfile?.institutionName || 'LA-UNI'}` : 'Padre / Tutor'}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-primary leading-none tracking-tighter truncate">{displayName}</h2>
              {isTeacher && <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">DOCENTE ASIGNADO</p>}
            </div>
          </div>
          <AppButton 
            onClick={() => router.push('/children/create')} 
            className="w-full md:w-auto px-6 md:px-10 h-12 md:h-14 text-[10px] md:text-[11px] bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20"
          >
            <Plus className="w-5 h-5 mr-2" /> Registrar Nuevo Niño
          </AppButton>
        </div>

        {/* Groups Filter for Teachers */}
        {isTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Filter className="w-3.5 h-3.5" /> Filtrar por Grupo Académico
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2 mask-linear-fade">
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

        {/* Children Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-primary uppercase text-xs tracking-[0.2em]">Perfiles Activos</h3>
            <span className="text-[10px] font-black bg-muted px-3 py-1 rounded-full uppercase">{filteredChildren.length} Niños</span>
          </div>

          {filteredChildren.length === 0 ? (
            <EmptyState 
              title={selectedGroup !== 'Todos' ? `Sin alumnos en ${selectedGroup}` : "Sin perfiles registrados"} 
              description={isTeacher ? `No hay niños registrados en el grupo ${selectedGroup} de la institución todavía.` : "Aún no has registrado ningún niño. Crea un perfil para comenzar el seguimiento personalizado de su aprendizaje."} 
              actionLabel={!isTeacher ? "Agregar mi primer niño" : "Actualizar Lista"}
              onAction={!isTeacher ? () => router.push('/children/create') : loadData}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredChildren.map((child: any) => (
                <AppCard 
                  key={child.id} 
                  className="p-4 md:p-6 flex items-center gap-4 md:gap-6 hover:translate-y-[-4px] active:scale-[0.98] transition-all cursor-pointer bg-white group shadow-xl hover:shadow-primary/10 border-2 border-transparent hover:border-primary/20"
                  onClick={() => router.push(`/child/${child.id}/dashboard`)}
                >
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-primary/5 flex items-center justify-center text-3xl md:text-4xl shadow-inner group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    {child.avatarKey ? getAvatarEmoji(child.avatarKey) : child.name?.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <h3 className="font-black text-lg md:text-xl text-primary leading-tight tracking-tight group-hover:translate-x-1 transition-transform truncate">{child.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[8px] md:text-[9px] px-2 md:px-3 py-1 bg-secondary/20 text-secondary-foreground font-black rounded-full uppercase tracking-widest truncate max-w-[100px]">
                        {child.groupId || 'PENDIENTE'}
                      </span>
                      <span className="text-[8px] md:text-[9px] px-2 md:px-3 py-1 bg-accent text-accent-foreground font-black rounded-full uppercase tracking-widest">
                        {child.points || 0} PTS
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-full opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0">
                    <ChevronRight className="text-primary w-5 h-5" />
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}