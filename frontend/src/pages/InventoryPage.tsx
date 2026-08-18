import React, { useEffect, useState } from 'react';
import { farmingApi } from '../services/api';
import { Navbar } from '../components/Navbar';

interface InventoryItem {
  itemId: string;
  quantity: number;
  rarity: string;
}

const ITEM_INFO: Record<string, { name: string; icon: string; type: string }> = {
  wheat: { name: 'Wheat', icon: '🌾', type: 'Crop' },
  corn: { name: 'Corn', icon: '🌽', type: 'Crop' },
  carrot: { name: 'Carrot', icon: '🥕', type: 'Crop' },
  potato: { name: 'Potato', icon: '🥔', type: 'Crop' },
  tomato: { name: 'Tomato', icon: '🍅', type: 'Crop' },
  pumpkin: { name: 'Pumpkin', icon: '🎃', type: 'Crop' },
  strawberry: { name: 'Strawberry', icon: '🍓', type: 'Crop' },
  watermelon: { name: 'Watermelon', icon: '🍉', type: 'Crop' },
  egg: { name: 'Egg', icon: '🥚', type: 'Animal Product' },
  milk: { name: 'Milk', icon: '🥛', type: 'Animal Product' },
  wool: { name: 'Wool', icon: '🧶', type: 'Animal Product' },
  honey: { name: 'Honey', icon: '🍯', type: 'Animal Product' },
  duck_egg: { name: 'Duck Egg', icon: '🥚', type: 'Animal Product' },
  truffle: { name: 'Truffle', icon: '🍄', type: 'Animal Product' },
  goat_milk: { name: 'Goat Milk', icon: '🥛', type: 'Animal Product' },
  wood: { name: 'Wood', icon: '🪵', type: 'Material' },
  stone: { name: 'Stone', icon: '🪨', type: 'Material' },
  coal: { name: 'Coal', icon: '⚫', type: 'Material' },
  copper: { name: 'Copper Ore', icon: '🟤', type: 'Material' },
  iron: { name: 'Iron Ore', icon: '⛏️', type: 'Material' },
  gold: { name: 'Gold Ore', icon: '🪙', type: 'Material' },
  diamond: { name: 'Diamond', icon: '💎', type: 'Material' },
  bread: { name: 'Bread', icon: '🍞', type: 'Crafted' },
  cheese: { name: 'Cheese', icon: '🧀', type: 'Crafted' },
  cake: { name: 'Cake', icon: '🍰', type: 'Crafted' },
  carp: { name: 'Carp', icon: '🐟', type: 'Fish' },
  catfish: { name: 'Catfish', icon: '🐟', type: 'Fish' },
  trout: { name: 'Trout', icon: '🐠', type: 'Fish' },
  salmon: { name: 'Salmon', icon: '🐟', type: 'Fish' },
  bass: { name: 'Bass', icon: '🐟', type: 'Fish' },
  koi: { name: 'Koi', icon: '🐠', type: 'Fish' },
  golden_fish: { name: 'Golden Fish', icon: '✨🐟', type: 'Fish' }
};

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await farmingApi.getInventory();
      const raw = response.data.inventory || [];
      const normalized: InventoryItem[] = raw.map((i: any) => ({
        itemId: i.item_id || i.itemId,
        quantity: i.quantity,
        rarity: i.rarity || 'common'
      }));
      setInventory(normalized);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemType = (itemId: string): string => {
    return ITEM_INFO[itemId]?.type || 'Other';
  };

  const filteredInventory = filterType === 'all' 
    ? inventory 
    : inventory.filter(item => getItemType(item.itemId) === filterType);

  const totalValue = inventory.reduce((sum, item) => {
    const basePrices: Record<string, number> = {
      wheat: 15, corn: 25, carrot: 14, potato: 12, tomato: 35, pumpkin: 50, strawberry: 45, watermelon: 60,
      egg: 20, milk: 30, wool: 25, honey: 50, bread: 40, cheese: 60, cake: 120,
      stone: 5, coal: 15, copper: 30, iron: 50, gold: 100, diamond: 500,
      carp: 15, catfish: 18, trout: 35, salmon: 45, bass: 60, koi: 80, golden_fish: 200
    };
    return sum + ((basePrices[item.itemId] || 10) * item.quantity);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="p-8 text-center text-gray-500 font-semibold">Loading Inventory...</div>
      </div>
    );
  }

  const types = ['all', ...Array.from(new Set(inventory.map(i => getItemType(i.itemId))))];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>🎒</span> Player Inventory
          </h1>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Total Items</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {inventory.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Unique Items</div>
            <div className="text-3xl font-black text-purple-600 mt-1">{inventory.length}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Est. Gold Value</div>
            <div className="text-3xl font-black text-amber-600 mt-1">🪙 {totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-bold uppercase">Slots Used</div>
            <div className="text-3xl font-black text-blue-600 mt-1">{inventory.length} / 50</div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-500 mr-2 uppercase">Category:</span>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  filterType === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Items' : type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredInventory.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl block mb-2">📭</span>
                <span className="text-sm font-semibold">No items found in this category. Plant crops or fish to collect items!</span>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const info = ITEM_INFO[item.itemId];
                return (
                  <div
                    key={item.itemId}
                    className="border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-4xl">{info?.icon || '📦'}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            item.rarity === 'uncommon'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.rarity === 'rare'
                              ? 'bg-blue-100 text-blue-800'
                              : item.rarity === 'epic'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.rarity}
                        </span>
                      </div>
                      <div className="font-bold text-gray-800 text-base">{info?.name || item.itemId}</div>
                      <div className="text-xs text-gray-500">{info?.type || 'General'}</div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <div className="text-xl font-black text-emerald-700">×{item.quantity}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
