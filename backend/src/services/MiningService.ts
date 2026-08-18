import pool from '../db/index';

export class MiningService {
  private readonly ORES: Record<string, { name: string; rarity: string; sellPrice: number; xpReward: number; minLevel: number; dropChance: number }> = {
    stone: { name: 'Stone', rarity: 'common', sellPrice: 5, xpReward: 2, minLevel: 1, dropChance: 0.5 },
    coal: { name: 'Coal', rarity: 'common', sellPrice: 15, xpReward: 5, minLevel: 1, dropChance: 0.3 },
    copper: { name: 'Copper Ore', rarity: 'uncommon', sellPrice: 30, xpReward: 10, minLevel: 5, dropChance: 0.2 },
    iron: { name: 'Iron Ore', rarity: 'uncommon', sellPrice: 50, xpReward: 20, minLevel: 10, dropChance: 0.15 },
    gold: { name: 'Gold Ore', rarity: 'rare', sellPrice: 100, xpReward: 40, minLevel: 20, dropChance: 0.08 },
    silver: { name: 'Silver Ore', rarity: 'rare', sellPrice: 80, xpReward: 35, minLevel: 15, dropChance: 0.1 },
    diamond: { name: 'Diamond', rarity: 'epic', sellPrice: 500, xpReward: 200, minLevel: 30, dropChance: 0.02 },
    emerald: { name: 'Emerald', rarity: 'epic', sellPrice: 400, xpReward: 180, minLevel: 25, dropChance: 0.03 }
  };

  async mine(playerId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const player = await client.query(
        'SELECT level, energy FROM players WHERE id = $1 FOR UPDATE',
        [playerId]
      );

      if (!player.rows[0]) {
        throw new Error('Player not found');
      }

      if (player.rows[0].energy < 15) {
        throw new Error('Not enough energy (need 15)');
      }

      await client.query(
        'UPDATE players SET energy = energy - 15 WHERE id = $1',
        [playerId]
      );

      const playerLevel = player.rows[0].level;
      const availableOres = Object.entries(this.ORES)
        .filter(([, ore]) => ore.minLevel <= playerLevel)
        .map(([id, ore]) => ({ id, ...ore }));

      if (availableOres.length === 0) {
        throw new Error('No ores available at your level');
      }

      let minedOre = null;
      let accumulatedChance = 0;
      const rand = Math.random();

      for (const ore of availableOres) {
        accumulatedChance += ore.dropChance;
        if (rand <= accumulatedChance) {
          minedOre = ore;
          break;
        }
      }

      if (!minedOre) {
        minedOre = availableOres[0];
      }

      const existing = await client.query(
        'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [playerId, minedOre.id]
      );

      const newQuantity = (existing.rows[0]?.quantity || 0) + 1;
      await client.query(
        `INSERT INTO inventory (player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, $4)
         ON CONFLICT (player_id, item_id) DO UPDATE SET quantity = $3`,
        [playerId, minedOre.id, newQuantity, minedOre.rarity]
      );

      await client.query(
        'UPDATE players SET farm_xp = farm_xp + $1 WHERE id = $2',
        [minedOre.xpReward, playerId]
      );

      await client.query('COMMIT');
      return minedOre;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getOres(playerLevel: number) {
    return Object.entries(this.ORES)
      .filter(([, ore]) => ore.minLevel <= playerLevel)
      .map(([id, ore]) => ({ id, ...ore }));
  }

  getAllOres() {
    return Object.entries(this.ORES).map(([id, ore]) => ({ id, ...ore }));
  }
}

export default new MiningService();
