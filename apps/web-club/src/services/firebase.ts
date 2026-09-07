import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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
export const dbFirestore = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/* ────────────────────────────────────────────────────────────
   Club & Court Settings
   ──────────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────────────
   Booking & Split Payments System
   ──────────────────────────────────────────────────────────── */

export interface BookingParticipant {
  id: string;
  name: string;
  phone?: string;
  amount: number;
  status: 'PAID' | 'PENDING';
  paidAt?: string;
  isHost?: boolean;
}

export interface BookingRecord {
  id: string; // e.g. HE-58291
  userId?: string;
  clubId: string;
  clubName: string;
  clubAddress?: string;
  courtId: string;
  courtName: string;
  sport: 'PADEL' | 'FUTBOL';
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  serviceFee: number;
  totalPaid: number;
  paymentType: 'FULL' | 'SPLIT';
  splitPlayers: number;
  paidPlayersCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  participants: BookingParticipant[];
  splitToken: string;
  splitLink: string;
  mpPreferenceId?: string;
  mpInitPoint?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Creates or overwrites a booking in Firestore
 */
export async function createBookingFirestore(booking: BookingRecord): Promise<boolean> {
  try {
    const docKey = `booking_${booking.id.toLowerCase()}`;
    const cleanBooking: BookingRecord = JSON.parse(
      JSON.stringify({
        ...booking,
        updatedAt: new Date().toISOString(),
      })
    );

    // 1. Direct document for fast key-value lookups & real-time snapshot
    await setDoc(doc(dbFirestore, 'settings', docKey), cleanBooking);

    // 1.b Also index under user collection if userId is provided
    if (cleanBooking.userId) {
      await setDoc(doc(dbFirestore, 'users', cleanBooking.userId, 'bookings', docKey), cleanBooking);
    }

    // 2. Append or update in the centralized hay_equipo_bookings registry
    const registryRef = doc(dbFirestore, 'settings', 'hay_equipo_bookings');
    const registrySnap = await getDoc(registryRef);
    let existingList: BookingRecord[] = [];
    if (registrySnap.exists() && Array.isArray(registrySnap.data()?.bookings)) {
      existingList = registrySnap.data()?.bookings;
    }
    const filtered = existingList.filter((b) => b.id !== booking.id);
    filtered.unshift(cleanBooking);

    await setDoc(registryRef, {
      bookings: filtered.slice(0, 100), // Keep recent 100 bookings
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return true;
  } catch (e) {
    console.error('Error saving booking to Firestore:', e);
    return false;
  }
}

/**
 * Retrieves a booking by its ID
 */
export async function getBookingByIdFirestore(bookingId: string): Promise<BookingRecord | null> {
  try {
    const cleanId = bookingId.trim().toLowerCase();
    const docKey = `booking_${cleanId}`;
    const snap = await getDoc(doc(dbFirestore, 'settings', docKey));
    if (snap.exists()) {
      return snap.data() as BookingRecord;
    }

    // Fallback lookup in registry
    const registrySnap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_bookings'));
    if (registrySnap.exists()) {
      const list: BookingRecord[] = registrySnap.data()?.bookings || [];
      const found = list.find((b) => b.id.toLowerCase() === cleanId);
      if (found) return found;
    }
  } catch (e) {
    console.error('Error fetching booking by ID:', e);
  }
  return null;
}

/**
 * Retrieves a booking by its split token (or lowercase booking ID)
 */
export async function getBookingBySplitTokenFirestore(token: string): Promise<BookingRecord | null> {
  try {
    const cleanToken = token.trim().toLowerCase();
    const docKey = `booking_${cleanToken}`;
    const snap = await getDoc(doc(dbFirestore, 'settings', docKey));
    if (snap.exists()) {
      return snap.data() as BookingRecord;
    }

    // Fallback lookup in registry
    const registrySnap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_bookings'));
    if (registrySnap.exists()) {
      const list: BookingRecord[] = registrySnap.data()?.bookings || [];
      const found = list.find(
        (b) => b.splitToken.toLowerCase() === cleanToken || b.id.toLowerCase() === cleanToken
      );
      if (found) return found;
    }
  } catch (e) {
    console.error('Error fetching booking by split token:', e);
  }
  return null;
}

/**
 * Pays a participant slot for an invited friend
 */
export async function payBookingParticipantFirestore(
  bookingId: string,
  participantName: string,
  phone?: string
): Promise<{ success: boolean; booking?: BookingRecord; error?: string }> {
  try {
    const cleanId = bookingId.trim().toLowerCase();
    const docKey = `booking_${cleanId}`;
    const bookingRef = doc(dbFirestore, 'settings', docKey);
    const snap = await getDoc(bookingRef);

    let booking: BookingRecord | null = null;
    if (snap.exists()) {
      booking = snap.data() as BookingRecord;
    } else {
      booking = await getBookingByIdFirestore(bookingId);
    }

    if (!booking) {
      return { success: false, error: 'Reserva no encontrada' };
    }

    const participants = [...(booking.participants || [])];

    // Find first pending participant
    const pendingIdx = participants.findIndex((p) => p.status === 'PENDING');
    if (pendingIdx === -1) {
      return { success: false, error: 'Todos los cupos ya fueron abonados' };
    }

    const shareAmount = Math.round(booking.totalPrice / booking.splitPlayers);

    participants[pendingIdx] = {
      ...participants[pendingIdx],
      name: participantName.trim() || `Jugador ${pendingIdx + 1}`,
      phone: phone || '',
      amount: shareAmount,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    };

    const newPaidCount = participants.filter((p) => p.status === 'PAID').length;
    const newTotalPaid = participants
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0) + (booking.serviceFee || 0);

    const isAllPaid = newPaidCount >= booking.splitPlayers;

    const updatedBooking: BookingRecord = {
      ...booking,
      participants,
      paidPlayersCount: newPaidCount,
      totalPaid: newTotalPaid,
      status: isAllPaid ? 'CONFIRMED' : booking.status,
      updatedAt: new Date().toISOString(),
    };

    const cleanUpdatedBooking: BookingRecord = JSON.parse(JSON.stringify(updatedBooking));
    await setDoc(bookingRef, cleanUpdatedBooking);

    // Also update registry
    const registryRef = doc(dbFirestore, 'settings', 'hay_equipo_bookings');
    const registrySnap = await getDoc(registryRef);
    if (registrySnap.exists() && Array.isArray(registrySnap.data()?.bookings)) {
      const list: BookingRecord[] = registrySnap.data()?.bookings;
      const updatedList = list.map((b) => (b.id === booking!.id ? cleanUpdatedBooking : b));
      await setDoc(registryRef, { bookings: updatedList, updatedAt: new Date().toISOString() }, { merge: true });
    }

    return {
      success: true,
      booking: cleanUpdatedBooking,
    };
  } catch (e: any) {
    console.error('Error paying participant:', e);
    return { success: false, error: e?.message || 'Error al procesar el pago' };
  }
}

/**
 * Listens to real-time changes on a specific booking
 */
export function listenBookingFirestore(
  bookingId: string,
  callback: (booking: BookingRecord | null) => void
) {
  const cleanId = bookingId.trim().toLowerCase();
  const docKey = `booking_${cleanId}`;
  const bookingRef = doc(dbFirestore, 'settings', docKey);
  return onSnapshot(
    bookingRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as BookingRecord);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Error in listenBookingFirestore snapshot:', err);
    }
  );
}

