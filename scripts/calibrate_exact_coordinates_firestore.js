/**
 * calibrate_exact_coordinates_firestore.js
 *
 * Actualiza las coordenadas geográficas exactas de los 26 complejos deportivos de Mar del Plata
 * en Firestore (documento settings/hay_equipo_clubs) para que coincidan 100% con sus direcciones físicas reales.
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

const EXACT_COORDINATES = {
  'club-laverde-jara': { lat: -37.9773206, lng: -57.5628425, address: 'Av. Juan Héctor Jara 470' },
  'club-laverde-cordoba': { lat: -38.0141982, lng: -57.5587000, address: 'Córdoba 3540' },
  'club-laverde-telefonos': { lat: -37.9596508, lng: -57.5745327, address: 'Florisbelo Acosta 6810' },
  'club-el-potrero': { lat: -38.0003187, lng: -57.5575158, address: 'Salta 2248' },
  'club-balon-5': { lat: -37.9968982, lng: -57.5583613, address: 'Moreno 3545' },
  'club-cancha-luro-5102': { lat: -37.9858939, lng: -57.5716764, address: 'Av. Pedro Luro 5102' },
  'club-catonio-f7': { lat: -38.0358579, lng: -57.5490708, address: 'Juan B. Justo 666' },
  'club-complejo-gaboto': { lat: -38.0376911, lng: -57.5497306, address: 'Gaboto 3875' },
  'club-complejo-san-paolo': { lat: -38.0215594, lng: -57.5732509, address: 'J. S. Elcano 6438' },
  'club-parada-5': { lat: -37.9694059, lng: -57.5456539, address: 'Av. Constitución 4205' },
  'club-estacion-futbol-luro': { lat: -37.9840237, lng: -57.5753389, address: 'Av. Pedro Luro 5484' },
  'club-estacion-futbol-berutti': { lat: -37.9635793, lng: -57.5842879, address: 'Beruti 7290' },
  'club-el-campito': { lat: -38.0249698, lng: -57.5649423, address: 'Rafael del Riego 95' },
  'club-dreams-futbol-5': { lat: -37.9980221, lng: -57.5566554, address: 'Moreno 3364' },
  'club-7-anker': { lat: -38.0431060, lng: -57.5481270, address: 'Magallanes y San Antonio' },
  'club-smith-colon': { lat: -37.9951480, lng: -57.5617430, address: 'Guido y Av. Colón' },
  'club-green-park': { lat: -37.9950124, lng: -57.5940345, address: 'Av. Champagnat 3418' },
  'club-la-techada': { lat: -37.9973941, lng: -57.5999070, address: 'Av. Juan B. Justo 6454' },
  'club-indoor-7': { lat: -37.9951630, lng: -57.5941523, address: 'Av. M. Champagnat 3442' },
  'club-3er-tiempo': { lat: -37.9904186, lng: -57.5802554, address: 'Falucho 5463' },
  'club-var-futbol-7': { lat: -38.0830350, lng: -57.6304872, address: 'Calle 475 Nº 3500' },
  'club-aztk-arena': { lat: -37.9844031, lng: -57.5764276, address: 'San Martín 5521' },
  'club-deportivo-colon': { lat: -37.9541966, lng: -57.6452780, address: 'Av. Colón 9534' },
  'club-complejo-trebi': { lat: -37.9751687, lng: -57.5711091, address: 'Tierra del Fuego 650' },
  'club-america-f5': { lat: -37.9799350, lng: -57.5969540, address: 'Av. Colón 7254' },
  'club-area-7': { lat: -38.0106930, lng: -57.5644040, address: 'Av. Independencia 3500' }
};

async function run() {
  console.log('Fetching clubs from settings/hay_equipo_clubs...');
  const snap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  if (!snap.exists()) {
    console.error('Document settings/hay_equipo_clubs does not exist.');
    return;
  }

  const data = snap.data();
  const clubs = data.clubs || [];
  console.log(`Auditing and updating coordinates for ${clubs.length} clubs...`);

  let updatedCount = 0;
  const updatedClubs = clubs.map(club => {
    const coords = EXACT_COORDINATES[club.id];
    if (coords) {
      updatedCount++;
      return {
        ...club,
        latitude: coords.lat,
        longitude: coords.lng,
        address: coords.address || club.address,
        updatedAt: new Date().toISOString()
      };
    }
    return club;
  });

  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    ...data,
    clubs: updatedClubs,
    lastCoordinatesCalibration: new Date().toISOString()
  });

  console.log(`Successfully calibrated exact coordinates for ${updatedCount} clubs in Firestore.`);
}

run().catch(console.error);
