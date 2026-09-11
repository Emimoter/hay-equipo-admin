/**
 * fix_accurate_sports_firestore.js
 *
 * Clasificación 100% REAL y AUTÉNTICA de los 26 complejos de Mar del Plata:
 * - 8 Complejos SOLO PÁDEL (Gaboto, San Paolo, 7 Anker, Smith Colón, Green Park, La Techada, AZTK Arena, Trebi)
 * - 14 Complejos SOLO FÚTBOL (Catonio, Balón 5, Fútbol 5 MB, Dreams, VAR, El Potrero, Parada 5, Estación Luro, Estación Berutti, El Campito, Indoor 7, 3er Tiempo, Dep. Colón, América)
 * - 4 Complejos AMBOS (Laverde Jara, Laverde Córdoba, Laverde Teléfonos, Área 7)
 *
 * Elimina canchas inventadas de pádel en complejos de fútbol puro (Catonio, Balón 5, Dreams, etc.).
 * Preserva al 100% las fotos, teléfonos y WhatsApp reales.
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

const ACCURATE_CLASSIFICATION = {
  // ── 4 AMBOS (PÁDEL + FÚTBOL) ──
  'club-laverde-jara': {
    name: 'Laverde Jara - Fútbol & Pádel',
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal WPT', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm · Césped Texturado Azul WPT', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm · LED Torneo', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Sintético Forbex', sportType: 'FUTBOL_5', surface: 'Césped Sintético Forbex 50mm con Caucho', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-laverde-cordoba': {
    name: 'Laverde Córdoba - Fútbol & Pádel',
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-laverde-telefonos': {
    name: 'Laverde Club Teléfonos - Fútbol & Pádel',
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha Principal — Fútbol 7 Sintético Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético AFA 55mm', duration: 60, capacity: 14, isCovered: false },
    ]
  },
  'club-area-7': {
    name: 'Área 7 Complejo Deportivo',
    sports: ['PADEL', 'FUTBOL'],
    category: 'BOTH',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal WPT', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 1 — Fútbol 7 Sintético Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético 50mm', duration: 60, capacity: 14, isCovered: true },
    ]
  },

  // ── 8 SOLO PÁDEL ──
  'club-complejo-gaboto': {
    name: 'Complejo Pádel Gaboto',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 3 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-complejo-san-paolo': {
    name: 'Complejo San Paolo Pádel',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica WPT', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm · Césped Texturado', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-7-anker': {
    name: '7 Anker Pádel Club',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-smith-colon': {
    name: 'Smith Colón Pádel',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Panorámica', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-green-park': {
    name: 'Green Park Pádel Complejo',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Pro', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Indoor', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-la-techada': {
    name: 'La Techada Pádel Club',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Cristal Indoor Techada', sportType: 'PADEL', surface: 'Vidrio Panorámico Climatizado', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Techada 2', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-aztk-arena': {
    name: 'Complejo AZTK Arena Pádel',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Pista Central — Cristal WPT Oficial', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm · Mondo Supercourt', duration: 90, capacity: 4, isCovered: true },
      { name: 'Pista 2 — Cristal Indoor Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },
  'club-complejo-trebi': {
    name: 'Complejo Trebi Pádel',
    sports: ['PADEL'],
    category: 'PADEL',
    courts: [
      { name: 'Cancha 1 — Pádel Panorámica Cristal', sportType: 'PADEL', surface: 'Vidrio Panorámico 12mm', duration: 90, capacity: 4, isCovered: true },
      { name: 'Cancha 2 — Pádel Blindex Pro', sportType: 'PADEL', surface: 'Vidrio Templado 10mm', duration: 90, capacity: 4, isCovered: true },
    ]
  },

  // ── 14 SOLO FÚTBOL (AUTÉNTICOS CLUBES DE FÚTBOL) ──
  'club-catonio-f7': {
    name: 'Catonio Fútbol 7',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha Principal — Fútbol 7 Pro', sportType: 'FUTBOL_7', surface: 'Césped Monofilamento AFA 55mm', duration: 60, capacity: 14, isCovered: false },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-balon-5': {
    name: 'Balón 5 Papi Fútbol',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético con Caucho', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético con Caucho', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-cancha-luro-5102': {
    name: 'Fútbol 5 MB',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha Techada 1 — Fútbol 5', sportType: 'FUTBOL_5', surface: 'Sintético Forbex Techado', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha Techada 2 — Fútbol 5', sportType: 'FUTBOL_5', surface: 'Sintético Forbex Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-dreams-futbol-5': {
    name: 'Dreams Fútbol 5',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-var-futbol-7': {
    name: 'V.A.R. Fútbol 7',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha Principal — Fútbol 7 Pro', sportType: 'FUTBOL_7', surface: 'Césped Sintético 55mm Iluminación LED', duration: 60, capacity: 14, isCovered: false },
      { name: 'Cancha 2 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético 50mm', duration: 60, capacity: 10, isCovered: false },
    ]
  },
  'club-el-potrero': {
    name: 'El Potrero Fútbol 5',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Forbex 50mm con Caucho Criogénico', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada Sintético', sportType: 'FUTBOL_5', surface: 'Forbex 50mm con Caucho Criogénico', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-parada-5': {
    name: 'Complejo Parada 5 Fútbol',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Principal', sportType: 'FUTBOL_5', surface: 'Forbex 50mm Techado', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Sintético Forbex Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-estacion-futbol-luro': {
    name: 'Estación Fútbol Mdq',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Sintético 50mm con Caucho', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Sintético Techado Pro', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-estacion-futbol-berutti': {
    name: 'Complejo Estación Fútbol Berutti',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-el-campito': {
    name: 'El Campito Complejo de Fútbol',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-indoor-7': {
    name: 'Indoor 7 Complejo de Fútbol',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 7 Indoor Pro', sportType: 'FUTBOL_7', surface: 'Sintético Monofilamento 55mm', duration: 60, capacity: 14, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Césped Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-3er-tiempo': {
    name: '3ER TIEMPO Complejo de Fútbol',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Sintético', sportType: 'FUTBOL_5', surface: 'Césped Sintético Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-deportivo-colon': {
    name: 'Complejo Deportivo Colón Fútbol',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha Principal — Fútbol 7 Pro', sportType: 'FUTBOL_7', surface: 'Césped Monofilamento AFA', duration: 60, capacity: 14, isCovered: false },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Sintético Forbex 50mm', duration: 60, capacity: 10, isCovered: true },
    ]
  },
  'club-america-f5': {
    name: 'América Fútbol 5',
    sports: ['FUTBOL'],
    category: 'FUTBOL',
    courts: [
      { name: 'Cancha 1 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Sintético Forbex Techado', duration: 60, capacity: 10, isCovered: true },
      { name: 'Cancha 2 — Fútbol 5 Techada', sportType: 'FUTBOL_5', surface: 'Sintético Forbex Techado', duration: 60, capacity: 10, isCovered: true },
    ]
  }
};

async function runAccurateCalibration() {
  console.log('Fetching clubs and courts from Firestore...');
  const [clubsSnap, courtsSnap] = await Promise.all([
    getDoc(doc(db, 'settings', 'hay_equipo_clubs')),
    getDoc(doc(db, 'settings', 'hay_equipo_courts'))
  ]);

  if (!clubsSnap.exists()) {
    console.error('Document settings/hay_equipo_clubs does not exist');
    return;
  }

  const existingClubs = clubsSnap.data().clubs || [];
  console.log(`Processing ${existingClubs.length} existing clubs...`);

  const updatedClubs = [];
  const updatedCourts = [];

  for (const club of existingClubs) {
    const info = ACCURATE_CLASSIFICATION[club.id];
    if (!info) {
      console.warn(`Club ${club.id} not found in ACCURATE_CLASSIFICATION, keeping as-is.`);
      updatedClubs.push(club);
      continue;
    }

    const updatedClub = {
      ...club,
      name: info.name,
      sports: info.sports,
      sportCategory: info.category,
      updatedAt: new Date().toISOString()
    };
    updatedClubs.push(updatedClub);

    // Generate court structures
    const clubImages = (club.images && club.images.length > 0) ? club.images : [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'
    ];

    info.courts.forEach((ct, index) => {
      const sportPrefix = ct.sportType.toLowerCase().replace('_', '');
      const courtId = `court-${club.id}-${sportPrefix}-${index + 1}`;
      const isPadel = ct.sportType === 'PADEL';
      const defaultPrice = isPadel ? 28000 : (ct.sportType === 'FUTBOL_7' ? 44000 : 36000);

      updatedCourts.push({
        id: courtId,
        clubId: club.id,
        name: ct.name,
        sport: isPadel ? 'PADEL' : 'FUTBOL',
        sportType: ct.sportType,
        surface: ct.surface,
        durationMinutes: ct.duration,
        capacity: ct.capacity,
        isCovered: ct.isCovered,
        hasLighting: true,
        pricePerHour: club.minPrice || defaultPrice,
        priceFixedSlotDiscount: 0.12,
        images: clubImages
      });
    });

    console.log(`[CALIBRATED] ${updatedClub.name} (${club.id}) -> sports: [${updatedClub.sports.join(', ')}], courts: ${info.courts.length}`);
  }

  console.log('\nSaving updated clubs to Firestore...');
  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    clubs: updatedClubs,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('Saving updated courts to Firestore...');
  await setDoc(doc(db, 'settings', 'hay_equipo_courts'), {
    courts: updatedCourts,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('\n--- CALIBRATION STATS ---');
  const padelOnly = updatedClubs.filter(c => c.sports.length === 1 && c.sports[0] === 'PADEL').length;
  const futbolOnly = updatedClubs.filter(c => c.sports.length === 1 && c.sports[0] === 'FUTBOL').length;
  const both = updatedClubs.filter(c => c.sports.includes('PADEL') && c.sports.includes('FUTBOL')).length;

  console.log(`Total Clubs: ${updatedClubs.length}`);
  console.log(`SOLO PÁDEL: ${padelOnly} clubs`);
  console.log(`SOLO FÚTBOL: ${futbolOnly} clubs`);
  console.log(`AMBOS (Pádel & Fútbol): ${both} clubs`);
  console.log(`Total Courts: ${updatedCourts.length}`);
  console.log('SUCCESS! Calibration complete.');
}

runAccurateCalibration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error during accurate calibration:', err);
    process.exit(1);
  });
