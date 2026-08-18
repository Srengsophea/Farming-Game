import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';

export const DashboardPage: React.FC = () => {
  const { player } = useGameStore();
  const navigate = useNavigate();

  const menuItems = [
    { icon: '🌾', label: 'My Farm', path: '/game', desc: 'Plant & harvest 20×20 crops, feed animals' },
    { icon: '🎒', label: 'Inventory', path: '/inventory', desc: 'Browse all collected crops, ores, items' },
    { icon: '🏪', label: 'Marketplace', path: '/marketplace', desc: 'Buy & sell items with player economy' },
    { icon: '🔨', label: 'Crafting', path: '/crafting', desc: 'Bake bread, churn cheese & craft recipes' },
    { icon: '🎣', label: 'Fishing', path: '/fishing', desc: 'Cast line to catch rare & epic fish' },
    { icon: '⛏️', label: 'Mining', path: '/mining', desc: 'Mine stone, iron, gold, & diamonds' },
    { icon: '👥', label: 'Friends', path: '/friends', desc: 'Connect, add friends, trade directly' },
    { icon: '🏆', label: 'Leaderboard', path: '/leaderboard', desc: 'Check rankings & top player scores' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 rounded-3xl p-8 text-white shadow-xl flex flex-wrap justify-between items-center gap-6">
          <div className="space-y-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Farmer Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">Welcome back, {player?.username || 'Farmer'}! 👋</h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              Your farm is flourishing. Plant crops, craft artisan goods, trade with friends, and climb the leaderboard!
            </p>
          </div>
          <button
            onClick={() => navigate('/game')}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            🚜 Go To Farm
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Player Level</div>
            <div className="text-3xl font-black text-emerald-700 mt-1">Lv. {player?.level ?? 1}</div>
            <div className="text-xs text-gray-400 mt-1 font-semibold">{player?.playerXp ?? 0} Player XP</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Farm Level</div>
            <div className="text-3xl font-black text-teal-700 mt-1">Lv. {player?.farmLevel ?? 1}</div>
            <div className="text-xs text-gray-400 mt-1 font-semibold">{player?.farmXp ?? 0} Farm XP</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Gold Coins</div>
            <div className="text-3xl font-black text-amber-600 mt-1">🪙 {player?.coins?.toLocaleString() ?? 0}</div>
            <div className="text-xs text-gray-400 mt-1 font-semibold">Spend on seeds & animals</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Energy Meter</div>
            <div className="text-3xl font-black text-blue-600 mt-1">⚡ {player?.energy ?? 100}/100</div>
            <div className="text-xs text-gray-400 mt-1 font-semibold">For fishing and mining</div>
          </div>
        </div>

        {/* Game Activity Hub */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span>🎮</span> Explore Activities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all p-6 text-left group flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div className="font-extrabold text-base text-gray-800 group-hover:text-emerald-700 transition">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                </div>
                <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Play now <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
