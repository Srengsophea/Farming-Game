import React, { useEffect, useState } from 'react';
import { farmingApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';

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
  egg: { name: 'Egg', icon: '🥚', type: 'Animal Product' },
  milk: { name: 'Milk', icon: '🥛', type: 'Animal Product' },
  wool: { name: 'Wool', icon: '🧶', type: 'Animal Product' },
  honey: { name: 'Honey', icon: '🍯', type: 'Animal Product' },
  wood: { name: 'Wood', icon: '🪵', type: 'Material' },
  stone: { name: 'Stone', icon: '🪨', type: 'Material' },
  bread: { name: 'Bread', icon: '🍞', type: 'Crafted' },
  cheese: { name: 'Cheese', icon: '🧀', type: 'Crafted' }
};

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const { player } = useGameStore();

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await farmingApi.getInventory();
      setInventory(response.data.inventory);
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
      wheat: 15, corn: 25, carrot: 14, potato: 12,
      egg: 20, milk: 30, wool: 25, honey: 50
    };
    return sum + ((basePrices[item.itemId] || 5) * item.quantity);
  }, 0);

  if (isLoading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  const types = ['all', ...Array.from(new Set(inventory.map(i => getItemType(i.itemId))))];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🎒 Inventory</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-gray-600 text-sm">Total Items</div>
          <div className="text-4xl font-bold text-blue-600">
            {inventory.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-gray-600 text-sm">Unique Items</div>
          <div className="text-4xl font-bold text-purple-600">{inventory.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-gray-600 text-sm">Est. Value</div>
          <div className="text-4xl font-bold text-yellow-600">{totalValue}</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-gray-600 text-sm">Capacity</div>
          <div className="text-4xl font-bold text-green-600">100/100</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Filter by Type</h2>
          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === type
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {type === 'all' ? 'All Items' : type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.length === 0 ? (
            <div className="col-span-full text-center text-gray-600 py-8">
              No items in this category
            </div>
          ) : (
            filteredInventory.map(item => {
              const info = ITEM_INFO[item.itemId];
              return (
                <div key={item.itemId} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl">{info?.icon || '📦'}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                      item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.rarity}
                    </span>
                  </div>
                  <div className="font-bold text-lg">{info?.name || item.itemId}</div>
                  <div className="text-sm text-gray-600 mb-2">{info?.type || 'Unknown'}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-600">×{item.quantity}</div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                      Sell
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
