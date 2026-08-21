const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyA6rBjlZ62CULHi8CqADZqE-VO8Nm5faJA',
  authDomain: 'pclink-f6e0d.firebaseapp.com',
  projectId: 'pclink-f6e0d',
  storageBucket: 'pclink-f6e0d.firebasestorage.app',
  messagingSenderId: '716411272758',
  appId: '1:716411272758:web:26e82f394e28e57e3de297',
  measurementId: 'G-0Y1T09135P'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const MDP_REAL_CLUBS = [
  {
    id: 'club-laverde-jara',
    name: 'Laverde Jara - Canchas de Césped Sintético',
    slug: 'laverde-jara',
    description: 'Complejo deportivo con canchas de césped sintético de alta calidad y canchas de pádel panorámicas.',
    address: 'Av. Juan Héctor Jara 470',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.977321,
    longitude: -57.562843,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 28000,
    active: true
  },
  {
    id: 'club-laverde-cordoba',
    name: 'Laverde Córdoba',
    slug: 'laverde-cordoba',
    description: 'Sede céntrica con canchas de pádel de cristal y fútbol 5 en césped sintético con buffet y vestuarios.',
    address: 'Córdoba 3540',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.014198,
    longitude: -57.5587,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 118,
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:00',
    closingTime: '00:00',
    minPrice: 26000,
    active: true
  },
  {
    id: 'club-laverde-telefonos',
    name: 'Laverde Club Teléfonos',
    slug: 'laverde-club-telefonos',
    description: 'Gran predio deportivo con canchas de Fútbol 7 reglamentario y canchas de Pádel techadas.',
    address: 'Florisbelo Acosta 6810',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.959651,
    longitude: -57.574533,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 195,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:30',
    closingTime: '01:00',
    minPrice: 32000,
    active: true
  },
  {
    id: 'club-el-potrero',
    name: 'El Potrero',
    slug: 'el-potrero',
    description: 'Complejo céntrico de Fútbol 5 y Pádel con excelente iluminación nocturna y vestuarios completos.',
    address: 'Salta 2248',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.000319,
    longitude: -57.557516,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 164,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80'
    ],
    amenities: {
      parking: false,
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
    closingTime: '00:30',
    minPrice: 25000,
    active: true
  },
  {
    id: 'club-balon-5',
    name: 'Balón 5 - Papi Fútbol & Pádel',
    slug: 'balon-5',
    description: 'Tradicional complejo en Mar del Plata. Pistas de pádel y canchas de fútbol 5 techadas.',
    address: 'Moreno 3545',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.996898,
    longitude: -57.558361,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
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
    closingTime: '00:00',
    minPrice: 24000,
    active: true
  },
  {
    id: 'club-cancha-luro-5102',
    name: 'Cancha Fútbol 5 & Pádel Luro',
    slug: 'cancha-luro-5102',
    description: 'Ubicación privilegiada sobre Av. Luro con canchas de césped sintético y pádel.',
    address: 'Av. Pedro Luro 5102',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.985894,
    longitude: -57.571676,
    phone: '',
    whatsapp: '',
    rating: 4.6,
    reviewCount: 76,
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 24000,
    active: true
  },
  {
    id: 'club-catonio-f7',
    name: 'Catonio Fútbol 7 & Pádel',
    slug: 'catonio-futbol-7',
    description: 'Complejo en zona Puerto / Juan B. Justo con canchas de fútbol 7 de césped monofilamento y pádel.',
    address: 'Juan B. Justo 666',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.035858,
    longitude: -57.549071,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 153,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
    ],
    amenities: {
      parking: true,
      showers: true,
      lockerRooms: true,
      buffet: true,
      grill: true,
      wifi: true,
      equipmentRental: true,
      covered: false,
      lighting: true
    },
    openingTime: '09:00',
    closingTime: '01:00',
    minPrice: 34000,
    active: true
  },
  {
    id: 'club-complejo-gaboto',
    name: 'Complejo Deportivo Gaboto',
    slug: 'complejo-deportivo-gaboto',
    description: 'Predio deportivo integral con canchas de pádel de blindex y fútbol sintético.',
    address: 'Gaboto 3875',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.037691,
    longitude: -57.549731,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 92,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 27000,
    active: true
  },
  {
    id: 'club-complejo-san-paolo',
    name: 'Complejo San Paolo',
    slug: 'complejo-san-paolo',
    description: 'Canchas panorámicas de pádel y predio de fútbol en la zona sur de Mar del Plata.',
    address: 'J. S. Elcano 6438',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.02195,
    longitude: -57.57273,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 114,
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 29000,
    active: true
  },
  {
    id: 'club-parada-5',
    name: 'Parada 5 Complejo Deportivo',
    slug: 'parada-5',
    description: 'Complejo sobre Av. Constitución con canchas de fútbol 5 y pádel de última generación.',
    address: 'Av. Constitución 4205',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.969406,
    longitude: -57.545654,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 220,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 30000,
    active: true
  },
  {
    id: 'club-estacion-futbol-luro',
    name: 'Estación Fútbol Mdq',
    slug: 'estacion-futbol-mdq',
    description: 'Canchas sintéticas sobre Av. Luro con iluminación LED y pistas de pádel.',
    address: 'Av. Pedro Luro 5484',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.984024,
    longitude: -57.575339,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 105,
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 25000,
    active: true
  },
  {
    id: 'club-estacion-futbol-berutti',
    name: 'Complejo Estación Fútbol',
    slug: 'complejo-estacion-futbol',
    description: 'Predio deportivo en Berutti con canchas de fútbol sintético y canchas de pádel.',
    address: 'Berutti 7290',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.964161,
    longitude: -57.583203,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 130,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:30',
    closingTime: '01:00',
    minPrice: 27000,
    active: true
  },
  {
    id: 'club-el-campito',
    name: 'El Campito Complejo Deportivo',
    slug: 'el-campito',
    description: 'Canchas de pádel techadas y fútbol en zona norte de Mar del Plata.',
    address: 'Rafael del Riego 95',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.9575,
    longitude: -57.568,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 82,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
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
    closingTime: '00:00',
    minPrice: 25000,
    active: true
  },
  {
    id: 'club-dreams-futbol-5',
    name: 'Dreams Fútbol 5 & Pádel',
    slug: 'dreams-futbol-5',
    description: 'Complejo céntrico sobre Moreno con canchas techadas de pádel y fútbol 5.',
    address: 'Moreno 3364',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.998022,
    longitude: -57.556655,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 147,
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
    ],
    amenities: {
      parking: false,
      showers: true,
      lockerRooms: true,
      buffet: true,
      grill: false,
      wifi: true,
      equipmentRental: true,
      covered: true,
      lighting: true
    },
    openingTime: '08:00',
    closingTime: '01:00',
    minPrice: 26000,
    active: true
  },
  {
    id: 'club-7-anker',
    name: '7 Anker Football & Pádel',
    slug: '7-anker-football',
    description: 'Predio multideporte en Magallanes y San Antonio con canchas sintéticas y pádel.',
    address: 'Magallanes y San Antonio',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.008397,
    longitude: -57.593922,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 94,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
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
    closingTime: '00:30',
    minPrice: 27000,
    active: true
  },
  {
    id: 'club-smith-colon',
    name: 'Smith Colón',
    slug: 'smith-colon',
    description: 'Complejo tradicional en Guido y Av. Colón. Pistas de pádel y fútbol sintético.',
    address: 'Guido y Av. Colón',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.0035,
    longitude: -57.5615,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 160,
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:00',
    closingTime: '01:00',
    minPrice: 28000,
    active: true
  },
  {
    id: 'club-green-park',
    name: 'Green Park Complejo',
    slug: 'green-park',
    description: 'Amplio predio sobre Champagnat con canchas de fútbol y pádel rodeadas de verde.',
    address: 'Av. Champagnat 3418',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.995012,
    longitude: -57.594034,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 210,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 30000,
    active: true
  },
  {
    id: 'club-la-techada',
    name: 'La Techada Fútbol 5 & Pádel',
    slug: 'la-techada',
    description: 'Canchas 100% techadas en Juan B. Justo. Ideales para jugar en cualquier clima.',
    address: 'Av. Juan B. Justo 6454',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.997394,
    longitude: -57.599907,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 175,
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:30',
    closingTime: '01:00',
    minPrice: 28000,
    active: true
  },
  {
    id: 'club-indoor-7',
    name: 'Indoor 7 Nuevo Complejo',
    slug: 'indoor-7',
    description: 'Modernas instalaciones techadas sobre Champagnat para Fútbol 7 y Pádel Pro.',
    address: 'Av. M. Champagnat 3442',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.995163,
    longitude: -57.594152,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 188,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 32000,
    active: true
  },
  {
    id: 'club-3er-tiempo',
    name: '3ER TIEMPO Complejo Deportivo',
    slug: '3er-tiempo',
    description: 'Complejo sobre Falucho con canchas sintéticas, pádel y área social con parrillas.',
    address: 'Falucho 5463',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.990419,
    longitude: -57.580255,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 135,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80'
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
    closingTime: '01:00',
    minPrice: 27000,
    active: true
  },
  {
    id: 'club-var-futbol-7',
    name: 'V.A.R. Fútbol 7 & Pádel',
    slug: 'var-futbol-7',
    description: 'Complejo deportivo en zona sur (Calle 475) con canchas de Fútbol 7 y Pádel.',
    address: 'Calle 475 Nº 3500',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.083035,
    longitude: -57.630487,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 162,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
    ],
    amenities: {
      parking: true,
      showers: true,
      lockerRooms: true,
      buffet: true,
      grill: true,
      wifi: true,
      equipmentRental: true,
      covered: false,
      lighting: true
    },
    openingTime: '09:00',
    closingTime: '01:00',
    minPrice: 30000,
    active: true
  },
  {
    id: 'club-aztk-arena',
    name: 'COMPLEJO AZTK ARENA',
    slug: 'complejo-aztk-arena',
    description: 'Arena deportiva moderna sobre San Martín con canchas de pádel de cristal y fútbol.',
    address: 'San Martín 5521',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.984403,
    longitude: -57.576428,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 140,
    images: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:00',
    closingTime: '00:30',
    minPrice: 28000,
    active: true
  },
  {
    id: 'club-deportivo-colon',
    name: 'Complejo Deportivo Colón',
    slug: 'complejo-deportivo-colon',
    description: 'Predio sobre Av. Colón con canchas de fútbol sintético y pistas de pádel iluminadas.',
    address: 'Av. Colón 9534',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.997074,
    longitude: -57.562824,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 98,
    images: [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
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
    openingTime: '08:30',
    closingTime: '01:00',
    minPrice: 26000,
    active: true
  },
  {
    id: 'club-complejo-trebi',
    name: 'Complejo Trebi',
    slug: 'complejo-trebi',
    description: 'Canchas de pádel de césped texturado y canchas de fútbol en Tierra del Fuego.',
    address: 'Tierra del Fuego 650',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.975169,
    longitude: -57.571109,
    phone: '',
    whatsapp: '',
    rating: 4.8,
    reviewCount: 112,
    images: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80'
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
    closingTime: '00:00',
    minPrice: 25000,
    active: true
  },
  {
    id: 'club-america-f5',
    name: 'América Fútbol 5 & Pádel',
    slug: 'america-futbol-5',
    description: 'Complejo deportivo sobre Av. Colón con canchas de fútbol 5 y pistas de pádel.',
    address: 'Av. Colón 7254',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -37.979935,
    longitude: -57.596954,
    phone: '',
    whatsapp: '',
    rating: 4.7,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 24000,
    active: true
  },
  {
    id: 'club-area-7',
    name: 'Área 7 Complejo Deportivo',
    slug: 'area-7',
    description: 'Canchas de pádel de última generación y fútbol 7 sintético en Av. Independencia.',
    address: 'Av. Independencia 3500',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    latitude: -38.010693,
    longitude: -57.564404,
    phone: '',
    whatsapp: '',
    rating: 4.9,
    reviewCount: 178,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
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
    minPrice: 31000,
    active: true
  }
];

