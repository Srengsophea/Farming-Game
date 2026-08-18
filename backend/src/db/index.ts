import { Pool as PgPool, PoolClient } from 'pg';
import { newDb, DataType } from 'pg-mem';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

let realPool: any = null;
let memPool: any = null;
let useMemory = false;

function getMemPool() {
  if (!memPool) {
    console.log('Using in-memory PostgreSQL instance (pg-mem)...');
    const db = newDb();
    db.public.registerFunction({
      name: 'gen_random_uuid',
      returns: DataType.uuid,
      implementation: () => randomUUID()
    });
    const adapter = db.adapters.createPg();
    memPool = new adapter.Pool();
  }
  return memPool;
}

export function getActivePool() {
  if (useMemory) {
    return getMemPool();
  }
  if (!realPool) {
    realPool = new PgPool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/farming_game'
    });
  }
  return realPool;
}

const poolProxy = {
  connect: async (): Promise<PoolClient> => {
    if (useMemory) {
      return getMemPool().connect();
    }
    try {
      const active = getActivePool();
      return await active.connect();
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('ECONNREFUSED')) {
        console.warn('Could not connect to PostgreSQL server at 127.0.0.1:5432. Falling back to in-memory PostgreSQL database.');
        useMemory = true;
        return getMemPool().connect();
      }
      throw err;
    }
  },
  query: async (text: string, params?: any[]) => {
    if (useMemory) {
      return getMemPool().query(text, params);
    }
    try {
      const active = getActivePool();
      return await active.query(text, params);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message?.includes('ECONNREFUSED')) {
        console.warn('Could not connect to PostgreSQL server at 127.0.0.1:5432. Falling back to in-memory PostgreSQL database.');
        useMemory = true;
        return getMemPool().query(text, params);
      }
      throw err;
    }
  },
  end: () => {
    if (realPool) realPool.end();
    if (memPool) memPool.end();
  }
};

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized && useMemory) {
    return;
  }
  const client = await poolProxy.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE NOT NULL,
        level INT DEFAULT 1,
        farm_level INT DEFAULT 1,
        player_xp INT DEFAULT 0,
        farm_xp INT DEFAULT 0,
        coins INT DEFAULT 1000,
        gems INT DEFAULT 0,
        energy INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS farms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID UNIQUE NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        name VARCHAR(100) DEFAULT 'My Farm',
        width INT DEFAULT 20,
        height INT DEFAULT 20,
        expansion_level INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS farm_tiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        grid_x INT NOT NULL,
        grid_y INT NOT NULL,
        tile_type VARCHAR(20) NOT NULL,
        tilled BOOLEAN DEFAULT FALSE,
        watered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(farm_id, grid_x, grid_y)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_tile_id UUID UNIQUE NOT NULL REFERENCES farm_tiles(id) ON DELETE CASCADE,
        crop_type VARCHAR(50) NOT NULL,
        planted_at TIMESTAMP NOT NULL,
        stage INT DEFAULT 0,
        watered BOOLEAN DEFAULT FALSE,
        fertilized BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        item_id VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        rarity VARCHAR(20) DEFAULT 'common',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, item_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS animals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        animal_type VARCHAR(50) NOT NULL,
        hunger INT DEFAULT 50,
        happiness INT DEFAULT 50,
        health INT DEFAULT 100,
        last_product_collected_at TIMESTAMP,
        friendship_level INT DEFAULT 0,
        age INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
        building_type VARCHAR(50) NOT NULL,
        level INT DEFAULT 1,
        grid_x INT NOT NULL,
        grid_y INT NOT NULL,
        rotation VARCHAR(10) DEFAULT '0',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        quest_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        objective_type VARCHAR(50) NOT NULL,
        objective_target INT NOT NULL,
        objective_progress INT DEFAULT 0,
        reward_coins INT DEFAULT 0,
        reward_xp INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, friend_id),
        CHECK (player_id != friend_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        initiator_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        initiator_items JSONB NOT NULL,
        recipient_items JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        item_id VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        price_per_unit INT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        sold_at TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        reward_coins INT DEFAULT 0,
        reward_gems INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS player_achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, achievement_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        data JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default poolProxy;
