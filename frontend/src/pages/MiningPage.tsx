import React, { useEffect, useState } from 'react';
import { farmingApi, authApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';
import { ToastContainer, ToastData } from '../components/Toast';
import { RewardModal, RewardModalData } from '../components/RewardModal';

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
  const [isStriking, setIsStriking] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);
  const { player, setPlayer } = useGameStore();

  useEffect(() => {
    loadOres();
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
    setIsStriking(true);
    try {
      const response = await farmingApi.mine();
      const ore: Ore = response.data.minedOre;
      setMinedOre(ore);

      const meRes = await authApi.getMe().catch(() => null);
      if (meRes?.data?.player) {
        setPlayer(meRes.data.player);
      }

      setRewardModal({
        title: 'Rare Mineral Discovered!',
        subtitle: 'The cavern wall crumbled to reveal a treasure!',
        itemName: ore.name,
        icon: ORE_ICONS[ore.id] || '🪨',
        rarity: ore.rarity,
        coinsEarned: ore.sellPrice,
        xpEarned: ore.xpReward,
        energyUsed: 15
      });

      addToast({
        type: 'reward',
        title: `Mined ${ore.name}!`,
        message: `+1x ${ore.name} added to your Inventory`,
        icon: ORE_ICONS[ore.id] || '🪨',
        coins: ore.sellPrice,
        xp: ore.xpReward
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Mining Failed',
        message: err.response?.data?.error || 'You need at least 15 Energy (⚡) to strike rock!',
        icon: '⚡'
      });
    } finally {
      setIsMining(false);
      setTimeout(() => setIsStriking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <RewardModal data={rewardModal} onClose={() => setRewardModal(null)} />

      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
              <span>⛏️</span> The Deep Cave Mines
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Excavate hidden gems, precious crystals, and valuable metals deep in the quarry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mining Area */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div
              className={`bg-gradient-to-b from-slate-800 via-zinc-900 to-black rounded-3xl p-10 text-center text-white shadow-xl relative overflow-hidden transition-transform duration-200 ${
                isStriking ? 'animate-shake' : ''
              }`}
            >
              {/* Glowing crystal background effects */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

              <div className="text-8xl mb-4 transform hover:scale-110 transition cursor-pointer select-none">
                {isMining ? '💥' : '⛏️'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-1">Deep Cavern Shaft</h2>
              <p className="text-slate-300 text-xs font-semibold max-w-md mx-auto">
                Cost: 15 Energy (⚡) per strike • Strike deep into bedrock to discover rare diamonds and gold!
              </p>
            </div>

            <button
              onClick={handleMine}
              disabled={isMining || (player?.energy ?? 100) < 15}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl transition shadow-lg shadow-amber-600/30 text-base flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>{isMining ? '⏳' : '⛏️'}</span>
              <span>{isMining ? 'Excavating rocks...' : 'Strike Rock (15 Energy)'}</span>
            </button>

            {minedOre && (
              <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-3xl text-center space-y-2 animate-popup shadow-md">
                <div className="text-[11px] font-black uppercase text-amber-800 tracking-wider">🎉 Vein Discovered!</div>
                <div className="text-5xl">{ORE_ICONS[minedOre.id] || '🪨'}</div>
                <div className="text-xl font-black text-slate-900">{minedOre.name}</div>
                <div className="flex justify-center gap-4 text-xs font-black pt-1">
                  <span className="text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">🪙 Value: {minedOre.sellPrice}</span>
                  <span className="text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">⭐ Reward: +{minedOre.xpReward} XP</span>
                  <span className="capitalize text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg">{minedOre.rarity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Available Ores Catalog */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-slate-800">Quarry Catalog ({ores.length})</h2>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {ores.map((o) => (
                <div
                  key={o.id}
                  className="border border-slate-150 bg-slate-50/70 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ORE_ICONS[o.id] || '🪨'}</span>
                    <div>
                      <div className="font-black text-slate-900">{o.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold capitalize">{o.rarity} • Lv.{o.minLevel}+</div>
                    </div>
                  </div>
                  <div className="text-right font-black">
                    <div className="text-amber-600">🪙 {o.sellPrice}</div>
                    <div className="text-[10px] text-slate-400">+{o.xpReward} XP</div>
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
