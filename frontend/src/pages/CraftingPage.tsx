import React, { useEffect, useState } from 'react';
import { farmingApi } from '../services/api';
import { Navbar } from '../components/Navbar';

interface Recipe {
  id: string;
  ingredients: Record<string, number>;
  output: string;
  outputQuantity: number;
  craftTimeMs: number;
  xpReward: number;
}

const RECIPE_ICONS: Record<string, string> = {
  bread: '🍞',
  cheese: '🧀',
  cake: '🍰'
};

export const CraftingPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await farmingApi.getRecipes();
      setRecipes(response.data.recipes || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCraft = async (recipeId: string) => {
    setIsCrafting(true);
    try {
      await farmingApi.craftItem(recipeId);
      setStatusMsg(`Successfully crafted ${recipeId}! ✨`);
      setTimeout(() => setStatusMsg(null), 3000);
      setSelectedRecipe(null);
    } catch (error: any) {
      setStatusMsg(error.response?.data?.error || 'Not enough ingredients in inventory');
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setIsCrafting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="p-8 text-center text-gray-500 font-semibold">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>🔨</span> Artisan Crafting
          </h1>
        </div>

        {statusMsg && (
          <div className="bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-md text-sm font-semibold animate-fade-in">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Available Recipes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`border rounded-2xl p-5 text-left transition-all flex flex-col justify-between ${
                    selectedRecipe?.id === recipe.id
                      ? 'border-emerald-600 ring-2 ring-emerald-300 bg-emerald-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-md bg-white'
                  }`}
                >
                  <div>
                    <div className="text-4xl mb-2">{RECIPE_ICONS[recipe.output] || '📦'}</div>
                    <div className="font-extrabold text-base text-gray-800 capitalize">{recipe.output}</div>
                    <div className="text-xs text-gray-500 mt-1">Reward: +{recipe.xpReward} Farm XP</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-600">
                    Ingredients: {Object.entries(recipe.ingredients).map(([k, v]) => `${v}x ${k}`).join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 h-fit">
            <h2 className="text-lg font-bold text-gray-800">Craft Item</h2>
            {selectedRecipe ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                  <div className="text-5xl mb-2">{RECIPE_ICONS[selectedRecipe.output] || '📦'}</div>
                  <div className="font-black text-xl text-emerald-900 capitalize">{selectedRecipe.output}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">Output: {selectedRecipe.outputQuantity}x item</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-700 uppercase">Required Ingredients:</div>
                  <div className="space-y-1">
                    {Object.entries(selectedRecipe.ingredients).map(([item, qty]) => (
                      <div key={item} className="flex justify-between text-xs bg-slate-50 p-2 rounded-lg font-semibold">
                        <span className="capitalize">{item}</span>
                        <span className="text-emerald-700 font-bold">{qty}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCraft(selectedRecipe.id)}
                  disabled={isCrafting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  {isCrafting ? 'Crafting in progress...' : `Craft ${selectedRecipe.output}`}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs font-semibold">
                Select a recipe from the list to start crafting
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