/**
 * Retrieves all bookings, optionally filtered by clubId
 */
export async function getBookingsFirestore(clubId?: string): Promise<BookingRecord[]> {
  try {
    const snap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_bookings'));
    if (snap.exists() && Array.isArray(snap.data()?.bookings)) {
      const list: BookingRecord[] = snap.data()?.bookings;
      if (clubId) {
        return list.filter((b) => b.clubId === clubId);
      }
      return list;
    }
  } catch (e) {
    console.error('Error fetching bookings:', e);
  }
  return [];
}

/**
 * Retrieves all bookings associated with a specific user (by userId or userEmail)
 */
export async function getUserBookingsFirestore(userId: string, userEmail?: string): Promise<BookingRecord[]> {
  const mapById = new Map<string, BookingRecord>();

  try {
    // 1. Fetch from user subcollection /users/{userId}/bookings
    if (userId) {
      const userBookingsRef = collection(dbFirestore, 'users', userId, 'bookings');
      const snap = await getDocs(userBookingsRef);
      snap.forEach((d) => {
        const item = d.data() as BookingRecord;
        if (item && item.id) {
          mapById.set(item.id.toLowerCase(), item);
        }
      });
    }

    // 2. Fetch from centralized registry to catch any created by email or matching userId
    const registrySnap = await getDoc(doc(dbFirestore, 'settings', 'hay_equipo_bookings'));
    if (registrySnap.exists() && Array.isArray(registrySnap.data()?.bookings)) {
      const registryList: BookingRecord[] = registrySnap.data()?.bookings;
      const normalizedEmail = userEmail?.trim().toLowerCase();

      registryList.forEach((b) => {
        const matchesUid = userId && b.userId === userId;
        const matchesEmail = normalizedEmail && b.buyer?.email?.trim().toLowerCase() === normalizedEmail;
        if (matchesUid || matchesEmail) {
          if (!mapById.has(b.id.toLowerCase())) {
            mapById.set(b.id.toLowerCase(), b);
          }
        }
      });
    }
  } catch (e) {
    console.error('Error fetching user bookings:', e);
  }

  return Array.from(mapById.values()).sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return tB - tA;
  });
}

