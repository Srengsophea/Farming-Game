import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface Ore {
  id: string;
  name: string;
  rarity: string;
  sellPrice: number;
  xpReward: number;
  minLevel: number;
}

export const MiningPage: React.FC = () => {
  const [ores, setOres] = useState<Ore[]>([]);
  const [minedOre, setMinedOre] = useState<Ore | null>(null);
  const [isMining, setIsMining] = useState(false);

  const handleMine = async () => {
    setIsMining(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/game/mining/mine`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMinedOre(response.data.minedOre);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to mine');
    } finally {
      setIsMining(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">⛏️ Mining</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <div className="bg-gradient-to-b from-gray-400 to-gray-700 rounded-lg p-12 text-center mb-6">
            <div className="text-6xl mb-4">⛏️</div>
            <div className="text-xl font-bold text-white">The Deep Mines</div>
          </div>

          <button
            onClick={handleMine}
            disabled={isMining}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 text-lg"
          >
            {isMining ? '⛏️ Mining...' : '⛏️ Strike Rock'}
          </button>

          {minedOre && (
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center">
              <div className="text-2xl mb-2">🎉 You found ore!</div>
              <div className="text-4xl mb-2">💎</div>
              <div className="text-2xl font-bold text-orange-600">{minedOre.name}</div>
              <div className={`text-sm font-semibold mt-2 ${
                minedOre.rarity === 'epic' ? 'text-purple-600' :
                minedOre.rarity === 'rare' ? 'text-blue-600' :
                minedOre.rarity === 'uncommon' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {minedOre.rarity.toUpperCase()}
              </div>
              <div className="mt-3 text-sm">
                <div>Value: {minedOre.sellPrice} 🪙</div>
                <div>XP: +{minedOre.xpReward}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Ore Guide</h2>
          <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
            <div className="border-b pb-2">
              <div className="font-bold">Level 1+</div>
              <div className="text-gray-600 text-xs">Stone, Coal</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Level 5+</div>
              <div className="text-gray-600 text-xs">Copper Ore</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Level 10+</div>
              <div className="text-gray-600 text-xs">Iron Ore</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Level 15+</div>
              <div className="text-gray-600 text-xs">Silver Ore</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Level 20+</div>
              <div className="text-gray-600 text-xs">Gold Ore</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Level 25+</div>
              <div className="text-gray-600 text-xs">Emerald</div>
            </div>
            <div className="pb-2">
              <div className="font-bold">Level 30+</div>
              <div className="text-gray-600 text-xs">Diamond</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="text-xs font-semibold mb-1">💡 Tip</div>
            <div className="text-xs text-gray-700">Mining requires 15 energy. Higher level = better ores!</div>
          </div>
        </div>
      </div>
    </div>
  );
};
