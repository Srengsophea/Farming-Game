import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './stores/gameStore';

describe('Frontend Game Store', () => {
  beforeEach(() => {
    useGameStore.setState({
      player: null,
      farm: null,
      inventory: [],
      token: null,
      isLoading: false,
      error: null
    });
  });

  it('sets token correctly', () => {
    useGameStore.getState().setToken('test-token');
    expect(useGameStore.getState().token).toBe('test-token');
  });

  it('sets player data correctly', () => {
    const mockPlayer = {
      id: 'p1',
      username: 'FarmerBob',
      level: 1,
      farmLevel: 1,
      playerXp: 0,
      farmXp: 0,
      coins: 1000,
      gems: 5,
      energy: 100
    };
    useGameStore.getState().setPlayer(mockPlayer);
    expect(useGameStore.getState().player).toEqual(mockPlayer);
  });

  it('updates player stats partially', () => {
    const mockPlayer = {
      id: 'p1',
      username: 'FarmerBob',
      level: 1,
      farmLevel: 1,
      playerXp: 0,
      farmXp: 0,
      coins: 1000,
      gems: 5,
      energy: 100
    };
    useGameStore.getState().setPlayer(mockPlayer);
    useGameStore.getState().updatePlayerStats({ coins: 1500, level: 2 });
    
    expect(useGameStore.getState().player?.coins).toBe(1500);
    expect(useGameStore.getState().player?.level).toBe(2);
    expect(useGameStore.getState().player?.username).toBe('FarmerBob');
  });

  it('adds inventory items', () => {
    useGameStore.getState().addInventoryItem('wheat', 5);
    expect(useGameStore.getState().inventory).toEqual([
      { itemId: 'wheat', quantity: 5, rarity: 'common' }
    ]);

    useGameStore.getState().addInventoryItem('wheat', 3);
    expect(useGameStore.getState().inventory).toEqual([
      { itemId: 'wheat', quantity: 8, rarity: 'common' }
    ]);
  });

  it('removes inventory items', () => {
    useGameStore.getState().addInventoryItem('wheat', 10);
    useGameStore.getState().removeInventoryItem('wheat', 4);
    expect(useGameStore.getState().inventory).toEqual([
      { itemId: 'wheat', quantity: 6, rarity: 'common' }
    ]);

    useGameStore.getState().removeInventoryItem('wheat', 6);
    expect(useGameStore.getState().inventory).toEqual([]);
  });

  it('logs out and clears state', () => {
    useGameStore.getState().setToken('jwt-token');
    useGameStore.getState().setPlayer({
      id: 'p1',
      username: 'Bob',
      level: 1,
      farmLevel: 1,
      playerXp: 0,
      farmXp: 0,
      coins: 100,
      gems: 0,
      energy: 100
    });
    useGameStore.getState().logout();
    expect(useGameStore.getState().token).toBeNull();
    expect(useGameStore.getState().player).toBeNull();
    expect(useGameStore.getState().inventory).toEqual([]);
  });
});
