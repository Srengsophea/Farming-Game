import React, { useEffect, useState } from 'react';
import { tradingApi } from '../services/api';
import { Navbar } from '../components/Navbar';

interface Listing {
  id: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  pricePerUnit: number;
  username: string;
}

export const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [sellItemId, setSellItemId] = useState('wheat');
  const [sellQty, setSellQty] = useState(5);
  const [sellPrice, setSellPrice] = useState(20);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, [selectedItemId]);

  const loadListings = async () => {
    try {
      const response = await tradingApi.getListings(selectedItemId || undefined, undefined, undefined, 50, 0);
      const raw = response.data.listings || [];
      const normalized: Listing[] = raw.map((l: any) => ({
        id: l.id,
        sellerId: l.seller_id || l.sellerId,
        itemId: l.item_id || l.itemId,
        quantity: l.quantity,
        pricePerUnit: l.price_per_unit || l.pricePerUnit,
        username: l.username || 'Anonymous'
      }));
      setListings(normalized);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (listingId: string, quantity: number) => {
    try {
      await tradingApi.purchaseListing(listingId, quantity);
      setStatusMsg('Purchased item from market! 🛒');
      setTimeout(() => setStatusMsg(null), 3000);
      await loadListings();
    } catch (error: any) {
      setStatusMsg(error.response?.data?.error || 'Purchase failed');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tradingApi.createListing(sellItemId, sellQty, sellPrice);
      setStatusMsg('Listing published on Marketplace! 🎉');
      setTimeout(() => setStatusMsg(null), 3000);
      await loadListings();
    } catch (error: any) {
      setStatusMsg(error.response?.data?.error || 'Failed to create listing');
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="p-8 text-center text-gray-500 font-semibold">Loading Marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <span>🏪</span> Global Marketplace
          </h1>
        </div>

        {statusMsg && (
          <div className="bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-md text-sm font-semibold animate-fade-in">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Listings */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">Browse Listings ({listings.length})</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by item..."
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs outline-none bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-3">
              {listings.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs font-semibold">
                  No listings currently available. Create one to sell items to other players!
                </div>
              ) : (
                listings.map((l) => (
                  <div
                    key={l.id}
                    className="border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 bg-white hover:shadow-sm transition"
                  >
                    <div>
                      <div className="font-extrabold text-base text-gray-800 capitalize">{l.itemId}</div>
                      <div className="text-xs text-gray-500">Seller: {l.username}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-bold text-amber-600">🪙 {l.pricePerUnit} / unit</div>
                        <div className="text-xs text-gray-400">Qty: {l.quantity} available</div>
                      </div>

                      <button
                        onClick={() => handlePurchase(l.id, l.quantity)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
                      >
                        Buy All (🪙 {l.pricePerUnit * l.quantity})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create Listing */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 h-fit">
            <h2 className="text-lg font-bold text-gray-800">List an Item for Sale</h2>
            <form onSubmit={handleCreateListing} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item to Sell</label>
                <select
                  value={sellItemId}
                  onChange={(e) => setSellItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold bg-white outline-none"
                >
                  <option value="wheat">🌾 Wheat</option>
                  <option value="corn">🌽 Corn</option>
                  <option value="carrot">🥕 Carrot</option>
                  <option value="potato">🥔 Potato</option>
                  <option value="egg">🥚 Egg</option>
                  <option value="milk">🥛 Milk</option>
                  <option value="bread">🍞 Bread</option>
                  <option value="iron">⛏️ Iron Ore</option>
                  <option value="gold">🪙 Gold Ore</option>
                  <option value="trout">🐠 Trout</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={sellQty}
                  onChange={(e) => setSellQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Price per Unit (🪙)</label>
                <input
                  type="number"
                  min="1"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow text-xs transition"
                >
                  Publish Listing (Total: 🪙 {sellPrice * sellQty})
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
