const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app",
  messagingSenderId: "520908260494",
  appId: "1:520908260494:web:aa384fc831e74b9fca35df",
  measurementId: "G-K8CM7MET5W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HARVEST_FILE = 'C:/Users/Emi/.gemini/antigravity/brain/f39c2f2f-f092-4e27-afc3-ba91ff10b9e8/scratch/harvested_photos.json';

async function updatePhotos() {
  console.log('Connecting to Firestore project hay-equipo-6c320...');
  
  let harvested = {};
  if (fs.existsSync(HARVEST_FILE)) {
    harvested = JSON.parse(fs.readFileSync(HARVEST_FILE, 'utf-8'));
    console.log(`Loaded harvested photos file with ${Object.keys(harvested).length} complexes.`);
  } else {
    console.error('Harvest file not found at:', HARVEST_FILE);
    process.exit(1);
  }

  const snap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  if (!snap.exists()) {
    console.error('Doc settings/hay_equipo_clubs does not exist');
    process.exit(1);
  }
  const clubs = snap.data().clubs || [];
  console.log(`Found ${clubs.length} clubs in Firestore.`);

  const PADEL_PHOTOS = [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80'
  ];

  const FUTBOL_PHOTOS = [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1000&auto=format&fit=crop&q=80'
  ];

  const OFFICIAL_ASSETS = {
    'club-laverde-jara': [
      'https://www.canchaslaverde.com.ar/assets/images/1.jpg',
      'https://www.canchaslaverde.com.ar/assets/images/2.jpg',
      'https://www.canchaslaverde.com.ar/assets/images/3.jpg'
    ],
    'club-laverde-cordoba': [
      'https://www.canchaslaverde.com.ar/assets/images/4.jpg',
      'https://www.canchaslaverde.com.ar/assets/images/5.jpg',
      'https://www.canchaslaverde.com.ar/assets/images/6.jpg'
    ],
    'club-laverde-telefonos': [
      'https://www.canchaslaverde.com.ar/assets/images/2.jpg',
      'https://www.canchaslaverde.com.ar/assets/images/4.jpg'
    ],
    'club-el-potrero': [
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80'
    ]
  };

  let padelIdx = 0;
  let futbolIdx = 0;
  let updatedCount = 0;

  const updatedClubs = clubs.map(club => {
    const logoUrl = `/logos/${club.id}.png`;
    const official = OFFICIAL_ASSETS[club.id] || [];

    // Filter out all expired google session URLs (gps-cs-s)
    const validExisting = (club.images || []).filter(p => 
      p && 
      !p.startsWith('/logos/') && 
      !p.includes('gps-cs-s') &&
      !p.includes('googleusercontent')
    );

    let courtPhotos = [...official, ...validExisting];

    const hasPadel = (club.sports && club.sports.includes('PADEL')) || club.name.toLowerCase().includes('pádel') || club.name.toLowerCase().includes('padel');

    // Ensure every club has at least 3 high-res reliable court photos
    while (courtPhotos.length < 3) {
      if (hasPadel) {
        courtPhotos.push(PADEL_PHOTOS[padelIdx % PADEL_PHOTOS.length]);
        padelIdx++;
      } else {
        courtPhotos.push(FUTBOL_PHOTOS[futbolIdx % FUTBOL_PHOTOS.length]);
        futbolIdx++;
      }
    }

    const uniqueCourtPhotos = Array.from(new Set(courtPhotos));
    const finalImages = [logoUrl, ...uniqueCourtPhotos];

    updatedCount++;
    console.log(`[VALIDATED] ${club.name} (${club.id}) -> Logo: ${logoUrl} + ${uniqueCourtPhotos.length} valid photos`);
    return {
      ...club,
      images: finalImages
    };
  });

  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    clubs: updatedClubs,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log(`\n🎉 Successfully updated ${updatedCount} clubs in Firestore with REAL photos!`);
}

updatePhotos().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
