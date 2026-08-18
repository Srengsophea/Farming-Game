import { describe, it, expect } from 'vitest';
import CraftingService from './services/CraftingService';
import FishingService from './services/FishingService';
import MiningService from './services/MiningService';

describe('Backend Services Unit Tests', () => {
  describe('CraftingService', () => {
    it('returns all recipes', () => {
      const recipes = CraftingService.getRecipes();
      expect(recipes).toBeDefined();
      expect(recipes.length).toBeGreaterThan(0);
      expect(recipes.find(r => r.id === 'bread')).toBeDefined();
    });

    it('returns a specific recipe by ID', () => {
      const breadRecipe = CraftingService.getRecipe('bread');
      expect(breadRecipe).toBeDefined();
      expect(breadRecipe?.output).toBe('bread');
      expect(breadRecipe?.ingredients).toEqual({ wheat: 3 });
    });

    it('returns undefined for non-existent recipe', () => {
      const invalid = CraftingService.getRecipe('non_existent');
      expect(invalid).toBeUndefined();
    });
  });

  describe('FishingService', () => {
    it('returns all available fish', () => {
      const fishList = FishingService.getAllFish();
      expect(fishList.length).toBe(7);
      expect(fishList.map(f => f.id)).toContain('carp');
      expect(fishList.map(f => f.id)).toContain('golden_fish');
    });

    it('returns fish data by ID', () => {
      const carp = FishingService.getFishData('carp');
      expect(carp).toBeDefined();
      expect(carp?.name).toBe('Carp');
      expect(carp?.rarity).toBe('common');
    });
  });

  describe('MiningService', () => {
    it('returns all ores', () => {
      const ores = MiningService.getAllOres();
      expect(ores.length).toBe(8);
      expect(ores.map(o => o.id)).toContain('stone');
      expect(ores.map(o => o.id)).toContain('diamond');
    });

    it('filters ores by player level', () => {
      const level1Ores = MiningService.getOres(1);
      expect(level1Ores.map(o => o.id)).toEqual(['stone', 'coal']);

      const level10Ores = MiningService.getOres(10);
      expect(level10Ores.map(o => o.id)).toContain('copper');
      expect(level10Ores.map(o => o.id)).toContain('iron');
      expect(level10Ores.map(o => o.id)).not.toContain('diamond');
    });
  });
});
