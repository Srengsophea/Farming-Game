import pool from '../db/index';
import { v4 as uuidv4 } from 'uuid';

export class PlayerService {
  async createPlayer(userId: string, username: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const playerId = uuidv4();
      
      await client.query(
        'INSERT INTO players (id, user_id, username, level, farm_level, player_xp, farm_xp, coins, gems, energy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [playerId, userId, username, 1, 1, 0, 0, 1000, 0, 100]
      );

      const farmId = uuidv4();
      await client.query(
        'INSERT INTO farms (id, player_id, name, width, height, expansion_level) VALUES ($1, $2, $3, $4, $5, $6)',
        [farmId, playerId, 'My Farm', 20, 20, 1]
      );

      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          const tileType = Math.random() > 0.7 ? 'grass' : 'soil';
          await client.query(
            'INSERT INTO farm_tiles (id, farm_id, grid_x, grid_y, tile_type, tilled) VALUES ($1, $2, $3, $4, $5, $6)',
            [uuidv4(), farmId, x, y, tileType, false]
          );
        }
      }

      const farmhouseId = uuidv4();
      await client.query(
        'INSERT INTO buildings (id, farm_id, building_type, level, grid_x, grid_y, rotation) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [farmhouseId, farmId, 'farmhouse', 1, 8, 8, '0']
      );

      await client.query('COMMIT');

      return { playerId, farmId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPlayer(playerId: string) {
    const result = await pool.query(
      `SELECT p.id, p.username, p.level, p.farm_level, p.player_xp, p.farm_xp, p.coins, p.gems, p.energy, p.created_at
       FROM players p WHERE p.id = $1`,
      [playerId]
    );
    return result.rows[0];
  }

  async getPlayerStats(playerId: string) {
    const result = await pool.query(
      `SELECT level, farm_level, player_xp, farm_xp, coins, gems, energy FROM players WHERE id = $1`,
      [playerId]
    );
    return result.rows[0];
  }

  async updatePlayerStats(playerId: string, stats: Partial<{ coins: number; gems: number; energy: number; playerXp: number; farmXp: number; level: number; farmLevel: number }>) {
    const updates: string[] = [];
    const values: unknown[] = [playerId];
    let paramIndex = 2;

    if (stats.coins !== undefined) {
      updates.push(`coins = $${paramIndex++}`);
      values.push(stats.coins);
    }
    if (stats.gems !== undefined) {
      updates.push(`gems = $${paramIndex++}`);
      values.push(stats.gems);
    }
    if (stats.energy !== undefined) {
      updates.push(`energy = $${paramIndex++}`);
      values.push(stats.energy);
    }
    if (stats.playerXp !== undefined) {
      updates.push(`player_xp = $${paramIndex++}`);
      values.push(stats.playerXp);
    }
    if (stats.farmXp !== undefined) {
      updates.push(`farm_xp = $${paramIndex++}`);
      values.push(stats.farmXp);
    }
    if (stats.level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      values.push(stats.level);
    }
    if (stats.farmLevel !== undefined) {
      updates.push(`farm_level = $${paramIndex++}`);
      values.push(stats.farmLevel);
    }

    if (updates.length === 0) return;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    await pool.query(
      `UPDATE players SET ${updates.join(', ')} WHERE id = $1`,
      values
    );
  }

  async getFarm(playerId: string) {
    const result = await pool.query(
      `SELECT f.id, f.player_id, f.name, f.width, f.height, f.expansion_level FROM farms f WHERE f.player_id = $1`,
      [playerId]
    );
    return result.rows[0];
  }

  async getFarmTiles(farmId: string) {
    const result = await pool.query(
      `SELECT ft.id, ft.grid_x, ft.grid_y, ft.tile_type, ft.tilled, ft.watered,
              c.id as crop_id, c.crop_type, c.planted_at, c.stage, c.watered as crop_watered, c.fertilized
       FROM farm_tiles ft
       LEFT JOIN crops c ON ft.id = c.farm_tile_id
       WHERE ft.farm_id = $1
       ORDER BY ft.grid_x, ft.grid_y`,
      [farmId]
    );
    return result.rows;
  }

  async getInventory(playerId: string) {
    const result = await pool.query(
      `SELECT item_id, quantity, rarity FROM inventory WHERE player_id = $1`,
      [playerId]
    );
    return result.rows;
  }

  async updateInventory(playerId: string, itemId: string, quantityDelta: number) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const current = await client.query(
        `SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2`,
        [playerId, itemId]
      );

      const newQuantity = (current.rows[0]?.quantity || 0) + quantityDelta;

      if (newQuantity <= 0) {
        await client.query(
          `DELETE FROM inventory WHERE player_id = $1 AND item_id = $2`,
          [playerId, itemId]
        );
      } else {
        await client.query(
          `INSERT INTO inventory (player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, 'common')
           ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = $3, updated_at = CURRENT_TIMESTAMP`,
          [playerId, itemId, newQuantity]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async addCrop(farmTileId: string, cropType: string) {
    const cropId = uuidv4();
    await pool.query(
      `INSERT INTO crops (id, farm_tile_id, crop_type, planted_at, stage, watered, fertilized)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 0, false, false)`,
      [cropId, farmTileId, cropType]
    );
    return cropId;
  }

  async getCrop(farmTileId: string) {
    const result = await pool.query(
      `SELECT id, crop_type, planted_at, stage, watered, fertilized FROM crops WHERE farm_tile_id = $1`,
      [farmTileId]
    );
    return result.rows[0];
  }

  async updateCrop(cropId: string, updates: { stage?: number; watered?: boolean; fertilized?: boolean }) {
    const setClauses: string[] = [];
    const values: unknown[] = [cropId];
    let paramIndex = 2;

    if (updates.stage !== undefined) {
      setClauses.push(`stage = $${paramIndex++}`);
      values.push(updates.stage);
    }
    if (updates.watered !== undefined) {
      setClauses.push(`watered = $${paramIndex++}`);
      values.push(updates.watered);
    }
    if (updates.fertilized !== undefined) {
      setClauses.push(`fertilized = $${paramIndex++}`);
      values.push(updates.fertilized);
    }

    if (setClauses.length === 0) return;

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    await pool.query(
      `UPDATE crops SET ${setClauses.join(', ')} WHERE id = $1`,
      values
    );
  }

  async deleteCrop(cropId: string) {
    await pool.query(`DELETE FROM crops WHERE id = $1`, [cropId]);
  }

  async getAnimals(farmId: string) {
    const result = await pool.query(
      `SELECT id, animal_type, hunger, happiness, health, last_product_collected_at, friendship_level, age
       FROM animals WHERE farm_id = $1`,
      [farmId]
    );
    return result.rows;
  }

  async addAnimal(farmId: string, animalType: string) {
    const animalId = uuidv4();
    await pool.query(
      `INSERT INTO animals (id, farm_id, animal_type, hunger, happiness, health, friendship_level, age)
       VALUES ($1, $2, $3, 50, 50, 100, 0, 0)`,
      [animalId, farmId, animalType]
    );
    return animalId;
  }

  async getBuildings(farmId: string) {
    const result = await pool.query(
      `SELECT id, building_type, level, grid_x, grid_y, rotation, completed_at
       FROM buildings WHERE farm_id = $1`,
      [farmId]
    );
    return result.rows;
  }

  async addBuilding(farmId: string, buildingType: string, gridX: number, gridY: number) {
    const buildingId = uuidv4();
    await pool.query(
      `INSERT INTO buildings (id, farm_id, building_type, level, grid_x, grid_y, rotation, completed_at)
       VALUES ($1, $2, $3, 1, $4, $5, '0', CURRENT_TIMESTAMP)`,
      [buildingId, farmId, buildingType, gridX, gridY]
    );
    return buildingId;
  }

  async getQuests(playerId: string) {
    const result = await pool.query(
      `SELECT id, quest_type, title, description, objective_type, objective_target, objective_progress, 
              reward_coins, reward_xp, status, started_at, completed_at
       FROM quests WHERE player_id = $1`,
      [playerId]
    );
    return result.rows;
  }

  async addQuest(playerId: string, questType: string, title: string, description: string, objectiveType: string, objectiveTarget: number, rewardCoins: number, rewardXp: number) {
    const questId = uuidv4();
    await pool.query(
      `INSERT INTO quests (id, player_id, quest_type, title, description, objective_type, objective_target, 
                          objective_progress, reward_coins, reward_xp, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, 'active')`,
      [questId, playerId, questType, title, description, objectiveType, objectiveTarget, rewardCoins, rewardXp]
    );
    return questId;
  }

  async updateQuestProgress(questId: string, progress: number) {
    await pool.query(
      `UPDATE quests SET objective_progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [progress, questId]
    );
  }

  async completeQuest(questId: string) {
    await pool.query(
      `UPDATE quests SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [questId]
    );
  }

  async searchPlayers(query: string, limit: number = 20) {
    const result = await pool.query(
      `SELECT id, username, level, farm_level FROM players 
       WHERE username ILIKE $1 LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }
}

export default new PlayerService();
