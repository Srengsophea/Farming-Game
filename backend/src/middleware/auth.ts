import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthToken, AuthTokenSchema } from '@farming-game/shared';
import pool from '../db/index';

declare global {
  namespace Express {
    interface Request {
      user?: AuthToken;
      userId?: string;
      playerId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export function generateToken(userId: string, playerId: string): string {
  return jwt.sign(
    { userId, playerId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthToken {
  const decoded = jwt.verify(token, JWT_SECRET);
  return AuthTokenSchema.parse(decoded);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = verifyToken(token);
    const result = await pool.query('SELECT id FROM players WHERE id = $1', [user.playerId]);
    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Player session expired or not found' });
    }
    req.user = user;
    req.userId = user.userId;
    req.playerId = user.playerId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const user = verifyToken(token);
      const result = await pool.query('SELECT id FROM players WHERE id = $1', [user.playerId]);
      if (result.rows[0]) {
        req.user = user;
        req.userId = user.userId;
        req.playerId = user.playerId;
      }
    } catch (error) {
      // Token invalid but optional, continue
    }
  }

  next();
}
