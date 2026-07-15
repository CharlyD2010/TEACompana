'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppButton, AppCard, AppHeader, LoadingState, EmptyState, SelectChip } from '@/components/app-components';
import { Plus, ChevronRight, Settings, Filter, LogOut, User as UserIcon, RefreshCcw, Star, Trophy, ArrowUpDown } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'name' | 'points'>('name');

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
    let list = children.filter(child => {
      if (selectedGroup === 'Todos') return true;
      return child.groupId === selectedGroup;
    });

    if (sortBy === 'points') {
      return list.sort((a, b) => (b.points || 0) - (a.points || 0));
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [children, selectedGroup, sortBy]);

  if (loading || userLoading) {
    return <LoadingState message="Cargando perfiles académicos..." onRetry={loadData} />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <AppHeader title="Mis Niños" showBack={false}>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-muted rounded-xl transition-colors" onClick={() => router.push('/settings')}>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-destructive" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </AppHeader>

      <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10">
        {/* Cabecera de Perfil */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border-2 border-primary/5">
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary text-3xl md:text-4xl shadow-inner">
              {userProfile?.avatarKey ? getAvatarEmoji(userProfile.avatarKey) : <UserIcon className="w-8 h-8" />}
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] truncate">
                {isTeacher ? `${userProfile?.institutionName || 'LA-UNI'}` : 'Padre / Tutor'}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-primary leading-none tracking-tighter truncate">{displayName}</h2>
              {isTeacher && <p className="text-[9px] font-bold text-secondary-foreground uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full inline-block mt-1">DOCENTE ASIGNADO</p>}
            </div>
          </div>
          <AppButton 
            onClick={() => router.push('/children/create')} 
            className="w-full md:w-auto px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/10"
          >
            <Plus className="w-5 h-5 mr-2" /> Registrar Niño
          </AppButton>
        </div>

        {/* Herramientas de Docente */}
        {isTeacher && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center px-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                <Filter className="w-3.5 h-3.5" /> Grupos Académicos
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSortBy(sortBy === 'name' ? 'points' : 'name')}
                  className="flex items-center gap-2 bg-muted px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                >
                  <ArrowUpDown className="w-3 h-3" /> Ordenar por {sortBy === 'name' ? 'Puntos' : 'Nombre'}
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
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

        {/* Listado de Alumnos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-primary uppercase text-xs tracking-[0.2em]">Listado de Alumnos</h3>
            <span className="text-[10px] font-black bg-muted px-4 py-1 rounded-full uppercase">{filteredChildren.length} Niños</span>
          </div>

          {filteredChildren.length === 0 ? (
            <EmptyState 
              title={selectedGroup !== 'Todos' ? `Sin alumnos en ${selectedGroup}` : "Sin perfiles todavía"} 
              description={isTeacher ? "No hay niños registrados en este grupo de la institución todavía." : "Aún no has registrado ningún niño. Crea un perfil para comenzar el seguimiento pedagógico."} 
              actionLabel={!isTeacher ? "Agregar primer niño" : "Actualizar Lista"}
              onAction={!isTeacher ? () => router.push('/children/create') : loadData}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {filteredChildren.map((child: any) => (
                <AppCard 
                  key={child.id} 
                  className="p-4 md:p-6 flex items-center gap-4 md:gap-6 hover:translate-y-[-4px] active:scale-[0.98] transition-all cursor-pointer bg-white group shadow-xl border-2 border-transparent hover:border-primary/10"
                  onClick={() => router.push(`/child/${child.id}/dashboard`)}
                >
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center text-3xl md:text-4xl shadow-inner flex-shrink-0">
                    {child.avatarKey ? getAvatarEmoji(child.avatarKey) : child.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg md:text-xl text-primary leading-tight truncate group-hover:translate-x-1 transition-transform">{child.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[8px] md:text-[9px] px-3 py-1 bg-secondary/10 text-secondary-foreground font-black rounded-full uppercase tracking-widest">
                        {child.groupId || 'SIN GRUPO'}
                      </span>
                      <div className="flex items-center gap-1 text-[8px] md:text-[9px] px-3 py-1 bg-accent text-accent-foreground font-black rounded-full uppercase tracking-widest">
                        <Trophy className="w-2.5 h-2.5" /> {child.points || 0} PTS
                      </div>
                      <div className="flex items-center gap-1 text-[8px] md:text-[9px] px-3 py-1 bg-primary/10 text-primary font-black rounded-full uppercase tracking-widest">
                        <Star className="w-2.5 h-2.5 fill-current" /> {child.stars || 0}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
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
