import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import CraftingService from '../services/CraftingService';
import FishingService from '../services/FishingService';
import MiningService from '../services/MiningService';

const router = express.Router();

router.get('/crafting/recipes', (req: Request, res: Response) => {
  try {
    const recipes = CraftingService.getRecipes();
    res.json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/crafting/craft', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ error: 'Missing recipe ID' });
    }

    const result = await CraftingService.craft(req.playerId!, recipeId);
    res.json(result);
  } catch (error: any) {
    console.error('Error crafting:', error);
    res.status(400).json({ error: error.message || 'Failed to craft' });
  }
});

router.post('/fishing/fish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const caughtFish = await FishingService.fish(req.playerId!);
    res.json({ caughtFish });
  } catch (error: any) {
    console.error('Error fishing:', error);
    res.status(400).json({ error: error.message || 'Failed to fish' });
  }
});

router.get('/fishing/fish', (req: Request, res: Response) => {
  try {
    const fish = FishingService.getAllFish();
    res.json({ fish });
  } catch (error) {
    console.error('Error fetching fish:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/mining/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const minedOre = await MiningService.mine(req.playerId!);
    res.json({ minedOre });
  } catch (error: any) {
    console.error('Error mining:', error);
    res.status(400).json({ error: error.message || 'Failed to mine' });
  }
});

router.get('/mining/ores', authMiddleware, async (req: Request, res: Response) => {
  try {
    const player = await (await require('../db/index').default.query(
      'SELECT level FROM players WHERE id = $1',
      [req.playerId]
    ));

    const playerLevel = player.rows[0]?.level || 1;
    const ores = MiningService.getOres(playerLevel);
    res.json({ ores });
  } catch (error) {
    console.error('Error fetching ores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
