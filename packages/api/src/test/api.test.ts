import assert from 'node:assert';
import { test, describe } from 'node:test';
import { bookingEngine } from '../services/bookingEngine';
import { redisLock } from '@hay-equipo/redis';
import { db } from '@hay-equipo/db';
import { mpService } from '../services/mercadoPagoService';

describe('Hay Equipo Core Booking Engine & Flow Tests', () => {
  const testDate = '2026-09-01';

  test('1. Generates correct availability slots for court', () => {
    const courtId = 'court-arena-wpt-1';
    const slots = bookingEngine.generateSlotsForCourt(courtId, testDate);
    assert(slots.length > 0, 'Should generate discrete slots');
    assert(slots[0].startTime === '08:00', 'First slot starts at opening time 08:00');
    assert(slots[0].durationMinutes === 90, 'Padel court duration is 90 min');
  });

  test('2. Atomic Hold Lock prevents double-booking on the same slot', () => {
    const courtId = 'court-arena-indoor-2';
    const startTime = '20:00';
    const userId1 = 'usr-player-1';
    const userId2 = 'usr-player-2';

    // Player 1 acquires hold
    const hold1 = bookingEngine.holdSlot({
      courtId,
      date: testDate,
      startTime,
      userId: userId1,
      userName: 'Player One',
      userPhone: '+5491100000001',
      paymentType: 'FULL'
    });
    assert(hold1.success === true, 'Player 1 must acquire hold');
    assert(hold1.booking?.status === 'HELD', 'Status must be HELD');

    // Player 2 attempts to hold the same slot simultaneously
    const hold2 = bookingEngine.holdSlot({
      courtId,
      date: testDate,
      startTime,
      userId: userId2,
      userName: 'Player Two',
      userPhone: '+5491100000002',
      paymentType: 'FULL'
    });
    assert(hold2.success === false, 'Player 2 must be blocked by hold lock');
    assert(hold2.error?.includes('bloqueo temporal'), 'Error must inform active 7min hold');

    // Cleanup
    redisLock.releaseCourtHold(courtId, testDate, startTime, userId1);
  });

  test('3. Mercado Pago preference creation and booking confirmation', async () => {
    const courtId = 'court-arena-indoor-3';
    const hold = bookingEngine.holdSlot({
      courtId,
      date: testDate,
      startTime: '18:00',
      userId: 'usr-player-3',
      userName: 'Player Three',
      userPhone: '+5491100000003',
      paymentType: 'FULL'
    });
    assert(hold.booking, 'Booking must be created');

    const preference = await mpService.createPreference({
      bookingId: hold.booking.id,
      title: 'Reserva Test',
      totalAmount: hold.booking.totalPrice,
      payerEmail: 'test@example.com'
    });
    assert(preference.preferenceId.startsWith('pref_'), 'Preference ID generated');
    assert(preference.initPoint.includes('mercadopago'), 'Init point generated');

    // Confirm booking
    const confirmed = bookingEngine.confirmBooking(hold.booking.id, 'mp_test_123');
    assert(confirmed?.status === 'CONFIRMED', 'Status must transition to CONFIRMED');
    assert(confirmed?.paymentStatus === 'APPROVED', 'Payment status must be APPROVED');
  });

  test('4. Split Payment divides accurately and handles participant payments', () => {
    const courtId = 'court-belgrano-p1';
    const hold = bookingEngine.holdSlot({
      courtId,
      date: testDate,
      startTime: '21:00',
      userId: 'usr-organizer',
      userName: 'Organizer Player',
      userPhone: '+5491100000004',
      paymentType: 'SPLIT',
      splitPlayerCount: 4
    });

    assert(hold.booking?.splitToken, 'Split token must be created');
    const split = db.splitPayments.find(s => s.shareToken === hold.booking?.splitToken);
    assert(split, 'Split payment record must exist');
    assert(split.sharesCount === 4, 'Must have 4 participants');
    assert(split.participants.length === 4, '4 participant quotas created');
    assert.strictEqual(
      split.participants.reduce((a, b) => a + b.amount, 0),
      split.totalAmount,
      'Sum of quotas must equal total price'
    );
  });

  test('5. Fixed Slot Subscription generates weekly occurrences with discounts', () => {
    const court = db.courts.find(c => c.id === 'court-cantera-f5-a')!;
    const durationMonths = 3;
    const initialCount = db.fixedSlotSubscriptions.length;

    const subId = `sub_test_${Date.now()}`;
    db.fixedSlotSubscriptions.push({
      id: subId,
      userId: 'usr-fixed-player',
      userName: 'Fixed Player',
      userPhone: '+5491100000005',
      clubId: court.clubId,
      clubName: 'Belgrano Sports',
      courtId: court.id,
      courtName: court.name,
      sportType: court.sportType,
      dayOfWeek: 3, // Miércoles
      startTime: '21:00',
      endTime: '22:00',
      startDate: testDate,
      durationMonths,
      pricePerOccurrence: court.pricePerHour * (1 - court.priceFixedSlotDiscount),
      discountMonthlyTotal: court.pricePerHour * court.priceFixedSlotDiscount * 4,
      billingFrequency: 'MONTHLY',
      status: 'ACTIVE',
      autoRenew: true,
      occurrencesGenerated: 12
    });

    assert(db.fixedSlotSubscriptions.length === initialCount + 1, 'Subscription added');
  });
});
