import { Router } from 'express';
import { db } from '@hay-equipo/db';
import { notificationService } from '../services/notificationService';

export const fixedSlotsRouter = Router();

// Create / Contract a Fixed Slot Subscription
fixedSlotsRouter.post('/subscribe', (req, res) => {
  const {
    userId,
    userName,
    userPhone,
    clubId,
    courtId,
    dayOfWeek, // 0-6
    startTime,
    durationMonths = 3,
    billingFrequency = 'MONTHLY'
  } = req.body;

  const court = db.courts.find(c => c.id === courtId);
  const club = db.clubs.find(c => c.id === clubId);

  if (!court || !club) {
    return res.status(404).json({ success: false, error: 'Club o Cancha no encontrados' });
  }

  // Calculate end time
  const duration = court.durationMinutes;
  const startParts = startTime.split(':').map(Number);
  const endMinutes = startParts[0] * 60 + startParts[1] + duration;
  const endH = Math.floor(endMinutes / 60) % 24;
  const endM = endMinutes % 60;
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

  const regularPrice = court.pricePerHour * (duration / 60);
  const discountedPrice = Math.round(regularPrice * (1 - court.priceFixedSlotDiscount));
  const estimatedMatchesPerMonth = 4;
  const monthlySavings = (regularPrice - discountedPrice) * estimatedMatchesPerMonth;

  const subId = `sub_${Date.now()}`;
  const startDate = new Date().toISOString().split('T')[0];

  const subscription = {
    id: subId,
    userId,
    userName,
    userPhone,
    clubId: club.id,
    clubName: club.name,
    courtId: court.id,
    courtName: court.name,
    sportType: court.sportType,
    dayOfWeek: Number(dayOfWeek),
    startTime,
    endTime,
    startDate,
    durationMonths: Number(durationMonths),
    pricePerOccurrence: discountedPrice,
    discountMonthlyTotal: monthlySavings,
    billingFrequency,
    status: 'ACTIVE' as const,
    autoRenew: true,
    occurrencesGenerated: Number(durationMonths) * 4
  };

  db.fixedSlotSubscriptions.push(subscription);

  // Generate weekly occurrences
  const totalWeeks = Number(durationMonths) * 4;
  for (let i = 0; i < totalWeeks; i++) {
    const occDate = new Date();
    occDate.setDate(occDate.getDate() + (i * 7));
    const occDateStr = occDate.toISOString().split('T')[0];

    db.recurringOccurrences.push({
      id: `occ_${subId}_${i + 1}`,
      subscriptionId: subId,
      date: occDateStr,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      courtName: court.name,
      clubName: club.name,
      status: 'SCHEDULED',
      isPaid: i === 0,
      price: discountedPrice
    });
  }

  res.status(201).json({
    success: true,
    message: `¡Turno fijo confirmado! Ahorrás $${monthlySavings.toLocaleString('es-AR')} por mes.`,
    subscription
  });
});

// Get user fixed slot subscriptions
fixedSlotsRouter.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const subs = db.fixedSlotSubscriptions.filter(s => s.userId === userId);
  const occurrences = db.recurringOccurrences.filter(o =>
    subs.some(s => s.id === o.subscriptionId)
  );

  res.json({
    success: true,
    subscriptions: subs,
    occurrences
  });
});

// Liberate a weekly occurrence to the marketplace
fixedSlotsRouter.post('/occurrences/:occurrenceId/liberate', async (req, res) => {
  const { occurrenceId } = req.params;
  const occurrence = db.recurringOccurrences.find(o => o.id === occurrenceId);

  if (!occurrence) {
    return res.status(404).json({ success: false, error: 'Ocurrencia de turno no encontrada' });
  }

  occurrence.status = 'RELEASED_TO_MARKETPLACE';

  // Notify waitlist users for this liberated slot
  await notificationService.notifyWaitlistAvailable(
    'usr_waitlist_1',
    occurrence.clubName,
    occurrence.courtName,
    occurrence.date,
    occurrence.startTime
  );

  res.json({
    success: true,
    message: 'La fecha fue liberada exitosamente al marketplace.',
    occurrence
  });
});
