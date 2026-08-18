import React, { useEffect, useState } from 'react';
import { farmingApi, authApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';

interface Fish {
  id: string;
  name: string;
  rarity: string;
  sellPrice: number;
  xpReward: number;
  catchChance: number;
}

const FISH_ICONS: Record<string, string> = {
  carp: '🐟',
  catfish: '🐡',
  trout: '🐠',
  salmon: '🐟',
  bass: '🐟',
  koi: '🐠',
  golden_fish: '✨🐟'
};

export const FishingPage: React.FC = () => {
  const [availableFish, setAvailableFish] = useState<Fish[]>([]);
  const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
  const [isFishing, setIsFishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { player, setPlayer } = useGameStore();

  useEffect(() => {
    loadFishList();
  }, []);

  const loadFishList = async () => {
    try {
      const res = await farmingApi.getFish();
      setAvailableFish(res.data.fish || []);
    } catch (err) {
      console.error('Error loading fish list:', err);
    }
  };

  const handleFish = async () => {
    setIsFishing(true);
    setError(null);
    try {
      const response = await farmingApi.fish();
      setCaughtFish(response.data.caughtFish);
      // Refresh player energy / stats
      const meRes = await authApi.getMe().catch(() => null);
      if (meRes?.data?.player) {
        setPlayer(meRes.data.player);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fish. Ensure you have at least 10 Energy!');
    } finally {
      setIsFishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>🎣</span> The Great Lake Fishing
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fishing Zone */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="bg-gradient-to-b from-sky-300 via-blue-500 to-indigo-600 rounded-2xl p-10 text-center text-white shadow-md relative overflow-hidden">
              <div className="text-7xl mb-3 animate-pulse">🌊</div>
              <h2 className="text-2xl font-black mb-1">Mirror Lake</h2>
              <p className="text-sky-100 text-xs font-semibold">
                Cost: 10 Energy (⚡) per cast • Catch chances vary by rarity
              </p>
            </div>

            <button
              onClick={handleFish}
              disabled={isFishing || (player?.energy ?? 100) < 10}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold py-4 px-6 rounded-2xl transition shadow-md text-base flex items-center justify-center gap-2"
            >
              <span>{isFishing ? '⏳' : '🎣'}</span>
              <span>{isFishing ? 'Reeling in fish...' : 'Cast Line (10 Energy)'}</span>
            </button>

            {caughtFish && (
              <div className="p-6 bg-amber-50/80 border-2 border-amber-300 rounded-2xl text-center space-y-2 animate-fade-in shadow-sm">
                <div className="text-xs font-black uppercase text-amber-800 tracking-wider">🎉 Successful Catch!</div>
                <div className="text-5xl">{FISH_ICONS[caughtFish.id] || '🐟'}</div>
                <div className="text-xl font-black text-gray-900">{caughtFish.name}</div>
                <div className="flex justify-center gap-4 text-xs font-bold pt-1">
                  <span className="text-amber-700">Value: 🪙 {caughtFish.sellPrice}</span>
                  <span className="text-emerald-700">Reward: ⭐ +{caughtFish.xpReward} XP</span>
                  <span className="capitalize text-blue-700">Rarity: {caughtFish.rarity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Fish Species List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-800">Lake Species ({availableFish.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {availableFish.map((f) => (
                <div key={f.id} className="border border-gray-100 bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{FISH_ICONS[f.id] || '🐟'}</span>
                    <div>
                      <div className="font-bold text-gray-800">{f.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{f.rarity}</div>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    <div className="text-amber-600">🪙 {f.sellPrice}</div>
                    <div className="text-[10px] text-gray-400">+{f.xpReward} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
