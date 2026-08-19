import { Club, Court, TimeSlot, SportType } from '@hay-equipo/contracts';

export const REALISTIC_ARG_CLUBS: Club[] = [
  {
    id: 'club-arena-palermo',
    name: 'Arena Pádel Palermo',
    slug: 'arena-padel-palermo',
    description: 'El complejo de pádel de referencia en Palermo Hollywood. 4 canchas panorámicas indoor con alfombra oficial World Padel Tour, iluminación LED de 8 focos sin sombra, vestuarios premium y un sports bar con cerveza tirada, hamburguesas gourmet y pantallas gigantes.',
    address: 'Humboldt 1980',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5842,
    longitude: -58.4367,
    phone: '+54 11 4772-5500',
    whatsapp: '+54 9 11 3344-8899',
    instagram: '@arenapadelpalermo',
    website: 'https://arenapadel.com.ar',
    rating: 4.9,
    reviewCount: 512,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1000&q=80'
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
    minPrice: 42000,
    active: true
  },
  {
    id: 'club-la-cantera-palermo',
    name: 'La Cantera Fútbol Club',
    slug: 'la-cantera-futbol-club',
    description: 'Centro de fútbol 5 y fútbol 7 de alto rendimiento en pleno Palermo. Césped sintético monofilamento de 60mm con shock pad, canchas techadas con ventilación cruzada y parrillas para el tercer tiempo.',
    address: 'Av. Dorrego 2450',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5775,
    longitude: -58.4290,
    phone: '+54 11 4778-9000',
    whatsapp: '+54 9 11 2233-4455',
    instagram: '@lacanterafutbol',
    website: 'https://lacanterafutbol.com.ar',
    rating: 4.8,
    reviewCount: 428,
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80'
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
    openingTime: '09:00',
    closingTime: '02:00',
    minPrice: 36000,
    active: true
  },
  {
    id: 'club-belgrano-r-padel',
    name: 'Belgrano R Pádel & Tennis Lounge',
    slug: 'belgrano-r-padel-lounge',
    description: 'Exclusivo club en Belgrano R con 3 canchas de pádel panorámicas con cristal templado de 12mm y 2 canchas de tenis polvo de ladrillo. Clases particulares, alquiler de paletas de alta gama y cafetería de especialidad.',
    address: 'Echeverría 3150',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5690,
    longitude: -58.4630,
    phone: '+54 11 4554-1122',
    whatsapp: '+54 9 11 8899-7766',
    instagram: '@belgranorpadel',
    website: 'https://belgranorpadel.com.ar',
    rating: 4.9,
    reviewCount: 389,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1000&q=80'
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
    openingTime: '07:30',
    closingTime: '23:30',
    minPrice: 40000,
    active: true
  },
  {
    id: 'club-central-park-urquiza',
    name: 'Central Park Complejo Deportivo',
    slug: 'central-park-complejo-deportivo',
    description: 'El predio multideporte más grande de Villa Urquiza. Canchas de Fútbol 5, Fútbol 7, Fútbol 8 y Fútbol 11 reglamentario con césped certificado FIFA, más 4 canchas de pádel techadas e iluminación profesional de 1000 lux.',
    address: 'Av. Monroe 5200',
    city: 'Buenos Aires',
    province: 'CABA',
    latitude: -34.5760,
    longitude: -58.4915,
    phone: '+54 11 4522-7788',
    whatsapp: '+54 9 11 6655-4433',
    instagram: '@centralparkdeportes',
    website: 'https://centralparkdeportes.com.ar',
    rating: 4.8,
    reviewCount: 680,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80'
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
    closingTime: '01:30',
    minPrice: 35000,
    active: true
  },
  {
    id: 'club-san-isidro-padel',
    name: 'San Isidro Pádel & Golf Club',
    slug: 'san-isidro-padel-club',
    description: 'Predio verde en Zona Norte. 5 canchas de pádel panorámicas al aire libre y techadas, rodeadas de parque, con vestuarios tipo spa y estacionamiento para más de 80 vehículos.',
    address: 'Av. del Libertador 16400',
    city: 'San Isidro',
    province: 'Buenos Aires',
    latitude: -34.4715,
    longitude: -58.5120,
    phone: '+54 11 4743-9988',
    whatsapp: '+54 9 11 9988-1122',
    instagram: '@sanisidropadel',
    website: 'https://sanisidropadel.com.ar',
    rating: 4.9,
    reviewCount: 410,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=80'
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
    closingTime: '00:30',
    minPrice: 44000,
    active: true
  }
];

