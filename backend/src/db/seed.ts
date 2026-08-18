import pool from './index';

const CROPS = [
  { id: 'wheat', seedPrice: 10, growthTimeMs: 120000, stages: 3, sellPrice: 15, xpReward: 5, waterRequired: 1, harvestQuantity: 3, seasons: ['spring', 'summer', 'autumn'] },
  { id: 'corn', seedPrice: 15, growthTimeMs: 150000, stages: 4, sellPrice: 25, xpReward: 10, waterRequired: 2, harvestQuantity: 2, seasons: ['spring', 'summer'] },
  { id: 'rice', seedPrice: 12, growthTimeMs: 180000, stages: 3, sellPrice: 20, xpReward: 8, waterRequired: 3, harvestQuantity: 4, seasons: ['summer'] },
  { id: 'potato', seedPrice: 8, growthTimeMs: 100000, stages: 3, sellPrice: 12, xpReward: 4, waterRequired: 1, harvestQuantity: 5, seasons: ['spring', 'autumn'] },
  { id: 'carrot', seedPrice: 9, growthTimeMs: 110000, stages: 3, sellPrice: 14, xpReward: 5, waterRequired: 1, harvestQuantity: 3, seasons: ['spring', 'autumn'] },
  { id: 'tomato', seedPrice: 20, growthTimeMs: 160000, stages: 4, sellPrice: 35, xpReward: 15, waterRequired: 2, harvestQuantity: 2, seasons: ['summer'] },
  { id: 'cabbage', seedPrice: 11, growthTimeMs: 130000, stages: 3, sellPrice: 18, xpReward: 7, waterRequired: 1, harvestQuantity: 2, seasons: ['spring', 'autumn'] },
  { id: 'pumpkin', seedPrice: 25, growthTimeMs: 200000, stages: 4, sellPrice: 50, xpReward: 20, waterRequired: 2, harvestQuantity: 1, seasons: ['autumn'] },
  { id: 'strawberry', seedPrice: 30, growthTimeMs: 90000, stages: 3, sellPrice: 45, xpReward: 18, waterRequired: 2, harvestQuantity: 4, seasons: ['spring'] },
  { id: 'watermelon', seedPrice: 35, growthTimeMs: 210000, stages: 4, sellPrice: 60, xpReward: 25, waterRequired: 3, harvestQuantity: 1, seasons: ['summer'] },
  { id: 'sugarcane', seedPrice: 28, growthTimeMs: 190000, stages: 3, sellPrice: 55, xpReward: 22, waterRequired: 2, harvestQuantity: 2, seasons: ['summer', 'autumn'] },
  { id: 'onion', seedPrice: 10, growthTimeMs: 120000, stages: 3, sellPrice: 16, xpReward: 6, waterRequired: 1, harvestQuantity: 3, seasons: ['spring', 'autumn'] },
  { id: 'garlic', seedPrice: 12, growthTimeMs: 140000, stages: 3, sellPrice: 22, xpReward: 9, waterRequired: 1, harvestQuantity: 2, seasons: ['spring'] },
  { id: 'pepper', seedPrice: 22, growthTimeMs: 170000, stages: 4, sellPrice: 40, xpReward: 16, waterRequired: 2, harvestQuantity: 3, seasons: ['summer'] },
  { id: 'eggplant', seedPrice: 18, growthTimeMs: 150000, stages: 4, sellPrice: 32, xpReward: 13, waterRequired: 2, harvestQuantity: 2, seasons: ['summer', 'autumn'] },
  { id: 'lettuce', seedPrice: 8, growthTimeMs: 80000, stages: 2, sellPrice: 12, xpReward: 3, waterRequired: 1, harvestQuantity: 5, seasons: ['spring', 'autumn'] }
];

