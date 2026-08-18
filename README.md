# Harvest Valley - Multiplayer Farming Game

A complete, production-quality multiplayer farming simulation game built with React, Node.js, PostgreSQL, and TypeScript.

## Features

- 🌾 **Farming System**: Plant, water, and harvest 16+ crop types
- 🐄 **Animals**: Raise chickens, cows, pigs, sheep, and more
- 🏠 **Buildings**: Construct and upgrade farmhouse, barn, marketplace, etc.
- 💰 **Economy**: Buy/sell items, trade with players, marketplace listings
- 👥 **Multiplayer**: Friends, trading, visiting other farms
- 🎯 **Quests**: Complete objectives for rewards and progression
- 📊 **Progression**: Level up, unlock features, earn achievements
- 🎮 **Responsive UI**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand, Vite
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Real-time**: WebSockets (Socket.IO ready)
- **Database**: PostgreSQL with proper schema

## Project Structure

```
farming-game/
├── frontend/          # React web application
├── backend/           # Node.js API server
├── shared/            # Shared types and schemas
└── package.json       # Workspace configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Backend (.env):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farming_game
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
PORT=3001
```

Frontend (.env.local):
```
VITE_API_URL=http://localhost:3001/api
```

3. Initialize database:
```bash
npm run db:migrate
npm run db:seed
```

4. Start development servers:
```bash
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current player

### Farming
- `GET /api/game/farm` - Get farm state
- `GET /api/game/inventory` - Get inventory
- `POST /api/game/farm/plant` - Plant crop
- `POST /api/game/farm/water` - Water crop
- `POST /api/game/farm/harvest` - Harvest crop
- `POST /api/game/animals/purchase` - Buy animal
- `POST /api/game/animals/feed` - Feed animal
- `POST /api/game/animals/collect` - Collect animal product
- `POST /api/game/buildings/add` - Add building
- `GET /api/game/quests` - Get quests

### Trading & Marketplace
- `POST /api/game/marketplace/list` - Create listing
- `GET /api/game/marketplace/listings` - Browse listings
- `POST /api/game/marketplace/purchase` - Buy item
- `POST /api/game/trades/initiate` - Start trade
- `POST /api/game/trades/:id/accept` - Accept trade

### Social
- `POST /api/social/friends/request` - Send friend request
- `GET /api/social/friends` - Get friends
- `GET /api/social/players/search` - Search players
- `GET /api/social/notifications` - Get notifications

## Game Balance

- Starter coins: 1000
- Energy: 100/100
- Crop growth: 80-210 seconds (for testing)
- Animal products: Every 60-180 seconds
- Marketplace: No fees, player-driven pricing

## Database Schema

Key tables:
- `users` - User accounts
- `players` - Player profiles
- `farms` - Farm data
- `farm_tiles` - Grid-based farm layout
- `crops` - Growing crops
- `animals` - Farm animals
- `buildings` - Farm buildings
- `inventory` - Player items
- `quests` - Quest progress
- `friends` - Friendships
- `trades` - Player trades
- `marketplace_listings` - Item listings
- `notifications` - Player notifications

## Security Features

- Bcrypt password hashing
- JWT token authentication
- Server-side validation on all actions
- Transaction-based database operations
- Rate limiting ready
- No sensitive data in client

## Testing the Game

1. Create two accounts
2. Plant crops and watch them grow
3. Buy animals
4. Harvest and sell items
5. Send friend requests
6. Create marketplace listings
7. Trade with other players

## Future Enhancements

- WebSocket real-time updates
- Fishing & mining systems
- Crafting recipes
- Multiplayer events
- Guild system
- Admin dashboard
- Mobile app (React Native)
- Seasonal weather effects
- NPC village system

## Development Notes

- All game logic validated server-side
- Optimistic UI updates for better UX
- Database transactions prevent race conditions
- Crop growth calculated from server timestamps
- Animals decay over time (not yet implemented)

## License

MIT