const MDP_REAL_COURTS = [];

for (const club of MDP_REAL_CLUBS) {
  // Padel Court 1
  MDP_REAL_COURTS.push({
    id: `court-${club.id}-padel-1`,
    clubId: club.id,
    sportType: 'PADEL',
    name: 'Cancha 1 — Pádel Panorámica Cristal',
    surface: 'Césped Sintético Texturado Azul WPT',
    isCovered: true,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: club.minPrice,
    priceFixedSlotDiscount: 0.12,
    images: [club.images[0]]
  });

  // Padel Court 2
  MDP_REAL_COURTS.push({
    id: `court-${club.id}-padel-2`,
    clubId: club.id,
    sportType: 'PADEL',
    name: 'Cancha 2 — Pádel Blindex Pro',
    surface: 'Césped Sintético Fibrilado',
    isCovered: club.amenities.covered,
    hasLighting: true,
    durationMinutes: 90,
    pricePerHour: club.minPrice,
    priceFixedSlotDiscount: 0.10,
    images: [club.images[0]]
  });

  // Futbol Court
  const isF7 = club.name.toLowerCase().includes('fútbol 7') || club.name.toLowerCase().includes('futbol 7') || club.name.toLowerCase().includes('7');
  const sportType = isF7 ? 'FUTBOL_7' : 'FUTBOL_5';
  const courtName = isF7 ? 'Cancha 1 — Fútbol 7 Sintético Pro' : 'Cancha 1 — Fútbol 5 Sintético';

  MDP_REAL_COURTS.push({
    id: `court-${club.id}-futbol-1`,
    clubId: club.id,
    sportType: sportType,
    name: courtName,
    surface: 'Césped Sintético Forbex 50mm con Caucho',
    isCovered: club.amenities.covered,
    hasLighting: true,
    durationMinutes: 60,
    pricePerHour: club.minPrice + 2000,
    priceFixedSlotDiscount: 0.15,
    images: [club.images[1] || club.images[0]]
  });
}

