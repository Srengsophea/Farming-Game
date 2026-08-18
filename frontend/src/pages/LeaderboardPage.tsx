import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';

const API_BASE = 'http://localhost:3001/api';

interface LeaderboardPlayer {
  id: string;
  username: string;
  level: number;
  farm_level?: number;
  coins?: number;
  player_xp?: number;
}

type LeaderboardType = 'top-players' | 'top-farms' | 'wealthiest' | 'most-crops' | 'most-trades';

export const LeaderboardPage: React.FC = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeaderboardType>('top-players');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/social/leaderboards/${activeTab}?limit=50&offset=0`
      );
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'top-players' as LeaderboardType, label: '👑 Top Players' },
    { id: 'top-farms' as LeaderboardType, label: '🌾 Top Farms' },
    { id: 'wealthiest' as LeaderboardType, label: '💰 Wealthiest' },
    { id: 'most-crops' as LeaderboardType, label: '🌱 Most Crops' },
    { id: 'most-trades' as LeaderboardType, label: '🤝 Most Trades' }
  ];

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>🏆</span> Valley Hall of Fame
          </h1>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 font-semibold text-sm">Loading rankings...</div>
          ) : players.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-semibold text-sm">
              No players ranked on this board yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {players.map((p, index) => (
                <div
                  key={p.id || index}
                  className={`p-4 flex items-center justify-between transition ${
                    index === 0
                      ? 'bg-amber-50/50'
                      : index === 1
                      ? 'bg-slate-50/70'
                      : index === 2
                      ? 'bg-orange-50/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center text-lg font-black text-gray-700">
                      {getMedalEmoji(index + 1)}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-gray-800">{p.username}</div>
                      <div className="text-xs text-gray-400">Player Lv.{p.level}</div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-bold">
                    {activeTab === 'wealthiest' && (
                      <span className="text-amber-600 text-sm">🪙 {p.coins?.toLocaleString() ?? 0}</span>
                    )}
                    {activeTab === 'top-farms' && (
                      <span className="text-teal-700 text-sm">Farm Lv. {p.farm_level ?? 1}</span>
                    )}
                    {(activeTab === 'top-players' || activeTab === 'most-crops' || activeTab === 'most-trades') && (
                      <span className="text-emerald-700 text-sm">Level {p.level}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
