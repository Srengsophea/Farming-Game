import React from 'react';

export interface RewardModalData {
  title: string;
  subtitle?: string;
  icon: string;
  itemName?: string;
  rarity?: string;
  coinsEarned?: number;
  xpEarned?: number;
  energyUsed?: number;
  type?: 'harvest' | 'mine' | 'fish' | 'craft' | 'levelup';
}

interface RewardModalProps {
  data: RewardModalData | null;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-modal-backdrop">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center animate-popup relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-200 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-200 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Big Animated Icon */}
        <div className="relative mx-auto mb-4 w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-100 via-yellow-50 to-emerald-100 border-2 border-amber-300 flex items-center justify-center text-6xl shadow-lg transform hover:scale-105 transition-transform">
          <span className="animate-bounce">{data.icon}</span>
        </div>

        {/* Header */}
        <div className="text-xs font-black uppercase text-amber-700 tracking-wider mb-1">
          {data.title}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-1">
          {data.itemName || 'Reward Collected!'}
        </h3>
        {data.subtitle && (
          <p className="text-xs text-slate-500 font-medium mb-4">{data.subtitle}</p>
        )}

        {/* Rarity Pill if available */}
        {data.rarity && (
          <div className="mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                data.rarity === 'epic'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : data.rarity === 'rare'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : data.rarity === 'uncommon'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              ⭐ {data.rarity} Rarity
            </span>
          </div>
        )}

        {/* Reward Chips Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-4 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
          {data.coinsEarned !== undefined && (
            <div className="bg-amber-100/70 border border-amber-300/80 p-2.5 rounded-xl text-center">
              <div className="text-[10px] uppercase font-bold text-amber-800">Coins Gained</div>
              <div className="text-lg font-black text-amber-900 mt-0.5">🪙 +{data.coinsEarned}</div>
            </div>
          )}
          {data.xpEarned !== undefined && (
            <div className="bg-emerald-100/70 border border-emerald-300/80 p-2.5 rounded-xl text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Farm XP</div>
              <div className="text-lg font-black text-emerald-900 mt-0.5">⭐ +{data.xpEarned}</div>
            </div>
          )}
          {data.energyUsed !== undefined && (
            <div className="bg-blue-100/70 border border-blue-300/80 p-2.5 rounded-xl text-center col-span-2">
              <div className="text-[10px] uppercase font-bold text-blue-800">Energy Consumed</div>
              <div className="text-sm font-black text-blue-900 mt-0.5">⚡ -{data.energyUsed} Energy</div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition duration-150 text-sm"
        >
          Collect & Continue ✨
        </button>
      </div>
    </div>
  );
};
