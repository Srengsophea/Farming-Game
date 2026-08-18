# Quick Start Guide - How to Run

## Step 1: Prerequisites

Make sure you have installed:
- **Node.js 18+** - Download from https://nodejs.org
- **PostgreSQL 13+** - Download from https://www.postgresql.org/download/windows/
- **Git** - Already installed

Verify installations:
```bash
node --version
npm --version
psql --version
```

## Step 2: Navigate to Project

```bash
cd "C:\Users\Asus\Desktop\Farming Game Online Web\farming-game"
```

## Step 3: Install Dependencies

```bash
npm install
```

This installs all packages for backend, frontend, and shared modules.

## Step 4: Create Database

Open PowerShell or Command Prompt and create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE farming_game;"
```

You'll be prompted for PostgreSQL password (default is often blank or "postgres").

## Step 5: Configure Environment

### Backend Configuration

Create file: `backend/.env`

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farming_game
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
PORT=3001
```

**Note**: Replace "postgres" password if yours is different.

### Frontend Configuration (Optional)

Create file: `frontend/.env.local`

```
VITE_API_URL=http://localhost:3001/api
```

## Step 6: Initialize Database Schema

```bash
npm run db:migrate
```

This creates all 20+ database tables.

## Step 7: Seed Sample Data

```bash
npm run db:seed
```

This adds crop types, animals, buildings, items, and achievements to the database.

## Step 8: Start Both Servers

```bash
npm run dev
```

This launches:
- **Backend API**: http://localhost:3001
- **Frontend App**: http://localhost:5173

Both servers will start in development mode with hot reload.

## Step 9: Open Game in Browser

Go to: **http://localhost:5173**

You should see the Harvest Valley login page.

## Step 10: Create Account & Play

1. Click **"Register"**
2. Fill in:
   - Username: `TestFarmer` (or your name)
   - Email: `test@example.com`
   - Password: `password123`
3. Click **"Create Account"**
4. You're logged in! Click **"My Farm"**

## First Gameplay Steps

1. **Plant a Crop**
   - Click on an empty soil tile
   - Select "Wheat" crop type
   - Click "Plant Crop" (costs 10 coins)

2. **Water Crop**
   - Click "💧 Water" button
   - Crop grows faster when watered

3. **Wait ~2 Minutes**
   - Crop grows in stages
   - You can check progress

4. **Harvest**
   - Click "🌾 Harvest"
   - Gain coins + XP
   - Crop removed from farm

5. **Check Inventory**
   - Click "🎒 Inventory" in dashboard
   - View harvested wheat

6. **Explore Other Features**
   - 🎣 Fishing - Catch fish
   - ⛏️ Mining - Mine ore
   - 🔨 Crafting - Make items
   - 🏪 Marketplace - Buy/sell items
   - 👥 Friends - Add other players
   - 🏆 Leaderboards - Check rankings

## Troubleshooting

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED
```

**Solution**: 
- Make sure PostgreSQL is running
- Check DATABASE_URL in `backend/.env`
- Test connection: `psql -U postgres -d farming_game`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution**: Kill process on port 3001
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```
npm ERR! code ERESOLVE
```

**Solution**: 
```bash
npm install --legacy-peer-deps
```

### Database Migration Failed
```
Error: relation "users" already exists
```

**Solution**: Drop and recreate database
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS farming_game;"
psql -U postgres -c "CREATE DATABASE farming_game;"
npm run db:migrate
npm run db:seed
```

### Frontend Not Loading
```
http://localhost:5173 - Blank page or error
```

**Solution**:
- Check backend is running: http://localhost:3001/health
- Check browser console for errors (F12)
- Clear browser cache: Ctrl+Shift+Delete

## Commands Reference

```bash
# Install all dependencies
npm install

# Start both backend and frontend
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend  
npm run dev:frontend

# Initialize database tables
npm run db:migrate

# Seed sample data
npm run db:seed

# Build for production
npm run build

# Run tests
npm run test
```

## File Locations

| Component | Location |
|-----------|----------|
| Backend Server | `backend/src/index.ts` |
| Frontend App | `frontend/src/App.tsx` |
| Database Schema | `backend/src/db/index.ts` |
| API Routes | `backend/src/routes/` |
| Game Services | `backend/src/services/` |
| React Pages | `frontend/src/pages/` |
| Styles | `frontend/src/index.css` + `tailwind.config.js` |

## Testing Multiple Accounts

To test multiplayer features (trading, friends):

1. **Account 1**: 
   - Register as `Farmer1` / `farmer1@test.com`
   - Plant and harvest crops

2. **Account 2**: 
   - Open second browser tab (or private window)
   - Register as `Farmer2` / `farmer2@test.com`
   - Buy items from Farmer1's marketplace listings

3. **Trade**:
   - Search for each other
   - Send friend requests
   - Trade items directly

## Stopping Servers

Press `Ctrl+C` in terminal where `npm run dev` is running.

## Next Steps

- Read **SETUP.md** for detailed deployment guide
- Read **ARCHITECTURE.md** for system design details
- Read **API_TESTING.md** for API endpoint examples
- Check **PROJECT_SUMMARY.md** for complete feature list

## Support

If you encounter issues:

1. Check error messages in terminal
2. Review logs in browser DevTools (F12)
3. Check `/health` endpoint: http://localhost:3001/health
4. Verify PostgreSQL is running
5. Check database exists: `psql -l`

Good luck farming! 🌾