export const REALISTIC_ARG_COURTS: Court[] = [
  // Arena Pádel Palermo
  {
    id: 'court-arena-wpt-1',
    clubId: 'club-arena-palermo',
    sportType: 'PADEL',
    name: 'Cancha 1 — Central Panorámica WPT',
    surface: 'Césped Sintético Monofilamento Azul WPT',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 48000,
    priceFixedSlotDiscount: 0.12,
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-arena-indoor-2',
    clubId: 'club-arena-palermo',
    sportType: 'PADEL',
    name: 'Cancha 2 — Indoor Vidrio Pro',
    surface: 'Césped Texturado 12mm',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 45000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-arena-indoor-3',
    clubId: 'club-arena-palermo',
    sportType: 'PADEL',
    name: 'Cancha 3 — Indoor Climatizada',
    surface: 'Césped Sintético Verde Clásico',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 42000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80']
  },

  // La Cantera Fútbol Club
  {
    id: 'court-cantera-f5-a',
    clubId: 'club-la-cantera-palermo',
    sportType: 'FUTBOL_5',
    name: 'Cancha A — Fútbol 5 Techada Premium',
    surface: 'Césped Sintético Forbex 50mm con Caucho',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: 36000,
    priceFixedSlotDiscount: 0.15,
    images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-cantera-f7-1',
    clubId: 'club-la-cantera-palermo',
    sportType: 'FUTBOL_7',
    name: 'Cancha 1 — Fútbol 7 Estadio',
    surface: 'Césped Sintético Monofilamento 60mm',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: 52000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80']
  },

  // Belgrano R Pádel
  {
    id: 'court-belgrano-p1',
    clubId: 'club-belgrano-r-padel',
    sportType: 'PADEL',
    name: 'Cancha 1 — Panorámica Cristal 12mm',
    surface: 'Césped Supercourt XN Azul',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 46000,
    priceFixedSlotDiscount: 0.12,
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-belgrano-p2',
    clubId: 'club-belgrano-r-padel',
    sportType: 'PADEL',
    name: 'Cancha 2 — Panorámica Outdoor',
    surface: 'Césped Sintético Fibrilado',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 40000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80']
  },

  // Central Park Urquiza
  {
    id: 'court-cp-f5-1',
    clubId: 'club-central-park-urquiza',
    sportType: 'FUTBOL_5',
    name: 'Fútbol 5 Techada — Pista Rápida',
    surface: 'Césped Sintético Forbex',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: 35000,
    priceFixedSlotDiscount: 0.15,
    images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-cp-f8-1',
    clubId: 'club-central-park-urquiza',
    sportType: 'FUTBOL_8',
    name: 'Fútbol 8 — Gran Estadio Urquiza',
    surface: 'Césped Sintético Bicolor FIFA Quality',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: 62000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-cp-f11-1',
    clubId: 'club-central-park-urquiza',
    sportType: 'FUTBOL_11',
    name: 'Fútbol 11 Profesional Reglamentario',
    surface: 'Césped Sintético de Competición Homologado FIFA',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 98000,
    priceFixedSlotDiscount: 0.15,
    images: ['https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-cp-padel-1',
    clubId: 'club-central-park-urquiza',
    sportType: 'PADEL',
    name: 'Pádel Panorámica Techada 1',
    surface: 'Césped Texturado Azul',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 44000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80']
  },

  // San Isidro Pádel
  {
    id: 'court-si-p1',
    clubId: 'club-san-isidro-padel',
    sportType: 'PADEL',
    name: 'Cancha 1 (Panorámica WPT Master)',
    surface: 'Césped Sintético Monofilamento WPT',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 48000,
    priceFixedSlotDiscount: 0.12,
    images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: 'court-si-p2',
    clubId: 'club-san-isidro-padel',
    sportType: 'PADEL',
    name: 'Cancha 2 (Parque Outdoor)',
    surface: 'Césped Sintético Fibrilado',
    isCovered: false,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: 44000,
    priceFixedSlotDiscount: 0.10,
    images: ['https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80']
  }
];
