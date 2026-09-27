const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanForLaunch() {
  console.log('🚀 Starting Firebase Firestore cleanup for launch...');

  // 1. Clean settings/hay_equipo_clubs
  const clubsRef = doc(db, 'settings', 'hay_equipo_clubs');
  const clubsSnap = await getDoc(clubsRef);

  if (!clubsSnap.exists()) {
    console.error('❌ Could not find settings/hay_equipo_clubs in Firestore!');
    process.exit(1);
  }

  const rawClubs = clubsSnap.data().clubs || [];
  console.log(`📋 Found ${rawClubs.length} total clubs in Firestore.`);

  // Filter out mock club 'club-de-prueba'
  const realClubs = rawClubs.filter(c => c.id !== 'club-de-prueba');
  console.log(`✂️ Filtered out mock club "club-de-prueba". Remaining real clubs: ${realClubs.length}`);

  // Clean each club: remove rating, reviewCount, and mock amenities
  const cleanedClubs = realClubs.map(c => {
    const clubCopy = { ...c };

    // Remove rating and review counts
    delete clubCopy.rating;
    delete clubCopy.reviewCount;
    delete clubCopy.reviewsCount;

    // Remove mock amenities (parking, buffet, etc.)
    delete clubCopy.amenities;

    // Link admin email to club-laverde-jara so Emiliano retains access
    if (clubCopy.id === 'club-laverde-jara') {
      const existing = Array.isArray(clubCopy.adminEmails) ? clubCopy.adminEmails : [];
      if (!existing.includes('emiliano.gimenez.96@gmail.com')) {
        clubCopy.adminEmails = [...existing, 'emiliano.gimenez.96@gmail.com'];
      }
      clubCopy.adminEmail = 'emiliano.gimenez.96@gmail.com';
      console.log('🔑 Linked emiliano.gimenez.96@gmail.com as admin to club-laverde-jara');
    }

    return clubCopy;
  });

  await setDoc(clubsRef, {
    clubs: cleanedClubs,
    totalClubs: cleanedClubs.length,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ settings/hay_equipo_clubs updated successfully.');

  // 2. Clean settings/hay_equipo_courts
  const courtsRef = doc(db, 'settings', 'hay_equipo_courts');
  const courtsSnap = await getDoc(courtsRef);
  if (courtsSnap.exists()) {
    const rawCourts = courtsSnap.data().courts || [];
    const cleanedCourts = rawCourts.filter(court => court.clubId !== 'club-de-prueba');
    console.log(`🏸 Cleaned courts: ${rawCourts.length} -> ${cleanedCourts.length}`);
    await setDoc(courtsRef, {
      courts: cleanedCourts,
      totalCourts: cleanedCourts.length,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ settings/hay_equipo_courts updated successfully.');
  }

  // 3. Clean settings/hay_equipo_all_active_slots
  const allSlotsRef = doc(db, 'settings', 'hay_equipo_all_active_slots');
  const allSlotsSnap = await getDoc(allSlotsRef);
  if (allSlotsSnap.exists()) {
    const rawSlots = allSlotsSnap.data().slots || [];
    const cleanedSlots = rawSlots.filter(s => s.clubId !== 'club-de-prueba');
    await setDoc(allSlotsRef, {
      slots: cleanedSlots,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`🕒 Cleaned all active slots: ${rawSlots.length} -> ${cleanedSlots.length}`);
  }

  // 4. Clean settings/hay_equipo_available_fixed_slots
  const fixedSlotsRef = doc(db, 'settings', 'hay_equipo_available_fixed_slots');
  const fixedSlotsSnap = await getDoc(fixedSlotsRef);
  if (fixedSlotsSnap.exists()) {
    const rawFixed = fixedSlotsSnap.data().slots || [];
    const cleanedFixed = rawFixed.filter(s => s.clubId !== 'club-de-prueba');
    await setDoc(fixedSlotsRef, {
      slots: cleanedFixed,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`🔄 Cleaned available fixed slots: ${rawFixed.length} -> ${cleanedFixed.length}`);
  }

  // 5. Clean settings/hay_equipo_bookings
  const bookingsRef = doc(db, 'settings', 'hay_equipo_bookings');
  const bookingsSnap = await getDoc(bookingsRef);
  if (bookingsSnap.exists()) {
    await setDoc(bookingsRef, {
      bookings: [],
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('🧹 Cleaned settings/hay_equipo_bookings (reset to 0 mock bookings).');
  }

  // 6. Delete test documents
  const testDocsToDelete = [
    'booking_he-63196',
    'club_slots_club-de-prueba',
    'published_slots_club-de-prueba_2026-09-20',
    'published_slots_club-de-prueba_2026-09-21',
    'published_slots_club-de-prueba_2026-09-25'
  ];

  for (const docId of testDocsToDelete) {
    try {
      await deleteDoc(doc(db, 'settings', docId));
      console.log(`🗑️ Deleted test doc settings/${docId}`);
    } catch (e) {
      // Ignore if document didn't exist
    }
  }

  console.log('🎉 Firebase cleanup complete! All mock data, ratings, and fake amenities removed.');
  process.exit(0);
}

cleanForLaunch().catch(err => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
