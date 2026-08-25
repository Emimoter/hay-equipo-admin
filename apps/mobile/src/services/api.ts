import { Sport, Club, Court, TimeSlot, Booking, SplitPayment, FixedSlotSubscription, RecurringOccurrence } from '@hay-equipo/contracts';
import { INITIAL_CLUBS, INITIAL_COURTS } from '@hay-equipo/db';
import { getClubsFirestore, getCourtsFirestore } from './firebase';

const API_BASE_URL = 'http://localhost:4000/api';

// In-memory instant cache for maximum fluidity
let memoryClubsCache: Club[] = INITIAL_CLUBS;
let isSyncingClubs = false;

// Background sync with Firestore
async function syncClubsInBackground() {
  if (isSyncingClubs) return;
  isSyncingClubs = true;
  try {
    const firestoreClubs = await getClubsFirestore();
    if (firestoreClubs && firestoreClubs.length > 0) {
      memoryClubsCache = firestoreClubs;
    }
  } catch (e) {
    console.log('Background sync info:', e);
  } finally {
    isSyncingClubs = false;
  }
}

// Initial trigger
syncClubsInBackground();

export class MobileApiService {
  public async getSports(): Promise<Sport[]> {
    return [
      { id: 'sp-padel', name: 'Pádel', slug: 'padel', icon: 'padel', defaultDurationMinutes: 90, active: true },
      { id: 'sp-f5', name: 'Fútbol 5', slug: 'futbol-5', icon: 'football', defaultDurationMinutes: 60, active: true },
      { id: 'sp-f7', name: 'Fútbol 7', slug: 'futbol-7', icon: 'football', defaultDurationMinutes: 60, active: true },
      { id: 'sp-f8', name: 'Fútbol 8', slug: 'futbol-8', icon: 'football', defaultDurationMinutes: 60, active: true },
      { id: 'sp-f11', name: 'Fútbol 11', slug: 'futbol-11', icon: 'football', defaultDurationMinutes: 90, active: true }
    ];
  }

  public async getClubs(sport?: string): Promise<Club[]> {
    syncClubsInBackground();

    const clubsList = memoryClubsCache.length > 0 ? memoryClubsCache : INITIAL_CLUBS;
    if (!sport) return clubsList;

    const sportUpper = sport.toUpperCase();
    return clubsList.filter((c: any) => {
      if (c.active === false) return false;
      if (sportUpper === 'PADEL') {
        return c.name.toLowerCase().includes('pádel') || c.name.toLowerCase().includes('padel') || (c.description && c.description.toLowerCase().includes('padel')) || true;
      }
      if (sportUpper.includes('FUTBOL')) {
        return c.name.toLowerCase().includes('fútbol') || c.name.toLowerCase().includes('futbol') || c.name.toLowerCase().includes('7') || c.name.toLowerCase().includes('5');
      }
      return true;
    });
  }

  public async getClubDetails(clubId: string): Promise<(Club & { courts: Court[] }) | null> {
    const clubs = await this.getClubs();
    const club = clubs.find(c => c.id === clubId) || clubs[0];
    if (!club) return null;

    const matchingCourts = INITIAL_COURTS.filter(c => c.clubId === club.id);
    if (matchingCourts.length > 0) {
      return { ...club, courts: matchingCourts };
    }

    const mockCourts: Court[] = [
      {
        id: `court-${club.id}-1`,
        clubId: club.id,
        sportType: 'PADEL',
        name: 'Cancha 1 (Panorámica Pro)',
        surface: 'Césped Texturado',
        isCovered: true,
        hasLighting: true,
        durationMinutes: 90,
        pricePerHour: club.minPrice || 28000,
        priceFixedSlotDiscount: 0.15,
        images: club.images,
      },
      {
        id: `court-${club.id}-2`,
        clubId: club.id,
        sportType: 'PADEL',
        name: 'Cancha 2 (Blindex Cristal)',
        surface: 'Césped Sintético',
        isCovered: true,
        hasLighting: true,
        durationMinutes: 90,
        pricePerHour: (club.minPrice || 28000) + 2000,
        priceFixedSlotDiscount: 0.15,
        images: club.images,
      },
      {
        id: `court-${club.id}-3`,
        clubId: club.id,
        sportType: 'FUTBOL_5',
        name: 'Cancha Fútbol 5 Sintético',
        surface: 'Césped Sintético FIFA',
        isCovered: false,
        hasLighting: true,
        durationMinutes: 60,
        pricePerHour: 26000,
        priceFixedSlotDiscount: 0.1,
        images: club.images,
      },
    ];

    return { ...club, courts: mockCourts };
  }

