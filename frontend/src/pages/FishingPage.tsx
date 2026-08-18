import React, { useState } from 'react';
import { farmingApi, authApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';
import { ToastContainer, ToastData } from '../components/Toast';
import { RewardModal, RewardModalData } from '../components/RewardModal';

interface Fish {
  id: string;
  name: string;
  rarity: string;
  sellPrice: number;
  xpReward: number;
}

const FISH_ICONS: Record<string, string> = {
  carp: '🐟',
  bass: '🐠',
  salmon: '🍣',
  trout: '🐡',
  catfish: '🦈',
  sturgeon: '🐬',
  legendary_koi: '✨🐠'
};

export const FishingPage: React.FC = () => {
  const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
  const [isFishing, setIsFishing] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);
  const { player, setPlayer } = useGameStore();

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFish = async () => {
    setIsFishing(true);
    try {
      const response = await farmingApi.fish();
      const fish: Fish = response.data.fish;
      setCaughtFish(fish);

      const meRes = await authApi.getMe().catch(() => null);
      if (meRes?.data?.player) {
        setPlayer(meRes.data.player);
      }

      setRewardModal({
        title: 'Huge Catch!',
        subtitle: 'You reeled in a fresh aquatic catch from the lake!',
        itemName: fish.name,
        icon: FISH_ICONS[fish.id] || '🐟',
        rarity: fish.rarity,
        coinsEarned: fish.sellPrice,
        xpEarned: fish.xpReward,
        energyUsed: 10
      });

      addToast({
        type: 'reward',
        title: `Caught ${fish.name}!`,
        message: `+1x ${fish.name} added to your Inventory`,
        icon: FISH_ICONS[fish.id] || '🐟',
        coins: fish.sellPrice,
        xp: fish.xpReward
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Fishing Failed',
        message: err.response?.data?.error || 'You need at least 10 Energy (⚡) to cast your line!',
        icon: '⚡'
      });
    } finally {
      setIsFishing(false);
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
              <span>🎣</span> Emerald Lake Fishery
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Cast your fishing line into shimmering waters and reel in prized fish
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fishing Pier */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="bg-gradient-to-b from-sky-500 via-blue-600 to-indigo-800 rounded-3xl p-10 text-center text-white shadow-xl relative overflow-hidden">
              {/* Animated waves background */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/30 rounded-full blur-3xl" />
              <div className="text-8xl mb-4 transform hover:scale-110 transition cursor-pointer select-none">
                {isFishing ? '🌊' : '🎣'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-1">Whispering Lake Pier</h2>
              <p className="text-sky-100 text-xs font-semibold max-w-md mx-auto">
                Cost: 10 Energy (⚡) per cast • Watch the bobber ripple and reel in rare legendary koi!
              </p>
            </div>

            <button
              onClick={handleFish}
              disabled={isFishing || (player?.energy ?? 100) < 10}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl transition shadow-lg shadow-blue-600/30 text-base flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>{isFishing ? '⏳' : '🎣'}</span>
              <span>{isFishing ? 'Reeling in fish...' : 'Cast Line (10 Energy)'}</span>
            </button>

            {caughtFish && (
              <div className="p-5 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-3xl text-center space-y-2 animate-popup shadow-md">
                <div className="text-[11px] font-black uppercase text-blue-800 tracking-wider">🎉 Fish Caught!</div>
                <div className="text-5xl">{FISH_ICONS[caughtFish.id] || '🐟'}</div>
                <div className="text-xl font-black text-slate-900">{caughtFish.name}</div>
                <div className="flex justify-center gap-4 text-xs font-black pt-1">
                  <span className="text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">🪙 Value: {caughtFish.sellPrice}</span>
                  <span className="text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">⭐ Reward: +{caughtFish.xpReward} XP</span>
                  <span className="capitalize text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg">{caughtFish.rarity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Lake Fish Species Catalog */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-slate-800">Lake Species</h2>
            <div className="space-y-2.5">
              {[
                { name: 'Common Carp', rarity: 'common', price: 15, xp: 5, icon: '🐟' },
                { name: 'Black Bass', rarity: 'uncommon', price: 35, xp: 12, icon: '🐠' },
                { name: 'Wild Salmon', rarity: 'uncommon', price: 45, xp: 15, icon: '🍣' },
                { name: 'Rainbow Trout', rarity: 'rare', price: 80, xp: 25, icon: '🐡' },
                { name: 'Catfish', rarity: 'rare', price: 100, xp: 35, icon: '🦈' },
                { name: 'Giant Sturgeon', rarity: 'epic', price: 200, xp: 60, icon: '🐬' },
                { name: 'Legendary Koi', rarity: 'legendary', price: 500, xp: 150, icon: '✨🐠' }
              ].map((f) => (
                <div
                  key={f.name}
                  className="border border-slate-150 bg-slate-50/70 p-3 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{f.icon}</span>
                    <div>
                      <div className="font-black text-slate-900">{f.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold capitalize">{f.rarity}</div>
                    </div>
                  </div>
                  <div className="text-right font-black">
                    <div className="text-amber-600">🪙 {f.price}</div>
                    <div className="text-[10px] text-slate-400">+{f.xp} XP</div>
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
