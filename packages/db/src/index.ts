import { Sport, Club, Court, Booking, SplitPayment, FixedSlotSubscription, RecurringOccurrence, SportType } from '@hay-equipo/contracts';
import { MDP_REAL_CLUBS, MDP_REAL_COURTS } from './mdp_clubs';
import { REALISTIC_ARG_CLUBS, REALISTIC_ARG_COURTS } from './realistic_seed';

export * from './realistic_seed';
export * from './mdp_clubs';

export const INITIAL_SPORTS: Sport[] = [
  { id: 'sp-padel', name: 'Pádel', slug: 'padel', icon: 'tennisball', defaultDurationMinutes: 90, active: true },
  { id: 'sp-f5', name: 'Fútbol 5', slug: 'futbol-5', icon: 'football', defaultDurationMinutes: 60, active: true },
  { id: 'sp-f7', name: 'Fútbol 7', slug: 'futbol-7', icon: 'football', defaultDurationMinutes: 60, active: true },
  { id: 'sp-f8', name: 'Fútbol 8', slug: 'futbol-8', icon: 'football', defaultDurationMinutes: 60, active: true },
  { id: 'sp-f11', name: 'Fútbol 11', slug: 'futbol-11', icon: 'football', defaultDurationMinutes: 90, active: true },
  { id: 'sp-tenis', name: 'Tenis', slug: 'tenis', icon: 'tennisball', defaultDurationMinutes: 60, active: true },
  { id: 'sp-pickleball', name: 'Pickleball', slug: 'pickleball', icon: 'tennisball', defaultDurationMinutes: 60, active: true },
  { id: 'sp-basquet', name: 'Básquet', slug: 'basquet', icon: 'basketball', defaultDurationMinutes: 60, active: true },
  { id: 'sp-voley', name: 'Vóley', slug: 'voley', icon: 'volleyball', defaultDurationMinutes: 60, active: true },
  { id: 'sp-hockey', name: 'Hockey', slug: 'hockey', icon: 'hockey-puck', defaultDurationMinutes: 60, active: true },
  { id: 'sp-squash', name: 'Squash', slug: 'squash', icon: 'tennisball', defaultDurationMinutes: 45, active: true }
];

export const INITIAL_CLUBS: Club[] = [...REALISTIC_ARG_CLUBS, ...MDP_REAL_CLUBS];

export const INITIAL_COURTS: Court[] = [...REALISTIC_ARG_COURTS, ...MDP_REAL_COURTS];

// In-Memory Database Store for stateful simulation with seed data
class DatabaseStore {
  public sports: Sport[] = [...INITIAL_SPORTS];
  public clubs: Club[] = [...INITIAL_CLUBS];
  public courts: Court[] = [...INITIAL_COURTS];
  public bookings: Booking[] = [];
  public splitPayments: SplitPayment[] = [];
  public fixedSlotSubscriptions: FixedSlotSubscription[] = [];
  public recurringOccurrences: RecurringOccurrence[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Seed an initial confirmed booking
    const bookingId1 = 'bk-seed-1';
    this.bookings.push({
      id: bookingId1,
      courtId: 'court-arena-1',
      courtName: 'Cancha 1 (Central Panorámica)',
      clubId: 'club-arena-palermo',
      clubName: 'Arena Pádel Palermo',
      sportType: 'PADEL',
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+54 9 11 5555-0001',
      date: today,
      startTime: '19:30',
      endTime: '21:00',
      totalPrice: 45000,
      serviceFee: 2000,
      status: 'CONFIRMED',
      paymentType: 'SPLIT',
      paymentStatus: 'PARTIALLY_PAID',
      isFixedSlot: false,
      splitToken: 'split-seed-token-123',
      createdAt: new Date().toISOString()
    });

    this.splitPayments.push({
      id: 'sp-seed-1',
      bookingId: bookingId1,
      totalAmount: 45000,
      sharesCount: 4,
      splitType: 'EQUAL',
      shareToken: 'split-seed-token-123',
      status: 'PENDING',
      participants: [
        { id: 'part-1', splitPaymentId: 'sp-seed-1', userId: 'usr-emi', name: 'Emiliano (Organizador)', phone: '+5491155550001', amount: 11250, status: 'PAID', paidAt: new Date().toISOString() },
        { id: 'part-2', splitPaymentId: 'sp-seed-1', name: 'Lucas', phone: '+5491155550002', amount: 11250, status: 'PAID', paidAt: new Date().toISOString() },
        { id: 'part-3', splitPaymentId: 'sp-seed-1', name: 'Nicolás', phone: '+5491155550003', amount: 11250, status: 'PENDING' },
        { id: 'part-4', splitPaymentId: 'sp-seed-1', name: 'Juan', phone: '+5491155550004', amount: 11250, status: 'PENDING' }
      ]
    });

    // Seed a Fixed Slot Subscription
    const subId = 'sub-seed-1';
    this.fixedSlotSubscriptions.push({
      id: subId,
      userId: 'usr-emi',
      userName: 'Emiliano',
      userPhone: '+54 9 11 5555-0001',
      clubId: 'club-arena-palermo',
      clubName: 'Arena Pádel Palermo',
      courtId: 'court-arena-2',
      courtName: 'Cancha 2 (Indoor Azul)',
      sportType: 'PADEL',
      dayOfWeek: 4, // Jueves
      startTime: '21:00',
      endTime: '22:30',
      startDate: today,
      durationMonths: 3,
      pricePerOccurrence: 37800,
      discountMonthlyTotal: 16800,
      billingFrequency: 'MONTHLY',
      status: 'ACTIVE',
      autoRenew: true,
      occurrencesGenerated: 12
    });

    // Generate upcoming occurrences for this fixed slot
    for (let i = 0; i < 4; i++) {
      const occDate = new Date();
      occDate.setDate(occDate.getDate() + (i * 7));
      const occDateStr = occDate.toISOString().split('T')[0];
      
      this.recurringOccurrences.push({
        id: `occ-${subId}-${i + 1}`,
        subscriptionId: subId,
        date: occDateStr,
        dayOfWeek: 4,
        startTime: '21:00',
        endTime: '22:30',
        courtName: 'Cancha 2 (Indoor Azul)',
        clubName: 'Arena Pádel Palermo',
        status: i === 1 ? 'RELEASED_TO_MARKETPLACE' : 'SCHEDULED',
        isPaid: i === 0,
        price: 37800
      });
    }
  }
}

export const db = new DatabaseStore();
