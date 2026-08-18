import React, { useEffect, useState } from 'react';
import { farmingApi } from '../services/api';
import { Navbar } from '../components/Navbar';
import { ToastContainer, ToastData } from '../components/Toast';
import { RewardModal, RewardModalData } from '../components/RewardModal';

interface Recipe {
  id: string;
  name: string;
  category: string;
  inputs: Record<string, number>;
  output: string;
  outputQuantity: number;
  xpReward: number;
}

const ITEM_ICONS: Record<string, string> = {
  bread: '🍞',
  flour: '🥡',
  cheese: '🧀',
  butter: '🧈',
  cake: '🎂',
  egg: '🥚',
  milk: '🥛',
  wheat: '🌾',
  corn: '🌽',
  sugar: '🍬',
  honey: '🍯'
};

export const CraftingPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isCrafting, setIsCrafting] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadRecipes = async () => {
    try {
      const res = await farmingApi.getRecipes();
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.error('Error loading recipes:', err);
    }
  };

  const handleCraft = async (recipe: Recipe) => {
    setIsCrafting(recipe.id);
    try {
      await farmingApi.craft(recipe.id);

      setRewardModal({
        title: 'Crafting Complete!',
        subtitle: 'You processed your farm harvests into an artisan product!',
        itemName: `${recipe.outputQuantity}x ${recipe.name}`,
        icon: ITEM_ICONS[recipe.output] || '🧁',
        xpEarned: recipe.xpReward,
        rarity: 'Handcrafted'
      });

      addToast({
        type: 'reward',
        title: `Crafted ${recipe.name}!`,
        message: `+${recipe.outputQuantity}x ${recipe.output} added to your Inventory`,
        icon: ITEM_ICONS[recipe.output] || '🧁',
        xp: recipe.xpReward
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Crafting Failed',
        message: err.response?.data?.error || 'Missing required ingredients in your Inventory!',
        icon: '⚠️'
      });
    } finally {
      setIsCrafting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <RewardModal data={rewardModal} onClose={() => setRewardModal(null)} />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
              <span>🔨</span> Artisan Crafting Kitchen
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Transform your raw farm harvest into delicious baked goods and artisan products
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-tr from-amber-100 to-yellow-50 border border-amber-300 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                    {ITEM_ICONS[recipe.output] || '📦'}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{recipe.name}</h3>
                    <div className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                      Yield: {recipe.outputQuantity}x {recipe.output}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 mb-5 space-y-2">
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Required Ingredients:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(recipe.inputs).map(([item, qty]) => (
                      <span
                        key={item}
                        className="bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>{ITEM_ICONS[item] || '🌱'}</span>
                        <span className="capitalize">{item}</span>
                        <span className="text-emerald-700 font-black">×{qty}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-black px-1">
                  <span className="text-emerald-700">⭐ Reward: +{recipe.xpReward} XP</span>
                  <span className="text-slate-400 capitalize">{recipe.category}</span>
                </div>

                <button
                  onClick={() => handleCraft(recipe)}
                  disabled={isCrafting === recipe.id}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black py-3 px-4 rounded-2xl transition shadow-lg shadow-amber-600/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>{isCrafting === recipe.id ? '⏳' : '🔨'}</span>
                  <span>{isCrafting === recipe.id ? 'Crafting...' : 'Craft Recipe'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
