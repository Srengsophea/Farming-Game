import pool from '../db/index';

export class LeaderboardService {
  async getTopPlayers(limit: number = 100, offset: number = 0) {
    const result = await pool.query(
      `SELECT id, username, level, player_xp, coins, farm_level, created_at 
       FROM players 
       ORDER BY level DESC, player_xp DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getTopByFarmLevel(limit: number = 100, offset: number = 0) {
    const result = await pool.query(
      `SELECT id, username, farm_level, farm_xp, coins, level, created_at 
       FROM players 
       ORDER BY farm_level DESC, farm_xp DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getWealthiest(limit: number = 100, offset: number = 0) {
    const result = await pool.query(
      `SELECT id, username, coins, gems, level, farm_level, created_at 
       FROM players 
       ORDER BY coins DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getPlayerRank(playerId: string, sortBy: 'level' | 'farm_level' | 'coins' = 'level') {
    const orderClause = 
      sortBy === 'farm_level' ? 'farm_level DESC, farm_xp DESC' :
      sortBy === 'coins' ? 'coins DESC' :
      'level DESC, player_xp DESC';

    const result = await pool.query(
      `SELECT position FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY ${orderClause.split(' DESC')[0]} DESC) as position
        FROM players
       ) ranked
       WHERE id = $1`,
      [playerId]
    );

    return result.rows[0]?.position || 0;
  }

  async getMostCropHarvested(limit: number = 100) {
    const result = await pool.query(
      `SELECT p.id, p.username, COUNT(c.id) as crops_harvested, p.level
       FROM players p
       LEFT JOIN farms f ON p.id = f.player_id
       WHERE p.level > 1
       GROUP BY p.id, p.username, p.level
       ORDER BY crops_harvested DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getMostTradesCompleted(limit: number = 100) {
    const result = await pool.query(
      `SELECT p.id, p.username, COUNT(t.id) as trades_completed, p.level
       FROM players p
       LEFT JOIN trades t ON (p.id = t.initiator_id OR p.id = t.recipient_id) AND t.status = 'completed'
       GROUP BY p.id, p.username, p.level
       ORDER BY trades_completed DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

export default new LeaderboardService();
