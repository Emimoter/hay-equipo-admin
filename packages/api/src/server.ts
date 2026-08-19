import express from 'express';
import cors from 'cors';
import { sportsRouter } from './routes/sports';
import { clubsRouter } from './routes/clubs';
import { availabilityRouter } from './routes/availability';
import { bookingsRouter } from './routes/bookings';
import { splitRouter } from './routes/split';
import { fixedSlotsRouter } from './routes/fixed-slots';
import { clubAdminRouter } from './routes/club-admin';
import { redisLock } from '@hay-equipo/redis';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hay Equipo Core API',
    timestamp: new Date().toISOString()
  });
});

// SSE for Real-Time Slot Locking & Availability Broadcast
app.get('/api/events/live-availability', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const onHeld = (data: any) => {
    res.write(`event: slot_held\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const onReleased = (data: any) => {
    res.write(`event: slot_released\ndata: ${JSON.stringify(data)}\n\n`);
  };

  redisLock.events.on('slot:held', onHeld);
  redisLock.events.on('slot:released', onReleased);

  req.on('close', () => {
    redisLock.events.off('slot:held', onHeld);
    redisLock.events.off('slot:released', onReleased);
  });
});

// Mount Routes
app.use('/api/sports', sportsRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/split', splitRouter);
app.use('/api/fixed-slots', fixedSlotsRouter);
app.use('/api/club-admin', clubAdminRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  HAY EQUIPO API SERVER RUNNING ON PORT ${PORT}`);
    console.log(`  Healthcheck: http://localhost:${PORT}/health`);
    console.log(`=========================================`);
  });
}

export { app };
