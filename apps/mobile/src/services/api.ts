import { Sport, Club, Court, TimeSlot, Booking, SplitPayment, FixedSlotSubscription, RecurringOccurrence } from '@hay-equipo/contracts';

const API_BASE_URL = 'http://localhost:4000/api';

export class MobileApiService {
  public async getSports(): Promise<Sport[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/sports`);
      const data = await res.json();
      return data.data;
    } catch {
      // Fallback
      return [
        { id: 'sp-padel', name: 'Pádel', slug: 'padel', icon: '🎾', defaultDurationMinutes: 90, active: true },
        { id: 'sp-f5', name: 'Fútbol 5', slug: 'futbol-5', icon: '⚽', defaultDurationMinutes: 60, active: true },
        { id: 'sp-f7', name: 'Fútbol 7', slug: 'futbol-7', icon: '⚽', defaultDurationMinutes: 60, active: true },
        { id: 'sp-f8', name: 'Fútbol 8', slug: 'futbol-8', icon: '⚽', defaultDurationMinutes: 60, active: true },
        { id: 'sp-f11', name: 'Fútbol 11', slug: 'futbol-11', icon: '⚽', defaultDurationMinutes: 90, active: true }
      ];
    }
  }

  public async getClubs(sport?: string): Promise<Club[]> {
    try {
      const url = sport ? `${API_BASE_URL}/clubs?sport=${sport}` : `${API_BASE_URL}/clubs`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.data && data.data.length > 0) return data.data;
    } catch {}

    // Fallback High-Quality Clubs in Buenos Aires with exact coordinates
    const fallbackClubs: Club[] = [
      {
        id: 'club-1',
        name: 'Club Padel Center',
        slug: 'club-padel-center',
        description: '4 canchas panorámicas de última generación con césped texturado y vestuarios premium.',
        address: 'Av. Juan B. Justo 2800, Palermo',
        city: 'CABA',
        province: 'Buenos Aires',
        latitude: -34.5885,
        longitude: -58.4350,
        phone: '+54 9 11 4455-8899',
        whatsapp: '+54 9 11 4455-8899',
        rating: 4.9,
        reviewCount: 142,
        images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'],
        amenities: {
          parking: true,
          showers: true,
          lockerRooms: true,
          buffet: true,
          grill: false,
          wifi: true,
          equipmentRental: true,
          covered: true,
          lighting: true,
        },
        openingTime: '08:00',
        closingTime: '00:00',
        minPrice: 18000,
        active: true,
      },
      {
        id: 'club-2',
        name: 'Complejo Deportivo Norte',
        slug: 'complejo-deportivo-norte',
        description: 'Canchas de fútbol 5 y 7 sintético Pro FIFA y 2 canchas de pádel techadas.',
        address: 'Av. Cabildo 3100, Belgrano',
        city: 'CABA',
        province: 'Buenos Aires',
        latitude: -34.5610,
        longitude: -58.4590,
        phone: '+54 9 11 5566-7788',
        whatsapp: '+54 9 11 5566-7788',
        rating: 4.8,
        reviewCount: 98,
        images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'],
        amenities: {
          parking: true,
          showers: true,
          lockerRooms: true,
          buffet: true,
          grill: true,
          wifi: true,
          equipmentRental: true,
          covered: false,
          lighting: true,
        },
        openingTime: '09:00',
        closingTime: '01:00',
        minPrice: 24000,
        active: true,
      },
      {
        id: 'club-3',
        name: 'Palermo Tenis & Padel Hub',
        slug: 'palermo-tenis-padel-hub',
        description: 'Canchas de tenis de polvo de ladrillo y pádel blindex en el corazón de Palermo Soho.',
        address: 'Honduras 4900, Palermo Soho',
        city: 'CABA',
        province: 'Buenos Aires',
        latitude: -34.5930,
        longitude: -58.4280,
        phone: '+54 9 11 6677-8899',
        whatsapp: '+54 9 11 6677-8899',
        rating: 4.7,
        reviewCount: 86,
        images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80'],
        amenities: {
          parking: false,
          showers: true,
          lockerRooms: true,
          buffet: true,
          grill: false,
          wifi: true,
          equipmentRental: true,
          covered: true,
          lighting: true,
        },
        openingTime: '08:00',
        closingTime: '23:30',
        minPrice: 16000,
        active: true,
      },
      {
        id: 'club-4',
        name: 'La Cantera Padel Club',
        slug: 'la-cantera-padel-club',
        description: '3 canchas full panorámicas techadas con iluminación LED de alta potencia.',
        address: 'Av. Corrientes 5400, Villa Crespo',
        city: 'CABA',
        province: 'Buenos Aires',
        latitude: -34.5980,
        longitude: -58.4410,
        phone: '+54 9 11 3344-5566',
        whatsapp: '+54 9 11 3344-5566',
        rating: 4.9,
        reviewCount: 115,
        images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'],
        amenities: {
          parking: true,
          showers: true,
          lockerRooms: true,
          buffet: true,
          grill: false,
          wifi: true,
          equipmentRental: true,
          covered: true,
          lighting: true,
        },
        openingTime: '08:00',
        closingTime: '00:00',
        minPrice: 22000,
        active: true,
      },
    ];

    return fallbackClubs;
  }

  public async getClubDetails(clubId: string): Promise<(Club & { courts: Court[] }) | null> {
    const clubs = await this.getClubs();
    const club = clubs.find(c => c.id === clubId) || clubs[0];
    if (!club) return null;

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
        pricePerHour: club.minPrice,
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
        pricePerHour: club.minPrice + 2000,
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
    try {
      const query = new URLSearchParams();
      if (params.sport) query.append('sport', params.sport);
      if (params.date) query.append('date', params.date);
      if (params.timeFrom) query.append('timeFrom', params.timeFrom);

      const res = await fetch(`${API_BASE_URL}/availability?${query.toString()}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) return data.data;
    } catch {}

    const today = params.date || new Date().toISOString().split('T')[0];

    const fallbackSlots: TimeSlot[] = [
      {
        courtId: 'court-1-1',
        courtName: 'Cancha 1 (Panorámica)',
        clubId: 'club-1',
        clubName: 'Club Padel Center',
        sportType: 'PADEL',
        date: today,
        startTime: '19:00',
        endTime: '20:30',
        durationMinutes: 90,
        price: 18000,
        fixedSlotPrice: 15300,
        status: 'AVAILABLE',
      },
      {
        courtId: 'court-1-2',
        courtName: 'Cancha 2 (Blindex Cristal)',
        clubId: 'club-1',
        clubName: 'Club Padel Center',
        sportType: 'PADEL',
        date: today,
        startTime: '20:30',
        endTime: '22:00',
        durationMinutes: 90,
        price: 20000,
        fixedSlotPrice: 17000,
        status: 'AVAILABLE',
      },
      {
        courtId: 'court-2-1',
        courtName: 'Cancha Fútbol 5 Sintético',
        clubId: 'club-2',
        clubName: 'Complejo Deportivo Norte',
        sportType: 'FUTBOL_5',
        date: today,
        startTime: '21:00',
        endTime: '22:00',
        durationMinutes: 60,
        price: 24000,
        fixedSlotPrice: 21600,
        status: 'AVAILABLE',
      },
      {
        courtId: 'court-3-1',
        courtName: 'Cancha Tenis Polvo 1',
        clubId: 'club-3',
        clubName: 'Palermo Tenis & Padel Hub',
        sportType: 'TENIS',
        date: today,
        startTime: '18:30',
        endTime: '20:00',
        durationMinutes: 90,
        price: 16000,
        fixedSlotPrice: 13600,
        status: 'AVAILABLE',
      },
      {
        courtId: 'court-4-1',
        courtName: 'Cancha Panorámica Techada 3',
        clubId: 'club-4',
        clubName: 'La Cantera Padel Club',
        sportType: 'PADEL',
        date: today,
        startTime: '22:00',
        endTime: '23:30',
        durationMinutes: 90,
        price: 22000,
        fixedSlotPrice: 18700,
        status: 'AVAILABLE',
      },
    ];

    return fallbackSlots;
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
