# Game Architecture & Systems

## Core Systems Overview

### 1. Farming System
**Files**: `FarmingService.ts`, `farming.ts` routes

**Mechanics**:
- Grid-based farm (20x20 tiles default)
- Tile types: soil, grass, water, stone
- Crop lifecycle: empty → plowed → seeded → growth stages → harvestable → harvested
- Growth calculated server-side from timestamps (continues offline)
- Water requirement: 1-3 units per crop type

**Crop Data** (16 types):
| Crop | Growth Time | Stages | Sell Price | XP |
|------|-------------|--------|------------|-----|
| Wheat | 120s | 3 | 15 | 5 |
| Corn | 150s | 4 | 25 | 10 |
| Strawberry | 90s | 3 | 45 | 18 |
| Pumpkin | 200s | 4 | 50 | 20 |
| Watermelon | 210s | 4 | 60 | 25 |

### 2. Animal System
**Files**: `FarmingService.ts`, `farming.ts` routes

**8 Animal Types**:
- Chicken → Eggs (60s)
- Cow → Milk (120s)
- Pig → Truffles (180s)
- Sheep → Wool (150s)
- Goat → Goat Milk (140s)
- Duck → Duck Eggs (70s)
- Horse → Manure (100s)
- Bee → Honey (110s)

**Animal Stats**:
- Hunger: 0-100 (decay over time)
- Happiness: 0-100 (affected by care)
- Health: 0-100 (affected by feeding)
- Friendship: 0+ (increases with interaction)
- Age: Tracked for potential breeding

**Actions**:
- Feed: Costs item, restores hunger to 0, increases happiness
- Pet: Increases friendship
- Collect Product: Available after production interval

### 3. Building System
**Files**: `PlayerService.ts`, `farming.ts` routes

**13 Building Types**:
- Farmhouse (4×4) - Storage
- Barn (3×3) - Animals
- Chicken Coop (2×2) - Chickens
- Stable (3×3) - Horses
- Silo (2×2) - Storage
- Warehouse (4×4) - Massive storage
- Workshop (3×3) - Crafting
- Kitchen (2×3) - Food prep
- Bakery (3×2) - Baking
- Mill (3×3) - Grain processing
- Greenhouse (4×3) - Year-round crops
- Fishing Hut (2×2) - Fishing
- Marketplace (4×4) - Trading hub

**Building Features**:
- Grid placement (snap to 1×1)
- Upgradeable levels (1+)
- Upgrade cost multiplies: `baseCost × multiplier^(level-1)`
- Visual changes per level
- Capacity increases with upgrades

### 4. Inventory System
**Files**: `PlayerService.ts`, database schema

**Item Categories**:
- Seeds: Plant materials
- Crops: Harvested vegetables
- Animal Products: Eggs, milk, wool, etc.
- Fish: Caught from fishing
- Materials: Stone, coal, ore
- Crafted Products: Bread, cheese, cake
- Tools: Hoe, watering can, axe, pickaxe
- Decorations: Farm aesthetics

**Features**:
- Stackable items (1-999 quantity)
- Rarity: common, uncommon, rare, epic, legendary
- Descriptions and icons
- Max inventory: 100 slots (expandable)
- Sort/filter by type

### 5. Economy System
**Files**: Multiple services, database transactions

**Currencies**:
- Coins (primary): Earned from selling, quests, tasks
- Gems (premium): Limited sources, cosmetic focus
- Farm XP: Farming-specific progression
- Player XP: General leveling

**Price Models**:
- Crops: 12-60 coins each
- Animals: 40-200 coins
- Fish: 15-200 coins (rarity-based)
- Ore: 5-500 coins (rarity-based)
- Marketplace: Player-set prices (no fee)

**Money Sinks**:
- Buying animals: 40-200 coins
- Planting seeds: 8-35 coins
- Building upgrades: 100-1000 coins

**Money Sources**:
- Selling crops: 12-60 coins
- Selling animal products: 20-50 coins
- Selling fish/ore: 5-500 coins
- Quests: 50-500 coins
- Events: Bonuses

### 6. Crafting System
**Files**: `CraftingService.ts`, `activities.ts` routes

**Current Recipes** (expandable):
```
Bread: 3 wheat → 1 bread (30s, 10 XP)
Cheese: 2 milk → 1 cheese (40s, 15 XP)
Cake: 2 wheat + 2 egg + 1 milk → 1 cake (60s, 25 XP)
```

**Mechanics**:
- Server-side validation of ingredients
- Transaction-based (all-or-nothing)
- Inventory automatically updated
- Crafting time (future: timers)
- XP rewards immediate

### 7. Fishing System
**Files**: `FishingService.ts`, `activities.ts` routes

**7 Fish Types**:
| Fish | Rarity | Price | XP | Chance |
|------|--------|-------|-----|--------|
| Carp | Common | 15 | 5 | 40% |
| Catfish | Common | 18 | 6 | 30% |
| Trout | Uncommon | 35 | 15 | 20% |
| Salmon | Uncommon | 45 | 20 | 15% |
| Bass | Rare | 60 | 30 | 10% |
| Koi | Rare | 80 | 40 | 8% |
| Golden Fish | Epic | 200 | 100 | 2% |

**Mechanics**:
- Costs 10 energy per cast
- Chance-based catches (weighted by rarity)
- Energy check server-side
- Inventory updated immediately
- XP awarded

### 8. Mining System
**Files**: `MiningService.ts`, `activities.ts` routes

