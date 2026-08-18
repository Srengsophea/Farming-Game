import pool, { initializeDatabase } from './index';
import { v4 as uuidv4 } from 'uuid';

const ACHIEVEMENTS = [
  { code: 'first_harvest', title: 'First Harvest', description: 'Harvest your first crop', icon: '🌾', rewardCoins: 50, rewardGems: 0 },
  { code: 'harvest_100', title: 'Harvester', description: 'Harvest 100 crops', icon: '🌾', rewardCoins: 500, rewardGems: 5 },
  { code: 'level_10', title: 'Rising Farmer', description: 'Reach level 10', icon: '⭐', rewardCoins: 200, rewardGems: 2 },
  { code: 'level_50', title: 'Farming Master', description: 'Reach level 50', icon: '👑', rewardCoins: 2000, rewardGems: 20 },
  { code: 'first_animal', title: 'Zookeeper', description: 'Buy your first animal', icon: '🐔', rewardCoins: 100, rewardGems: 1 },
  { code: 'coins_100k', title: 'Wealthy Farmer', description: 'Earn 100,000 coins', icon: '💰', rewardCoins: 0, rewardGems: 50 },
  { code: 'first_trade', title: 'Trader', description: 'Complete your first trade', icon: '🤝', rewardCoins: 100, rewardGems: 2 },
  { code: 'ten_friends', title: 'Social Butterfly', description: 'Make 10 friends', icon: '👥', rewardCoins: 300, rewardGems: 5 }
];

let isSeeded = false;

export async function seedDatabase() {
  if (isSeeded) return;
  await initializeDatabase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const achievement of ACHIEVEMENTS) {
      await client.query(
        `INSERT INTO achievements (id, code, title, description, icon, reward_coins, reward_gems) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (code) DO NOTHING`,
        [uuidv4(), achievement.code, achievement.title, achievement.description, achievement.icon, achievement.rewardCoins, achievement.rewardGems]
      );
    }

    await client.query('COMMIT');
    isSeeded = true;
    console.log('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
