import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { INITIAL_CLUBS, INITIAL_COURTS } from '@hay-equipo/db';

export const firebaseConfig = {
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app",
  messagingSenderId: "520908260494",
  appId: "1:520908260494:web:aa384fc831e74b9fca35df",
  measurementId: "G-K8CM7MET5W"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const dbFirestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  nickname?: string;
  photoURL: string | null;
  phone?: string;
  bio?: string;
  zone?: string;
  sports?: ('PADEL' | 'FUTBOL')[];
  padelCategory?: string;
  padelPosition?: string;
  padelHand?: string;
  padelRacket?: string;
  futbolFormat?: string;
  futbolPosition?: string;
  futbolFoot?: string;
  sportLevel?: string;
  category?: string;
  matchesPlayed: number;
  fairPlayRating?: number;
  punctualityRate?: number;
  createdAt?: string;
}

// 1. Sync User Profile in Firestore
export async function syncUserProfile(user: FirebaseUser, extraPhone?: string): Promise<UserProfile> {
  const userRef = doc(dbFirestore, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Jugador',
      nickname: 'Dibu',
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: extraPhone || user.phoneNumber || '+54 9 11 5555-0001',
      bio: 'Fanático del pádel y del fútbol de los miércoles. Juego con intensidad y fair play.',
      zone: 'Palermo, CABA',
      sports: ['PADEL', 'FUTBOL'],
      padelCategory: '5ta Categoría',
      padelPosition: 'REVES',
      padelHand: 'DIESTRO',
      futbolFormat: 'Fútbol 7',
      futbolPosition: 'MEDIOCAMPISTA',
      futbolFoot: 'DIESTRA',
      sportLevel: 'Intermedio',
      category: 'Pádel 5ta / Fútbol 7',
      matchesPlayed: 24,
      fairPlayRating: 4.9,
      punctualityRate: 98,
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, defaultProfile);
    return defaultProfile;
  } else {
    const existing = snap.data() as UserProfile;
    if (user.photoURL && existing.photoURL !== user.photoURL) {
      await setDoc(userRef, { photoURL: user.photoURL }, { merge: true });
      existing.photoURL = user.photoURL;
    }
    return existing;
  }
}

export async function updateUserProfileFirestore(uid: string, data: Partial<UserProfile>): Promise<boolean> {
  try {
    const userRef = doc(dbFirestore, 'users', uid);
    await setDoc(userRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error updating user profile in Firestore:', e);
    return false;
  }
}

// 2. Fetch Clubs from Firestore
export async function getClubsFirestore() {
  try {
    const snap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_clubs'));
    if (snap.exists() && snap.data()?.clubs?.length > 0) {
      return snap.data()?.clubs;
    }
    const col = collection(dbFirestore, 'clubs');
    const colSnap = await getDocs(col);
    if (!colSnap.empty) {
      return colSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return INITIAL_CLUBS;
  } catch {
    return INITIAL_CLUBS;
  }
}

// 3. Fetch Courts for a Club from Firestore
export async function getCourtsFirestore(clubId: string) {
  try {
    const snap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_courts'));
    if (snap.exists() && snap.data()?.courts?.length > 0) {
      const courts = snap.data()?.courts;
      return courts.filter((c: any) => c.clubId === clubId);
    }
    const q = query(collection(dbFirestore, 'courts'), where('clubId', '==', clubId));
    const colSnap = await getDocs(q);
    if (!colSnap.empty) {
      return colSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return INITIAL_COURTS.filter(c => c.clubId === clubId);
  } catch {
    return INITIAL_COURTS.filter(c => c.clubId === clubId);
  }
}

// 4. Delete User Profile from Firestore (Google Play Requirement)
export async function deleteUserFirestore(uid: string): Promise<boolean> {
  try {
    const userRef = doc(dbFirestore, 'users', uid);
    await deleteDoc(userRef);
    return true;
  } catch (e) {
    console.error('Error deleting user from Firestore:', e);
    return false;
  }
}