  public async searchAvailability(params: {
    sport?: string;
    date?: string;
    timeFrom?: string;
  }): Promise<TimeSlot[]> {
    const today = params.date || new Date().toISOString().split('T')[0];
    const clubs = await this.getClubs(params.sport);
    const slots: TimeSlot[] = [];
    const times = ['18:00', '19:30', '21:00', '22:30'];

    for (const club of clubs.slice(0, 8)) {
      const courts = INITIAL_COURTS.filter(c => c.clubId === club.id);
      const activeCourts = courts.length > 0 ? courts : [
        {
          id: `court-${club.id}-1`,
          clubId: club.id,
          sportType: 'PADEL',
          name: 'Cancha 1 (Panorámica)',
          durationMinutes: 90,
          pricePerHour: club.minPrice || 28000,
          priceFixedSlotDiscount: 0.15,
        }
      ];

      for (const court of activeCourts) {
        for (const t of times) {
          const [h, m] = t.split(':').map(Number);
          const duration = court.durationMinutes || 90;
          const totalM = h * 60 + m + duration;
          const endH = Math.floor(totalM / 60) % 24;
          const endM = totalM % 60;
          const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

          slots.push({
            courtId: court.id,
            courtName: court.name,
            clubId: club.id,
            clubName: club.name,
            sportType: (court.sportType || 'PADEL') as any,
            date: today,
            startTime: t,
            endTime: endTimeStr,
            durationMinutes: duration,
            price: court.pricePerHour || club.minPrice || 28000,
            fixedSlotPrice: Math.round((court.pricePerHour || club.minPrice || 28000) * 0.85),
            status: 'AVAILABLE',
          });
        }
      }
    }

    return slots;
  }

  public async holdBooking(params: {
    courtId: string;
    date: string;
    startTime: string;
    userId: string;
    userName: string;
    userPhone: string;
    paymentType: 'FULL' | 'SPLIT';
    splitPlayerCount?: number;
  }): Promise<{ success: boolean; booking?: Booking; checkout?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async confirmBooking(bookingId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  public async getSplitDetails(token: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/split/${token}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  public async paySplitShare(token: string, participantId: string, name: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/split/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, playerName: name })
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }

  public async getUserBookings(userId: string): Promise<{
    upcoming: Booking[];
    past: Booking[];
    cancelled: Booking[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/user/${userId}`);
      const data = await res.json();
      return {
        upcoming: data.upcoming || [],
        past: data.past || [],
        cancelled: data.cancelled || []
      };
    } catch {
      return { upcoming: [], past: [], cancelled: [] };
    }
  }

  public async subscribeFixedSlot(params: {
    userId: string;
    userName: string;
    userPhone: string;
    clubId: string;
    courtId: string;
    dayOfWeek: number;
    startTime: string;
    durationMonths: number;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/fixed-slots/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public async getUserFixedSlots(userId: string): Promise<{
    subscriptions: FixedSlotSubscription[];
    occurrences: RecurringOccurrence[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/fixed-slots/user/${userId}`);
      return await res.json();
    } catch {
      return { subscriptions: [], occurrences: [] };
    }
  }

  public async liberateOccurrence(occurrenceId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/fixed-slots/occurrences/${occurrenceId}/liberate`, {
        method: 'POST'
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  }
}

export const mobileApi = new MobileApiService();
