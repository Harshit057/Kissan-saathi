'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { apiGet, apiDelete } from '@/lib/api';
import { Plus, Edit2, Trash2, ToggleRight, ToggleLeft, Eye, EyeOff } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface Listing {
  id: string;
  crop_name: string;
  quantity: number;
  quantity_unit: string;
  price_per_unit: number;
  is_active: boolean;
  harvest_date: string;
  is_organic: boolean;
}

export default function ListingsPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{ listings: Listing[] }>('/listings');
      setListings(data.listings || []);
    } catch (err: any) {
      setError('लिस्टिंग लोड करने में विफल');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiDelete(`/listings/${id}/toggle`);
      setListings(listings.map((l) => (l.id === id ? { ...l, is_active: !currentStatus } : l)));
    } catch (err) {
      setError('स्थिति अपडेट करने में विफल');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('क्या आप इस लिस्टिंग को हटाना सुनिश्चित हैं?')) {
      try {
        await apiDelete(`/listings/${id}`);
        setListings(listings.filter((l) => l.id !== id));
      } catch (err) {
        setError('हटाने में विफल');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">मेरी लिस्टिंग</h1>
        <Link
          href="/listings/new"
          className="flex items-center gap-2 h-14 px-6 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition text-lg"
        >
          <Plus size={24} />
          नई लिस्टिंग
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-base">
          {error}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">कोई लिस्टिंग नहीं</h2>
          <p className="text-lg text-muted-foreground mb-6">शुरू करने के लिए अपनी पहली लिस्टिंग बनाएं</p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 h-14 px-8 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition text-lg"
          >
            <Plus size={24} />
            अब बनाएं
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className={`bg-white rounded-lg p-6 shadow-sm border-2 ${
                listing.is_active ? 'border-primary/20' : 'border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">{listing.crop_name}</h3>
                    {listing.is_organic && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        जैविक
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {listing.quantity} {listing.quantity_unit} @ ₹{listing.price_per_unit}/इकाई
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">कटाई: {listing.harvest_date}</p>
                  <p className={`text-base font-bold mt-1 ${listing.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {listing.is_active ? 'सक्रिय' : 'निष्क्रिय'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggleActive(listing.id, listing.is_active)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition text-base"
                >
                  {listing.is_active ? (
                    <>
                      <EyeOff size={20} />
                      सक्रिय करें
                    </>
                  ) : (
                    <>
                      <Eye size={20} />
                      सक्रिय करें
                    </>
                  )}
                </button>

                <Link
                  href={`/listings/${listing.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent font-semibold rounded-lg transition text-base"
                >
                  <Edit2 size={20} />
                  संपादित करें
                </Link>

                <button
                  onClick={() => handleDelete(listing.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition text-base ml-auto"
                >
                  <Trash2 size={20} />
                  हटाएं
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
