import { Router } from 'express';
import { db } from '@hay-equipo/db';
import { mpService } from '../services/mercadoPagoService';

export const splitRouter = Router();

// Get split payment status and participants by shareToken
splitRouter.get('/:token', (req, res) => {
  const { token } = req.params;
  const split = db.splitPayments.find(s => s.shareToken === token);
  if (!split) {
    return res.status(404).json({ success: false, error: 'Enlace de split payment no encontrado o vencido' });
  }

  const booking = db.bookings.find(b => b.id === split.bookingId);
  const club = booking?.clubId ? db.clubs.find(c => c.id === booking.clubId) : null;

  const totalCollected = split.participants
    .filter(p => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

  res.json({
    success: true,
    data: {
      ...split,
      booking,
      club,
      totalCollected,
      remainingAmount: split.totalAmount - totalCollected,
      isFullyPaid: totalCollected >= split.totalAmount
    }
  });
});

// Create Mercado Pago Checkout Pro preference for an individual split quota
splitRouter.post('/:token/preference', async (req, res) => {
  const { token } = req.params;
  const { participantId, playerName, playerEmail } = req.body;

  const split = db.splitPayments.find(s => s.shareToken === token);
  if (!split) {
    return res.status(404).json({ success: false, error: 'Split payment no encontrado' });
  }

  const booking = db.bookings.find(b => b.id === split.bookingId);
  let participant = split.participants.find(p => p.id === participantId);

  if (!participant) {
    participant = split.participants.find(p => p.status === 'PENDING');
  }

  if (!participant) {
    return res.status(400).json({ success: false, error: 'No hay cupos disponibles para pagar' });
  }

  const preference = await mpService.createPreference({
    bookingId: split.bookingId,
    title: `Tu cuota en ${booking?.courtName || 'Cancha'} - ${booking?.date || ''} ${booking?.startTime || ''}hs`,
    totalAmount: participant.amount,
    payerEmail: playerEmail || 'jugador@hayequipo.com',
    splitToken: token,
    participantId: participant.id,
    isSplitShare: true
  });

  res.json({
    success: true,
    participant,
    checkout: preference
  });
});

// Pay individual split share (direct or webhook callback confirmation)
splitRouter.post('/:token/pay', async (req, res) => {
  const { token } = req.params;
  const { participantId, playerName, playerPhone } = req.body;

  const split = db.splitPayments.find(s => s.shareToken === token);
  if (!split) {
    return res.status(404).json({ success: false, error: 'Split payment no encontrado' });
  }

  let participant = split.participants.find(p => p.id === participantId);

  // If participant is generic or not assigned yet, assign name
  if (!participant) {
    const unassigned = split.participants.find(p => p.status === 'PENDING' && !p.userId);
    if (unassigned) {
      participant = unassigned;
      if (playerName) participant.name = playerName;
      if (playerPhone) participant.phone = playerPhone;
    }
  }

  if (!participant) {
    return res.status(400).json({ success: false, error: 'No hay cupos pendientes disponibles en este partido' });
  }

  participant.status = 'PAID';
  participant.paidAt = new Date().toISOString();
  participant.mpPaymentId = `mp_split_${Date.now()}`;

  // Check if all are paid
  const allPaid = split.participants.every(p => p.status === 'PAID');
  if (allPaid) {
    split.status = 'APPROVED';
    const booking = db.bookings.find(b => b.id === split.bookingId);
    if (booking) {
      booking.paymentStatus = 'APPROVED';
    }
  } else {
    split.status = 'PARTIALLY_PAID';
  }

  res.json({
    success: true,
    message: `¡Pago de $${participant.amount} acreditado con éxito!`,
    participant,
    splitStatus: split.status
  });
});
