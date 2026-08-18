# API Testing Guide

## Quick Start

All endpoints require authentication header except `/register`, `/login`, and public leaderboards.

```bash
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Authentication Endpoints

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123",
    "username": "GreenThumb"
  }'

# Response:
{
  "token": "eyJhbGc...",
  "user": {
    "userId": "uuid",
    "playerId": "uuid",
    "farmId": "uuid",
    "username": "GreenThumb",
    "email": "farmer@example.com"
  }
}
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123"
  }'
```

### Get Current Player
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "player": {
    "id": "uuid",
    "username": "GreenThumb",
    "level": 1,
    "farmLevel": 1,
    "playerXp": 0,
    "farmXp": 0,
    "coins": 1000,
    "gems": 0,
    "energy": 100
  },
  "farm": {
    "id": "uuid",
    "playerId": "uuid",
    "name": "My Farm",
    "width": 20,
    "height": 20,
    "expansionLevel": 1
  }
}
```

## Farming Endpoints

### Get Farm State
```bash
curl -X GET http://localhost:3001/api/game/farm \
  -H "Authorization: Bearer $TOKEN"
```

### Get Inventory
```bash
curl -X GET http://localhost:3001/api/game/inventory \
  -H "Authorization: Bearer $TOKEN"
```

### Plant Crop
```bash
curl -X POST http://localhost:3001/api/game/farm/plant \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmTileId": "tile-uuid",
    "cropType": "wheat"
  }'

# Available cropTypes: wheat, corn, rice, potato, carrot, tomato, cabbage, pumpkin,
# strawberry, watermelon, sugarcane, onion, garlic, pepper, eggplant, lettuce
```

### Water Crop
```bash
curl -X POST http://localhost:3001/api/game/farm/water \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cropId": "crop-uuid"}'
```

### Harvest Crop
```bash
curl -X POST http://localhost:3001/api/game/farm/harvest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cropId": "crop-uuid"}'

# Response:
{
  "coins": 15,
  "xp": 5
}
```

### Check Crop Progress
```bash
curl -X GET http://localhost:3001/api/game/farm/crop/crop-uuid/progress \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "stage": 1,
  "totalStages": 3,
  "progress": 45.5,
  "readyToHarvest": false,
  "nextStageAt": 1692374120000
}
```

### Buy Animal
```bash
curl -X POST http://localhost:3001/api/game/animals/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"animalType": "chicken"}'

# Available types: chicken, cow, pig, sheep, goat, duck, horse, bee
```

### Feed Animal
```bash
curl -X POST http://localhost:3001/api/game/animals/feed \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"animalId": "animal-uuid"}'
```

### Collect Animal Product
```bash
curl -X POST http://localhost:3001/api/game/animals/collect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"animalId": "animal-uuid"}'

# Response:
{
  "productId": "egg",
  "quantity": 1
}
```

### Add Building
```bash
curl -X POST http://localhost:3001/api/game/buildings/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buildingType": "chicken_coop",
    "gridX": 5,
    "gridY": 5
  }'
```

## Marketplace Endpoints

### Get Listings
```bash
curl -X GET "http://localhost:3001/api/game/marketplace/listings?itemId=wheat&limit=20&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "listings": [
    {
      "id": "listing-uuid",
      "sellerId": "player-uuid",
      "itemId": "wheat",
      "quantity": 10,
      "pricePerUnit": 15,
      "username": "FarmMaster",
      "createdAt": "2026-08-19T01:00:00Z"
    }
  ]
}
```

### Create Listing
```bash
curl -X POST http://localhost:3001/api/game/marketplace/list \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "wheat",
    "quantity": 10,
    "pricePerUnit": 20
  }'
```

### Purchase Listing
```bash
curl -X POST http://localhost:3001/api/game/marketplace/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "listing-uuid",
    "quantity": 5
  }'

# Response:
{
  "totalCost": 100
}
```

### Cancel Listing
```bash
curl -X POST http://localhost:3001/api/game/marketplace/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listingId": "listing-uuid"}'
```

## Trading Endpoints

### Initiate Trade
```bash
curl -X POST http://localhost:3001/api/game/trades/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetPlayerId": "player-uuid",
    "initiatorItems": ["wheat", "egg"],
    "recipientItems": ["milk", "wool"]
  }'
```

### Accept Trade
```bash
curl -X POST http://localhost:3001/api/game/trades/trade-uuid/accept \
  -H "Authorization: Bearer $TOKEN"
```

### Decline Trade
```bash
curl -X POST http://localhost:3001/api/game/trades/trade-uuid/decline \
  -H "Authorization: Bearer $TOKEN"
