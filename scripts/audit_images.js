const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app",
});

const db = getFirestore(app);

async function main() {
  const snap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  const clubs = snap.data().clubs || [];
  
  let totalImages = 0;
  let okCount = 0;
  let failCount = 0;
  const failures = [];

  for (const club of clubs) {
    const images = club.images || [];
    for (const url of images) {
      totalImages++;
      try {
        const r = await fetch(url, { method: 'HEAD' });
        if (r.status === 200) {
          okCount++;
        } else {
          failCount++;
          failures.push({ club: club.name, url: url.substring(0, 100), status: r.status });
        }
      } catch (e) {
        failCount++;
        failures.push({ club: club.name, url: url.substring(0, 100), error: e.message });
      }
    }
  }

  console.log('\n=== IMAGE URL AUDIT ===');
  console.log('Total clubs: ' + clubs.length);
  console.log('Total images: ' + totalImages);
  console.log('OK (200): ' + okCount);
  console.log('FAILED: ' + failCount);

  if (failures.length > 0) {
    console.log('\n=== FAILURES ===');
    failures.forEach(f => {
      console.log('  ' + f.club + ': ' + (f.status || f.error) + ' - ' + f.url);
    });
  } else {
    console.log('\nALL IMAGES LOAD SUCCESSFULLY');
  }

  process.exit(0);
}

main();
