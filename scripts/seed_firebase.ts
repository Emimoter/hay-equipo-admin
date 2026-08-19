import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { REALISTIC_ARG_CLUBS, REALISTIC_ARG_COURTS } from '../packages/db/src/realistic_seed';

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
const db = getFirestore(app);

async function seedFirestore() {
  console.log('🚀 Iniciando carga de datos mock up realistas en Firestore (pclink-f6e0d)...');

  // 1. Seed Clubs
  console.log(`📍 Guardando ${REALISTIC_ARG_CLUBS.length} clubes en colección 'clubs'...`);
  for (const club of REALISTIC_ARG_CLUBS) {
    await setDoc(doc(db, 'clubs', club.id), club);
    console.log(`  ✓ Club guardado: ${club.name} (${club.city})`);
  }

  // 2. Seed Courts
  console.log(`🎾⚽ Guardando ${REALISTIC_ARG_COURTS.length} canchas en colección 'courts'...`);
  for (const court of REALISTIC_ARG_COURTS) {
    await setDoc(doc(db, 'courts', court.id), court);
    console.log(`  ✓ Cancha guardada: ${court.name} - ${court.sportType}`);
  }

  // 3. Seed Time Slots (Turnos para hoy, mañana y los próximos 3 días)
  console.log(`⏰ Generando y guardando turnos mock up para Pádel y Fútbol...`);
  const hoursPadel = ['08:00', '09:30', '11:00', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'];
  const hoursFutbol = ['09:00', '10:00', '11:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  let totalSlots = 0;

  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    for (const court of REALISTIC_ARG_COURTS) {
      const hoursList = court.sportType === 'PADEL' ? hoursPadel : hoursFutbol;

      for (let i = 0; i < hoursList.length; i++) {
        const startTime = hoursList[i];
        const duration = court.durationMinutes;
        const [h, m] = startTime.split(':').map(Number);
        const endTotal = h * 60 + m + duration;
        const endH = Math.floor(endTotal / 60) % 24;
        const endM = endTotal % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        // Deterministic status based on hour
        let status: 'AVAILABLE' | 'CONFIRMED' | 'HELD' = 'AVAILABLE';
        if (startTime === '21:00' && (court.id.includes('wpt-1') || court.id.includes('f5-a'))) {
          status = 'CONFIRMED';
        } else if (startTime === '19:30' && court.id.includes('indoor-2')) {
          status = 'HELD';
        }

        const slotId = `slot_${court.id}_${dateStr}_${startTime.replace(':', '')}`;
        const slotData = {
          id: slotId,
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
        };

        await setDoc(doc(db, 'slots', slotId), slotData);
        totalSlots++;
      }
    }
  }

  console.log(`  ✓ ${totalSlots} turnos guardados en Firestore.`);

  // 4. Seed Turnos Fijos (Fixed Slot Subscriptions)
  console.log(`⚡ Guardando suscripciones de turnos fijos de ejemplo...`);
  const subMock = {
    id: 'sub_palermo_jueves_21',
    userId: 'usr-emi',
    userName: 'Emiliano Martínez',
    userPhone: '+54 9 11 5555-0001',
    clubId: 'club-arena-palermo',
    clubName: 'Arena Pádel Palermo',
    courtId: 'court-arena-wpt-1',
    courtName: 'Cancha 1 — Central Panorámica WPT',
    sportType: 'PADEL',
    dayOfWeek: 4, // Jueves
    startTime: '21:00',
    endTime: '22:30',
    startDate: new Date().toISOString().split('T')[0],
    durationMonths: 3,
    pricePerOccurrence: 42240,
    discountMonthlyTotal: 23040,
    billingFrequency: 'MONTHLY',
    status: 'ACTIVE',
    autoRenew: true,
    occurrencesGenerated: 12
  };
  await setDoc(doc(db, 'fixed_slot_subscriptions', subMock.id), subMock);

  // 5. Seed Bookings & Split Payments
  console.log(`💳 Guardando reservas y split payments en Firestore...`);
  const today = new Date().toISOString().split('T')[0];
  const bookingMock = {
    id: 'bk_arena_palermo_today',
    courtId: 'court-arena-wpt-1',
    courtName: 'Cancha 1 — Central Panorámica WPT',
    clubId: 'club-arena-palermo',
    clubName: 'Arena Pádel Palermo',
    sportType: 'PADEL',
    userId: 'usr-emi',
    userName: 'Emiliano Martínez',
    userPhone: '+54 9 11 5555-0001',
    date: today,
    startTime: '19:30',
    endTime: '21:00',
    totalPrice: 48000,
    serviceFee: 2000,
    status: 'CONFIRMED',
    paymentType: 'SPLIT',
    paymentStatus: 'PARTIALLY_PAID',
    splitToken: 'split-seed-token-123',
    createdAt: new Date().toISOString()
  };
  await setDoc(doc(db, 'bookings', bookingMock.id), bookingMock);

  const splitMock = {
    id: 'sp_arena_palermo_today',
    bookingId: 'bk_arena_palermo_today',
    totalAmount: 48000,
    sharesCount: 4,
    splitType: 'EQUAL',
    shareToken: 'split-seed-token-123',
    status: 'PARTIALLY_PAID',
    participants: [
      { id: 'part_1', name: 'Emiliano (Organizador)', phone: '+54 9 11 5555-0001', amount: 12000, status: 'PAID', paidAt: new Date().toISOString() },
      { id: 'part_2', name: 'Lucas', phone: '+54 9 11 5555-0002', amount: 12000, status: 'PAID', paidAt: new Date().toISOString() },
      { id: 'part_3', name: 'Nicolás', phone: '+54 9 11 5555-0003', amount: 12000, status: 'PENDING' },
      { id: 'part_4', name: 'Juan', phone: '+54 9 11 5555-0004', amount: 12000, status: 'PENDING' }
    ]
  };
  await setDoc(doc(db, 'split_payments', splitMock.id), splitMock);

  console.log('✅ ¡Todos los datos mock up fueron guardados con éxito en Firestore!');
}

seedFirestore().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error guardando en Firestore:', err);
  process.exit(1);
});
