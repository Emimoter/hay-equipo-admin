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
  collection,
  getDocs,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { INITIAL_CLUBS, INITIAL_COURTS } from '@hay-equipo/db';

export const firebaseConfig = {
  apiKey: 'AIzaSyA6rBjlZ62CULHi8CqADZqE-VO8Nm5faJA',
  authDomain: 'pclink-f6e0d.firebaseapp.com',
  projectId: 'pclink-f6e0d',
  storageBucket: 'pclink-f6e0d.firebasestorage.app',
  messagingSenderId: '716411272758',
  appId: '1:716411272758:web:26e82f394e28e57e3de297',
  measurementId: 'G-0Y1T09135P'
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
  photoURL: string | null;
  phone?: string;
  sportLevel: string;
  category: string;
  matchesPlayed: number;
  walletBalance: number;
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
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: extraPhone || user.phoneNumber || '+54 9 11 5555-0001',
      sportLevel: 'Intermedio',
      category: 'Pádel 5ta / Fútbol 7',
      matchesPlayed: 0,
      walletBalance: 12000,
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

// 2. Fetch Clubs from Firestore or Seed
export async function getClubsFirestore() {
  try {
    const col = collection(dbFirestore, 'clubs');
    const snap = await getDocs(col);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    // Seed initial clubs if empty
    for (const club of INITIAL_CLUBS) {
      await setDoc(doc(dbFirestore, 'clubs', club.id), club);
    }
    for (const court of INITIAL_COURTS) {
      await setDoc(doc(dbFirestore, 'courts', court.id), court);
    }
    return INITIAL_CLUBS;
  } catch {
    return INITIAL_CLUBS;
  }
}

// 3. Fetch Courts for a Club from Firestore
export async function getCourtsFirestore(clubId: string) {
  try {
    const q = query(collection(dbFirestore, 'courts'), where('clubId', '==', clubId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return INITIAL_COURTS.filter(c => c.clubId === clubId);
  } catch {
    return INITIAL_COURTS.filter(c => c.clubId === clubId);
  }
}
