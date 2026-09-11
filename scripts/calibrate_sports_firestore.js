/**
 * calibrate_sports_firestore.js
 *
 * Calibra y clasifica de forma exacta los 26 complejos de Mar del Plata en Firestore:
 * - 9 Complejos de SOLO PÁDEL (Canchas de cristal WPT / Blindex)
 * - 9 Complejos de SOLO FÚTBOL (Canchas F5 / F7 Sintético Forbex)
 * - 8 Complejos de AMBOS DEPORTES (Pádel + Fútbol combinados)
 *
 * Mantiene intactos todos los teléfonos y enlaces oficiales de WhatsApp.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Clasificación deportiva canónica y real para los 26 clubes
const CLUB_CLASSIFICATIONS = {
  // ── AMBOS DEPORTES (PÁDEL + FÚTBOL) ──
  'club-laverde-jara': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Laverde Jara - Fútbol & Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal WPT', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm · Césped Texturado Azul WPT', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm · LED Torneo', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Sintético Forbex', sportType: 'FUTBOL_5', surface: 'Césped Sintético Forbex 50mm con Caucho', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-laverde-cordoba': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Laverde Córdoba - Fútbol & Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-laverde-telefonos': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Laverde Club Teléfonos - Fútbol & Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha Principal — Fútbol 7 Sintético Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético AFA 55mm', duration: 60, capacity: 14, isCovered: false },
    ]
  },
  'club-balon-5': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Balón 5 - Papi Fútbol & Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-cancha-luro-5102': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Cancha Fútbol 5 & Pádel Luro',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Panorámico 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Césped Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético con Caucho', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-catonio-f7': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Catonio Fútbol 7 & Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha Principal — Fútbol 7 Pro', sportType: 'FUTBOL_7', surface: 'Césped Monofilamento 50mm', duration: 60, capacity: 14, isCovered: false },
    ]
  },
  'club-area-7': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Área 7 Complejo Deportivo',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal WPT', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 7 Sintético Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético 50mm', duration: 60, capacity: 14, isCovered: true },
    ]
  },
  'club-dreams-futbol-5': {
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    name: 'Dreams Fútbol 5 & Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },

  // ── SOLO PÁDEL (CLUBS DEDICADOS EXCLUSIVAMENTE A PÁDEL) ──
  'club-complejo-gaboto': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'Complejo Pádel Gaboto',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 3 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-complejo-san-paolo': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'Complejo San Paolo Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica WPT', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm · Césped Texturado', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-7-anker': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: '7 Anker Pádel Club',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-smith-colon': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'Smith Colón Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Panorámica', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-green-park': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'Green Park Pádel Complejo',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Pro', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-la-techada': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'La Techada Pádel Club',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Indoor Techada', sportType: 'PADEL', surface: 'Vidrio Panorámico Climatizado', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Techada 2', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-aztk-arena': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'Complejo AZTK Arena Pádel',
    courts: [
      { name: 'Pista Central — Cristal WPT Oficial', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm · Mondo Supercourt', duration: 90, capacity: 4, isCovered: true },
      { name: 'Pista 2 — Cristal Indoor Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-complejo-trebi': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'Complejo Trebi Pádel',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-var-futbol-7': {
    sports: ['PADEL'],
    category: 'PADEL',
    name: 'V.A.R. Pádel Club',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Pro', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },

  // ── SOLO FÚTBOL (CLUBS DEDICADOS EXCLUSIVAMENTE A FÚTBOL) ──
  'club-el-potrero': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'El Potrero Fútbol 5',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Forbex 50mm con Caucho Criogénico', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Forbex 50mm con Caucho Criogénico', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-parada-5': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'Complejo Parada 5 Fútbol',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Principal Forbex', sportType: 'FUTBOL_5', surface: 'Césped Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-estacion-futbol-luro': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'Estación Fútbol Mdq',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Sintético Pro', sportType: 'FUTBOL_5', surface: 'Césped Sintético con Caucho', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético 45mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-estacion-futbol-berutti': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'Complejo Estación Fútbol Berutti',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-el-campito': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'El Campito Complejo de Fútbol',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Sintético 50mm', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 al Aire Libre', sportType: 'FUTBOL_5', surface: 'Césped Sintético Iluminación LED', duration: 60, capacity: 10, isCovered: false },
    ]
  },
  'club-indoor-7': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'Indoor 7 Nuevo Complejo de Fútbol',
    courts: [
      { name: 'Cancha Principal — Fútbol 7 Techada Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético Monofilamento 50mm', duration: 60, capacity: 14, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-3er-tiempo': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: '3ER TIEMPO Complejo de Fútbol',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético con Caucho', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético con Caucho', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-deportivo-colon': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'Complejo Deportivo Colón Fútbol',
    courts: [
      { name: 'Cancha Principal — Fútbol 7 Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético AFA', duration: 60, capacity: 14, isCovered: false },
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético 50mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-america-f5': {
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    name: 'América Fútbol 5',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Bajo Techo', duration: 60, capacity: 10, isCovered: true },
    ]
  },
};

async function calibrate() {
  console.log('🎾⚽ Calibrando disciplinas deportivas en Firestore...');
  const clubSnap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  if (!clubSnap.exists()) {
    console.error('No se encontró el documento hay_equipo_clubs');
    process.exit(1);
  }

  const existingClubs = clubSnap.data()?.clubs || [];
  console.log(`Clubes actuales en Firestore: ${existingClubs.length}`);

  const updatedClubs = [];
  const updatedCourts = [];

  let countPadel = 0;
  let countFutbol = 0;
  let countBoth = 0;

  existingClubs.forEach((club) => {
    const conf = CLUB_CLASSIFICATIONS[club.id];
    if (!conf) {
      console.warn(`Club ${club.id} sin configuración explícita, se mantiene original`);
      updatedClubs.push(club);
      return;
    }

    if (conf.category === 'PADEL') countPadel++;
    if (conf.category === 'FUTBOL') countFutbol++;
    if (conf.category === 'BOTH') countBoth++;

    // Preservar fotos, teléfonos, coordenadas y amenidades
    const calibratedClub = {
      ...club,
      name: conf.name || club.name,
      sports: conf.sports,
      sportCategory: conf.category,
      minPrice: club.minPrice || (conf.category === 'PADEL' ? 28000 : 25000),
      updatedAt: new Date().toISOString(),
    };
    updatedClubs.push(calibratedClub);

    // Generar canchas perfectamente coherentes para este club
    conf.courts.forEach((ct, idx) => {
      updatedCourts.push({
        id: `court-${club.id}-${ct.sportType.toLowerCase()}-${idx + 1}`,
        clubId: club.id,
        name: ct.name,
        sportType: ct.sportType,
        sport: ct.sportType.startsWith('FUTBOL') ? 'FUTBOL' : 'PADEL',
        surface: ct.surface,
        durationMinutes: ct.duration,
        capacity: ct.capacity,
        pricePerHour: calibratedClub.minPrice,
        priceFixedSlotDiscount: 0.12,
        isCovered: ct.isCovered,
        hasLighting: true,
        images: Array.isArray(club.images) && club.images.length > 0 ? club.images : [
          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
        ],
      });
    });
  });

  console.log(`\nResumen de Calibración:`);
  console.log(`  - Solo Pádel: ${countPadel} clubes`);
  console.log(`  - Solo Fútbol: ${countFutbol} clubes`);
  console.log(`  - Ambos (Pádel & Fútbol): ${countBoth} clubes`);
  console.log(`  - Total Canchas calibradas: ${updatedCourts.length}`);

  // Guardar en Firestore
  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    clubs: updatedClubs,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  await setDoc(doc(db, 'settings', 'hay_equipo_courts'), {
    courts: updatedCourts,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  console.log('✅ Firestore sincronizado exitosamente.');
  process.exit(0);
}

calibrate().catch((err) => {
  console.error('Error al calibrar Firestore:', err);
  process.exit(1);
});
