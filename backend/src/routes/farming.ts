import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import PlayerService from '../services/PlayerService';
import FarmingService from '../services/FarmingService';

const router = express.Router();

router.get('/farm', authMiddleware, async (req: Request, res: Response) => {
  try {
    const farm = await PlayerService.getFarm(req.playerId!);
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    const tiles = await PlayerService.getFarmTiles(farm.id);
    const animals = await PlayerService.getAnimals(farm.id);
    const buildings = await PlayerService.getBuildings(farm.id);

    res.json({ farm, tiles, animals, buildings });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/inventory', authMiddleware, async (req: Request, res: Response) => {
  try {
    const inventory = await PlayerService.getInventory(req.playerId!);
    res.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/farm/plant', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { farmTileId, cropType } = req.body;

    if (!farmTileId || !cropType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cropId = await FarmingService.plantCrop(farmTileId, cropType, req.playerId!);
    res.json({ cropId });
  } catch (error: any) {
    console.error('Error planting crop:', error);
    res.status(400).json({ error: error.message || 'Failed to plant crop' });
  }
});

router.post('/farm/water', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { cropId } = req.body;

    if (!cropId) {
      return res.status(400).json({ error: 'Missing crop ID' });
    }

    await FarmingService.waterCrop(cropId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error watering crop:', error);
    res.status(400).json({ error: error.message || 'Failed to water crop' });
  }
});

router.post('/farm/harvest', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { cropId } = req.body;

    if (!cropId) {
      return res.status(400).json({ error: 'Missing crop ID' });
    }

    const result = await FarmingService.harvestCrop(cropId, req.playerId!);
    res.json(result);
  } catch (error: any) {
    console.error('Error harvesting crop:', error);
    res.status(400).json({ error: error.message || 'Failed to harvest crop' });
  }
});

router.get('/farm/crop/:cropId/progress', authMiddleware, async (req: Request, res: Response) => {
  try {
    const progress = await FarmingService.getCropGrowthProgress(req.params.cropId);
    res.json(progress);
  } catch (error: any) {
    console.error('Error fetching crop progress:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch progress' });
  }
});

router.post('/animals/feed', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { animalId } = req.body;

    if (!animalId) {
      return res.status(400).json({ error: 'Missing animal ID' });
    }

    await FarmingService.feedAnimal(animalId, req.playerId!);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error feeding animal:', error);
    res.status(400).json({ error: error.message || 'Failed to feed animal' });
  }
});

router.post('/animals/collect', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { animalId } = req.body;

    if (!animalId) {
      return res.status(400).json({ error: 'Missing animal ID' });
    }

    const result = await FarmingService.collectAnimalProduct(animalId, req.playerId!);
    res.json(result);
  } catch (error: any) {
    console.error('Error collecting animal product:', error);
    res.status(400).json({ error: error.message || 'Failed to collect product' });
  }
});

router.post('/animals/purchase', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { animalType } = req.body;

    if (!animalType) {
      return res.status(400).json({ error: 'Missing animal type' });
    }

    const farm = await PlayerService.getFarm(req.playerId!);
    const animalId = await FarmingService.purchaseAnimal(farm.id, animalType, req.playerId!);

    res.json({ animalId });
  } catch (error: any) {
    console.error('Error purchasing animal:', error);
    res.status(400).json({ error: error.message || 'Failed to purchase animal' });
  }
});

router.post('/buildings/add', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { buildingType, gridX, gridY } = req.body;

    if (!buildingType || gridX === undefined || gridY === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const farm = await PlayerService.getFarm(req.playerId!);
    const buildingId = await PlayerService.addBuilding(farm.id, buildingType, gridX, gridY);

    res.json({ buildingId });
  } catch (error: any) {
    console.error('Error adding building:', error);
    res.status(400).json({ error: error.message || 'Failed to add building' });
  }
});

router.get('/quests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const quests = await PlayerService.getQuests(req.playerId!);
    res.json({ quests });
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/quests/:questId/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { questId } = req.params;
    await PlayerService.completeQuest(questId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error completing quest:', error);
    res.status(400).json({ error: error.message || 'Failed to complete quest' });
  }
});

export default router;
