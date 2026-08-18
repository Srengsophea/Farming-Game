import pool from '../db/index';
import { v4 as uuidv4 } from 'uuid';

export class FishingService {
  private readonly FISH: Record<string, { name: string; rarity: string; sellPrice: number; xpReward: number; catchChance: number }> = {
    carp: { name: 'Carp', rarity: 'common', sellPrice: 15, xpReward: 5, catchChance: 0.4 },
    catfish: { name: 'Catfish', rarity: 'common', sellPrice: 18, xpReward: 6, catchChance: 0.3 },
    trout: { name: 'Trout', rarity: 'uncommon', sellPrice: 35, xpReward: 15, catchChance: 0.2 },
    salmon: { name: 'Salmon', rarity: 'uncommon', sellPrice: 45, xpReward: 20, catchChance: 0.15 },
    bass: { name: 'Bass', rarity: 'rare', sellPrice: 60, xpReward: 30, catchChance: 0.1 },
    koi: { name: 'Koi', rarity: 'rare', sellPrice: 80, xpReward: 40, catchChance: 0.08 },
    golden_fish: { name: 'Golden Fish', rarity: 'epic', sellPrice: 200, xpReward: 100, catchChance: 0.02 }
  };

  async fish(playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const player = await client.query(
        'SELECT energy FROM players WHERE id = $1 FOR UPDATE',
        [playerId]
      );

      if (!player.rows[0] || player.rows[0].energy < 10) {
        throw new Error('Not enough energy (need 10)');
      }

      await client.query(
        'UPDATE players SET energy = energy - 10 WHERE id = $1',
        [playerId]
      );

      const rand = Math.random();
      let caughtFish = null;
      let accumulatedChance = 0;

      for (const [fishId, fishData] of Object.entries(this.FISH)) {
        accumulatedChance += fishData.catchChance;
        if (rand <= accumulatedChance) {
          caughtFish = { id: fishId, ...fishData };
          break;
        }
      }

      if (!caughtFish) {
        caughtFish = { id: 'carp', ...this.FISH.carp };
      }

      const existing = await client.query(
        'SELECT id, quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [playerId, caughtFish.id]
      );

      if (existing.rows[0]) {
        await client.query(
          'UPDATE inventory SET quantity = quantity + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = $1 AND item_id = $2',
          [playerId, caughtFish.id]
        );
      } else {
        await client.query(
          'INSERT INTO inventory (id, player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), playerId, caughtFish.id, 1, caughtFish.rarity]
        );
      }

      await client.query(
        'UPDATE players SET farm_xp = farm_xp + $1 WHERE id = $2',
        [caughtFish.xpReward, playerId]
      );

      await client.query('COMMIT');
      return caughtFish;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getFishData(fishId: string) {
    return this.FISH[fishId];
  }

  getAllFish() {
    return Object.entries(this.FISH).map(([id, data]) => ({ id, ...data }));
  }
}

export default new FishingService();
