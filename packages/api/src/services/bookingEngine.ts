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
        status: 'PARTIALLY_PAID',
        participants: [
          {
            id: `part_org_${Date.now()}`,
            splitPaymentId: `sp_${bookingId}`,
            userId: params.userId,
            name: params.userName.replace(/\s*\(Organizador\)/gi, ''),
            phone: params.userPhone,
            amount: shareAmount,
            status: 'PAID',
            isOrganizer: true,
            paidAt: new Date().toISOString()
          },
          ...Array.from({ length: count - 1 }, (_, i) => ({
            id: `part_guest_${i + 1}_${Date.now()}`,
            splitPaymentId: `sp_${bookingId}`,
            name: `Jugador ${i + 2}`,
            amount: shareAmount,
            isOrganizer: false,
            status: 'PENDING' as const
          }))
        ]
      });
    }

    return { success: true, booking: newBooking };
  }

  /**
   * Retrieves Split payment room details and booking information
   */
  public getSplitDetails(token: string) {
    const split = db.splitPayments.find(s => s.shareToken === token);
    if (!split) return null;

    const booking = db.bookings.find(b => b.id === split.bookingId);
    const paidParticipants = split.participants.filter(p => p.status === 'PAID');
    const pendingParticipants = split.participants.filter(p => p.status === 'PENDING');
    const totalCollected = paidParticipants.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = pendingParticipants.reduce((sum, p) => sum + p.amount, 0);
    const isComplete = paidParticipants.length === split.sharesCount;

    return {
      split,
      booking,
      totalCollected,
      remainingAmount,
      paidCount: paidParticipants.length,
      pendingCount: pendingParticipants.length,
      totalSlots: split.sharesCount,
      isComplete
    };
  }

  /**
   * Processes a participant's quota payment in the Split Lobby.
   * When all participants have paid, automatically confirms the booking.
   */
  public paySplitShare(params: {
    shareToken: string;
    participantId?: string;
    playerName?: string;
    mpPaymentId?: string;
  }): { success: boolean; isComplete: boolean; booking?: Booking; split?: any; error?: string } {
    const split = db.splitPayments.find(s => s.shareToken === params.shareToken);
    if (!split) return { success: false, isComplete: false, error: 'Sala de Split no encontrada' };

    // Find specific participant or next pending participant
    let participant = params.participantId
      ? split.participants.find(p => p.id === params.participantId)
      : split.participants.find(p => p.status === 'PENDING');

    if (!participant) {
      // If all are already paid
      const allPaid = split.participants.every(p => p.status === 'PAID');
      const booking = db.bookings.find(b => b.id === split.bookingId);
      return { success: true, isComplete: allPaid, booking, split };
    }

    // Mark participant as PAID
    participant.status = 'PAID';
    if (params.playerName && params.playerName.trim()) {
      participant.name = params.playerName.trim();
    }
    participant.paidAt = new Date().toISOString();
    participant.mpPaymentId = params.mpPaymentId || `mp_split_${Date.now()}`;

    // Check if room is fully paid
    const allPaid = split.participants.every(p => p.status === 'PAID');
    let booking = db.bookings.find(b => b.id === split.bookingId);

    if (allPaid) {
      split.status = 'APPROVED';
      if (booking && booking.status !== 'CONFIRMED') {
        booking = this.confirmBooking(booking.id, participant.mpPaymentId) || booking;
      }
    } else {
      split.status = 'PARTIALLY_PAID';
    }

    return {
      success: true,
      isComplete: allPaid,
      booking,
      split
    };
  }

  /**
   * Host covers all remaining pending quotas to immediately confirm the booking.
   */
  public payRemainingSplitShares(shareToken: string, payerName = 'Organizador'): {
    success: boolean;
    coveredCount: number;
    coveredAmount: number;
    booking?: Booking;
    split?: any;
    error?: string;
  } {
    const split = db.splitPayments.find(s => s.shareToken === shareToken);
    if (!split) return { success: false, coveredCount: 0, coveredAmount: 0, error: 'Sala no encontrada' };

    const pending = split.participants.filter(p => p.status === 'PENDING');
    let coveredAmount = 0;

    pending.forEach((p, idx) => {
      p.status = 'PAID';
      p.name = p.name ? `${p.name} (Cubierto)` : `Jugador ${split.participants.indexOf(p) + 1} (Cubierto)`;
      p.paidAt = new Date().toISOString();
      p.mpPaymentId = `mp_cover_${Date.now()}_${idx}`;
      coveredAmount += p.amount;
    });

    split.status = 'APPROVED';
    const booking = this.confirmBooking(split.bookingId);

    return {
      success: true,
      coveredCount: pending.length,
      coveredAmount,
      booking: booking || undefined,
      split
    };
  }

  /**
   * Cancels split waiting room due to timeout and issues in-app wallet refunds
   * to all participants who already deposited.
   */
  public cancelSplitAndRefundToWallet(shareToken: string): {
    success: boolean;
    booking?: Booking;
    totalRefunded: number;
    refundedParticipants: Array<{ id: string; name: string; amount: number; isOrganizer: boolean }>;
    error?: string;
  } {
    const split = db.splitPayments.find(s => s.shareToken === shareToken);
    if (!split) return { success: false, totalRefunded: 0, refundedParticipants: [], error: 'Sala no encontrada' };

    const booking = db.bookings.find(b => b.id === split.bookingId);
    if (booking) {
      booking.status = 'CANCELLED';
      booking.paymentStatus = 'REFUNDED';
      // Release court lock
      redisLock.releaseCourtHold(booking.courtId, booking.date, booking.startTime, booking.userId);
    }

    split.status = 'CANCELLED';

    const paidParticipants = split.participants.filter(p => p.status === 'PAID');
    const totalRefunded = paidParticipants.reduce((sum, p) => sum + p.amount, 0);

    return {
      success: true,
      booking,
      totalRefunded,
      refundedParticipants: paidParticipants.map(p => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        isOrganizer: !!p.isOrganizer
      }))
    };
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
