import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './stores/gameStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FarmPage } from './pages/FarmPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { FriendsPage } from './pages/FriendsPage';
import { InventoryPage } from './pages/InventoryPage';
import { CraftingPage } from './pages/CraftingPage';
import { FishingPage } from './pages/FishingPage';
import { MiningPage } from './pages/MiningPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useGameStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { token } = useGameStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <FarmPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <MarketplacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crafting"
          element={
            <ProtectedRoute>
              <CraftingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fishing"
          element={
            <ProtectedRoute>
              <FishingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mining"
          element={
            <ProtectedRoute>
              <MiningPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
