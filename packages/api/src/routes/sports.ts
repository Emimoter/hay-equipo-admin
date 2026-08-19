import { Router } from 'express';
import { db } from '@hay-equipo/db';

export const sportsRouter = Router();

sportsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    data: db.sports
  });
});
