import { describe, it, expect } from 'vitest';
import {
  CropTypeSchema,
  AnimalTypeSchema,
  BuildingTypeSchema,
  ItemTypeSchema,
  PlayerStatsSchema,
  InventoryItemSchema,
  CropStateSchema,
  AnimalStateSchema,
  FarmTileSchema,
  WebSocketMessageSchema
} from './index';

describe('Shared Schemas & Types', () => {
  it('validates CropTypeSchema', () => {
    expect(CropTypeSchema.parse('wheat')).toBe('wheat');
    expect(CropTypeSchema.parse('pumpkin')).toBe('pumpkin');
    expect(() => CropTypeSchema.parse('unknown_crop')).toThrow();
  });

  it('validates AnimalTypeSchema', () => {
    expect(AnimalTypeSchema.parse('chicken')).toBe('chicken');
    expect(AnimalTypeSchema.parse('cow')).toBe('cow');
    expect(() => AnimalTypeSchema.parse('dragon')).toThrow();
  });

  it('validates BuildingTypeSchema', () => {
    expect(BuildingTypeSchema.parse('farmhouse')).toBe('farmhouse');
    expect(BuildingTypeSchema.parse('barn')).toBe('barn');
    expect(() => BuildingTypeSchema.parse('skyscraper')).toThrow();
  });

  it('validates ItemTypeSchema', () => {
    expect(ItemTypeSchema.parse('seed')).toBe('seed');
    expect(ItemTypeSchema.parse('crafted_product')).toBe('crafted_product');
    expect(() => ItemTypeSchema.parse('invalid')).toThrow();
  });

  it('validates PlayerStatsSchema', () => {
    const validStats = {
      level: 5,
      farmLevel: 2,
      playerXp: 450,
      farmXp: 120,
      coins: 1000,
      gems: 10,
      energy: 90
    };
    expect(PlayerStatsSchema.parse(validStats)).toEqual(validStats);
    expect(() => PlayerStatsSchema.parse({ level: 'invalid' })).toThrow();
  });

  it('validates InventoryItemSchema', () => {
    const item = {
      itemId: 'wheat_seed',
      quantity: 10,
      rarity: 'common'
    };
    expect(InventoryItemSchema.parse(item)).toEqual(item);
    expect(() => InventoryItemSchema.parse({ itemId: 'wheat_seed', quantity: -1, rarity: 'common' })).toThrow();
  });

  it('validates CropStateSchema', () => {
    const crop = {
      id: 'crop-123',
      farmTileId: 'tile-456',
      cropType: 'wheat',
      plantedAt: Date.now(),
      stage: 1,
      watered: true,
      fertilized: false
    };
    expect(CropStateSchema.parse(crop)).toEqual(crop);
  });

  it('validates AnimalStateSchema', () => {
    const animal = {
      id: 'animal-1',
      animalType: 'cow',
      hunger: 80,
      happiness: 90,
      health: 100,
      lastProductCollectedAt: Date.now(),
      friendshipLevel: 3,
      age: 5
    };
    expect(AnimalStateSchema.parse(animal)).toEqual(animal);
  });

  it('validates FarmTileSchema', () => {
    const tile = {
      id: 'tile-1',
      gridX: 0,
      gridY: 0,
      type: 'soil',
      tilled: true,
      watered: false
    };
    expect(FarmTileSchema.parse(tile)).toEqual(tile);
  });

  it('validates WebSocketMessageSchema', () => {
    const joinMsg = { type: 'join_farm', farmId: 'farm-101' };
    const chatMsg = { type: 'chat', message: 'Hello farm!', channel: 'global' };
    expect(WebSocketMessageSchema.parse(joinMsg)).toEqual(joinMsg);
    expect(WebSocketMessageSchema.parse(chatMsg)).toEqual(chatMsg);
    expect(() => WebSocketMessageSchema.parse({ type: 'invalid_type' })).toThrow();
  });
});
