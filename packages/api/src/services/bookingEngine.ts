import { db } from '@hay-equipo/db';
import { redisLock } from '@hay-equipo/redis';
import { TimeSlot, Booking, BookingStatus, SportType } from '@hay-equipo/contracts';

export class BookingEngineService {
  /**
   * Generates discrete time slots for a court on a specific date
   */
  public generateSlotsForCourt(courtId: string, date: string): TimeSlot[] {
    const court = db.courts.find(c => c.id === courtId);
    if (!court) return [];

    const club = db.clubs.find(c => c.id === court.clubId);
    if (!club) return [];

    const slots: TimeSlot[] = [];
    const openHour = parseInt(club.openingTime.split(':')[0], 10);
    const closeHour = parseInt(club.closingTime.split(':')[0], 10) === 0 ? 24 : parseInt(club.closingTime.split(':')[0], 10);
    const duration = court.durationMinutes;

    let currentMinutes = openHour * 60;
    const endMinutes = (closeHour <= openHour ? closeHour + 24 : closeHour) * 60;

    while (currentMinutes + duration <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60) % 24;
      const startM = currentMinutes % 60;
      const endTotalM = currentMinutes + duration;
      const endH = Math.floor(endTotalM / 60) % 24;
      const endM = endTotalM % 60;

      const startTimeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // 1. Check if occupied by confirmed booking
      const confirmedBooking = db.bookings.find(
        b => b.courtId === courtId && b.date === date && b.startTime === startTimeStr && (b.status === 'CONFIRMED' || b.status === 'MANUAL_ENTRY')
      );

      // 2. Check if held in Redis (temporary 7min hold)
      const activeHold = redisLock.getActiveHold(courtId, date, startTimeStr);

      // 3. Check if recurring fixed slot exists on this day of week
      const dateObj = new Date(date + 'T12:00:00Z');
      const dayOfWeek = dateObj.getDay();
      const fixedSlot = db.fixedSlotSubscriptions.find(
        s => s.courtId === courtId && s.dayOfWeek === dayOfWeek && s.startTime === startTimeStr && s.status === 'ACTIVE'
      );

      // Check if this date was released back to marketplace
      const occurrence = fixedSlot
        ? db.recurringOccurrences.find(o => o.subscriptionId === fixedSlot.id && o.date === date)
        : null;

      let status: BookingStatus = 'AVAILABLE';
      let holdExpiresAt: string | undefined = undefined;

      if (confirmedBooking) {
        status = 'CONFIRMED';
      } else if (fixedSlot && (!occurrence || occurrence.status !== 'RELEASED_TO_MARKETPLACE')) {
        status = 'CONFIRMED'; // Booked by fixed slot
      } else if (activeHold) {
        status = 'HELD';
        holdExpiresAt = new Date(activeHold.expiresAt).toISOString();
      }

      // Calculate regular and fixed slot prices
      const regularPrice = court.pricePerHour * (duration / 60);
      const fixedPrice = Math.round(regularPrice * (1 - court.priceFixedSlotDiscount));

      slots.push({
        courtId: court.id,
        courtName: court.name,
        clubId: club.id,
        clubName: club.name,
        sportType: court.sportType,
        date,
        startTime: startTimeStr,
        endTime: endTimeStr,
        durationMinutes: duration,
        price: regularPrice,
        fixedSlotPrice: fixedPrice,
        status,
        holdExpiresAt
      });

      currentMinutes += duration;
    }

    return slots;
  }

  /**
   * Holds a time slot atomically using Redis distributed locking
   */
  public holdSlot(params: {
    courtId: string;
    date: string;
    startTime: string;
    userId: string;
    userName: string;
    userPhone: string;
    paymentType: 'FULL' | 'SPLIT';
    splitPlayerCount?: number;
  }): { success: boolean; booking?: Booking; error?: string } {
    const court = db.courts.find(c => c.id === params.courtId);
    if (!court) return { success: false, error: 'Cancha no encontrada' };

    const club = db.clubs.find(c => c.id === court.clubId);

    // Acquire lock in Redis
    const lockResult = redisLock.acquireCourtHold(params.courtId, params.date, params.startTime, params.userId, 420);
    if (!lockResult.success) {
      return { success: false, error: lockResult.message };
    }

    const duration = court.durationMinutes;
    const startParts = params.startTime.split(':').map(Number);
    const endMinutes = startParts[0] * 60 + startParts[1] + duration;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const totalPrice = court.pricePerHour * (duration / 60);
    const serviceFee = 2000; // $2.000 ARS service fee
    const bookingId = `bk_${Date.now()}`;
    const splitToken = params.paymentType === 'SPLIT' ? `split_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : undefined;

    const newBooking: Booking = {
      id: bookingId,
      courtId: court.id,
      courtName: court.name,
      clubId: club?.id,
      clubName: club?.name,
      sportType: court.sportType,
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      date: params.date,
      startTime: params.startTime,
      endTime: endTimeStr,
      totalPrice,
      serviceFee,
      status: 'HELD',
      holdExpiresAt: lockResult.expiresAt,
      paymentType: params.paymentType,
      paymentStatus: 'PENDING',
      isFixedSlot: false,
      splitToken,
      createdAt: new Date().toISOString()
    };

    db.bookings.push(newBooking);

    // If Split Payment, initialize participant quotas
    if (params.paymentType === 'SPLIT' && splitToken) {
      const count = params.splitPlayerCount || 4;
      const shareAmount = Math.round(totalPrice / count);

      db.splitPayments.push({
        id: `sp_${bookingId}`,
        bookingId,
        totalAmount: totalPrice,
        sharesCount: count,
        splitType: 'EQUAL',
        shareToken: splitToken,
        status: 'PENDING',
        participants: [
          {
            id: `part_org_${Date.now()}`,
            splitPaymentId: `sp_${bookingId}`,
            userId: params.userId,
            name: `${params.userName} (Organizador)`,
            phone: params.userPhone,
            amount: shareAmount,
            status: 'PENDING'
          },
          ...Array.from({ length: count - 1 }, (_, i) => ({
            id: `part_guest_${i + 1}_${Date.now()}`,
            splitPaymentId: `sp_${bookingId}`,
            name: `Jugador ${i + 2}`,
            amount: shareAmount,
            status: 'PENDING' as const
          }))
        ]
      });
    }

    return { success: true, booking: newBooking };
  }

  /**
   * Confirms payment and changes status from HELD to CONFIRMED
   */
  public confirmBooking(bookingId: string, mpPaymentId?: string): Booking | null {
    const booking = db.bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    booking.status = 'CONFIRMED';
    booking.paymentStatus = 'APPROVED';
    booking.holdExpiresAt = undefined;

    // Release Redis lock since it is now permanently confirmed in DB
    redisLock.releaseCourtHold(booking.courtId, booking.date, booking.startTime, booking.userId);

    return booking;
  }
}

export const bookingEngine = new BookingEngineService();
