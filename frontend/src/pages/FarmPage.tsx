import React, { useEffect, useState } from 'react';
import { farmingApi, authApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';
import { Navbar } from '../components/Navbar';
import { ToastContainer, ToastData } from '../components/Toast';
import { RewardModal, RewardModalData } from '../components/RewardModal';

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
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [rewardModal, setRewardModal] = useState<RewardModalData | null>(null);
  const [actionTileId, setActionTileId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { farm, setPlayer, setFarm } = useGameStore();

  useEffect(() => {
    loadFarmData();
    const interval = setInterval(loadFarmData, 4000);
    return () => clearInterval(interval);
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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
    setIsActionLoading(true);
    setActionTileId(tile.id);
    try {
      await farmingApi.plantCrop(tile.id, selectedCropType);
      addToast({
        type: 'success',
        title: `Planted ${selectedCropType.toUpperCase()}!`,
        message: 'Plot seeded. Water it to accelerate growth!',
        icon: CROP_ICONS[selectedCropType] || '🌱',
        coins: -10
      });
      await loadFarmData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Planting Failed',
        message: error.response?.data?.error || 'Could not plant crop on this tile',
        icon: '⚠️'
      });
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setActionTileId(null), 500);
    }
  };

  const handleHarvestCrop = async (tile: FarmTile) => {
    if (!tile.crop) return;
    setIsActionLoading(true);
    setActionTileId(tile.id);
    try {
      const res = await farmingApi.harvestCrop(tile.crop.id);
      const cropName = tile.crop.cropType;
      const earnedCoins = res.data?.coins ?? 15;
      const earnedXp = res.data?.xp ?? 5;

      setRewardModal({
        title: 'Crop Harvested!',
        subtitle: 'Crops and rewards added to your bag!',
        itemName: `Harvested ${cropName.toUpperCase()}`,
        icon: CROP_ICONS[cropName] || '🌾',
        coinsEarned: earnedCoins,
        xpEarned: earnedXp,
        rarity: 'Common'
      });

      addToast({
        type: 'reward',
        title: `Harvested ${cropName}!`,
        message: `+1x ${cropName} added to Inventory!`,
        icon: CROP_ICONS[cropName] || '🌾',
        coins: earnedCoins,
        xp: earnedXp
      });

      await loadFarmData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Not Ready',
        message: error.response?.data?.error || 'Crop is still growing. Please wait!',
        icon: '⏳'
      });
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setActionTileId(null), 500);
    }
  };

  const handleWaterCrop = async (tile: FarmTile) => {
    if (!tile.crop) return;
    setIsActionLoading(true);
    setActionTileId(tile.id);
    try {
      await farmingApi.waterCrop(tile.crop.id);
      addToast({
        type: 'info',
        title: 'Crop Watered! 💧',
        message: 'Soil hydrated. Growth speed boosted!',
        icon: '💧'
      });
      await loadFarmData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Watering Notice',
        message: error.response?.data?.error || 'This crop is already well-watered!',
        icon: '💧'
      });
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setActionTileId(null), 500);
    }
  };

  const handleBuyAnimal = async () => {
    try {
      await farmingApi.purchaseAnimal(selectedAnimalType);
      addToast({
        type: 'success',
        title: `New ${selectedAnimalType.toUpperCase()} Added!`,
        message: 'Your animal is roaming the farm pasture!',
        icon: ANIMAL_ICONS[selectedAnimalType] || '🐾'
      });
      await loadFarmData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Purchase Failed',
        message: error.response?.data?.error || 'Not enough coins to buy animal',
        icon: '🪙'
      });
    }
  };

  const handleFeedAnimal = async (animalId: string) => {
    try {
      await farmingApi.feedAnimal(animalId);
      addToast({
        type: 'success',
        title: 'Animal Fed!',
        message: 'Hunger satisfied & happiness boosted!',
        icon: '🌾'
      });
      await loadFarmData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Feed Notice',
        message: error.response?.data?.error || 'Could not feed animal',
        icon: '⚠️'
      });
    }
  };

  const handleCollectProduct = async (animalId: string) => {
    try {
      const res = await farmingApi.collectAnimalProduct(animalId);
      const prodName = res.data?.productId || 'Product';
      addToast({
        type: 'reward',
        title: 'Product Collected!',
        message: `+1x ${prodName} added to Inventory!`,
        icon: '🥚'
      });
      await loadFarmData();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Not Ready',
        message: error.response?.data?.error || 'Product is not ready for collection yet',
        icon: '⏳'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100 animate-popup">
          <div className="text-6xl animate-bounce mb-3">🌾</div>
          <div className="text-xl font-black text-slate-800">Loading Your Farm...</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Preparing fertile soil & crops</div>
        </div>
      </div>
    );
  }

  const GRID_SIZE = 20;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <RewardModal data={rewardModal} onClose={() => setRewardModal(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Farm Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 rounded-3xl shadow-xl p-6 sm:p-8 text-white flex flex-wrap justify-between items-center gap-4 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-emerald-100">
              <span>🌾</span> Valley Estate
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{farm?.name || 'My Farm'}</h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-lg">
              20×20 Interactive Plots • Click tiles to plant, hydrate, and harvest fresh produce!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-inner relative z-10">
            <div className="text-center">
              <div className="text-[11px] text-emerald-200 uppercase font-bold tracking-wider">Crops Planted</div>
              <div className="text-2xl font-black mt-0.5">{tiles.filter((t) => t.crop).length}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-[11px] text-emerald-200 uppercase font-bold tracking-wider">Livestock</div>
              <div className="text-2xl font-black mt-0.5">{animals.length}</div>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interactive Farm Grid */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col justify-between">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <span>🌱</span> Farm Territory (20×20 Plots)
              </h2>
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-700 rounded-sm"></span> Soil</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-200 rounded-sm"></span> Grass</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-300 rounded-sm"></span> Crop</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-300 rounded-sm"></span> Watered</span>
              </div>
            </div>

            {/* Grid Viewport */}
            <div className="overflow-auto border border-slate-200 rounded-2xl bg-slate-100 p-4 max-h-[600px] shadow-inner select-none">
              <div
                className="grid gap-1.5 mx-auto w-fit"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 34px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 34px)`
                }}
              >
                {tiles.map((tile) => {
                  const hasBuilding = buildings.some((b) => b.gridX === tile.gridX && b.gridY === tile.gridY);
                  const isSelected = selectedTile?.id === tile.id;
                  const isAction = actionTileId === tile.id;
                  const crop = tile.crop;
                  const cropIcon = crop ? (CROP_ICONS[crop.cropType] || '🌱') : '';

                  let tileStyle = 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200/60';
                  if (tile.tileType === 'soil' || tile.tilled) {
                    tileStyle = tile.watered
                      ? 'bg-amber-900/90 hover:bg-amber-900 text-amber-100 border border-amber-950 shadow-inner'
                      : 'bg-amber-700/85 hover:bg-amber-700 text-amber-100 border border-amber-800/80 shadow-inner';
                  }
                  if (crop) {
                    tileStyle = crop.stage >= 2
                      ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 shadow-sm animate-harvest-glow'
                      : 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border border-emerald-400 shadow-sm';
                  }
                  if (hasBuilding) {
                    tileStyle = 'bg-orange-200 hover:bg-orange-300 text-orange-950 border border-orange-400 shadow-sm';
                  }

                  return (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedTile(tile)}
                      className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm font-black transition-all duration-150 relative ${tileStyle} ${
                        isSelected
                          ? 'ring-4 ring-yellow-400 scale-110 z-20 shadow-xl'
                          : 'hover:scale-105'
                      } ${isAction ? 'animate-pulse scale-95' : ''}`}
                      title={`Plot (${tile.gridX}, ${tile.gridY}) - ${crop ? `${crop.cropType} (Stage ${crop.stage})` : tile.tileType}`}
                    >
                      {hasBuilding ? '🏠' : crop ? cropIcon : tile.tileType === 'soil' ? '' : '🌿'}
                      {crop?.watered && !hasBuilding && (
                        <span className="absolute -top-1.5 -right-1.5 text-[10px] filter drop-shadow">💧</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Animals Panel */}
          <div className="space-y-6">
            {/* Selected Plot Panel */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>🎯</span> Plot Actions
              </h2>

              {selectedTile ? (
                <div className="space-y-4 animate-popup">
                  {/* Selected Coordinate Details */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-black text-sm text-slate-900">
                      <span>Coordinates</span>
                      <span className="text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-extrabold">
                        X: {selectedTile.gridX}, Y: {selectedTile.gridY}
                      </span>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Terrain:</span>
                      <span className="capitalize font-extrabold text-slate-800">{selectedTile.tileType}</span>
                    </div>
                    {selectedTile.crop && (
                      <div className="text-slate-600 flex justify-between pt-1.5 border-t border-slate-200">
                        <span>Active Crop:</span>
                        <span className="font-black text-amber-700 capitalize flex items-center gap-1">
                          {CROP_ICONS[selectedTile.crop.cropType]} {selectedTile.crop.cropType} (Stage {selectedTile.crop.stage}/3)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Plant Crop Action */}
                  {!selectedTile.crop && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-1">Select Seed to Plant:</label>
                        <select
                          value={selectedCropType}
                          onChange={(e) => setSelectedCropType(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm"
                        >
                          <option value="wheat">🌾 Wheat (Cost: 10🪙 • Harvest: 15🪙)</option>
                          <option value="corn">🌽 Corn (Cost: 15🪙 • Harvest: 25🪙)</option>
                          <option value="carrot">🥕 Carrot (Cost: 10🪙 • Harvest: 14🪙)</option>
                          <option value="potato">🥔 Potato (Cost: 10🪙 • Harvest: 12🪙)</option>
                          <option value="tomato">🍅 Tomato (Cost: 20🪙 • Harvest: 35🪙)</option>
                          <option value="pumpkin">🎃 Pumpkin (Cost: 25🪙 • Harvest: 50🪙)</option>
                          <option value="strawberry">🍓 Strawberry (Cost: 30🪙 • Harvest: 45🪙)</option>
                          <option value="watermelon">🍉 Watermelon (Cost: 35🪙 • Harvest: 60🪙)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handlePlantCrop(selectedTile)}
                        disabled={isActionLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        <span>🌱</span> Plant Selected Seed
                      </button>
                    </div>
                  )}

                  {/* Water and Harvest Actions */}
                  {selectedTile.crop && (
                    <div className="space-y-2.5">
                      <button
                        onClick={() => handleWaterCrop(selectedTile)}
                        disabled={isActionLoading || selectedTile.crop.watered}
                        className={`w-full font-black py-3 px-4 rounded-2xl shadow transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                          selectedTile.crop.watered
                            ? 'bg-blue-100 text-blue-800 border border-blue-200 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                        }`}
                      >
                        <span>💧</span> {selectedTile.crop.watered ? 'Already Watered' : 'Water Crop (Boost Growth)'}
                      </button>

                      <button
                        onClick={() => handleHarvestCrop(selectedTile)}
                        disabled={isActionLoading}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        <span>🌾</span> Harvest Crop (+Coins & XP)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-4xl block mb-1">👆</span>
                  <span className="text-xs font-bold">Select any plot on the grid to perform actions</span>
                </div>
              )}
            </div>

            {/* Livestock Management */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span>🐔</span> Farm Livestock ({animals.length})
                </h2>
              </div>

              {/* Purchase Animal */}
              <div className="flex gap-2">
                <select
                  value={selectedAnimalType}
                  onChange={(e) => setSelectedAnimalType(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold bg-white outline-none"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-black transition shadow-md"
                >
                  Buy
                </button>
              </div>

              {/* Animal List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {animals.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
                    No animals yet. Adopt your first livestock above!
                  </div>
                ) : (
                  animals.map((animal) => (
                    <div
                      key={animal.id}
                      className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-2xl flex items-center justify-between text-xs gap-2"
                    >
                      <div>
                        <div className="font-extrabold text-slate-800 capitalize flex items-center gap-1.5">
                          <span className="text-base">{ANIMAL_ICONS[animal.animalType] || '🐾'}</span>
                          <span>{animal.animalType}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Hunger: {animal.hunger}% • Happy: {animal.happiness}%
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleFeedAnimal(animal.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-black shadow-sm"
                        >
                          Feed
                        </button>
                        <button
                          onClick={() => handleCollectProduct(animal.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-black shadow-sm"
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
