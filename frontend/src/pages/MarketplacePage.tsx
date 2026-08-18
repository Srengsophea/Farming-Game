import React, { useEffect, useState } from 'react';
import { tradingApi } from '../services/api';
import { useGameStore } from '../stores/gameStore';

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
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const { player } = useGameStore();

  useEffect(() => {
    loadListings();
  }, [selectedItemId]);

  const loadListings = async () => {
    try {
      const response = await tradingApi.getListings(selectedItemId || undefined, undefined, undefined, 50, 0);
      setListings(response.data.listings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (listingId: string, quantity: number) => {
    try {
      await tradingApi.purchaseListing(listingId, quantity);
      await loadListings();
    } catch (error) {
      console.error('Error purchasing listing:', error);
    }
  };

  const handleCreateListing = async (itemId: string, quantity: number, pricePerUnit: number) => {
    try {
      await tradingApi.createListing(itemId, quantity, pricePerUnit);
      alert('Listing created!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create listing');
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading marketplace...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🏪 Marketplace</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-2xl font-bold mb-4">Available Listings</h2>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search items..."
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {listings.length === 0 ? (
              <p className="text-gray-600">No listings found</p>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{listing.itemId}</div>
                      <div className="text-sm text-gray-600">Seller: {listing.username}</div>
                      <div className="text-sm">Quantity: {listing.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{listing.pricePerUnit} 🪙</div>
                      <button
                        onClick={() => handlePurchase(listing.id, 1)}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold mb-4">Create Listing</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateListing(
                formData.get('itemId') as string,
                parseInt(formData.get('quantity') as string),
                parseInt(formData.get('price') as string)
              );
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Item ID</label>
              <input name="itemId" type="text" className="w-full px-3 py-2 border rounded" placeholder="wheat" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input name="quantity" type="number" className="w-full px-3 py-2 border rounded" defaultValue="1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per Unit</label>
              <input name="price" type="number" className="w-full px-3 py-2 border rounded" defaultValue="10" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
              Create Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
