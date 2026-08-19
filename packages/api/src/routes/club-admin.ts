import { Router } from 'express';
import { db } from '@hay-equipo/db';
import { bookingEngine } from '../services/bookingEngine';
import { CreateManualBookingRequestSchema } from '@hay-equipo/contracts';

export const clubAdminRouter = Router();

// 1. Get Real-Time Club Agenda / Timeline for a given Date
clubAdminRouter.get('/:clubId/timeline', (req, res) => {
  const { clubId } = req.params;
  const date = String(req.query.date || new Date().toISOString().split('T')[0]);

  const club = db.clubs.find(c => c.id === clubId);
  if (!club) {
    return res.status(404).json({ success: false, error: 'Club no encontrado' });
  }

  const courts = db.courts.filter(c => c.clubId === clubId);

  const timeline = courts.map(court => {
    const slots = bookingEngine.generateSlotsForCourt(court.id, date);
    return {
      courtId: court.id,
      courtName: court.name,
      sportType: court.sportType,
      surface: court.surface,
      isCovered: court.isCovered,
      slots
    };
  });

  res.json({
    success: true,
    club: { id: club.id, name: club.name },
    date,
    courtsCount: courts.length,
    timeline
  });
});

// 2. Create Manual Booking (from WhatsApp / Counter reception)
clubAdminRouter.post('/:clubId/manual-booking', (req, res) => {
  const { clubId } = req.params;
  const parseResult = CreateManualBookingRequestSchema.safeParse({ ...req.body, clubId });

  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.errors });
  }

  const { courtId, date, startTime, endTime, clientName, clientPhone, price, notes } = parseResult.data;

  const court = db.courts.find(c => c.id === courtId && c.clubId === clubId);
  if (!court) {
    return res.status(404).json({ success: false, error: 'Cancha no encontrada en este club' });
  }

  const bookingId = `bk_manual_${Date.now()}`;
  const booking = {
    id: bookingId,
    courtId,
    courtName: court.name,
    clubId,
    clubName: db.clubs.find(c => c.id === clubId)?.name,
    sportType: court.sportType,
    userId: `usr_client_${Date.now()}`,
    userName: clientName,
    userPhone: clientPhone,
    date,
    startTime,
    endTime,
    totalPrice: price,
    serviceFee: 0,
    status: 'MANUAL_ENTRY' as const,
    paymentType: 'FULL' as const,
    paymentStatus: 'APPROVED' as const,
    isFixedSlot: false,
    source: 'MANUAL_ENTRY' as const,
    notes,
    createdAt: new Date().toISOString()
  };

  db.bookings.push(booking as any);

  res.status(201).json({
    success: true,
    message: 'Reserva manual registrada exitosamente. Disponibilidad actualizada en vivo.',
    booking
  });
});

// 3. Get Club CRM Clients
clubAdminRouter.get('/:clubId/clients', (req, res) => {
  const { clubId } = req.params;

  const clubBookings = db.bookings.filter(b => b.clubId === clubId);
  const clientMap = new Map<string, any>();

  for (const b of clubBookings) {
    const key = b.userPhone || b.userName;
    const existing = clientMap.get(key);
    if (existing) {
      existing.totalBookings += 1;
      existing.totalSpent += b.totalPrice;
      if (b.date > existing.lastVisit) existing.lastVisit = b.date;
    } else {
      clientMap.set(key, {
        id: b.userId,
        name: b.userName,
        phone: b.userPhone,
        totalBookings: 1,
        totalSpent: b.totalPrice,
        lastVisit: b.date
      });
    }
  }

  res.json({
    success: true,
    clients: Array.from(clientMap.values())
  });
});

// 4. Get Club Analytics & Occupancy
clubAdminRouter.get('/:clubId/metrics', (req, res) => {
  const { clubId } = req.params;
  const clubBookings = db.bookings.filter(b => b.clubId === clubId);
  const fixedSlots = db.fixedSlotSubscriptions.filter(s => s.clubId === clubId && s.status === 'ACTIVE');

  const gmv = clubBookings.reduce((acc, b) => acc + b.totalPrice, 0);

  res.json({
    success: true,
    metrics: {
      totalBookings: clubBookings.length,
      activeFixedSlots: fixedSlots.length,
      gmvTotalARS: gmv,
      averageOccupancyRate: '78%',
      busiestHours: ['19:30 - 21:00', '21:00 - 22:30', '22:30 - 00:00'],
      topCourt: 'Cancha 1 (Central Panorámica)'
    }
  });
});
