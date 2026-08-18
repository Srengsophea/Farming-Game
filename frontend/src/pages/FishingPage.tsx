import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

interface Fish {
  id: string;
  name: string;
  rarity: string;
  sellPrice: number;
  xpReward: number;
  catchChance: number;
}

export const FishingPage: React.FC = () => {
  const [fish, setFish] = useState<Fish[]>([]);
  const [caughtFish, setCaughtFish] = useState<Fish | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFishing, setIsFishing] = useState(false);

  const handleFish = async () => {
    setIsFishing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/game/fishing/fish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaughtFish(response.data.caughtFish);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to fish');
    } finally {
      setIsFishing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🎣 Fishing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <div className="bg-gradient-to-b from-sky-200 to-blue-400 rounded-lg p-12 text-center mb-6">
            <div className="text-6xl mb-4">🌊</div>
            <div className="text-xl font-bold text-blue-900">The Great Lake</div>
          </div>

          <button
            onClick={handleFish}
            disabled={isFishing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition disabled:opacity-50 text-lg"
          >
            {isFishing ? '🎣 Fishing...' : '🎣 Cast Line'}
          </button>

          {caughtFish && (
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center">
              <div className="text-2xl mb-2">🎉 You caught something!</div>
              <div className="text-4xl mb-2">🐟</div>
              <div className="text-2xl font-bold text-orange-600">{caughtFish.name}</div>
              <div className={`text-sm font-semibold mt-2 ${
                caughtFish.rarity === 'epic' ? 'text-purple-600' :
                caughtFish.rarity === 'rare' ? 'text-blue-600' :
                caughtFish.rarity === 'uncommon' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {caughtFish.rarity.toUpperCase()}
              </div>
              <div className="mt-3 text-sm">
                <div>Value: {caughtFish.sellPrice} 🪙</div>
                <div>XP: +{caughtFish.xpReward}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Fish Guide</h2>
          <div className="space-y-3 text-sm">
            <div className="border-b pb-2">
              <div className="font-bold">Common</div>
              <div className="text-gray-600">Carp, Catfish</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Uncommon</div>
              <div className="text-gray-600">Trout, Salmon</div>
            </div>
            <div className="border-b pb-2">
              <div className="font-bold">Rare</div>
              <div className="text-gray-600">Bass, Koi</div>
            </div>
            <div className="pb-2">
              <div className="font-bold">Epic</div>
              <div className="text-gray-600">Golden Fish</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <div className="text-xs font-semibold mb-1">💡 Tip</div>
            <div className="text-xs text-gray-700">Fishing requires 10 energy per cast. Rarer fish are harder to catch!</div>
          </div>
        </div>
      </div>
    </div>
  );
};
