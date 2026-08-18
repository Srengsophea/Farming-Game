import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (email: string, password: string, username: string) =>
    client.post('/auth/register', { email, password, username }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  getMe: () => client.get('/auth/me')
};

export const farmingApi = {
  getFarm: () => client.get('/game/farm'),
  getInventory: () => client.get('/game/inventory'),
  plantCrop: (farmTileId: string, cropType: string) =>
    client.post('/game/farm/plant', { farmTileId, cropType }),
  waterCrop: (cropId: string) =>
    client.post('/game/farm/water', { cropId }),
  harvestCrop: (cropId: string) =>
    client.post('/game/farm/harvest', { cropId }),
  getCropProgress: (cropId: string) =>
    client.get(`/game/farm/crop/${cropId}/progress`),
  feedAnimal: (animalId: string) =>
    client.post('/game/animals/feed', { animalId }),
  collectAnimalProduct: (animalId: string) =>
    client.post('/game/animals/collect', { animalId }),
  purchaseAnimal: (animalType: string) =>
    client.post('/game/animals/purchase', { animalType }),
  addBuilding: (buildingType: string, gridX: number, gridY: number) =>
    client.post('/game/buildings/add', { buildingType, gridX, gridY }),
  getQuests: () => client.get('/game/quests'),
  completeQuest: (questId: string) =>
    client.post(`/game/quests/${questId}/complete`),
  getRecipes: () => client.get('/game/crafting/recipes'),
  craftItem: (recipeId: string) =>
    client.post('/game/crafting/craft', { recipeId }),
  fish: () => client.post('/game/fishing/fish'),
  getFish: () => client.get('/game/fishing/fish'),
  mine: () => client.post('/game/mining/mine'),
  getOres: () => client.get('/game/mining/ores')
};

export const tradingApi = {
  createListing: (itemId: string, quantity: number, pricePerUnit: number) =>
    client.post('/game/marketplace/list', { itemId, quantity, pricePerUnit }),
  getListings: (itemId?: string, minPrice?: number, maxPrice?: number, limit?: number, offset?: number) =>
    client.get('/game/marketplace/listings', { params: { itemId, minPrice, maxPrice, limit, offset } }),
  purchaseListing: (listingId: string, quantity: number) =>
    client.post('/game/marketplace/purchase', { listingId, quantity }),
  cancelListing: (listingId: string) =>
    client.post('/game/marketplace/cancel', { listingId }),
  initiateTrade: (targetPlayerId: string, initiatorItems: string[], recipientItems: string[]) =>
    client.post('/game/trades/initiate', { targetPlayerId, initiatorItems, recipientItems }),
  acceptTrade: (tradeId: string) =>
    client.post(`/game/trades/${tradeId}/accept`),
  declineTrade: (tradeId: string) =>
    client.post(`/game/trades/${tradeId}/decline`)
};

export const socialApi = {
  sendFriendRequest: (targetPlayerId: string) =>
    client.post('/social/friends/request', { targetPlayerId }),
  acceptFriendRequest: (friendshipId: string) =>
    client.post(`/social/friends/${friendshipId}/accept`),
  declineFriendRequest: (friendshipId: string) =>
    client.post(`/social/friends/${friendshipId}/decline`),
  getFriends: () => client.get('/social/friends'),
  getPendingRequests: () => client.get('/social/friends/requests'),
  removeFriend: (friendId: string) =>
    client.delete(`/social/friends/${friendId}`),
  searchPlayers: (query: string) =>
    client.get('/social/players/search', { params: { q: query } }),
  getPlayer: (playerId: string) =>
    client.get(`/social/players/${playerId}`),
  getNotifications: (unreadOnly?: boolean) =>
    client.get('/social/notifications', { params: { unreadOnly } }),
  markNotificationRead: (notificationId: string) =>
    client.post(`/social/notifications/${notificationId}/read`),
  markAllNotificationsRead: () =>
    client.post('/social/notifications/read-all')
};

export default client;
