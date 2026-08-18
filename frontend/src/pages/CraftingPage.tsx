import React, { useEffect, useState } from 'react';
import { farmingApi } from '../services/api';

interface Recipe {
  id: string;
  ingredients: Record<string, number>;
  output: string;
  outputQuantity: number;
  craftTimeMs: number;
  xpReward: number;
}

export const CraftingPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await farmingApi.getRecipes?.() || { data: { recipes: [] } };
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCraft = async (recipeId: string) => {
    setIsCrafting(true);
    try {
      await farmingApi.craftItem?.(recipeId) || Promise.reject('Craft not available');
      alert('Item crafted!');
      setSelectedRecipe(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to craft');
    } finally {
      setIsCrafting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading recipes...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🔨 Crafting</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-2xl font-bold mb-4">Available Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className={`border-2 rounded-lg p-4 text-left transition ${
                  selectedRecipe?.id === recipe.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <div className="font-bold text-lg capitalize">{recipe.output}</div>
                <div className="text-sm text-gray-600 mb-2">
                  Time: {(recipe.craftTimeMs / 1000).toFixed(0)}s
                </div>
                <div className="text-sm">
                  <div className="text-gray-700">Ingredients:</div>
                  {Object.entries(recipe.ingredients).map(([item, qty]) => (
                    <div key={item} className="text-xs text-gray-600 ml-2">
                      • {item} ×{qty}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedRecipe && (
          <div className="bg-white rounded-lg shadow-lg p-4 h-fit">
            <h3 className="text-2xl font-bold mb-4 capitalize">{selectedRecipe.output}</h3>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Ingredients</h4>
              <div className="space-y-2">
                {Object.entries(selectedRecipe.ingredients).map(([item, qty]) => (
                  <div key={item} className="flex justify-between text-sm">
                    <span className="capitalize">{item}</span>
                    <span className="font-bold">×{qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded">
              <div className="text-sm text-gray-700 mb-1">Rewards</div>
              <div className="font-bold">+{selectedRecipe.xpReward} XP</div>
            </div>

            <button
              onClick={() => handleCraft(selectedRecipe.id)}
              disabled={isCrafting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {isCrafting ? 'Crafting...' : 'Start Crafting'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
