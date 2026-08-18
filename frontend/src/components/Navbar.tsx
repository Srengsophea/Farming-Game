import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';

export const Navbar: React.FC = () => {
  const { player, logout } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/game', label: 'Farm', icon: '🚜' },
    { to: '/inventory', label: 'Inventory', icon: '🎒' },
    { to: '/marketplace', label: 'Market', icon: '🏪' },
    { to: '/crafting', label: 'Crafting', icon: '🔨' },
    { to: '/fishing', label: 'Fishing', icon: '🎣' },
    { to: '/mining', label: 'Mining', icon: '⛏️' },
    { to: '/friends', label: 'Friends', icon: '👥' },
    { to: '/leaderboard', label: 'Ranks', icon: '🏆' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🌾</span>
            <span className="text-xl font-black bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Harvest Valley
            </span>
          </div>

          {/* Navigation links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                      : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                  }`
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Player stats & profile */}
          <div className="flex items-center gap-3">
            {/* Stats badges */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner">
              <span className="text-green-700 font-extrabold flex items-center gap-1">
                ⭐ Lv.{player?.level ?? 1}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-amber-600 flex items-center gap-1">
                🪙 {player?.coins?.toLocaleString() ?? 0}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-purple-600 flex items-center gap-1">
                💎 {player?.gems ?? 0}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600 flex items-center gap-1">
                ⚡ {player?.energy ?? 100}/100
              </span>
            </div>

            {/* User info & Logout */}
            <div className="flex items-center gap-2 pl-2">
              <span className="font-semibold text-sm text-gray-700 hidden md:inline">
                {player?.username}
              </span>
              <button
                onClick={handleLogout}
                title="Logout"
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-200 hover:border-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary nav row */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-50'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
