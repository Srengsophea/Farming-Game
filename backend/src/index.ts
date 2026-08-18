import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import { initializeDatabase } from './db/index';
import { seedDatabase } from './db/seed';
import authRoutes from './routes/auth';
import farmingRoutes from './routes/farming';
import tradingRoutes from './routes/trading';
import socialRoutes from './routes/social';
import activitiesRoutes from './routes/activities';
import leaderboardRoutes from './routes/leaderboards';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', farmingRoutes);
app.use('/api/game', tradingRoutes);
app.use('/api/game', activitiesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/social', leaderboardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Seeding database...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
