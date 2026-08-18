import pool from '../db/index';
import { v4 as uuidv4 } from 'uuid';

export class CraftingService {
  private readonly RECIPES: Record<string, { ingredients: Record<string, number>; output: string; outputQuantity: number; craftTimeMs: number; xpReward: number }> = {
    bread: {
      ingredients: { wheat: 3 },
      output: 'bread',
      outputQuantity: 1,
      craftTimeMs: 30000,
      xpReward: 10
    },
    cheese: {
      ingredients: { milk: 2 },
      output: 'cheese',
      outputQuantity: 1,
      craftTimeMs: 40000,
      xpReward: 15
    },
    cake: {
      ingredients: { wheat: 2, egg: 2, milk: 1 },
      output: 'cake',
      outputQuantity: 1,
      craftTimeMs: 60000,
      xpReward: 25
    }
  };

  async craft(playerId: string, recipeId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const recipe = this.RECIPES[recipeId];
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      for (const [itemId, required] of Object.entries(recipe.ingredients)) {
        const inventory = await client.query(
          'SELECT quantity FROM inventory WHERE player_id = $1 AND item_id = $2 FOR UPDATE',
          [playerId, itemId]
        );

        if (!inventory.rows[0] || inventory.rows[0].quantity < required) {
          throw new Error(`Not enough ${itemId}`);
        }

        await client.query(
          'UPDATE inventory SET quantity = quantity - $1 WHERE player_id = $2 AND item_id = $3',
          [required, playerId, itemId]
        );
      }

      const existing = await client.query(
        'SELECT id, quantity FROM inventory WHERE player_id = $1 AND item_id = $2',
        [playerId, recipe.output]
      );

      if (existing.rows[0]) {
        await client.query(
          'UPDATE inventory SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE player_id = $2 AND item_id = $3',
          [recipe.outputQuantity, playerId, recipe.output]
        );
      } else {
        await client.query(
          'INSERT INTO inventory (id, player_id, item_id, quantity, rarity) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), playerId, recipe.output, recipe.outputQuantity, 'common']
        );
      }

      await client.query(
        'UPDATE players SET farm_xp = farm_xp + $1 WHERE id = $2',
        [recipe.xpReward, playerId]
      );

      await client.query('COMMIT');
      return { success: true, xpReward: recipe.xpReward };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getRecipes() {
    return Object.entries(this.RECIPES).map(([id, recipe]) => ({
      id,
      ...recipe
    }));
  }

  getRecipe(recipeId: string) {
    return this.RECIPES[recipeId];
  }
}

export default new CraftingService();
