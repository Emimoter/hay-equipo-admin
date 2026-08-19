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
      return data.data;
    } catch {
      return [];
    }
  }

  public async getClubDetails(clubId: string): Promise<(Club & { courts: Court[] }) | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/clubs/${clubId}`);
      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
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
      return data.data || [];
    } catch {
      return [];
    }
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
