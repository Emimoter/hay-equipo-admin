/**
 * Upload all club logos to Firebase Storage using Admin SDK (bypasses security rules)
 * and update Firestore image URLs.
 * 
 * Since we don't have a service account key file, we'll use a different approach:
 * Upload logos to a free image hosting service (imgbb) or convert them to GitHub-hosted URLs.
 */
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
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const LOGOS_DIR = path.join(__dirname, '..', 'apps', 'web-club', 'public', 'logos');

// Since logos are already in git and pushed to GitHub, we can use raw.githubusercontent.com URLs
// Repository: https://github.com/Emimoter/hay-equipo-admin
// Branch: main
// Path: apps/web-club/public/logos/

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Emimoter/hay-equipo-admin/main/apps/web-club/public/logos';

async function main() {
  // 1. Read all logo files
  const logoFiles = fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${logoFiles.length} logo files\n`);

  // 2. Build mapping: clubId -> GitHub raw URL
  const urlMap = {};
  for (const file of logoFiles) {
    const clubId = file.replace('.png', '');
    urlMap[clubId] = `${GITHUB_RAW_BASE}/${file}`;
  }

  // 3. Verify a few URLs actually work
  console.log('=== Verifying GitHub raw URLs ===');
  const testFiles = logoFiles.slice(0, 3);
  for (const file of testFiles) {
    const url = `${GITHUB_RAW_BASE}/${file}`;
    try {
      const r = await fetch(url, { method: 'HEAD' });
      console.log(`  ${r.status} ${r.headers.get('content-type')} ${file}`);
    } catch (e) {
      console.log(`  ERROR ${e.message} ${file}`);
    }
  }

  // 4. Update Firestore
  console.log('\n=== Updating Firestore ===');
  const snap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  if (!snap.exists()) {
    console.error('No hay_equipo_clubs document!');
    process.exit(1);
  }

  const data = snap.data();
  const clubs = data.clubs || [];
  let updated = 0;

  const updatedClubs = clubs.map(club => {
    const images = [...(club.images || [])];
    const newImages = images.map(img => {
      if (img.startsWith('/logos/')) {
        const clubId = img.replace('/logos/', '').replace('.png', '');
        if (urlMap[clubId]) {
          updated++;
          return urlMap[clubId];
        }
      }
      return img;
    });
    return { ...club, images: newImages };
  });

  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    ...data,
    clubs: updatedClubs,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  console.log(`Updated ${updated} image references in ${clubs.length} clubs`);

  // Print samples
  console.log('\n=== Sample Results ===');
  updatedClubs.slice(0, 5).forEach(c => {
    console.log(`${c.name}:`);
    console.log(`  Logo: ${c.images[0]}`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
