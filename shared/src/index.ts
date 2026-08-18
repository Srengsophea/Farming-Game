import { z } from 'zod';

export const CropTypeSchema = z.enum([
  'wheat', 'corn', 'rice', 'potato', 'carrot', 'tomato', 'cabbage', 'pumpkin',
  'strawberry', 'watermelon', 'sugarcane', 'onion', 'garlic', 'pepper', 'eggplant', 'lettuce'
]);

export type CropType = z.infer<typeof CropTypeSchema>;

export const AnimalTypeSchema = z.enum([
  'chicken', 'cow', 'pig', 'sheep', 'goat', 'duck', 'horse', 'bee'
]);

export type AnimalType = z.infer<typeof AnimalTypeSchema>;

export const BuildingTypeSchema = z.enum([
  'farmhouse', 'barn', 'chicken_coop', 'stable', 'silo', 'warehouse', 'workshop',
  'kitchen', 'bakery', 'mill', 'greenhouse', 'fishing_hut', 'marketplace'
]);

export type BuildingType = z.infer<typeof BuildingTypeSchema>;

export const ItemTypeSchema = z.enum([
  'seed', 'crop', 'animal_product', 'fish', 'material', 'crafted_product', 'tool', 'decoration'
]);

export type ItemType = z.infer<typeof ItemTypeSchema>;

export const SeasonSchema = z.enum(['spring', 'summer', 'autumn', 'winter']);
export type Season = z.infer<typeof SeasonSchema>;

export const WeatherSchema = z.enum(['sunny', 'cloudy', 'rain', 'storm', 'snow', 'fog']);
export type Weather = z.infer<typeof WeatherSchema>;

export interface CropData {
  id: string;
  type: CropType;
  seedPrice: number;
  growthTimeMs: number;
  stages: number;
  sellPrice: number;
  xpReward: number;
  waterRequired: number;
  harvestQuantity: number;
  seasons: Season[];
}

export interface AnimalData {
  id: string;
  type: AnimalType;
  purchasePrice: number;
  productType: string;
  productionIntervalMs: number;
  hungerRatePerHour: number;
  happinessDecayPerHour: number;
}

export interface BuildingData {
  id: string;
  type: BuildingType;
  width: number;
  height: number;
  baseCost: number;
  upgradeMultiplier: number;
  upgradeTimeMs: number;
  capacity: number;
}

export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  icon: string;
  stackable: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export const AuthTokenSchema = z.object({
  userId: z.string(),
  playerId: z.string(),
  iat: z.number(),
  exp: z.number()
});

export type AuthToken = z.infer<typeof AuthTokenSchema>;

export const PlayerStatsSchema = z.object({
  level: z.number(),
  farmLevel: z.number(),
  playerXp: z.number(),
  farmXp: z.number(),
  coins: z.number(),
  gems: z.number(),
  energy: z.number()
});

export type PlayerStats = z.infer<typeof PlayerStatsSchema>;

export const InventoryItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary'])
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const CropStateSchema = z.object({
  id: z.string(),
  farmTileId: z.string(),
  cropType: CropTypeSchema,
  plantedAt: z.number(),
  stage: z.number(),
  watered: z.boolean(),
  fertilized: z.boolean()
});

export type CropState = z.infer<typeof CropStateSchema>;

export const AnimalStateSchema = z.object({
  id: z.string(),
  animalType: AnimalTypeSchema,
  hunger: z.number().min(0).max(100),
  happiness: z.number().min(0).max(100),
  health: z.number().min(0).max(100),
  lastProductCollectedAt: z.number(),
  friendshipLevel: z.number().int(),
  age: z.number()
});

export type AnimalState = z.infer<typeof AnimalStateSchema>;

export const BuildingStateSchema = z.object({
  id: z.string(),
  buildingType: BuildingTypeSchema,
  level: z.number().int().min(1),
  gridX: z.number().int(),
  gridY: z.number().int(),
  rotation: z.enum(['0', '90', '180', '270']),
  completedAt: z.number()
});

export type BuildingState = z.infer<typeof BuildingStateSchema>;

export const FarmTileSchema = z.object({
  id: z.string(),
  gridX: z.number().int(),
  gridY: z.number().int(),
  type: z.enum(['soil', 'grass', 'water', 'stone']),
  tilled: z.boolean(),
  watered: z.boolean().optional(),
  crop: CropStateSchema.optional()
});

export type FarmTile = z.infer<typeof FarmTileSchema>;

export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('join_farm'), farmId: z.string() }),
  z.object({ type: z.literal('leave_farm') }),
  z.object({ type: z.literal('player_move'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('farm_update'), updates: z.record(z.any()) }),
  z.object({ type: z.literal('chat'), message: z.string(), channel: z.string() }),
  z.object({ type: z.literal('trade_request'), targetPlayerId: z.string(), items: z.array(z.string()) })
]);

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

export interface ServerEvent {
  type: string;
  timestamp: number;
  playerId: string;
  data: Record<string, unknown>;
}