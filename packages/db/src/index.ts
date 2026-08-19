import { Sport, Club, Court, Booking, SplitPayment, FixedSlotSubscription, RecurringOccurrence, SportType } from '@hay-equipo/contracts';

export * from './realistic_seed';

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

export const INITIAL_CLUBS: Club[] = [
  {
    id: 'club-arena-palermo',
    name: 'Arena Pádel Palermo',
    slug: 'arena-padel-palermo',
    description: 'El complejo de pádel más moderno de Palermo. 4 canchas panorámicas indoor con césped profesional WPT, vestuarios de primer nivel, buffet con cerveza tirada y estacionamiento privado.',
    address: 'Av. Juan B. Justo 1450',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5885,
    longitude: -58.4352,
    phone: '+54 11 4771-8899',
    whatsapp: '+54 9 11 5555-1234',
    instagram: '@arenapadelpalermo',
    website: 'https://arenapadel.com.ar',
    rating: 4.9,
    reviewCount: 342,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: {
      parking: true,
      showers: true,
      lockerRooms: true,
      buffet: true,
      grill: true,
      wifi: true,
      equipmentRental: true,
      covered: true,
      lighting: true
    },
    openingTime: '08:00',
    closingTime: '01:00',
    minPrice: 38000,
    active: true
  },
  {
    id: 'club-belgrano-sports',
    name: 'Belgrano Sports Center',
    slug: 'belgrano-sports-center',
    description: 'Centro deportivo integral en Belgrano. 3 canchas de Pádel panorámicas y 2 canchas de Fútbol 5 sintético de alta densidad techadas.',
    address: 'Av. Cabildo 2850',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5612,
    longitude: -58.4589,
    phone: '+54 11 4782-9012',
    whatsapp: '+54 9 11 4444-5678',
    instagram: '@belgranosports',
    website: 'https://belgranosports.com.ar',
    rating: 4.7,
    reviewCount: 215,
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: {
      parking: true,
      showers: true,
      lockerRooms: true,
      buffet: true,
      grill: false,
      wifi: true,
      equipmentRental: true,
      covered: true,
      lighting: true
    },
    openingTime: '09:00',
    closingTime: '00:00',
    minPrice: 32000,
    active: true
  },
  {
    id: 'club-central-park-urquiza',
    name: 'Central Park Fútbol & Pádel',
    slug: 'central-park-urquiza',
    description: 'Complejo gigante con canchas de Fútbol 5, Fútbol 7, Fútbol 8 y Fútbol 11 profesional, además de 4 canchas de pádel outdoor iluminadas y parrillas para el tercer tiempo.',
    address: 'Av. Monroe 5100',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5750,
    longitude: -58.4900,
    phone: '+54 11 4521-3344',
    whatsapp: '+54 9 11 6666-9900',
    instagram: '@centralparkfutbol',
    website: 'https://centralparkfutbol.com.ar',
    rating: 4.8,
    reviewCount: 480,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: {
      parking: true,
      showers: true,
      lockerRooms: true,
      buffet: true,
      grill: true,
      wifi: true,
      equipmentRental: false,
      covered: false,
      lighting: true
    },
    openingTime: '08:00',
    closingTime: '01:30',
    minPrice: 42000,
    active: true
  }
];

export const INITIAL_COURTS: Court[] = [
  // Arena Pádel Palermo
  {
    id: 'court-arena-1',
    clubId: 'club-arena-palermo',
    sportType: 'PADEL',
    name: 'Cancha 1 (Central Panorámica)',
    surface: 'Césped Sintético Monofilamento WPT',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 45000,
    priceFixedSlotDiscount: 0.12,
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-arena-2',
    clubId: 'club-arena-palermo',
    sportType: 'PADEL',
    name: 'Cancha 2 (Indoor Azul)',
    surface: 'Césped Sintético Texturado',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 42000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-arena-3',
    clubId: 'club-arena-palermo',
    sportType: 'PADEL',
    name: 'Cancha 3 (Indoor)',
    surface: 'Césped Sintético',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 38000,
    priceFixedSlotDiscount: 0.10,
    images: []
  },
  // Belgrano Sports
  {
    id: 'court-belgrano-p1',
    clubId: 'club-belgrano-sports',
    sportType: 'PADEL',
    name: 'Pádel Panorámica 1',
    surface: 'Sintético Premium',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 40000,
    priceFixedSlotDiscount: 0.10,
    images: []
  },
  {
    id: 'court-belgrano-f5-1',
    clubId: 'club-belgrano-sports',
    sportType: 'FUTBOL_5',
    name: 'Fútbol 5 Techada A',
    surface: 'Césped Sintético Forbex 50mm',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: 32000,
    priceFixedSlotDiscount: 0.15,
    images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80']
  },
  // Central Park Urquiza
  {
    id: 'court-cp-f7-1',
    clubId: 'club-central-park-urquiza',
    sportType: 'FUTBOL_7',
    name: 'Fútbol 7 Principal',
    surface: 'Césped Sintético con Caucho',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: 48000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-cp-f11-1',
    clubId: 'club-central-park-urquiza',
    sportType: 'FUTBOL_11',
    name: 'Fútbol 11 Estadio',
    surface: 'Césped Sintético Homologado FIFA',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 95000,
    priceFixedSlotDiscount: 0.15,
    images: ['https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80']
  }
];

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
