import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
        `${API_BASE}/social/leaderboards/${activeTab}?limit=100&offset=0`
      );
      setPlayers(response.data.players);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'top-players' as LeaderboardType, label: '👑 Top Players', icon: '⭐' },
    { id: 'top-farms' as LeaderboardType, label: '🌾 Top Farms', icon: '🏆' },
    { id: 'wealthiest' as LeaderboardType, label: '💰 Wealthiest', icon: '💎' },
    { id: 'most-crops' as LeaderboardType, label: '🌾 Most Crops', icon: '📊' },
    { id: 'most-trades' as LeaderboardType, label: '🤝 Most Trades', icon: '📈' }
  ];

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (isLoading) {
    return <div className="p-6">Loading leaderboard...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🏆 Leaderboards</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No players on this leaderboard yet
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition ${
                  index < 3
                    ? 'bg-yellow-50 border-l-4 border-yellow-500'
                    : 'bg-gray-50 hover:bg-blue-50'
                }`}
              >
                <div className="text-3xl font-bold w-12 text-center">
                  {getMedalEmoji(index + 1)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg">{player.username}</div>
                  <div className="text-sm text-gray-600">Level {player.level}</div>
                </div>
                <div className="text-right">
                  {activeTab === 'top-players' && (
                    <div className="text-lg font-bold text-green-600">{player.player_xp} XP</div>
                  )}
                  {activeTab === 'top-farms' && (
                    <div className="text-lg font-bold text-blue-600">Farm Lv. {player.farm_level}</div>
                  )}
                  {activeTab === 'wealthiest' && (
                    <div className="text-lg font-bold text-yellow-600">{player.coins} 🪙</div>
                  )}
                  {activeTab === 'most-crops' && (
                    <div className="text-lg font-bold text-orange-600">{player.player_xp} crops</div>
                  )}
                  {activeTab === 'most-trades' && (
                    <div className="text-lg font-bold text-purple-600">{player.player_xp} trades</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
