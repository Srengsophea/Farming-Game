import { create } from 'zustand';

export interface Player {
  id: string;
  username: string;
  level: number;
  farmLevel: number;
  playerXp: number;
  farmXp: number;
  coins: number;
  gems: number;
  energy: number;
}

export interface Farm {
  id: string;
  playerId: string;
  name: string;
  width: number;
  height: number;
  expansionLevel: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  rarity: string;
}

interface GameStore {
  player: Player | null;
  farm: Farm | null;
  inventory: InventoryItem[];
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setToken: (token: string) => void;
  setPlayer: (player: Player) => void;
  setFarm: (farm: Farm) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updatePlayerStats: (stats: Partial<Player>) => void;
  addInventoryItem: (itemId: string, quantity: number) => void;
  removeInventoryItem: (itemId: string, quantity: number) => void;
}

export const useGameStore = create<GameStore>()((set) => ({
  player: null,
  farm: null,
  inventory: [],
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null,
  isLoading: false,
  error: null,

  setToken: (token: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    set({ token });
  },

  setPlayer: (player: Player) => set({ player }),

  setFarm: (farm: Farm) => set({ farm }),

  setInventory: (inventory: InventoryItem[]) => set({ inventory }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    set({ player: null, farm: null, inventory: [], token: null });
  },

  updatePlayerStats: (stats: Partial<Player>) =>
    set((state: GameStore) => ({
      player: state.player ? { ...state.player, ...stats } : null
    })),

  addInventoryItem: (itemId: string, quantity: number) =>
    set((state: GameStore) => {
      const existing = state.inventory.find((i: InventoryItem) => i.itemId === itemId);
      if (existing) {
        return {
          inventory: state.inventory.map((i: InventoryItem) =>
            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
          )
        };
      }
      return {
        inventory: [...state.inventory, { itemId, quantity, rarity: 'common' }]
      };
    }),

  removeInventoryItem: (itemId: string, quantity: number) =>
    set((state: GameStore) => {
      const updated = state.inventory
        .map((i: InventoryItem) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
        )
        .filter((i: InventoryItem) => i.quantity > 0);
      return { inventory: updated };
    })
}));
