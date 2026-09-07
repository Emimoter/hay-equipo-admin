import { Router } from 'express';
import { db } from '@hay-equipo/db';
import { bookingEngine } from '../services/bookingEngine';
import { mpService } from '../services/mercadoPagoService';
import { notificationService } from '../services/notificationService';
import { HoldBookingRequestSchema, ConfirmPaymentRequestSchema } from '@hay-equipo/contracts';

export const bookingsRouter = Router();

// Hold booking slot (Atomic Redis lock)
bookingsRouter.post('/hold', async (req, res) => {
  const parseResult = HoldBookingRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.errors });
  }

  const { courtId, date, startTime, userId, userName, userPhone, paymentType, splitPlayerCount } = parseResult.data;

  const result = bookingEngine.holdSlot({
    courtId,
    date,
    startTime,
    userId,
    userName,
    userPhone,
    paymentType,
    splitPlayerCount
  });

  if (!result.success || !result.booking) {
    return res.status(409).json({
      success: false,
      error: result.error || 'No se pudo bloquear la cancha'
    });
  }

  // Create Mercado Pago Checkout Pro preference
  const preference = await mpService.createPreference({
    bookingId: result.booking.id,
    title: `Reserva ${result.booking.courtName || 'Cancha'} - ${result.booking.date} ${result.booking.startTime}hs`,
    totalAmount: result.booking.totalPrice + result.booking.serviceFee,
    payerEmail: 'usuario@hayequipo.com.ar',
    splitToken: result.booking.splitToken
  });

  res.status(201).json({
    success: true,
    booking: result.booking,
    checkout: preference
  });
});

// Confirm booking payment
bookingsRouter.post('/confirm', async (req, res) => {
  const parseResult = ConfirmPaymentRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.errors });
  }

  const { bookingId, mpPaymentId } = parseResult.data;
  const booking = bookingEngine.confirmBooking(bookingId, mpPaymentId);

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }

  // Send push notification to player
  await notificationService.notifyBookingConfirmed(
    booking.userId,
    booking.clubName || 'el Club',
    booking.date,
    booking.startTime
  );

  res.json({
    success: true,
    booking
  });
});

// Get user bookings by category (Upcoming, Past, Cancelled)
bookingsRouter.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const userBookings = db.bookings.filter(b => b.userId === userId);

  const upcoming = userBookings.filter(b => b.date >= today && b.status === 'CONFIRMED');
  const past = userBookings.filter(b => b.date < today && (b.status === 'CONFIRMED' || b.status === 'COMPLETED'));
  const cancelled = userBookings.filter(b => b.status === 'CANCELLED');
  const held = userBookings.filter(b => b.status === 'HELD');

  res.json({
    success: true,
    upcoming,
    past,
    cancelled,
    held
  });
});

// Get single booking details
bookingsRouter.get('/:id', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }

  const split = booking.splitToken ? db.splitPayments.find(s => s.shareToken === booking.splitToken) : null;
  const club = booking.clubId ? db.clubs.find(c => c.id === booking.clubId) : null;

  res.json({
    success: true,
    booking: {
      ...booking,
      split,
      club
    }
  });
});

// Cancel booking
bookingsRouter.post('/:id/cancel', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }

  booking.status = 'CANCELLED';
  res.json({
    success: true,
    message: 'Reserva cancelada exitosamente.',
    booking
  });
});

// Mercado Pago Webhook / IPN Listener
bookingsRouter.all('/webhook', async (req, res) => {
  try {
    const webhookResult = await mpService.processWebhook(req.body, req.query);

    if (webhookResult.approved) {
      if (webhookResult.isSplitShare && webhookResult.splitToken) {
        // Participant paid their split share
        const splitResult = bookingEngine.paySplitShare({
          shareToken: webhookResult.splitToken,
          participantId: webhookResult.participantId,
          playerName: webhookResult.payerName,
          mpPaymentId: webhookResult.mpPaymentId
        });

        if (splitResult.isComplete && splitResult.booking) {
          await notificationService.notifyBookingConfirmed(
            splitResult.booking.userId,
            splitResult.booking.clubName || 'el Club',
            splitResult.booking.date,
            splitResult.booking.startTime
          );
        }
      } else if (webhookResult.bookingId) {
        // Full reservation payment approved
        const confirmedBooking = bookingEngine.confirmBooking(webhookResult.bookingId, webhookResult.mpPaymentId);
        if (confirmedBooking) {
          await notificationService.notifyBookingConfirmed(
            confirmedBooking.userId,
            confirmedBooking.clubName || 'el Club',
            confirmedBooking.date,
            confirmedBooking.startTime
          );
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[MP Webhook Error]:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
});