```

## Crafting Endpoints

### Get Recipes
```bash
curl -X GET http://localhost:3001/api/game/crafting/recipes

# Response:
{
  "recipes": [
    {
      "id": "bread",
      "ingredients": {"wheat": 3},
      "output": "bread",
      "outputQuantity": 1,
      "craftTimeMs": 30000,
      "xpReward": 10
    }
  ]
}
```

### Craft Item
```bash
curl -X POST http://localhost:3001/api/game/crafting/craft \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipeId": "bread"}'
```

## Fishing Endpoints

### Fish
```bash
curl -X POST http://localhost:3001/api/game/fishing/fish \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "caughtFish": {
    "id": "trout",
    "name": "Trout",
    "rarity": "uncommon",
    "sellPrice": 35,
    "xpReward": 15,
    "catchChance": 0.2
  }
}
```

### Get All Fish
```bash
curl -X GET http://localhost:3001/api/game/fishing/fish
```

## Mining Endpoints

### Mine
```bash
curl -X POST http://localhost:3001/api/game/mining/mine \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "minedOre": {
    "id": "iron",
    "name": "Iron Ore",
    "rarity": "uncommon",
    "sellPrice": 50,
    "xpReward": 20,
    "minLevel": 10
  }
}
```

### Get Available Ores
```bash
curl -X GET http://localhost:3001/api/game/mining/ores \
  -H "Authorization: Bearer $TOKEN"
```

## Quest Endpoints

### Get Quests
```bash
curl -X GET http://localhost:3001/api/game/quests \
  -H "Authorization: Bearer $TOKEN"
```

### Complete Quest
```bash
curl -X POST http://localhost:3001/api/game/quests/quest-uuid/complete \
  -H "Authorization: Bearer $TOKEN"
```

## Social Endpoints

### Search Players
```bash
curl -X GET "http://localhost:3001/api/social/players/search?q=Green" \
  -H "Authorization: Bearer $TOKEN"
```

### Send Friend Request
```bash
curl -X POST http://localhost:3001/api/social/friends/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetPlayerId": "player-uuid"}'
```

### Get Friends
```bash
curl -X GET http://localhost:3001/api/social/friends \
  -H "Authorization: Bearer $TOKEN"
```

### Accept Friend Request
```bash
curl -X POST http://localhost:3001/api/social/friends/friendship-uuid/accept \
  -H "Authorization: Bearer $TOKEN"
```

### Get Notifications
```bash
curl -X GET http://localhost:3001/api/social/notifications?unreadOnly=true \
  -H "Authorization: Bearer $TOKEN"
```

### Mark Notification Read
```bash
curl -X POST http://localhost:3001/api/social/notifications/notif-uuid/read \
  -H "Authorization: Bearer $TOKEN"
```

## Leaderboard Endpoints

### Top Players
```bash
curl -X GET "http://localhost:3001/api/social/leaderboards/top-players?limit=50&offset=0"
```

### Top Farms
```bash
curl -X GET "http://localhost:3001/api/social/leaderboards/top-farms?limit=50"
```

### Wealthiest
```bash
curl -X GET "http://localhost:3001/api/social/leaderboards/wealthiest?limit=50"
```

### Most Crops
```bash
curl -X GET "http://localhost:3001/api/social/leaderboards/most-crops?limit=50"
```

### Most Trades
```bash
curl -X GET "http://localhost:3001/api/social/leaderboards/most-trades?limit=50"
```

## Testing Workflow

1. **Register & Login**
```bash
export TOKEN="your-token-here"
```

2. **Plant & Harvest Cycle**
```bash
# Get farm to find tile ID
curl -X GET http://localhost:3001/api/game/farm \
  -H "Authorization: Bearer $TOKEN" | jq '.tiles[0].id'

# Plant crop
curl -X POST http://localhost:3001/api/game/farm/plant \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"farmTileId":"TILE_ID","cropType":"wheat"}'

# Wait ~2 minutes, then harvest
curl -X POST http://localhost:3001/api/game/farm/harvest \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"cropId":"CROP_ID"}'
```

3. **Trade Test**
```bash
# Create 2 accounts (use different emails)
# Account 1: Plant & harvest wheat
# Account 2: Buy wheat from marketplace
# Then trade: Account 1 sends wheat for eggs
```

4. **Check Leaderboards**
```bash
curl http://localhost:3001/api/social/leaderboards/top-players | jq .
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Not enough coins"
}
```

Common errors:
- `401 Unauthorized` - Invalid/missing token
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Already exists
- `500 Internal Server Error` - Server issue