/**
 * Saves or updates extended player profile details in Firestore
 */
export async function saveUserProfileFirestore(
  uid: string,
  profileData: {
    name?: string;
    phone?: string;
    email?: string;
    padelCategory?: string;
    photoURL?: string;
  }
): Promise<boolean> {
  try {
    const userRef = doc(dbFirestore, 'users', uid);
    await setDoc(
      userRef,
      {
        ...profileData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('Error saving user profile to Firestore:', e);
    return false;
  }
}

/**
 * Retrieves player profile from Firestore
 */
export async function getUserProfileFirestore(uid: string): Promise<any | null> {
  try {
    const userRef = doc(dbFirestore, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.error('Error fetching user profile from Firestore:', e);
  }
  return null;
}

/* ────────────────────────────────────────────────────────────
   Fixed Slots (Turnos Fijos Semanales)
   ──────────────────────────────────────────────────────────── */

export interface FixedSlotSubscriptionFirestore {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  clubId: string;
  clubName: string;
  courtId: string;
  courtName: string;
  sportType: 'PADEL' | 'FUTBOL_5' | 'FUTBOL_7';
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ...
  startTime: string;
  endTime: string;
  startDate: string;
  durationMonths: number;
  pricePerOccurrence: number;
  discountMonthlyTotal: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  occurrences: RecurringOccurrenceFirestore[];
  createdAt: string;
}

export interface RecurringOccurrenceFirestore {
  id: string;
  subscriptionId: string;
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  courtName: string;
  clubName: string;
  status: 'SCHEDULED' | 'RELEASED_TO_MARKETPLACE' | 'COMPLETED';
  isPaid: boolean;
  price: number;
}

export async function saveUserFixedSlotFirestore(
  userId: string,
  sub: Omit<FixedSlotSubscriptionFirestore, 'occurrences'>,
  occurrences: RecurringOccurrenceFirestore[]
): Promise<boolean> {
  try {
    const fullSub: FixedSlotSubscriptionFirestore = {
      ...sub,
      occurrences,
      createdAt: new Date().toISOString()
    };
    const subRef = doc(dbFirestore, 'users', userId, 'fixed_slots', sub.id);
    await setDoc(subRef, fullSub);

    // Also persist in global collection for club panel
    const globalRef = doc(dbFirestore, 'fixed_slots', sub.id);
    await setDoc(globalRef, fullSub);

    return true;
  } catch (e) {
    console.error('Error saving fixed slot to Firestore:', e);
    return false;
  }
}

export async function getUserFixedSlotsFirestore(userId: string): Promise<{
  subscriptions: FixedSlotSubscriptionFirestore[];
  occurrences: RecurringOccurrenceFirestore[];
}> {
  try {
    const subsRef = collection(dbFirestore, 'users', userId, 'fixed_slots');
    const snap = await getDocs(subsRef);
    const subscriptions: FixedSlotSubscriptionFirestore[] = [];
    const occurrences: RecurringOccurrenceFirestore[] = [];

    snap.forEach((d) => {
      const data = d.data() as FixedSlotSubscriptionFirestore;
      subscriptions.push(data);
      if (data.occurrences && Array.isArray(data.occurrences)) {
        occurrences.push(...data.occurrences);
      }
    });

    return { subscriptions, occurrences };
  } catch (e) {
    console.error('Error fetching fixed slots from Firestore:', e);
    return { subscriptions: [], occurrences: [] };
  }
}

export async function liberateOccurrenceFirestore(
  userId: string,
  subscriptionId: string,
  occurrenceId: string
): Promise<boolean> {
  try {
    const subRef = doc(dbFirestore, 'users', userId, 'fixed_slots', subscriptionId);
    const snap = await getDoc(subRef);
    if (!snap.exists()) return false;

    const data = snap.data() as FixedSlotSubscriptionFirestore;
    const updatedOccurrences = (data.occurrences || []).map(occ => {
      if (occ.id === occurrenceId) {
        return { ...occ, status: 'RELEASED_TO_MARKETPLACE' as const };
      }
      return occ;
    });

    await updateDoc(subRef, { occurrences: updatedOccurrences });

    // Also update global
    const globalRef = doc(dbFirestore, 'fixed_slots', subscriptionId);
    await updateDoc(globalRef, { occurrences: updatedOccurrences }).catch(() => {});

    return true;
  } catch (e) {
    console.error('Error liberating occurrence in Firestore:', e);
    return false;
  }
}

