import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/index';
import { generateToken, authMiddleware } from '../middleware/auth';
import PlayerService from '../services/PlayerService';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Email already registered' });
    }

    const usernameCheck = await client.query('SELECT id FROM players WHERE username = $1', [username]);
    if (usernameCheck.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await client.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [userId, email, passwordHash]
    );

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

    const tileValues: any[] = [];
    const valuePlaceholders: string[] = [];
    let pIdx = 1;
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const tileType = Math.random() > 0.7 ? 'grass' : 'soil';
        valuePlaceholders.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, false)`);
        tileValues.push(uuidv4(), farmId, x, y, tileType);
      }
    }
    await client.query(
      `INSERT INTO farm_tiles (id, farm_id, grid_x, grid_y, tile_type, tilled) VALUES ${valuePlaceholders.join(', ')}`,
      tileValues
    );

    const farmhouseId = uuidv4();
    await client.query(
      'INSERT INTO buildings (id, farm_id, building_type, level, grid_x, grid_y, rotation) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [farmhouseId, farmId, 'farmhouse', 1, 8, 8, '0']
    );

    await client.query('COMMIT');

    const token = generateToken(userId, playerId);

    res.status(201).json({
      token,
      user: {
        userId,
        playerId,
        farmId,
        username,
        email
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed due to a server error' });
  } finally {
    client.release();
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const userResult = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows[0]) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const playerResult = await pool.query(
      'SELECT id, username FROM players WHERE user_id = $1',
      [user.id]
    );

    if (!playerResult.rows[0]) {
      return res.status(500).json({ error: 'Player data not found' });
    }

    const player = playerResult.rows[0];
    const token = generateToken(user.id, player.id);

    res.json({
      token,
      user: {
        userId: user.id,
        playerId: player.id,
        username: player.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const player = await PlayerService.getPlayer(req.playerId!);
    const farm = await PlayerService.getFarm(req.playerId!);
    const stats = await PlayerService.getPlayerStats(req.playerId!);

    res.json({
      player: { ...player, ...stats },
      farm
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
