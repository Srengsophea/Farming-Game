# Docker Setup Guide

Complete guide to run the Harvest Valley farming game using Docker.

## Prerequisites

- **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop
- **Docker Compose** - Included with Docker Desktop
- **Git** - Already installed

## Verify Docker Installation

```bash
docker --version
docker-compose --version
```

Should show version numbers.

---

## Step 1: Create docker-compose.yml

Create file: `docker-compose.yml` in root of project

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: farming_game_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: farming_game
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - farming_network

  # Backend API Server
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: farming_game_api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/farming_game
      JWT_SECRET: harvest-valley-secret-2026
      NODE_ENV: development
      PORT: 3001
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    networks:
      - farming_network
    command: npm run dev

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: farming_game_web
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3001/api
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src
    networks:
      - farming_network
    command: npm run dev

volumes:
  postgres_data:
    driver: local

networks:
  farming_network:
    driver: bridge
```

---

## Step 2: Create Backend Dockerfile

Create file: `backend/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev:backend"]
```

---

## Step 3: Create Frontend Dockerfile

Create file: `frontend/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/index.html ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/tsconfig.node.json ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/postcss.config.js ./frontend/

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev:frontend"]
```

---

## Step 4: Create .dockerignore Files

Create file: `backend/.dockerignore`

```
node_modules
npm-debug.log
dist
.env.local
.git
```

Create file: `frontend/.dockerignore`

```
node_modules
npm-debug.log
dist
.env.local
.git
```

---

## Step 5: Start Docker Containers

Navigate to project root:

```bash
cd "C:\Users\Asus\Desktop\Farming Game Online Web\farming-game"
```

Build and start all services:

```bash
docker-compose up --build
```

This will:
1. Build the backend image
2. Build the frontend image
3. Start PostgreSQL container
4. Start backend container
5. Start frontend container
6. Initialize database
7. Seed sample data

**Wait for output showing:**
```
backend   | Server running on port 3001
frontend  | Local:   http://localhost:5173/
```

---

## Step 6: Initialize Database (First Time Only)

In a new terminal, run migrations:

```bash
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

---

## Step 7: Open Game in Browser

Go to: **http://localhost:5173**

Create account and start playing!

---

## Common Docker Commands

```bash
# Start all containers
docker-compose up

# Start in background
docker-compose up -d

# Stop all containers
docker-compose down

# View logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f

# Stop containers but keep volumes
docker-compose down

# Remove containers AND volumes (reset database)
docker-compose down -v

# Rebuild containers
docker-compose up --build

# Run command in container
docker-compose exec backend npm run db:migrate

# View running containers
docker ps

# Shell into container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres
```

---

## Troubleshooting

### "docker: command not found"
- Docker not installed
- Download from https://www.docker.com/products/docker-desktop
- Restart terminal after installation

### "Cannot connect to Docker daemon"
- Docker Desktop not running
- Windows: Open Docker Desktop application
- Wait for Docker to start

### "Port 5173 already in use"
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
# Change "5173:5173" to "5174:5173"
```

### "Port 3001 already in use"
- Same as above, for port 3001

### Database connection error
- Wait for PostgreSQL health check to pass
- Check logs: `docker-compose logs postgres`
- Verify DATABASE_URL in docker-compose.yml

### "node_modules not found in container"
```bash
# Rebuild containers
docker-compose down
docker-compose up --build
```

### Want to reset database
```bash
# Remove volumes and rebuild
docker-compose down -v
docker-compose up --build
```

---

## Development Workflow with Docker

1. **Start containers:**
```bash
docker-compose up
```

2. **Edit files:**
- Backend: `backend/src/**` (hot reload)
- Frontend: `frontend/src/**` (hot reload)

3. **View logs:**
```bash
docker-compose logs -f backend
```

4. **Run migrations:**
```bash
docker-compose exec backend npm run db:migrate
```

5. **Access database:**
```bash
docker-compose exec postgres psql -U postgres -d farming_game
```

6. **Stop when done:**
```bash
docker-compose down
```

---

## Production Deployment with Docker

### Build Images

```bash
docker build -t farming-game-backend:latest ./backend
docker build -t farming-game-frontend:latest ./frontend
```

### Push to Docker Hub

```bash
docker tag farming-game-backend:latest YOUR_USERNAME/farming-game-backend:latest
docker tag farming-game-frontend:latest YOUR_USERNAME/farming-game-frontend:latest

docker push YOUR_USERNAME/farming-game-backend:latest
docker push YOUR_USERNAME/farming-game-frontend:latest
```

### Deploy on Server

```bash
# Pull images
docker pull YOUR_USERNAME/farming-game-backend:latest
docker pull YOUR_USERNAME/farming-game-frontend:latest

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## Docker Compose Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| postgres | 5432 | Database |
| backend | 3001 | API Server |
| frontend | 5173 | Web Game |

---

## File Structure with Docker

```
farming-game/
├── docker-compose.yml      # Main orchestration
├── backend/
│   ├── Dockerfile          # Backend image
│   ├── .dockerignore        # Docker ignore
│   ├── src/
│   └── package.json
├── frontend/
│   ├── Dockerfile          # Frontend image
│   ├── .dockerignore        # Docker ignore
│   ├── src/
│   └── package.json
└── shared/
    └── src/
```

---

## Network Communication

With Docker Compose:

- **Frontend → Backend**: `http://localhost:3001/api`
- **Backend → Database**: `postgresql://postgres:postgres@postgres:5432/farming_game`
- **From Host**: `http://localhost:5173` (frontend), `http://localhost:3001` (backend)

---

## Quick Start with Docker

```bash
# 1. Navigate to project
cd "C:\Users\Asus\Desktop\Farming Game Online Web\farming-game"

# 2. Create docker-compose.yml (from Step 1 above)
# 3. Create backend/Dockerfile (from Step 2)
# 4. Create frontend/Dockerfile (from Step 3)
# 5. Create .dockerignore files (from Step 4)

# 6. Start everything
docker-compose up --build

# 7. In new terminal, initialize database
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed

# 8. Open http://localhost:5173
# Game ready to play!
```

---

## Benefits of Docker

✅ **No local setup needed** - Everything isolated in containers
✅ **Same environment everywhere** - Dev, test, production
✅ **Easy to scale** - Add more containers
✅ **Database included** - PostgreSQL auto-starts
✅ **Hot reload** - Changes reflected instantly
✅ **Easy cleanup** - `docker-compose down -v`

---

## Next Steps

1. Create the 3 files (docker-compose.yml, Dockerfiles)
2. Run `docker-compose up --build`
3. Wait for all services to start
4. Initialize database in new terminal
5. Open http://localhost:5173
6. Play the game!

Enjoy! 🌾