const ANIMALS = [
  { id: 'chicken', purchasePrice: 50, productType: 'egg', productionIntervalMs: 60000, hungerRatePerHour: 5, happinessDecayPerHour: 3 },
  { id: 'cow', purchasePrice: 150, productType: 'milk', productionIntervalMs: 120000, hungerRatePerHour: 8, happinessDecayPerHour: 2 },
  { id: 'pig', purchasePrice: 80, productType: 'truffle', productionIntervalMs: 180000, hungerRatePerHour: 10, happinessDecayPerHour: 4 },
  { id: 'sheep', purchasePrice: 100, productType: 'wool', productionIntervalMs: 150000, hungerRatePerHour: 6, happinessDecayPerHour: 2 },
  { id: 'goat', purchasePrice: 90, productType: 'goat_milk', productionIntervalMs: 140000, hungerRatePerHour: 7, happinessDecayPerHour: 3 },
  { id: 'duck', purchasePrice: 40, productType: 'duck_egg', productionIntervalMs: 70000, hungerRatePerHour: 4, happinessDecayPerHour: 2 },
  { id: 'horse', purchasePrice: 200, productType: 'manure', productionIntervalMs: 100000, hungerRatePerHour: 12, happinessDecayPerHour: 2 },
  { id: 'bee', purchasePrice: 120, productType: 'honey', productionIntervalMs: 110000, hungerRatePerHour: 2, happinessDecayPerHour: 1 }
];

const BUILDINGS = [
  { id: 'farmhouse', width: 4, height: 4, baseCost: 0, upgradeMultiplier: 1.5, upgradeTimeMs: 0, capacity: 100 },
  { id: 'barn', width: 3, height: 3, baseCost: 500, upgradeMultiplier: 2, upgradeTimeMs: 60000, capacity: 50 },
  { id: 'chicken_coop', width: 2, height: 2, baseCost: 200, upgradeMultiplier: 1.8, upgradeTimeMs: 30000, capacity: 10 },
  { id: 'stable', width: 3, height: 3, baseCost: 600, upgradeMultiplier: 2.2, upgradeTimeMs: 90000, capacity: 5 },
  { id: 'silo', width: 2, height: 2, baseCost: 400, upgradeMultiplier: 1.6, upgradeTimeMs: 45000, capacity: 200 },
  { id: 'warehouse', width: 4, height: 4, baseCost: 800, upgradeMultiplier: 2.5, upgradeTimeMs: 120000, capacity: 500 },
  { id: 'workshop', width: 3, height: 3, baseCost: 700, upgradeMultiplier: 2.1, upgradeTimeMs: 100000, capacity: 0 },
  { id: 'kitchen', width: 2, height: 3, baseCost: 550, upgradeMultiplier: 2, upgradeTimeMs: 80000, capacity: 0 },
  { id: 'bakery', width: 3, height: 2, baseCost: 650, upgradeMultiplier: 2.3, upgradeTimeMs: 90000, capacity: 100 },
  { id: 'mill', width: 3, height: 3, baseCost: 600, upgradeMultiplier: 2, upgradeTimeMs: 75000, capacity: 150 },
  { id: 'greenhouse', width: 4, height: 3, baseCost: 900, upgradeMultiplier: 2.4, upgradeTimeMs: 110000, capacity: 200 },
  { id: 'fishing_hut', width: 2, height: 2, baseCost: 300, upgradeMultiplier: 1.7, upgradeTimeMs: 40000, capacity: 50 },
  { id: 'marketplace', width: 4, height: 4, baseCost: 1000, upgradeMultiplier: 3, upgradeTimeMs: 150000, capacity: 0 }
];

