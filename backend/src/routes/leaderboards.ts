import express, { Request, Response } from 'express';
import { optionalAuthMiddleware } from '../middleware/auth';
import LeaderboardService from '../services/LeaderboardService';

const router = express.Router();

router.get('/leaderboards/top-players', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const players = await LeaderboardService.getTopPlayers(limit, offset);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboards/top-farms', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const players = await LeaderboardService.getTopByFarmLevel(limit, offset);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching farm leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboards/wealthiest', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const players = await LeaderboardService.getWealthiest(limit, offset);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching wealth leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboards/player-rank', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.playerId) {
      return res.status(400).json({ error: 'Not authenticated' });
    }

    const sortBy = (req.query.sortBy as string) || 'level';
    const rank = await LeaderboardService.getPlayerRank(
      req.playerId,
      sortBy as 'level' | 'farm_level' | 'coins'
    );

    res.json({ rank });
  } catch (error) {
    console.error('Error fetching player rank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboards/most-crops', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const players = await LeaderboardService.getMostCropHarvested(limit);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching crop leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboards/most-trades', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const players = await LeaderboardService.getMostTradesCompleted(limit);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching trade leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
