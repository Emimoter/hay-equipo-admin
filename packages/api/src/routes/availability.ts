import { Router } from 'express';
import { db } from '@hay-equipo/db';
import { bookingEngine } from '../services/bookingEngine';
import { TimeSlot } from '@hay-equipo/contracts';

export const availabilityRouter = Router();

availabilityRouter.get('/', (req, res) => {
  const { sport, date, timeFrom, timeTo, isCovered, clubId } = req.query;

  const searchDate = String(date || new Date().toISOString().split('T')[0]);
  let courts = db.courts;

  if (sport) {
    courts = courts.filter(c => c.sportType === sport);
  }
  if (clubId) {
    courts = courts.filter(c => c.clubId === clubId);
  }
  if (isCovered !== undefined) {
    courts = courts.filter(c => c.isCovered === (isCovered === 'true'));
  }

  let allSlots: TimeSlot[] = [];

  for (const court of courts) {
    const slots = bookingEngine.generateSlotsForCourt(court.id, searchDate);
    allSlots.push(...slots);
  }

  // Filter only AVAILABLE slots if queried
  if (req.query.onlyAvailable === 'true' || req.query.onlyAvailable === undefined) {
    allSlots = allSlots.filter(s => s.status === 'AVAILABLE');
  }

  if (timeFrom) {
    allSlots = allSlots.filter(s => s.startTime >= String(timeFrom));
  }
  if (timeTo) {
    allSlots = allSlots.filter(s => s.startTime <= String(timeTo));
  }

  res.json({
    success: true,
    date: searchDate,
    totalSlots: allSlots.length,
    data: allSlots
  });
});

availabilityRouter.get('/court/:courtId', (req, res) => {
  const { courtId } = req.params;
  const searchDate = String(req.query.date || new Date().toISOString().split('T')[0]);
  const slots = bookingEngine.generateSlotsForCourt(courtId, searchDate);

  res.json({
    success: true,
    courtId,
    date: searchDate,
    data: slots
  });
});