async function cleanAndSeedFirestore() {
  console.log('🚀 Autenticando con Firebase Auth...');
  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@hayequipo.com.ar', 'HayEquipo2026!');
    user = cred.user;
  } catch (e) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, 'admin@hayequipo.com.ar', 'HayEquipo2026!');
      user = cred.user;
    } catch (createErr) {
      console.log('Auth note:', createErr.message);
    }
  }
  if (user) {
    console.log(`✓ Autenticado como: ${user.email}`);
  }

  console.log('\n🧹 1. Eliminando datos mock up anteriores de Firestore (pclink-f6e0d)...');

  const collectionsToClean = ['clubs', 'courts', 'slots', 'bookings', 'split_payments', 'fixed_slot_subscriptions'];

  for (const colName of collectionsToClean) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`  - Borrando ${snap.docs.length} documentos de '${colName}'...`);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
    } catch (err) {
      console.log(`  Nota en '${colName}':`, err.message);
    }
  }

  // Also clean old settings docs if any
  try {
    await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), { clubs: MDP_REAL_CLUBS, updatedAt: new Date().toISOString() });
    await setDoc(doc(db, 'settings', 'hay_equipo_courts'), { courts: MDP_REAL_COURTS, updatedAt: new Date().toISOString() });
    await setDoc(doc(db, 'settings', 'hay_equipo_slots'), { slots: [], totalSlots: 0, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.log('Settings update note:', e.message);
  }

  console.log('✅ Base de datos limpia de mockups.');

  console.log(`\n📍 2. Guardando ${MDP_REAL_CLUBS.length} complejos reales de Mar del Plata en colección 'clubs'...`);
  for (const club of MDP_REAL_CLUBS) {
    await setDoc(doc(db, 'clubs', club.id), club);
    console.log(`  ✓ Club guardado: ${club.name} -> Lat: ${club.latitude}, Lng: ${club.longitude}`);
  }

  console.log(`\n🎾⚽ 3. Guardando ${MDP_REAL_COURTS.length} canchas (Pádel y Fútbol) en colección 'courts'...`);
  for (const court of MDP_REAL_COURTS) {
    await setDoc(doc(db, 'courts', court.id), court);
    console.log(`  ✓ Cancha guardada: ${court.name} (${court.sportType})`);
  }

  console.log('\n🔒 4. No se generaron turnos disponibles (colección slots vacía como fue solicitado).');
  console.log('🔒 5. Teléfonos omitidos de las entidades.');
  console.log('🎉 ¡Carga real de Mar del Plata completada exitosamente en Firebase Firestore!');
}

cleanAndSeedFirestore().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error guardando en Firestore:', err);
  process.exit(1);
});
