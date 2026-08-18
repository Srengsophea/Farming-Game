import React, { useEffect, useState } from 'react';
import { socialApi } from '../services/api';
import { Navbar } from '../components/Navbar';

interface Friend {
  id: string;
  username: string;
  level: number;
  farmLevel: number;
}

interface PendingRequest {
  id: string;
  playerId: string;
  username: string;
  level: number;
  requestedAt: string;
}

export const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        socialApi.getFriends(),
        socialApi.getPendingRequests()
      ]);
      const rawFriends = friendsRes.data.friends || [];
      const normalizedFriends: Friend[] = rawFriends.map((f: any) => ({
        id: f.id,
        username: f.username,
        level: f.level,
        farmLevel: f.farm_level || f.farmLevel || 1
      }));

      const rawRequests = requestsRes.data.requests || [];
      const normalizedRequests: PendingRequest[] = rawRequests.map((r: any) => ({
        id: r.id,
        playerId: r.player_id || r.playerId,
        username: r.username,
        level: r.level,
        requestedAt: r.requested_at || r.requestedAt
      }));

      setFriends(normalizedFriends);
      setPendingRequests(normalizedRequests);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await socialApi.searchPlayers(searchQuery);
      const raw = response.data.players || [];
      const normalized: Friend[] = raw.map((p: any) => ({
        id: p.id,
        username: p.username,
        level: p.level,
        farmLevel: p.farm_level || p.farmLevel || 1
      }));
      setSearchResults(normalized);
    } catch (error) {
      console.error('Error searching players:', error);
    }
  };

  const handleSendFriendRequest = async (targetPlayerId: string) => {
    try {
      await socialApi.sendFriendRequest(targetPlayerId);
      setStatusMsg('Friend request sent! 🤝');
      setTimeout(() => setStatusMsg(null), 3000);
      setSearchResults((prev) => prev.filter((p) => p.id !== targetPlayerId));
    } catch (error: any) {
      setStatusMsg(error.response?.data?.error || 'Failed to send friend request');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await socialApi.acceptFriendRequest(requestId);
      setStatusMsg('Accepted friend request! 🎉');
      setTimeout(() => setStatusMsg(null), 3000);
      await loadFriends();
    } catch (error: any) {
      setStatusMsg(error.response?.data?.error || 'Failed to accept request');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="p-8 text-center text-gray-500 font-semibold">Loading Friends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>👥</span> Friends & Neighbors
          </h1>
        </div>

        {statusMsg && (
          <div className="bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-md text-sm font-semibold animate-fade-in">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Friends list */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  Pending Friend Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white p-3.5 rounded-xl border border-amber-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-800">{req.username}</div>
                        <div className="text-gray-500 text-[11px]">Level {req.level}</div>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends list */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">My Friends ({friends.length})</h2>
              {friends.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs font-semibold">
                  No friends added yet. Search for farmers to connect!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-black text-sm">
                          {friend.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{friend.username}</div>
                          <div className="text-xs text-gray-500">Lv.{friend.level} • Farm Lv.{friend.farmLevel}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Players */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 h-fit">
            <h2 className="text-lg font-bold text-gray-800">Find Farmers</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none bg-slate-50"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow"
              >
                Search
              </button>
            </form>

            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 p-3 rounded-xl flex justify-between items-center text-xs bg-slate-50"
                >
                  <div>
                    <div className="font-bold text-gray-800">{user.username}</div>
                    <div className="text-[11px] text-gray-500">Level {user.level}</div>
                  </div>
                  <button
                    onClick={() => handleSendFriendRequest(user.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-[11px]"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
