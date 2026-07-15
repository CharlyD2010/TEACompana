
'use client';

import { Timestamp } from 'firebase/firestore';

export type UserRole = 'parent' | 'teacher' | 'admin';
export type TeaLevel = 'leve' | 'moderado' | 'severo';
export type LearningStyle = 'visual' | 'auditivo' | 'kinestésico' | 'mixto';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarKey?: string;
  isActive: boolean;
  createdAt: string;
  institutionId?: string;
  institutionName?: string;
  assignedGroups?: string[];
}

/**
 * Estadísticas acumuladas para optimizar reportes sin procesar todas las sesiones.
 */
export interface ChildSummary {
  totalSessions: number;
  totalPoints: number;
  totalStars: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalQuestions: number;
  totalDurationSeconds: number;
  lastActivityAt?: string;
  updatedAt?: any;
}

export interface Child {
  id: string;
  createdBy: string;
  name: string;
  birthDate: string;
  teaLevel: TeaLevel;
  interests: string[];
  learningStyle: LearningStyle;
  avatarUrl?: string;
  avatarKey?: string;
  medicalNotes?: string;
  createdAt: string;
  points: number;
  stars: number;
  institutionId: string;
  institutionName: string;
  institution?: string; // Campo de compatibilidad
  groupId: string;
  groupName: string;
  summary?: ChildSummary;
}

export interface Institution {
  id: string;
  name: string;
  normalizedName: string;
  createdAt: string;
  createdBy: string;
  active: boolean;
}

export interface GameQuestion {
  id: number;
  text: string;
  options: string[];
  correct: number;
  audio?: string;
}

export interface GameLevelData {
  name: string;
  instruction: string;
  questions: GameQuestion[];
}

export interface GameSession {
  id: string;
  childId: string;
  gameId: string;
  levelId: number;
  userId: string;
  gameName: string;
  score: number;
  stars: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  accuracy: number;
  durationSeconds: number;
  createdAt: string;
}

export interface GameProgress {
  id: string;
  childId: string;
  gameId: string;
  levelId: number;
  stars: number;
  completed: boolean;
  unlocked?: boolean;
  updatedAt: Timestamp | any;
}

export interface ChatMessage {
  id?: string;
  childId: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher';
  senderAvatarKey?: string | null;
  message: string;
  createdAt: Timestamp | any;
}

export interface ChildReward {
  id: string;
  childId: string;
  rewardId: string;
  earnedAt: string;
  createdAt: Timestamp | any;
}
