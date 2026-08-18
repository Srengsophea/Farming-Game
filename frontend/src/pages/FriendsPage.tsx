import React, { useEffect, useState } from 'react';
import { socialApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';

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
  const { player } = useGameStore();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        socialApi.getFriends(),
        socialApi.getPendingRequests()
      ]);
      setFriends(friendsRes.data.friends);
      setPendingRequests(requestsRes.data.requests);
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
      setSearchResults(response.data.players);
    } catch (error) {
      console.error('Error searching players:', error);
    }
  };

  const handleSendFriendRequest = async (targetPlayerId: string) => {
    try {
      await socialApi.sendFriendRequest(targetPlayerId);
      alert('Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await socialApi.acceptFriendRequest(friendshipId);
      await loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      await socialApi.declineFriendRequest(friendshipId);
      await loadFriends();
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading friends...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">👥 Friends</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <h2 className="text-2xl font-bold mb-4">Search Players</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for players..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((player) => (
                  <div key={player.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{player.username}</div>
                      <div className="text-sm text-gray-600">Level {player.level} • Farm Level {player.farmLevel}</div>
                    </div>
                    <button
                      onClick={() => handleSendFriendRequest(player.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingRequests.length > 0 && (
            <div className="bg-yellow-50 rounded-lg shadow-lg p-4 mb-6">
              <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{request.username}</div>
                      <div className="text-sm text-gray-600">Level {request.level}</div>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Your Friends ({friends.length})</h2>
            {friends.length === 0 ? (
              <p className="text-gray-600">No friends yet. Add some!</p>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{friend.username}</div>
                      <div className="text-sm text-gray-600">Level {friend.level} • Farm Level {friend.farmLevel}</div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                      Visit Farm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 h-fit">
          <h3 className="text-xl font-bold mb-4">Stats</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Friends:</span>
              <span className="font-bold float-right">{friends.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Pending:</span>
              <span className="font-bold float-right">{pendingRequests.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
