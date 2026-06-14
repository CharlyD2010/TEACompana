
'use client';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export const authService = {
  login: async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  },

  logout: async () => {
    return signOut(auth);
  },

  registerParent: async (email: string, pass: string, fullName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Actualizar nombre en Auth
    await updateProfile(user, { displayName: fullName });

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      fullName,
      email,
      role: 'parent',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    return user;
  },

  registerTeacher: async (email: string, pass: string, fullName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Actualizar nombre en Auth
    await updateProfile(user, { displayName: fullName });

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      fullName,
      email,
      role: 'teacher',
      institutionId: 'la-uni',
      institutionName: 'LA-UNI',
      assignedGroups: ['PED_1', 'PED_2', 'PED_3', 'PED_4', 'PED_5'],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    return user;
  },

  getUserProfile: async (uid: string) => {
    if (!uid) return null;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  }
};
