import pool from '../db/index';
import { v4 as uuidv4 } from 'uuid';

export class FarmingService {
  private readonly CROP_CONFIGS: Record<string, { growthTimeMs: number; stages: number; sellPrice: number; xpReward: number }> = {
    wheat: { growthTimeMs: 120000, stages: 3, sellPrice: 15, xpReward: 5 },
    corn: { growthTimeMs: 150000, stages: 4, sellPrice: 25, xpReward: 10 },
    rice: { growthTimeMs: 180000, stages: 3, sellPrice: 20, xpReward: 8 },
    potato: { growthTimeMs: 100000, stages: 3, sellPrice: 12, xpReward: 4 },
    carrot: { growthTimeMs: 110000, stages: 3, sellPrice: 14, xpReward: 5 },
    tomato: { growthTimeMs: 160000, stages: 4, sellPrice: 35, xpReward: 15 },
    pumpkin: { growthTimeMs: 200000, stages: 4, sellPrice: 50, xpReward: 20 },
    strawberry: { growthTimeMs: 90000, stages: 3, sellPrice: 45, xpReward: 18 },
    watermelon: { growthTimeMs: 210000, stages: 4, sellPrice: 60, xpReward: 25 }
  };

  async plantCrop(farmTileId: string, cropType: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const seedCost = 10;
      const player = await client.query(
        'SELECT coins FROM players WHERE id = $1 FOR UPDATE',
        [playerId]
      );

      if (!player.rows[0] || player.rows[0].coins < seedCost) {
        throw new Error('Not enough coins');
      }

      await client.query(
        'UPDATE players SET coins = coins - $1 WHERE id = $2',
        [seedCost, playerId]
      );

      const cropId = uuidv4();
      await client.query(
        `INSERT INTO crops (id, farm_tile_id, crop_type, planted_at, stage, watered, fertilized)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 0, false, false)`,
        [cropId, farmTileId, cropType]
      );

      await client.query(
        'UPDATE farm_tiles SET tilled = true WHERE id = $1',
        [farmTileId]
      );

      await client.query('COMMIT');
      return cropId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async waterCrop(cropId: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const crop = await client.query(
        'SELECT watered FROM crops WHERE id = $1',
        [cropId]
      );

      if (crop.rows[0]?.watered) {
        throw new Error('Crop already watered');
      }

      await client.query(
        'UPDATE crops SET watered = true WHERE id = $1',
        [cropId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async harvestCrop(cropId: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const crop = await client.query(
        `SELECT c.id, c.crop_type, c.planted_at, c.stage, ft.id as tile_id
         FROM crops c
         JOIN farm_tiles ft ON c.farm_tile_id = ft.id
         WHERE c.id = $1 FOR UPDATE`,
        [cropId]
      );

      if (!crop.rows[0]) {
        throw new Error('Crop not found');
      }

      const cropData = crop.rows[0];
      const config = this.CROP_CONFIGS[cropData.crop_type];

      if (!config) {
        throw new Error('Invalid crop type');
      }

      const elapsedMs = Date.now() - new Date(cropData.planted_at).getTime();
      const isReady = elapsedMs >= config.growthTimeMs;

      if (!isReady) {
        throw new Error('Crop not ready to harvest');
      }

      await client.query('UPDATE players SET coins = coins + $1, farm_xp = farm_xp + $2 WHERE id = $3', [config.sellPrice, config.xpReward, playerId]);

      await client.query('UPDATE farm_tiles SET tilled = false WHERE id = $1', [cropData.tile_id]);

      await client.query('DELETE FROM crops WHERE id = $1', [cropId]);

      const existing = await client.query(
        'SELECT id, quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [playerId, cropData.crop_type]
      );

      if (existing.rows[0]) {
        await client.query(
          'UPDATE inventory SET quantity = quantity + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = $1 AND item_id = $2',
          [playerId, cropData.crop_type]
        );
      } else {
        await client.query(
          'INSERT INTO inventory (id, player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), playerId, cropData.crop_type, 1, 'common']
        );
      }

      await client.query('COMMIT');

      return { coins: config.sellPrice, xp: config.xpReward, cropType: cropData.crop_type };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCropGrowthProgress(cropId: string) {
    const crop = await pool.query(
      `SELECT crop_type, planted_at, stage FROM crops WHERE id = $1`,
      [cropId]
    );

    if (!crop.rows[0]) {
      throw new Error('Crop not found');
    }

    const cropData = crop.rows[0];
    const config = this.CROP_CONFIGS[cropData.crop_type];
    const elapsedMs = Date.now() - new Date(cropData.planted_at).getTime();
    const progress = Math.min(100, (elapsedMs / config.growthTimeMs) * 100);
    const nextStageAt = new Date(cropData.planted_at).getTime() + (config.growthTimeMs / config.stages) * (cropData.stage + 1);

    return {
      stage: cropData.stage,
      totalStages: config.stages,
      progress,
      readyToHarvest: elapsedMs >= config.growthTimeMs,
      nextStageAt
    };
  }

  async feedAnimal(animalId: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const animal = await client.query(
        `SELECT a.id, a.hunger FROM animals a
         JOIN farms f ON a.farm_id = f.id
         WHERE a.id = $1 AND f.player_id = $2 FOR UPDATE`,
        [animalId, playerId]
      );

      if (!animal.rows[0]) {
        throw new Error('Animal not found or not yours');
      }

      await client.query(
        'UPDATE animals SET hunger = 0, happiness = happiness + 10 WHERE id = $1',
        [animalId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async collectAnimalProduct(animalId: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const animal = await client.query(
        `SELECT a.id, a.animal_type, a.last_product_collected_at FROM animals a
         JOIN farms f ON a.farm_id = f.id
         WHERE a.id = $1 AND f.player_id = $2 FOR UPDATE`,
        [animalId, playerId]
      );

      if (!animal.rows[0]) {
        throw new Error('Animal not found or not yours');
      }

      const animalData = animal.rows[0];
      const productionInterval = 120000;
      const lastCollection = animalData.last_product_collected_at ? new Date(animalData.last_product_collected_at).getTime() : 0;
      const timeSinceLastCollection = Date.now() - lastCollection;

      if (timeSinceLastCollection < productionInterval) {
        throw new Error('Product not ready yet');
      }

      const productMap: Record<string, string> = {
        chicken: 'egg',
        cow: 'milk',
        pig: 'truffle',
        sheep: 'wool',
        goat: 'goat_milk',
        duck: 'duck_egg',
        horse: 'manure',
        bee: 'honey'
      };

      const productId = productMap[animalData.animal_type];
      if (!productId) {
        throw new Error('Invalid animal type');
      }

      await client.query(
        'UPDATE animals SET last_product_collected_at = CURRENT_TIMESTAMP, happiness = happiness + 5 WHERE id = $1',
        [animalId]
      );

      const existing = await client.query(
        'SELECT id, quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [playerId, productId]
      );

      if (existing.rows[0]) {
        await client.query(
          'UPDATE inventory SET quantity = quantity + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = $1 AND item_id = $2',
          [playerId, productId]
        );
      } else {
        await client.query(
          'INSERT INTO inventory (id, player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), playerId, productId, 1, 'common']
        );
      }

      await client.query('COMMIT');

      return { productId, quantity: 1 };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async purchaseAnimal(farmId: string, animalType: string, playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const animalPrices: Record<string, number> = {
        chicken: 50,
        cow: 150,
        pig: 80,
        sheep: 100,
        goat: 90,
        duck: 40,
        horse: 200,
        bee: 120
      };

      const cost = animalPrices[animalType];
      if (!cost) {
        throw new Error('Invalid animal type');
      }

      const player = await client.query(
        'SELECT coins FROM players WHERE id = $1 FOR UPDATE',
        [playerId]
      );

      if (!player.rows[0] || player.rows[0].coins < cost) {
        throw new Error('Not enough coins');
      }

      await client.query(
        'UPDATE players SET coins = coins - $1 WHERE id = $2',
        [cost, playerId]
      );

      const animalId = uuidv4();
      await client.query(
        `INSERT INTO animals (id, farm_id, animal_type, hunger, happiness, health, friendship_level, age)
         VALUES ($1, $2, $3, 50, 50, 100, 0, 0)`,
        [animalId, farmId, animalType]
      );

      await client.query('COMMIT');
      return animalId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new FarmingService();
