import React, { useEffect, useState } from 'react';
import { farmingApi, authApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';

interface FarmTile {
  id: string;
  gridX: number;
  gridY: number;
  tileType: string;
  tilled: boolean;
  watered?: boolean;
  crop?: {
    id: string;
    cropType: string;
    stage: number;
    watered?: boolean;
    fertilized?: boolean;
  };
}

interface Building {
  id: string;
  buildingType: string;
  gridX: number;
  gridY: number;
}

interface Animal {
  id: string;
  animalType: string;
  hunger: number;
  happiness: number;
}

const CROP_ICONS: Record<string, string> = {
  wheat: '🌾',
  corn: '🌽',
  carrot: '🥕',
  potato: '🥔',
  tomato: '🍅',
  pumpkin: '🎃',
  strawberry: '🍓',
  watermelon: '🍉',
  rice: '🌾',
  cabbage: '🥬',
  onion: '🧅',
  garlic: '🧄',
  pepper: '🌶️',
  eggplant: '🍆',
  lettuce: '🥬',
  sugarcane: '🎋'
};

const ANIMAL_ICONS: Record<string, string> = {
  chicken: '🐔',
  cow: '🐄',
  sheep: '🐑',
  pig: '🐷',
  goat: '🐐',
  duck: '🦆',
  horse: '🐴',
  bee: '🐝'
};

export const FarmPage: React.FC = () => {
  const [tiles, setTiles] = useState<FarmTile[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<FarmTile | null>(null);
  const [selectedCropType, setSelectedCropType] = useState('wheat');
  const [selectedAnimalType, setSelectedAnimalType] = useState('chicken');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { farm, setPlayer, setFarm } = useGameStore();

  useEffect(() => {
    loadFarmData();
    const interval = setInterval(loadFarmData, 4000);
    return () => clearInterval(interval);
  }, []);

  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const loadFarmData = async () => {
    try {
      const [farmRes, meRes] = await Promise.all([
        farmingApi.getFarm(),
        authApi.getMe().catch(() => null)
      ]);

      if (meRes?.data) {
        if (meRes.data.player) setPlayer(meRes.data.player);
        if (meRes.data.farm) setFarm(meRes.data.farm);
      }

      const rawTiles = farmRes.data.tiles || [];
      const normalizedTiles: FarmTile[] = rawTiles.map((t: any) => {
        const cropId = t.crop_id || t.crop?.id;
        const cropType = t.crop_type || t.crop?.cropType;
        const stage = t.stage !== undefined ? t.stage : t.crop?.stage ?? 0;
        const isWatered = t.crop_watered ?? t.watered ?? t.crop?.watered ?? false;

        return {
          id: t.id,
          gridX: t.grid_x !== undefined ? t.grid_x : t.gridX ?? 0,
          gridY: t.grid_y !== undefined ? t.grid_y : t.gridY ?? 0,
          tileType: t.tile_type || t.tileType || 'soil',
          tilled: t.tilled ?? false,
          watered: isWatered,
          crop: cropId
            ? {
                id: cropId,
                cropType: cropType || 'wheat',
                stage: stage,
                watered: isWatered,
                fertilized: t.fertilized ?? t.crop?.fertilized ?? false
              }
            : undefined
        };
      });

      const rawBuildings = farmRes.data.buildings || [];
      const normalizedBuildings: Building[] = rawBuildings.map((b: any) => ({
        id: b.id,
        buildingType: b.building_type || b.buildingType || 'farmhouse',
        gridX: b.grid_x !== undefined ? b.grid_x : b.gridX ?? 0,
        gridY: b.grid_y !== undefined ? b.grid_y : b.gridY ?? 0
      }));

      const rawAnimals = farmRes.data.animals || [];
      const normalizedAnimals: Animal[] = rawAnimals.map((a: any) => ({
        id: a.id,
        animalType: a.animal_type || a.animalType || 'chicken',
        hunger: a.hunger ?? 50,
        happiness: a.happiness ?? 50
      }));

      setTiles(normalizedTiles);
      setBuildings(normalizedBuildings);
      setAnimals(normalizedAnimals);

      // Keep selected tile in sync with fresh data
      setSelectedTile((prev) => {
        if (!prev) return null;
        return normalizedTiles.find((t) => t.id === prev.id) || null;
      });
    } catch (error) {
      console.error('Error loading farm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlantCrop = async (tile: FarmTile) => {
    try {
      await farmingApi.plantCrop(tile.id, selectedCropType);
      showFeedback(`Planted ${selectedCropType}! 🌱`);
      await loadFarmData();
    } catch (error: any) {
      showFeedback(error.response?.data?.error || 'Failed to plant crop');
    }
  };

  const handleHarvestCrop = async (tile: FarmTile) => {
    if (!tile.crop) return;
    try {
      const res = await farmingApi.harvestCrop(tile.crop.id);
      showFeedback(`Harvested! +${res.data?.coins ?? 15}🪙 +${res.data?.xp ?? 5}XP 🌾`);
      await loadFarmData();
    } catch (error: any) {
      showFeedback(error.response?.data?.error || 'Crop not ready to harvest yet');
    }
  };

  const handleWaterCrop = async (tile: FarmTile) => {
    if (!tile.crop) return;
    try {
      await farmingApi.waterCrop(tile.crop.id);
      showFeedback('Crop watered! 💧 Growth boosted!');
      await loadFarmData();
    } catch (error: any) {
      showFeedback(error.response?.data?.error || 'Crop already watered');
    }
  };

  const handleBuyAnimal = async () => {
    try {
      await farmingApi.purchaseAnimal(selectedAnimalType);
      showFeedback(`Purchased a new ${selectedAnimalType}! 🎉`);
      await loadFarmData();
    } catch (error: any) {
      showFeedback(error.response?.data?.error || 'Failed to purchase animal');
    }
  };

  const handleFeedAnimal = async (animalId: string) => {
    try {
      await farmingApi.feedAnimal(animalId);
      showFeedback('Fed animal! 🌾');
      await loadFarmData();
    } catch (error: any) {
      showFeedback(error.response?.data?.error || 'Failed to feed animal');
    }
  };

  const handleCollectProduct = async (animalId: string) => {
    try {
      const res = await farmingApi.collectAnimalProduct(animalId);
      showFeedback(`Collected ${res.data?.quantity ?? 1}x ${res.data?.productId ?? 'product'}! 🥚`);
      await loadFarmData();
    } catch (error: any) {
      showFeedback(error.response?.data?.error || 'Product not ready yet');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-5xl animate-bounce mb-4">🌾</div>
          <div className="text-xl font-bold text-green-800">Loading Your Farm...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing soil and crops</div>
        </div>
      </div>
    );
  }

  const GRID_SIZE = 20;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Title & Info */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              🌾 {farm?.name || 'My Farm'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              20×20 Plots • Click any tile to plant, water, or harvest
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <div className="text-center">
              <div className="text-xs text-emerald-200 uppercase font-semibold">Crops Planted</div>
              <div className="text-xl font-black">{tiles.filter((t) => t.crop).length}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-emerald-200 uppercase font-semibold">Animals</div>
              <div className="text-xl font-black">{animals.length}</div>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {actionMessage && (
          <div className="bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-md flex items-center justify-between animate-fade-in font-semibold text-sm">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-white/80 hover:text-white ml-4">✕</button>
          </div>
        )}

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Farm Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <span>🌱</span> Farm Grid (20×20)
              </h2>
              <div className="text-xs text-gray-500 font-medium flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-700 rounded-sm inline-block"></span> Soil</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-300 rounded-sm inline-block"></span> Grass</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-200 rounded-sm inline-block"></span> Growing</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-300 rounded-sm inline-block"></span> Watered</span>
              </div>
            </div>

            {/* Scrollable Grid Container */}
            <div className="overflow-auto border border-gray-200 rounded-xl bg-slate-100 p-3 max-h-[620px] shadow-inner">
              <div
                className="grid gap-1.5 mx-auto w-fit"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 32px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 32px)`
                }}
              >
                {tiles.map((tile) => {
                  const hasBuilding = buildings.some((b) => b.gridX === tile.gridX && b.gridY === tile.gridY);
                  const isSelected = selectedTile?.id === tile.id;
                  const crop = tile.crop;
                  const cropIcon = crop ? (CROP_ICONS[crop.cropType] || '🌱') : '';

                  let bgClass = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800';
                  if (tile.tileType === 'soil' || tile.tilled) {
                    bgClass = tile.watered
                      ? 'bg-amber-800/90 hover:bg-amber-800 text-white'
                      : 'bg-amber-700/80 hover:bg-amber-700 text-amber-100';
                  }
                  if (crop) {
                    bgClass = crop.stage >= 2
                      ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400'
                      : 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border border-emerald-400';
                  }
                  if (hasBuilding) {
                    bgClass = 'bg-orange-200 hover:bg-orange-300 text-orange-900 border border-orange-400';
                  }

                  return (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedTile(tile)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold select-none transition-all duration-150 relative ${bgClass} ${
                        isSelected
                          ? 'ring-4 ring-yellow-400 scale-110 z-10 shadow-lg'
                          : 'hover:scale-105'
                      }`}
                      title={`Plot (${tile.gridX}, ${tile.gridY}) - ${crop ? `${crop.cropType} (Stage ${crop.stage})` : tile.tileType}`}
                    >
                      {hasBuilding ? '🏠' : crop ? cropIcon : tile.tileType === 'soil' ? '' : '🌿'}
                      {crop?.watered && !hasBuilding && (
                        <span className="absolute -top-1 -right-1 text-[9px]">💧</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Animals Panel */}
          <div className="space-y-6">
            {/* Selected Tile Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🎯</span> Plot Actions
              </h2>

              {selectedTile ? (
                <div className="space-y-4">
                  {/* Selected Plot Badge */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-sm text-gray-800">
                      <span>Coordinates</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        X: {selectedTile.gridX}, Y: {selectedTile.gridY}
                      </span>
                    </div>
                    <div className="text-gray-600 flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize font-semibold text-gray-800">{selectedTile.tileType}</span>
                    </div>
                    {selectedTile.crop && (
                      <div className="text-gray-600 flex justify-between pt-1 border-t border-gray-200">
                        <span>Crop:</span>
                        <span className="font-bold text-amber-700 capitalize flex items-center gap-1">
                          {CROP_ICONS[selectedTile.crop.cropType]} {selectedTile.crop.cropType} (Stage {selectedTile.crop.stage}/3)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Plant Option if no crop */}
                  {!selectedTile.crop && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Select Crop to Plant:</label>
                        <select
                          value={selectedCropType}
                          onChange={(e) => setSelectedCropType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        >
                          <option value="wheat">🌾 Wheat (Cost: 10🪙 • Sell: 15🪙)</option>
                          <option value="corn">🌽 Corn (Cost: 15🪙 • Sell: 25🪙)</option>
                          <option value="carrot">🥕 Carrot (Cost: 10🪙 • Sell: 14🪙)</option>
                          <option value="potato">🥔 Potato (Cost: 10🪙 • Sell: 12🪙)</option>
                          <option value="tomato">🍅 Tomato (Cost: 20🪙 • Sell: 35🪙)</option>
                          <option value="pumpkin">🎃 Pumpkin (Cost: 25🪙 • Sell: 50🪙)</option>
                          <option value="strawberry">🍓 Strawberry (Cost: 30🪙 • Sell: 45🪙)</option>
                          <option value="watermelon">🍉 Watermelon (Cost: 35🪙 • Sell: 60🪙)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handlePlantCrop(selectedTile)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition duration-150 flex items-center justify-center gap-2"
                      >
                        <span>🌱</span> Plant Selected Crop
                      </button>
                    </div>
                  )}

                  {/* Water & Harvest if crop present */}
                  {selectedTile.crop && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleWaterCrop(selectedTile)}
                        className={`w-full font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2 ${
                          selectedTile.crop.watered
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <span>💧</span> {selectedTile.crop.watered ? 'Already Watered' : 'Water Crop (Boost Growth)'}
                      </button>

                      <button
                        onClick={() => handleHarvestCrop(selectedTile)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                      >
                        <span>🌾</span> Harvest Crop (+Coins & XP)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-3xl block mb-1">👆</span>
                  <span className="text-xs font-semibold">Select any plot on the grid to perform actions</span>
                </div>
              )}
            </div>

            {/* Animals Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>🐔</span> Farm Animals ({animals.length})
                </h2>
              </div>

              {/* Purchase Animal */}
              <div className="flex gap-2">
                <select
                  value={selectedAnimalType}
                  onChange={(e) => setSelectedAnimalType(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold bg-white outline-none"
                >
                  <option value="chicken">🐔 Chicken (50🪙 • Eggs)</option>
                  <option value="cow">🐄 Cow (150🪙 • Milk)</option>
                  <option value="sheep">🐑 Sheep (100🪙 • Wool)</option>
                  <option value="pig">🐷 Pig (80🪙 • Truffles)</option>
                  <option value="goat">🐐 Goat (90🪙 • Goat Milk)</option>
                  <option value="duck">🦆 Duck (40🪙 • Duck Eggs)</option>
                  <option value="bee">🐝 Bee (120🪙 • Honey)</option>
                </select>
                <button
                  onClick={handleBuyAnimal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow"
                >
                  Buy
                </button>
              </div>

              {/* Animal List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {animals.length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-xl">
                    No animals yet. Buy your first chicken above!
                  </div>
                ) : (
                  animals.map((animal) => (
                    <div
                      key={animal.id}
                      className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between text-xs gap-2"
                    >
                      <div>
                        <div className="font-bold text-gray-800 capitalize flex items-center gap-1.5">
                          <span className="text-base">{ANIMAL_ICONS[animal.animalType] || '🐾'}</span>
                          <span>{animal.animalType}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Hunger: {animal.hunger}% • Happy: {animal.happiness}%
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleFeedAnimal(animal.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded-lg text-[11px] font-bold shadow-sm"
                        >
                          Feed
                        </button>
                        <button
                          onClick={() => handleCollectProduct(animal.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg text-[11px] font-bold shadow-sm"
                        >
                          Collect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
