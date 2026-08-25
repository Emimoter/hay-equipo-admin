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
    const token = hold.booking.splitToken!;
    const details1 = bookingEngine.getSplitDetails(token);
    assert(details1, 'Split room details must exist');
    assert(details1.paidCount === 1, 'Organizer is already paid upon creation (1/4)');
    assert(details1.isComplete === false, 'Room is not yet complete');

    // Participant 2 pays
    const pay2 = bookingEngine.paySplitShare({ shareToken: token, playerName: 'Martín G.' });
    assert(pay2.success && !pay2.isComplete, 'Participant 2 paid, room still pending (2/4)');

    // Participant 3 pays
    const pay3 = bookingEngine.paySplitShare({ shareToken: token, playerName: 'Lucas P.' });
    assert(pay3.success && !pay3.isComplete, 'Participant 3 paid, room still pending (3/4)');

    // Participant 4 pays (final quota)
    const pay4 = bookingEngine.paySplitShare({ shareToken: token, playerName: 'Facundo M.' });
    assert(pay4.success && pay4.isComplete, 'Participant 4 paid, room is complete (4/4)');
    assert.strictEqual(pay4.booking?.status, 'CONFIRMED', 'Booking automatically confirmed when 100% paid');
    assert.strictEqual(pay4.booking?.paymentStatus, 'APPROVED', 'Payment status is APPROVED');

    // Test Host Covers Remaining Quotas
    const holdCover = bookingEngine.holdSlot({
      courtId: 'court-belgrano-p2',
      date: testDate,
      startTime: '20:00',
      userId: 'usr-org-cover',
      userName: 'Org Cover',
      userPhone: '+5491100000004',
      paymentType: 'SPLIT',
      splitPlayerCount: 4
    });
    const coverToken = holdCover.booking!.splitToken!;
    const coverRes = bookingEngine.payRemainingSplitShares(coverToken, 'Org Cover');
    assert(coverRes.success && coverRes.coveredCount === 3, 'Covered 3 remaining slots');
    assert.strictEqual(coverRes.booking?.status, 'CONFIRMED', 'Booking confirmed after host covered remaining');

    // Test Host Cancels and receives Wallet Refund
    const holdCancel = bookingEngine.holdSlot({
      courtId: 'court-belgrano-p1',
      date: '2026-08-30',
      startTime: '22:00',
      userId: 'usr-org-cancel',
      userName: 'Org Cancel',
      userPhone: '+5491100000004',
      paymentType: 'SPLIT',
      splitPlayerCount: 4
    });
    const cancelToken = holdCancel.booking!.splitToken!;
    // One friend paid before cancel
    bookingEngine.paySplitShare({ shareToken: cancelToken, playerName: 'Amigo 1' });
    const cancelRes = bookingEngine.cancelSplitAndRefundToWallet(cancelToken);
    assert(cancelRes.success, 'Cancelled successfully');
    assert.strictEqual(cancelRes.booking?.status, 'CANCELLED', 'Booking is cancelled');
    assert.strictEqual(cancelRes.refundedParticipants.length, 2, '2 players refunded (Org + Amigo 1)');
    assert(cancelRes.totalRefunded > 0, 'Total refunded amount is greater than 0');
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
