import React, { useEffect, useState } from 'react';
import { farmingApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';

interface FarmTile {
  id: string;
  gridX: number;
  gridY: number;
  tileType: string;
  tilled: boolean;
  crop?: {
    id: string;
    cropType: string;
    plantedAt: string;
    stage: number;
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

export const FarmPage: React.FC = () => {
  const [tiles, setTiles] = useState<FarmTile[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState<FarmTile | null>(null);
  const [selectedCropType, setSelectedCropType] = useState('wheat');
  const { player, farm } = useGameStore();

  useEffect(() => {
    loadFarmData();
    const interval = setInterval(loadFarmData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadFarmData = async () => {
    try {
      const response = await farmingApi.getFarm();
      setTiles(response.data.tiles);
      setBuildings(response.data.buildings);
      setAnimals(response.data.animals);
    } catch (error) {
      console.error('Error loading farm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlantCrop = async (tile: FarmTile) => {
    if (tile.tilled && !tile.crop) {
      try {
        await farmingApi.plantCrop(tile.id, selectedCropType);
        await loadFarmData();
      } catch (error) {
        console.error('Error planting crop:', error);
      }
    }
  };

  const handleHarvestCrop = async (tile: FarmTile) => {
    if (tile.crop) {
      try {
        await farmingApi.harvestCrop(tile.crop.id);
        await loadFarmData();
      } catch (error) {
        console.error('Error harvesting crop:', error);
      }
    }
  };

  const handleWaterCrop = async (tile: FarmTile) => {
    if (tile.crop) {
      try {
        await farmingApi.waterCrop(tile.crop.id);
        await loadFarmData();
      } catch (error) {
        console.error('Error watering crop:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-green-700">Loading farm...</div>
      </div>
    );
  }

  const GRID_SIZE = 20;
  const TILE_SIZE = 40;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-green-700">🌾 {farm?.name || 'My Farm'}</h1>
        <div className="text-right">
          <div className="text-lg">Level {player?.level}</div>
          <div className="text-sm text-gray-600">{player?.coins} 🪙</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4 overflow-x-auto">
          <div
            className="grid gap-1 bg-sky-100 p-4 rounded-lg inline-block"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`
            }}
          >
            {tiles.map((tile) => {
              const hasBuilding = buildings.some((b) => b.gridX === tile.gridX && b.gridY === tile.gridY);
              const isSelected = selectedTile?.id === tile.id;

              return (
                <div
                  key={tile.id}
                  onClick={() => setSelectedTile(tile)}
                  className={`w-10 h-10 rounded cursor-pointer flex items-center justify-center text-xs font-bold transition ${
                    isSelected
                      ? 'ring-4 ring-yellow-400'
                      : 'hover:ring-2 hover:ring-yellow-300'
                  } ${
                    hasBuilding
                      ? 'bg-orange-300'
                      : tile.crop
                      ? 'bg-yellow-100'
                      : tile.tilled
                      ? 'bg-amber-600'
                      : tile.tileType === 'water'
                      ? 'bg-blue-300'
                      : tile.tileType === 'stone'
                      ? 'bg-gray-400'
                      : 'bg-green-200'
                  }`}
                >
                  {tile.crop && '🌾'}
                  {hasBuilding && '🏠'}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-3">Farm Actions</h2>

            {selectedTile && (
              <>
                <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                  <p className="font-semibold">Selected: ({selectedTile.gridX}, {selectedTile.gridY})</p>
                  <p>Type: {selectedTile.tileType}</p>
                  {selectedTile.crop && (
                    <p>Crop: {selectedTile.crop.cropType} - Stage {selectedTile.crop.stage}</p>
                  )}
                </div>

                {!selectedTile.crop && selectedTile.tilled && (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Crop Type:</label>
                      <select
                        value={selectedCropType}
                        onChange={(e) => setSelectedCropType(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="wheat">Wheat</option>
                        <option value="corn">Corn</option>
                        <option value="carrot">Carrot</option>
                        <option value="potato">Potato</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handlePlantCrop(selectedTile)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                    >
                      Plant Crop
                    </button>
                  </>
                )}

                {selectedTile.crop && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleWaterCrop(selectedTile)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    >
                      💧 Water
                    </button>
                    <button
                      onClick={() => handleHarvestCrop(selectedTile)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded"
                    >
                      🌾 Harvest
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Animals ({animals.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {animals.map((animal) => (
                <div key={animal.id} className="bg-yellow-50 p-2 rounded text-sm">
                  <div className="font-semibold">🐄 {animal.animalType}</div>
                  <div className="text-xs text-gray-600">
                    Hunger: {animal.hunger}% | Happy: {animal.happiness}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
