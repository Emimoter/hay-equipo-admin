import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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
export const dbFirestore = getFirestore(app);

export async function getClubsFirestore() {
  try {
    const snap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_clubs'));
    if (snap.exists() && snap.data()?.clubs?.length > 0) {
      return snap.data()?.clubs;
    }
  } catch (e) {
    console.error('Error fetching clubs from Firestore:', e);
  }
  return [];
}

export async function getCourtsFirestore() {
  try {
    const snap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_courts'));
    if (snap.exists() && snap.data()?.courts?.length > 0) {
      return snap.data()?.courts;
    }
  } catch (e) {
    console.error('Error fetching courts from Firestore:', e);
  }
  return [];
}

export async function saveCourtsFirestore(updatedCourts: any[]) {
  try {
    await setDoc(doc(dbFirestore, 'settings', 'hay_equipo_courts'), {
      courts: updatedCourts,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving courts to Firestore:', e);
    return false;
  }
}

export async function saveClubsFirestore(updatedClubs: any[]) {
  try {
    await setDoc(doc(dbFirestore, 'settings', 'hay_equipo_clubs'), {
      clubs: updatedClubs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving clubs to Firestore:', e);
    return false;
  }
}
