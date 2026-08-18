import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/index';
import { generateToken, authMiddleware } from '../middleware/auth';
import PlayerService from '../services/PlayerService';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const usernameCheck = await pool.query('SELECT id FROM players WHERE username = $1', [username]);
    if (usernameCheck.rows[0]) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const userResult = await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [userId, email, passwordHash]
    );

    const { playerId, farmId } = await PlayerService.createPlayer(userId, username);

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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      'SELECT id, username, farm_id FROM players WHERE user_id = $1',
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
