# Setup and Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Git

## Local Development Setup

### 1. Clone and Install

```bash
cd farming-game
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb farming_game
```

Create `.env` file in `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/farming_game
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
PORT=3001
```

Create `.env.local` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Initialize Database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Servers

```bash
npm run dev
```

This launches:
- Backend API: http://localhost:3001
- Frontend: http://localhost:5173

## Testing the Game

### Create Test Account

1. Go to http://localhost:5173/register
2. Create account with:
   - Username: `TestFarmer`
   - Email: `test@example.com`
   - Password: `password123`

### Test Gameplay Loop

1. **Login** to dashboard
2. **Visit Farm**: Plant wheat (costs 10 coins)
3. **Water Crop**: Click water button
4. **Wait**: Crops grow in ~2 minutes (sped up for testing)
5. **Harvest**: Get coins + XP
6. **Check Inventory**: See harvested wheat
7. **Marketplace**: Sell wheat to other players
8. **Fishing**: Cast line to catch fish
9. **Mining**: Mine ore for resources
10. **Crafting**: Make bread from wheat
11. **Friends**: Search and add other players
12. **Leaderboard**: Check rankings

## Key Files

### Backend
- `src/db/index.ts` - Database initialization
- `src/db/seed.ts` - Test data
- `src/services/` - Business logic
- `src/routes/` - API endpoints
- `src/middleware/auth.ts` - Authentication

### Frontend
- `src/pages/` - Main UI pages
- `src/stores/gameStore.ts` - State management
- `src/services/api.ts` - API client
- `src/App.tsx` - Router configuration

## API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
{ "email": "user@example.com", "password": "pass123", "username": "Farmer" }

# Login
POST /api/auth/login
{ "email": "user@example.com", "password": "pass123" }

# Get current player
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Farming

```bash
# Get farm
GET /api/game/farm

# Plant crop
POST /api/game/farm/plant
{ "farmTileId": "uuid", "cropType": "wheat" }

# Water crop
POST /api/game/farm/water
{ "cropId": "uuid" }

# Harvest crop
POST /api/game/farm/harvest
{ "cropId": "uuid" }

# Get inventory
GET /api/game/inventory

# Buy animal
POST /api/game/animals/purchase
{ "animalType": "chicken" }

# Collect animal product
POST /api/game/animals/collect
{ "animalId": "uuid" }
```

### Marketplace

```bash
# Get listings
GET /api/game/marketplace/listings?itemId=wheat&limit=50

# Create listing
POST /api/game/marketplace/list
{ "itemId": "wheat", "quantity": 5, "pricePerUnit": 20 }

# Purchase listing
POST /api/game/marketplace/purchase
{ "listingId": "uuid", "quantity": 2 }
```

### Social

```bash
# Search players
GET /api/social/players/search?q=Farmer

# Send friend request
POST /api/social/friends/request
{ "targetPlayerId": "uuid" }

# Get friends
GET /api/social/friends

# Get notifications
GET /api/social/notifications

# Get leaderboards
GET /api/social/leaderboards/top-players?limit=100
GET /api/social/leaderboards/top-farms
GET /api/social/leaderboards/wealthiest
```

### Activities

```bash
# Get recipes
GET /api/game/crafting/recipes

# Craft item
POST /api/game/crafting/craft
{ "recipeId": "bread" }

# Fish
POST /api/game/fishing/fish

# Mine
POST /api/game/mining/mine

# Get ores available
GET /api/game/mining/ores
```

## Game Balance Numbers

### Crops
- Growth time: 80-210 seconds (for testing, production: 5-30 minutes)
- Sell price: 12-60 coins
- XP reward: 4-25 XP

### Animals
- Purchase price: 40-200 coins
- Product time: 60-180 seconds
- Happiness: Increases with petting/feeding

### Fishing
- Energy cost: 10 per cast
- Common catch chance: 30-40%
- Rare fish: 2-15% chance
- Legendary: <1% chance

### Mining
- Energy cost: 15 per swing
- Stone/Coal: Level 1+
- Iron/Copper: Level 5-10+
- Diamond/Emerald: Level 25-30+

### Crafting
- Bread: 3 wheat → 1 bread (30s)
- Cheese: 2 milk → 1 cheese (40s)
- Cake: 2 wheat + 2 egg + 1 milk → 1 cake (60s)

### Economy
- Starting coins: 1,000
- Max inventory: 100 slots
- Marketplace fee: None (player-to-player)
- No pay-to-win mechanics

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL in .env
- Run migrations: `npm run db:migrate`

### Port Already in Use
- Backend: `lsof -ti:3001 | xargs kill -9`
- Frontend: `lsof -ti:5173 | xargs kill -9`

### Crops Not Growing
- Check server time via `/health` endpoint
- Crop growth is server-side, based on timestamps
- Test with shorter growth times in CropData

### Token Invalid
- Check JWT_SECRET matches between backend and frontend
- Verify token not expired (7 days default)
- Clear localStorage and re-login

## Performance Optimization

- Database queries use indexes on player_id, farm_id, item_id
- Inventory loads paginated (50 items max)
- Leaderboards cached with LIMIT
- Crop growth calculated from timestamps (no polling)
- Frontend debounces API requests

## Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ All game logic server-validated
- ✅ No secrets in frontend code
- ✅ SQL injection protected (parameterized queries)
- ✅ Rate limiting ready (add express-rate-limit)
- ✅ CORS enabled for development

## Next Steps / Future Work

1. **Real-time updates**: Add Socket.IO for live farm syncing
2. **NPCs & Village**: Dynamic schedules, quests from NPCs
3. **Guilds**: Group farming, shared storage
4. **Events**: Seasonal content, limited-time challenges
5. **Admin Dashboard**: Manage players, view analytics
6. **Mobile App**: React Native for iOS/Android
7. **Assets**: Pixel art sprites, animations
8. **Audio**: Background music, sound effects
9. **Localization**: Multi-language support
10. **Analytics**: Track player behavior, retention

## Deployment

### To Production

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel, Netlify, or your host

3. Build backend:
```bash
cd backend
npm run build
```

4. Deploy to Heroku, Railway, or your host

5. Set environment variables on production host

6. Run migrations: `npm run db:migrate`

7. Seed production data (optional)

## Support

For issues or questions:
- Check logs: Backend console + Browser DevTools
- Verify API health: `curl http://localhost:3001/health`
- Check database: `psql farming_game -c "\dt"`
- Review error responses in API calls