const ITEMS = [
  { id: 'wheat_seed', name: 'Wheat Seed', type: 'seed', icon: '🌱', stackable: true, rarity: 'common', description: 'Plant to grow wheat' },
  { id: 'corn_seed', name: 'Corn Seed', type: 'seed', icon: '🌽', stackable: true, rarity: 'common', description: 'Plant to grow corn' },
  { id: 'wheat', name: 'Wheat', type: 'crop', icon: '🌾', stackable: true, rarity: 'common', description: 'Can be sold or crafted' },
  { id: 'corn', name: 'Corn', type: 'crop', icon: '🌽', stackable: true, rarity: 'common', description: 'Can be sold or crafted' },
  { id: 'egg', name: 'Egg', type: 'animal_product', icon: '🥚', stackable: true, rarity: 'common', description: 'Chicken product' },
  { id: 'milk', name: 'Milk', type: 'animal_product', icon: '🥛', stackable: true, rarity: 'common', description: 'Cow product' },
  { id: 'honey', name: 'Honey', type: 'animal_product', icon: '🍯', stackable: true, rarity: 'uncommon', description: 'Bee product' },
  { id: 'wool', name: 'Wool', type: 'animal_product', icon: '🧶', stackable: true, rarity: 'common', description: 'Sheep product' },
  { id: 'wood', name: 'Wood', type: 'material', icon: '🪵', stackable: true, rarity: 'common', description: 'Crafting material' },
  { id: 'stone', name: 'Stone', type: 'material', icon: '🪨', stackable: true, rarity: 'common', description: 'Crafting material' },
  { id: 'iron_ore', name: 'Iron Ore', type: 'material', icon: '⛏️', stackable: true, rarity: 'uncommon', description: 'Mining material' },
  { id: 'bread', name: 'Bread', type: 'crafted_product', icon: '🍞', stackable: true, rarity: 'common', description: 'Crafted from wheat' },
  { id: 'cheese', name: 'Cheese', type: 'crafted_product', icon: '🧀', stackable: true, rarity: 'uncommon', description: 'Crafted from milk' },
  { id: 'cake', name: 'Cake', type: 'crafted_product', icon: '🍰', stackable: true, rarity: 'uncommon', description: 'Special crafted item' },
  { id: 'hoe', name: 'Hoe', type: 'tool', icon: '🛠️', stackable: false, rarity: 'common', description: 'Tilling tool' },
  { id: 'watering_can', name: 'Watering Can', type: 'tool', icon: '💧', stackable: false, rarity: 'common', description: 'Watering tool' },
  { id: 'axe', name: 'Axe', type: 'tool', icon: '🪓', stackable: false, rarity: 'common', description: 'Chopping tool' },
  { id: 'pickaxe', name: 'Pickaxe', type: 'tool', icon: '⛏️', stackable: false, rarity: 'uncommon', description: 'Mining tool' },
  { id: 'flower_decoration', name: 'Flower Decoration', type: 'decoration', icon: '🌸', stackable: false, rarity: 'common', description: 'Farm decoration' },
  { id: 'bench_decoration', name: 'Bench', type: 'decoration', icon: '🪑', stackable: false, rarity: 'common', description: 'Farm decoration' }
];

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

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const crop of CROPS) {
      await client.query(
        'INSERT INTO crops (id, seed_price, growth_time_ms, stages, sell_price, xp_reward, water_required, harvest_quantity, seasons) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING',
        [crop.id, crop.seedPrice, crop.growthTimeMs, crop.stages, crop.sellPrice, crop.xpReward, crop.waterRequired, crop.harvestQuantity, JSON.stringify(crop.seasons)]
      );
    }

    for (const animal of ANIMALS) {
      await client.query(
        'INSERT INTO animals (id, purchase_price, product_type, production_interval_ms, hunger_rate_per_hour, happiness_decay_per_hour) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [animal.id, animal.purchasePrice, animal.productType, animal.productionIntervalMs, animal.hungerRatePerHour, animal.happinessDecayPerHour]
      );
    }

    for (const building of BUILDINGS) {
      await client.query(
        'INSERT INTO buildings (id, width, height, base_cost, upgrade_multiplier, upgrade_time_ms, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [building.id, building.width, building.height, building.baseCost, building.upgradeMultiplier, building.upgradeTimeMs, building.capacity]
      );
    }

    for (const item of ITEMS) {
      await client.query(
        'INSERT INTO items (id, name, type, icon, stackable, rarity, description) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [item.id, item.name, item.type, item.icon, item.stackable, item.rarity, item.description]
      );
    }

    for (const achievement of ACHIEVEMENTS) {
      await client.query(
        'INSERT INTO achievements (code, title, description, icon, reward_coins, reward_gems) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        [achievement.code, achievement.title, achievement.description, achievement.icon, achievement.rewardCoins, achievement.rewardGems]
      );
    }

    await client.query('COMMIT');
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
  seedDatabase().catch(console.error).finally(() => process.exit(0));
}
