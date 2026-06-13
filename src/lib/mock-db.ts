
'use client';

export interface ChildProfile {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string;
  tea_level: 'leve' | 'moderado' | 'severo';
  interests: string[];
  learning_style: 'visual' | 'auditivo' | 'kinestésico' | 'mixto';
  avatar_url: string;
  medical_notes: string;
  points: number;
  stars: number;
}

export interface Assessment {
  id: string;
  child_id: string;
  scores: {
    emociones: number;
    comunicacion: number;
    social: number;
    cognitivo: number;
    motricidad: number;
    rutinas: number;
  };
  created_at: string;
}

export interface GameSession {
  id: string;
  child_id: string;
  game_id: string;
  game_name: string;
  area: string;
  score: number;
  stars: number;
  correct_answers: number;
  incorrect_answers: number;
  duration_seconds: number;
  created_at: string;
}

const STORAGE_KEY = 'teacompana_data';

export const mockDb = {
  getData: () => {
    if (typeof window === 'undefined') return { children: [], assessments: [], sessions: [] };
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { children: [], assessments: [], sessions: [] };
  },

  saveData: (data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getChildren: (): ChildProfile[] => {
    return mockDb.getData().children || [];
  },

  getChild: (id: string): ChildProfile | undefined => {
    return mockDb.getChildren().find(c => c.id === id);
  },

  saveChild: (child: ChildProfile) => {
    const data = mockDb.getData();
    const index = data.children.findIndex((c: any) => c.id === child.id);
    if (index >= 0) {
      data.children[index] = child;
    } else {
      data.children.push(child);
    }
    mockDb.saveData(data);
  },

  saveAssessment: (assessment: Assessment) => {
    const data = mockDb.getData();
    data.assessments.push(assessment);
    mockDb.saveData(data);
  },

  getAssessment: (childId: string): Assessment | undefined => {
    const data = mockDb.getData();
    return data.assessments?.find((a: any) => a.child_id === childId);
  },

  saveSession: (session: GameSession) => {
    const data = mockDb.getData();
    if (!data.sessions) data.sessions = [];
    data.sessions.push(session);
    
    // Also update child totals
    const child = data.children.find((c: any) => c.id === session.child_id);
    if (child) {
      child.points = (child.points || 0) + session.score;
      child.stars = (child.stars || 0) + session.stars;
    }
    
    mockDb.saveData(data);
  },

  getSessions: (childId: string): GameSession[] => {
    const data = mockDb.getData();
    return (data.sessions || []).filter((s: any) => s.child_id === childId);
  }
};
