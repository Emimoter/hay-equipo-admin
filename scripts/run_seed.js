const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const path = require('path');
const { REALISTIC_ARG_CLUBS, REALISTIC_ARG_COURTS } = require(path.resolve(__dirname, '../packages/db/dist/realistic_seed'));

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

async function seed() {
  console.log('🚀 Conectando y guardando datos mock up en Firestore (pclink-f6e0d)...');

  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@hayequipo.com.ar', 'HayEquipo2026!');
    user = cred.user;
  } catch (e) {
    const cred = await createUserWithEmailAndPassword(auth, 'admin@hayequipo.com.ar', 'HayEquipo2026!');
    user = cred.user;
  }
  console.log(`✓ Autenticado como: ${user.email} (UID: ${user.uid})`);

  // Guardar en 'settings/hay_equipo_clubs' y 'settings/hay_equipo_courts' y 'settings/hay_equipo_slots'
  console.log(`\n📍 Guardando ${REALISTIC_ARG_CLUBS.length} complejos deportivos en Firestore (settings/hay_equipo_clubs):`);
  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    clubs: REALISTIC_ARG_CLUBS,
    updatedAt: new Date().toISOString()
  });
  for (const c of REALISTIC_ARG_CLUBS) {
    console.log(`  ✓ [CLUB] ${c.name} - ${c.address}, ${c.city} (${c.rating} ★)`);
  }

  console.log(`\n🎾⚽ Guardando ${REALISTIC_ARG_COURTS.length} canchas en Firestore (settings/hay_equipo_courts):`);
  await setDoc(doc(db, 'settings', 'hay_equipo_courts'), {
    courts: REALISTIC_ARG_COURTS,
    updatedAt: new Date().toISOString()
  });
  for (const ct of REALISTIC_ARG_COURTS) {
    console.log(`  ✓ [CANCHA] ${ct.name} - Deporte: ${ct.sportType} ($${ct.pricePerHour.toLocaleString('es-AR')}/h)`);
  }

  // Generar turnos para los próximos 4 días
  console.log(`\n⏰ Generando y guardando turnos mock up en Firestore (settings/hay_equipo_slots):`);
  const hoursPadel = ['08:00', '09:30', '11:00', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'];
  const hoursFutbol = ['09:00', '10:00', '11:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  const allSlots = [];
  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    for (const court of REALISTIC_ARG_COURTS) {
      const hours = court.sportType === 'PADEL' ? hoursPadel : hoursFutbol;

      for (const startTime of hours) {
        const duration = court.durationMinutes;
        const [h, m] = startTime.split(':').map(Number);
        const endTotal = h * 60 + m + duration;
        const endH = Math.floor(endTotal / 60) % 24;
        const endM = endTotal % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        let status = 'AVAILABLE';
        if (startTime === '21:00' && court.id.includes('wpt-1')) status = 'CONFIRMED';
        if (startTime === '19:30' && court.id.includes('indoor-2')) status = 'HELD';

        allSlots.push({
          id: `slot_${court.id}_${dateStr}_${startTime.replace(':', '')}`,
          courtId: court.id,
          courtName: court.name,
          clubId: court.clubId,
          sportType: court.sportType,
          date: dateStr,
          startTime,
          endTime,
          durationMinutes: duration,
          price: court.pricePerHour * (duration / 60),
          fixedSlotPrice: Math.round(court.pricePerHour * (duration / 60) * (1 - court.priceFixedSlotDiscount)),
          status,
          surface: court.surface,
          isCovered: court.isCovered
        });
      }
    }
  }

  await setDoc(doc(db, 'settings', 'hay_equipo_slots'), {
    slots: allSlots,
    totalSlots: allSlots.length,
    updatedAt: new Date().toISOString()
  });
  console.log(`  ✓ ${allSlots.length} turnos guardados en Firestore para Pádel y Fútbol.`);

  // Guardar perfil de usuario de prueba en `users/{uid}`
  console.log(`\n👤 Guardando perfil de usuario con Google photo en Firestore (users/${user.uid}):`);
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: 'Emiliano Martínez',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+54 9 11 5555-0001',
    sportLevel: 'Intermedio',
    category: 'Pádel 5ta / Fútbol 7',
    matchesPlayed: 24,
    walletBalance: 12000,
    activeFixedSlots: 1,
    rating: 4.9,
    updatedAt: new Date().toISOString()
  });
  console.log(`  ✓ Perfil de usuario guardado exitosamente.`);

  // Guardar suscripción y reserva en el documento del usuario
  await setDoc(doc(db, 'users', user.uid, 'hay_equipo_data', 'turnos_y_reservas'), {
    fixedSlotSubscription: {
      id: 'sub_palermo_jueves_21',
      clubName: 'Arena Pádel Palermo',
      courtName: 'Cancha 1 — Central Panorámica WPT',
      dayOfWeek: 'Jueves',
      time: '21:00 hs',
      status: 'ACTIVO',
      monthlySavings: '$23.040'
    },
    activeBooking: {
      id: 'bk_arena_palermo_today',
      clubName: 'Arena Pádel Palermo',
      courtName: 'Cancha 1 — Central Panorámica WPT',
      date: new Date().toISOString().split('T')[0],
      time: '19:30 hs',
      totalPrice: '$48.000',
      splitShare: '$12.000',
      paymentStatus: 'PARCIALMENTE_PAGADO'
    }
  });

  console.log('\n🎉 ¡Todos los datos mock up de canchas y turnos fueron guardados en Firebase Firestore con éxito!');
}

seed().catch(err => {
  console.error('Error al guardar:', err);
  process.exit(1);
});
