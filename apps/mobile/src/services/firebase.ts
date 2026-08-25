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

// 4. Update User Wallet Balance
export async function updateUserWalletBalance(uid: string, newBalance: number): Promise<boolean> {
  try {
    const userRef = doc(dbFirestore, 'users', uid);
    await setDoc(userRef, { walletBalance: newBalance }, { merge: true });
    return true;
  } catch {
    return false;
  }
}
