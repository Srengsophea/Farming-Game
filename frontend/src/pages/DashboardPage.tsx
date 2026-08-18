import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';

export const DashboardPage: React.FC = () => {
  const { player, logout } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '🌾', label: 'My Farm', path: '/game', desc: 'Manage crops & animals' },
    { icon: '🎒', label: 'Inventory', path: '/inventory', desc: 'View your items' },
    { icon: '🏪', label: 'Marketplace', path: '/marketplace', desc: 'Buy & sell items' },
    { icon: '👥', label: 'Friends', path: '/friends', desc: 'Connect with players' },
    { icon: '🔨', label: 'Crafting', path: '/crafting', desc: 'Craft items' },
    { icon: '🎣', label: 'Fishing', path: '/fishing', desc: 'Catch fish' },
    { icon: '⛏️', label: 'Mining', path: '/mining', desc: 'Mine ore' },
    { icon: '🎯', label: 'Quests', path: '/quests', desc: 'Complete quests' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-700">🌾 Harvest Valley</h1>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Level</span>
                <span className="font-bold text-lg text-green-700">{player?.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Coins</span>
                <span className="font-bold text-yellow-600">{player?.coins}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Gems</span>
                <span className="font-bold text-purple-600">{player?.gems}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">{player?.username}</div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {player?.username}!</h2>
          <p className="text-gray-600">Choose what you'd like to do next</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 text-left hover:bg-green-50"
            >
              <div className="text-5xl mb-3">{item.icon}</div>
              <div className="font-bold text-lg mb-1">{item.label}</div>
              <div className="text-sm text-gray-600">{item.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Player Level</div>
            <div className="text-4xl font-bold text-green-700">{player?.level}</div>
            <div className="text-xs text-gray-500 mt-2">{player?.playerXp || 0} XP</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Farm Level</div>
            <div className="text-4xl font-bold text-blue-700">{player?.farmLevel}</div>
            <div className="text-xs text-gray-500 mt-2">{player?.farmXp || 0} Farm XP</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Coins</div>
            <div className="text-4xl font-bold text-yellow-600">{player?.coins}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Energy</div>
            <div className="text-4xl font-bold text-blue-600">{player?.energy}/100</div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="border-l-4 border-green-600 pl-4">
              <div className="font-bold mb-1">Step 1: Start Farming</div>
              <div className="text-gray-600">Head to your farm and plant some crops. They'll grow over time!</div>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <div className="font-bold mb-1">Step 2: Explore Activities</div>
              <div className="text-gray-600">Try fishing, mining, or crafting to earn more items and XP.</div>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <div className="font-bold mb-1">Step 3: Connect & Trade</div>
              <div className="text-gray-600">Find friends, trade items, and explore the marketplace!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
