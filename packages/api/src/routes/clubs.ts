import { Router } from 'express';
import { db } from '@hay-equipo/db';

export const clubsRouter = Router();

// Haversine distance calculator in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

clubsRouter.get('/', (req, res) => {
  const { sport, city, lat, lng, maxDistanceKm } = req.query;

  let results = db.clubs.map(club => {
    let distance: number | undefined = undefined;
    if (lat && lng) {
      distance = calculateDistance(Number(lat), Number(lng), club.latitude, club.longitude);
    }
    const courts = db.courts.filter(c => c.clubId === club.id);
    return {
      ...club,
      distance: distance !== undefined ? `${distance} km` : '1.8 km',
      distanceValue: distance ?? 1.8,
      courtsCount: courts.length,
      availableSports: Array.from(new Set(courts.map(c => c.sportType)))
    };
  });

  if (sport) {
    results = results.filter(c => c.availableSports.includes(sport as any));
  }

  if (city) {
    results = results.filter(c => c.city.toLowerCase() === String(city).toLowerCase());
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

clubsRouter.get('/:id', (req, res) => {
  const club = db.clubs.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!club) {
    return res.status(404).json({ success: false, error: 'Club no encontrado' });
  }

  const courts = db.courts.filter(c => c.clubId === club.id);

  res.json({
    success: true,
    data: {
      ...club,
      courts
    }
  });
});