**8 Ore Types** (level-gated):
| Ore | Min Level | Rarity | Price | XP |
|-----|-----------|--------|-------|-----|
| Stone | 1 | Common | 5 | 2 |
| Coal | 1 | Common | 15 | 5 |
| Copper | 5 | Uncommon | 30 | 10 |
| Iron | 10 | Uncommon | 50 | 20 |
| Silver | 15 | Rare | 80 | 35 |
| Gold | 20 | Rare | 100 | 40 |
| Emerald | 25 | Epic | 400 | 180 |
| Diamond | 30 | Epic | 500 | 200 |

**Mechanics**:
- Costs 15 energy per swing
- Level gates available ores
- Weighted random drops
- Inventory updated immediately
- XP awarded

### 9. Trading System
**Files**: `TradeService.ts`, `trading.ts` routes

**Two modes**:

**Marketplace Listings**:
- Create: Player sets item, quantity, price
- Browse: Paginated results (50/page)
- Purchase: Buyer transfers coins, seller receives
- Cancel: Seller refunds items
- Expire: Auto-remove after 7 days

**Direct Trading**:
- Initiate: Send items for negotiation
- Accept: Both parties confirm
- Decline: Trade cancelled, items returned
- Complete: Items swapped server-side

**Anti-Cheat**:
- Server verifies inventory before each transaction
- Atomic database operations
- No duplicate transactions
- Rate limiting ready

### 10. Social System
**Files**: `SocialService.ts`, `social.ts` routes

**Features**:

**Friends**:
- Send/accept/decline requests
- Remove friends
- View friends' farms (future)
- View profiles
- Online status

**Notifications**:
- Crop ready
- Animal product ready
- Quest completed
- Friend request
- Trade completed
- Marketplace activity
- Event notifications
- Stored in database (persistent)

**Messaging** (future):
- Direct messages
- Group chat
- Notifications for messages

### 11. Quest System
**Files**: `PlayerService.ts`, `farming.ts` routes

**Quest Types**:
- Farming: "Harvest 5 wheat"
- Animal: "Collect 3 eggs"
- Crafting: "Make 2 bread"
- Fishing: "Catch a rare fish"
- Social: "Add 5 friends"
- Daily: Reset each day
- Story: Main progression

**Mechanics**:
- Track progress server-side
- Multiple objectives per quest
- Completion verification
- Rewards: Coins, XP, items
- Repeatable daily quests

### 12. Leaderboard System
**Files**: `LeaderboardService.ts`, `leaderboards.ts` routes

**Types**:
1. Top Players: By level + XP
2. Top Farms: By farm level + farm XP
3. Wealthiest: By coins
4. Most Crops: Total harvested
5. Most Trades: Trading volume

**Features**:
- Paginated (100/page)
- Rankings calculated live
- Player can check their rank
- Medals: 🥇🥈🥉 for top 3

## Database Schema

### Users & Players
```sql
users (id, email, password_hash, created_at)
players (id, user_id, username, level, farm_level, xp, coins, gems, energy)
```

### Farms & Terrain
```sql
farms (id, player_id, name, width, height, expansion_level)
farm_tiles (id, farm_id, grid_x, grid_y, tile_type, tilled, watered)
crops (id, farm_tile_id, crop_type, planted_at, stage, watered, fertilized)
animals (id, farm_id, animal_type, hunger, happiness, health, friendship)
buildings (id, farm_id, building_type, level, grid_x, grid_y, rotation)
```

### Inventory & Items
```sql
inventory (player_id, item_id, quantity, rarity)
items (id, name, type, icon, stackable, rarity, description)
```

### Economy & Trading
```sql
marketplace_listings (id, seller_id, item_id, quantity, price_per_unit, status)
trades (id, initiator_id, recipient_id, initiator_items, recipient_items, status)
```

### Social
```sql
friends (id, player_id, friend_id, status, accepted_at)
notifications (id, player_id, type, title, message, data, read)
```

### Progression
```sql
quests (id, player_id, quest_type, title, objective_type, objective_progress, status)
achievements (id, code, title, reward_coins, reward_gems)
player_achievements (player_id, achievement_id, unlocked_at)
```

## Server Validation Rules

### Farming
- ✅ Player owns farm tile
- ✅ Tile type supports crops
- ✅ Player has seed coins
- ✅ Crop exists and is owned
- ✅ Crop ready (grown timestamp)
- ✅ Crop not already collected

### Animals
- ✅ Animal exists and is owned
- ✅ Player has feed items
- ✅ Product timer expired
- ✅ Inventory not full

### Trading
- ✅ Both players exist
- ✅ Initiator has all items
- ✅ Recipient has all items
- ✅ Trade still pending
- ✅ Prices valid (>0)
- ✅ Item exists in catalog

### Economy
- ✅ Player has sufficient coins
- ✅ Seller has items to sell
- ✅ Quantity > 0
- ✅ Price > 0
- ✅ No negative balances

## Performance Considerations

- Crop growth: Calculated from timestamp (no tick system)
- Animal decay: Can be calculated on-demand or periodic task
- Inventory: Load only requested items
- Leaderboards: Paginated queries with LIMIT
- Notifications: Indexed by player_id
- Queries: Optimized with indexes on foreign keys

## Scalability Notes

For 10,000+ players:
1. Add Redis for session caching
2. Use read replicas for leaderboards
3. Archive old trades/listings
4. Implement notification queue
5. Add background job processor
6. Cache item metadata
7. Shard players by farm_id ranges
