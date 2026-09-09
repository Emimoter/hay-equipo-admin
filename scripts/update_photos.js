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

  let updatedCount = 0;
  const updatedClubs = clubs.map(club => {
    let photos = harvested[club.id] || [];

    if (club.id === 'club-laverde-jara') {
      photos = [
        'https://www.canchaslaverde.com.ar/assets/images/1.jpg',
        'https://www.canchaslaverde.com.ar/assets/images/2.jpg',
        'https://www.canchaslaverde.com.ar/assets/images/3.jpg',
        ...photos
      ];
    } else if (club.id === 'club-laverde-cordoba') {
      photos = [
        'https://www.canchaslaverde.com.ar/assets/images/4.jpg',
        'https://www.canchaslaverde.com.ar/assets/images/5.jpg',
        'https://www.canchaslaverde.com.ar/assets/images/6.jpg',
        ...photos
      ];
    } else if (club.id === 'club-area-7' && photos.length === 0) {
      photos = harvested['club-indoor-7'] || [];
    }

    if (photos.length > 0) {
      updatedCount++;
      console.log(`[UPDATED] ${club.name} (${club.id}) -> ${photos.length} real photos`);
      return {
        ...club,
        images: photos
      };
    } else {
      console.log(`[KEEP] ${club.name} (${club.id}) -> kept existing photos`);
      return club;
    }
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
