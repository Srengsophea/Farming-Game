import React, { useEffect, useState } from 'react';
import { farmingApi, authApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';

interface Ore {
  id: string;
  name: string;
  rarity: string;
  sellPrice: number;
  xpReward: number;
  minLevel: number;
}

const ORE_ICONS: Record<string, string> = {
  stone: '🪨',
  coal: '⚫',
  copper: '🟤',
  iron: '⛏️',
  silver: '🥈',
  gold: '🪙',
  emerald: '💚',
  diamond: '💎'
};

export const MiningPage: React.FC = () => {
  const [ores, setOres] = useState<Ore[]>([]);
  const [minedOre, setMinedOre] = useState<Ore | null>(null);
  const [isMining, setIsMining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { player, setPlayer } = useGameStore();

  useEffect(() => {
    loadOres();
  }, []);

  const loadOres = async () => {
    try {
      const res = await farmingApi.getOres();
      setOres(res.data.ores || []);
    } catch (err) {
      console.error('Error loading ores:', err);
    }
  };

  const handleMine = async () => {
    setIsMining(true);
    setError(null);
    try {
      const response = await farmingApi.mine();
      setMinedOre(response.data.minedOre);
      const meRes = await authApi.getMe().catch(() => null);
      if (meRes?.data?.player) {
        setPlayer(meRes.data.player);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mine. Need at least 15 Energy!');
    } finally {
      setIsMining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>⛏️</span> The Deep Cave Mines
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mining Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="bg-gradient-to-b from-slate-700 via-gray-800 to-zinc-900 rounded-2xl p-10 text-center text-white shadow-md relative overflow-hidden">
              <div className="text-7xl mb-3 animate-pulse">⛏️</div>
              <h2 className="text-2xl font-black mb-1">Deep Cavern Shaft</h2>
              <p className="text-slate-300 text-xs font-semibold">
                Cost: 15 Energy (⚡) per strike • Unlock rare gems as you level up!
              </p>
            </div>

            <button
              onClick={handleMine}
              disabled={isMining || (player?.energy ?? 100) < 15}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold py-4 px-6 rounded-2xl transition shadow-md text-base flex items-center justify-center gap-2"
            >
              <span>{isMining ? '⏳' : '⛏️'}</span>
              <span>{isMining ? 'Excavating rocks...' : 'Strike Rock (15 Energy)'}</span>
            </button>

            {minedOre && (
              <div className="p-6 bg-amber-50/80 border-2 border-amber-300 rounded-2xl text-center space-y-2 animate-fade-in shadow-sm">
                <div className="text-xs font-black uppercase text-amber-800 tracking-wider">🎉 Vein Discovered!</div>
                <div className="text-5xl">{ORE_ICONS[minedOre.id] || '🪨'}</div>
                <div className="text-xl font-black text-gray-900">{minedOre.name}</div>
                <div className="flex justify-center gap-4 text-xs font-bold pt-1">
                  <span className="text-amber-700">Value: 🪙 {minedOre.sellPrice}</span>
                  <span className="text-emerald-700">Reward: ⭐ +{minedOre.xpReward} XP</span>
                  <span className="capitalize text-blue-700">Rarity: {minedOre.rarity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Available Ores */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-800">Unlocked Veins ({ores.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {ores.map((o) => (
                <div key={o.id} className="border border-gray-100 bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{ORE_ICONS[o.id] || '🪨'}</span>
                    <div>
                      <div className="font-bold text-gray-800">{o.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{o.rarity} • Lv.{o.minLevel}+</div>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    <div className="text-amber-600">🪙 {o.sellPrice}</div>
                    <div className="text-[10px] text-gray-400">+{o.xpReward} XP</div>
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
