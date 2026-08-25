import { Sport, Club, Court, TimeSlot, Booking, SplitPayment, FixedSlotSubscription, RecurringOccurrence } from '@hay-equipo/contracts';
import { INITIAL_CLUBS, INITIAL_COURTS } from '@hay-equipo/db';
import { getClubsFirestore, getCourtsFirestore } from './firebase';

const API_BASE_URL = 'http://localhost:4000/api';

// In-memory instant cache for maximum fluidity
let memoryClubsCache: Club[] = INITIAL_CLUBS;
let isSyncingClubs = false;
const memoryBookings: Booking[] = [];
const memorySplitRooms = new Map<string, any>();

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

export function clubSupportsSport(club: any, sport?: string): boolean {
  if (!sport || sport === 'ALL') return true;
  const s = sport.toUpperCase().trim();

  // 1. Check explicit club.sports array (primary source of truth)
  if (Array.isArray(club.sports) && club.sports.length > 0) {
    const sportsUpper = club.sports.map((sp: string) => sp.toUpperCase());
    if (s === 'PADEL') return sportsUpper.includes('PADEL');
    if (s === 'FUTBOL_5') return sportsUpper.includes('FUTBOL_5') || sportsUpper.includes('FUTBOL');
    if (s === 'FUTBOL_7') return sportsUpper.includes('FUTBOL_7');
    if (s === 'FUTBOL') return sportsUpper.some((sp: string) => sp.startsWith('FUTBOL'));
    if (s === 'TENIS') return sportsUpper.includes('TENIS');
    if (s === 'PICKLEBALL') return sportsUpper.includes('PICKLEBALL');
    return sportsUpper.includes(s);
  }

  // 2. Check if INITIAL_COURTS has courts for this club ID or slug
  const clubCourts = INITIAL_COURTS.filter((c: any) => c.clubId === club.id || c.clubId === club.slug);
  if (clubCourts.length > 0) {
    return clubCourts.some((court: any) => {
      const cSport = court.sportType.toUpperCase();
      if (s === 'PADEL') return cSport === 'PADEL';
      if (s === 'FUTBOL_5') return cSport === 'FUTBOL_5' || cSport === 'FUTBOL';
      if (s === 'FUTBOL_7') return cSport === 'FUTBOL_7';
      if (s === 'FUTBOL_8') return cSport === 'FUTBOL_8';
      if (s === 'FUTBOL_11') return cSport === 'FUTBOL_11';
      if (s === 'FUTBOL') return cSport.startsWith('FUTBOL');
      if (s === 'TENIS') return cSport === 'TENIS';
      if (s === 'PICKLEBALL') return cSport === 'PICKLEBALL';
      return cSport === s;
    });
  }

  // 3. Fallback keyword matching from name & description
  const nameLower = (club.name || '').toLowerCase();
  const descLower = (club.description || '').toLowerCase();
  const fullText = `${nameLower} ${descLower}`;

  const isTennis = fullText.includes('tenis') || fullText.includes('nautico') || fullText.includes('náutico') || fullText.includes('edison') || fullText.includes('lawn') || fullText.includes('ladrillo');
  const isFutbol7 = fullText.includes('fútbol 7') || fullText.includes('futbol 7') || fullText.includes('f7') || fullText.includes('catonio') || fullText.includes('área 7') || fullText.includes('area 7') || fullText.includes('telefonos') || fullText.includes('teléfonos');
  const isFutbol5 = fullText.includes('fútbol 5') || fullText.includes('futbol 5') || fullText.includes('f5') || fullText.includes('papi') || fullText.includes('potrero') || fullText.includes('balón 5') || fullText.includes('luro 5102') || fullText.includes('américa') || fullText.includes('america');
  const isFutbolGeneric = fullText.includes('fútbol') || fullText.includes('futbol');
  const isPadel = fullText.includes('pádel') || fullText.includes('padel') || fullText.includes('cristal') || fullText.includes('blindex') || fullText.includes('panorámica') || fullText.includes('laverde') || fullText.includes('arena') || fullText.includes('naranjos') || fullText.includes('match point') || fullText.includes('trebi') || fullText.includes('house');

  if (s === 'TENIS') return isTennis;
  if (s === 'FUTBOL_7') return isFutbol7;
  if (s === 'FUTBOL_5') return isFutbol5 || (isFutbolGeneric && !isFutbol7);
  if (s === 'FUTBOL') return isFutbol5 || isFutbol7 || isFutbolGeneric;
  if (s === 'PADEL') return isPadel || (!isTennis && !isFutbol5 && !isFutbol7);

  return false;
}

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
    return clubsList.filter((c: any) => {
      if (c.active === false) return false;
      return clubSupportsSport(c, sport);
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
      const data = await res.json();
      if (data.success && data.booking) {
        memoryBookings.push(data.booking);
        return data;
      }
    } catch {
      // Fallback in-memory creation for standalone mobile execution
    }

    const court = INITIAL_COURTS.find(c => c.id === params.courtId);
    const club = memoryClubsCache.find(c => c.id === court?.clubId);
    const duration = court?.durationMinutes || 90;
    const startParts = params.startTime.split(':').map(Number);
    const endMinutes = startParts[0] * 60 + startParts[1] + duration;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    const totalPrice = (court?.pricePerHour || club?.minPrice || 28000) * (duration / 60);
    const bookingId = `bk_${Date.now()}`;
    const splitToken = params.paymentType === 'SPLIT' ? `HE-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const newBooking: Booking = {
      id: bookingId,
      courtId: params.courtId,
      courtName: court?.name || 'Cancha Central',
      clubId: club?.id || 'club-laverde-jara',
      clubName: club?.name || 'Club Deportivo',
      sportType: (court?.sportType || 'PADEL') as any,
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      date: params.date,
      startTime: params.startTime,
      endTime: endTimeStr,
      totalPrice,
      serviceFee: 2000,
      status: 'HELD',
      paymentType: params.paymentType,
      paymentStatus: 'PENDING',
      isFixedSlot: false,
      splitToken,
      createdAt: new Date().toISOString()
    };

    memoryBookings.push(newBooking);

    if (params.paymentType === 'SPLIT' && splitToken) {
      const count = params.splitPlayerCount || 4;
      const shareAmount = Math.round(totalPrice / count);

      const splitRoom = {
        id: `sp_${bookingId}`,
        bookingId,
        totalAmount: totalPrice,
        sharesCount: count,
        shareToken: splitToken,
        status: 'PARTIALLY_PAID',
        participants: [
          {
            id: `part_org_${Date.now()}`,
            splitPaymentId: `sp_${bookingId}`,
            userId: params.userId,
            name: `${params.userName} (Organizador)`,
            phone: params.userPhone,
            amount: shareAmount,
            status: 'PAID',
            paidAt: new Date().toISOString()
          },
          ...Array.from({ length: count - 1 }, (_, i) => ({
            id: `part_guest_${i + 1}_${Date.now()}`,
            splitPaymentId: `sp_${bookingId}`,
            name: `Jugador ${i + 2}`,
            amount: shareAmount,
            status: 'PENDING'
          }))
        ]
      };

      memorySplitRooms.set(splitToken, splitRoom);
    }

    return { success: true, booking: newBooking };
  }

  public async confirmBooking(bookingId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (data.success) {
        const found = memoryBookings.find(b => b.id === bookingId);
        if (found) {
          found.status = 'CONFIRMED';
          found.paymentStatus = 'APPROVED';
        }
        return true;
      }
    } catch {
      // Fallback
    }

    const found = memoryBookings.find(b => b.id === bookingId);
    if (found) {
      found.status = 'CONFIRMED';
      found.paymentStatus = 'APPROVED';
      return true;
    }
    return true;
  }

  public async getSplitDetails(token: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/split/${token}`);
      const data = await res.json();
      if (data?.data) return data;
    } catch {
      // Fallback
    }

    const split = memorySplitRooms.get(token);
    if (!split) return null;

    const booking = memoryBookings.find(b => b.id === split.bookingId);
    const paidParticipants = split.participants.filter((p: any) => p.status === 'PAID');
    const totalCollected = paidParticipants.reduce((sum: number, p: any) => sum + p.amount, 0);
    const isComplete = paidParticipants.length === split.sharesCount;

    return {
      success: true,
      data: {
        split,
        booking,
        participants: split.participants,
        totalCollected,
        paidCount: paidParticipants.length,
        totalSlots: split.sharesCount,
        isComplete
      }
    };
  }

  public async paySplitShare(token: string, participantId?: string, name?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/split/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, playerName: name })
      });
      const data = await res.json();
      if (data.success) return data;
    } catch {
      // Fallback
    }

    const split = memorySplitRooms.get(token);
    if (!split) return { success: false, error: 'Sala no encontrada' };

    let participant = participantId
      ? split.participants.find((p: any) => p.id === participantId)
      : split.participants.find((p: any) => p.status === 'PENDING');

    if (!participant) {
      const allPaid = split.participants.every((p: any) => p.status === 'PAID');
      return { success: true, isComplete: allPaid, split };
    }

    participant.status = 'PAID';
    if (name && name.trim()) {
      participant.name = name.trim();
    }
    participant.paidAt = new Date().toISOString();

    const allPaid = split.participants.every((p: any) => p.status === 'PAID');
    let booking = memoryBookings.find(b => b.id === split.bookingId);

    if (allPaid) {
      split.status = 'APPROVED';
      if (booking) {
        booking.status = 'CONFIRMED';
        booking.paymentStatus = 'APPROVED';
      }
    }

    return {
      success: true,
      isComplete: allPaid,
      booking,
      split
    };
  }

  public async getUserBookings(userId: string): Promise<{
    upcoming: Booking[];
    past: Booking[];
    cancelled: Booking[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/user/${userId}`);
      const data = await res.json();
      if (data.upcoming) return data;
    } catch {
      // Fallback
    }

    return {
      upcoming: memoryBookings.filter(b => b.userId === userId || true),
      past: [],
      cancelled: []
    };
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
